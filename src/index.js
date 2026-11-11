require("dotenv").config();
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { Client, GatewayIntentBits, Collection, Events, REST, Routes, EmbedBuilder } = require("discord.js");

const applyCommand = require("./commands/apply");
const companySettingsCommand = require("./commands/company-settings");
const commandModules = [
  require("./commands/setup-company"),
  require("./commands/reset-company"),
  applyCommand,
  require("./commands/convoy"),
  require("./commands/delivery"),
  require("./commands/roster"),
  require("./commands/convoy-cancel"),
  require("./commands/load"),
  require("./commands/carrier-register"),
  require("./commands/carrier-review"),
  companySettingsCommand,
  require("./commands/company-embed"),
];
const commandPayload = commandModules.map(command => command.data.toJSON());

for (const key of ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID"]) {
  if (!process.env[key]) throw new Error("Missing " + key + " environment variable.");
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
client.commands = new Collection(commandModules.map(command => [command.data.name, command]));
const sessions = new Map();
const oauthStates = new Map();
const MANAGER_ROLES = ["Owner","President","Chief Executive Officer","Chief Operating Officer","Executive Director","HR Director","Transportation Director","Fleet Director","Dispatch Director","Safety & Training Director","Department Manager","Shift Manager","Supervisor"];
const BASE_URL = (process.env.WEB_BASE_URL || "https://bc-gold-logistics-bot.onrender.com").replace(/\/$/, "");

client.on(Events.GuildMemberAdd, member => companySettingsCommand.handleMemberJoin(member));

client.once(Events.ClientReady, readyClient => {
  console.log("BC Gold Logistics Bot online as " + readyClient.user.tag);
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
      return;
    }
    if (interaction.isButton() && applyCommand.handleButton) {
      await applyCommand.handleButton(interaction);
      return;
    }
    if (interaction.isModalSubmit() && applyCommand.handleModal) await applyCommand.handleModal(interaction);
  } catch (error) {
    console.error("Interaction failed:", error);
    const message = { content: "Something went wrong while processing that action. Please contact company management.", ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(message).catch(console.error);
    else if (interaction.isRepliable()) await interaction.reply(message).catch(console.error);
  }
});

function send(res, status, data, headers={}) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers });
  res.end(JSON.stringify(data));
}
function cookieValue(req, name) {
  const part = (req.headers.cookie || "").split(";").map(x => x.trim()).find(x => x.startsWith(name + "="));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : "";
}
function sign(value) {
  return crypto.createHmac("sha256", process.env.WEB_SESSION_SECRET || "missing-session-secret").update(value).digest("hex");
}
function sessionFor(req) {
  const raw = cookieValue(req, "bcgl_session");
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;
  const value = raw.slice(0, dot), signature = raw.slice(dot + 1);
  const expected = sign(value);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const session = sessions.get(value);
  if (!session || session.expiresAt < Date.now()) { sessions.delete(value); return null; }
  return session;
}
function setCookie(res, name, value, maxAge) {
  res.setHeader("Set-Cookie", name + "=" + encodeURIComponent(value) + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + maxAge);
}
async function getReviewChannel(guild) {
  await guild.channels.fetch();
  return guild.channels.cache.find(channel => channel.name === "applications-review" && channel.isTextBased());
}
function parseApplication(message) {
  const embed = message.embeds?.[0];
  if (!embed) return null;
  const fields = embed.fields || [];
  const value = name => fields.find(field => field.name === name)?.value || "";
  const applicantMatch = value("Applicant").match(/ID:\s*(\d{17,20})/);
  if (!applicantMatch) return null;
  return {
    id: message.id,
    applicantId: applicantMatch[1],
    applicant: value("Applicant").replace(/\s*\(ID:.*$/, ""),
    games: value("Game"),
    truck: value("Preferred truck"),
    experience: value("Experience"),
    availability: value("Availability"),
    about: value("Why they want to join"),
    status: value("Status") || "Pending",
    createdAt: message.createdAt.toISOString()
  };
}
async function readBody(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 12000) throw new Error("Request is too large.");
  }
  return raw ? JSON.parse(raw) : {};
}
async function requireManager(req, res) {
  const session = sessionFor(req);
  if (!session) { send(res, 401, { error: "Unauthorized. Please sign in with Discord." }); return null; }
  if (!session.roles.some(role => MANAGER_ROLES.includes(role))) {
    send(res, 403, { error: "Your Discord account does not have a company management role." }); return null;
  }
  return session;
}

async function handleRequest(req, res) {
  const url = new URL(req.url, BASE_URL);
  if (req.method === "GET" && url.pathname === "/health") return send(res, 200, { ok: true, botReady: client.isReady(), dashboard: true });

  if (req.method === "GET" && url.pathname === "/auth/discord") {
    if (!process.env.DISCORD_CLIENT_SECRET || !process.env.WEB_SESSION_SECRET) return send(res, 503, { error: "Website sign-in is not configured yet. Management must add the Discord OAuth secret and session secret to Render." });
    const state = crypto.randomBytes(24).toString("hex");
    oauthStates.set(state, Date.now() + 10 * 60 * 1000);
    setCookie(res, "bcgl_oauth_state", state, 600);
    const params = new URLSearchParams({ client_id: process.env.CLIENT_ID, redirect_uri: BASE_URL + "/auth/discord/callback", response_type: "code", scope: "identify guilds.members.read", state });
    res.writeHead(302, { location: "https://discord.com/oauth2/authorize?" + params.toString(), "cache-control": "no-store" });
    return res.end();
  }

  if (req.method === "GET" && url.pathname === "/auth/discord/callback") {
    const state = url.searchParams.get("state"), code = url.searchParams.get("code");
    const savedState = cookieValue(req, "bcgl_oauth_state");
    if (!state || state !== savedState || !oauthStates.has(state) || oauthStates.get(state) < Date.now() || !code) return send(res, 400, { error: "Discord sign-in expired. Please try again." });
    oauthStates.delete(state);
    const tokenResponse = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: process.env.CLIENT_ID, client_secret: process.env.DISCORD_CLIENT_SECRET, grant_type: "authorization_code", code, redirect_uri: BASE_URL + "/auth/discord/callback" })
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.access_token) return send(res, 401, { error: "Discord could not complete sign-in." });
    const [userResponse, memberResponse] = await Promise.all([
      fetch("https://discord.com/api/v10/users/@me", { headers: { authorization: "Bearer " + token.access_token } }),
      fetch("https://discord.com/api/v10/users/@me/guilds/" + process.env.GUILD_ID + "/member", { headers: { authorization: "Bearer " + token.access_token } })
    ]);
    const user = await userResponse.json(), member = await memberResponse.json();
    if (!userResponse.ok || !memberResponse.ok) return send(res, 403, { error: "Your Discord account must be a member of the BC Gold Logistics server." });
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const roles = await guild.roles.fetch();
    const roleNames = (member.roles || []).map(id => roles.get(id)?.name).filter(Boolean);
    if (!roleNames.some(role => MANAGER_ROLES.includes(role))) return send(res, 403, { error: "Access denied. The management dashboard is limited to authorized BC Gold Logistics management roles." });
    const key = crypto.randomBytes(32).toString("hex");
    sessions.set(key, { userId: user.id, username: user.global_name || user.username, roles: roleNames, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
    setCookie(res, "bcgl_session", key + "." + sign(key), 8 * 60 * 60);
    res.writeHead(302, { location: "/", "cache-control": "no-store", "set-cookie": [
      "bcgl_session=" + encodeURIComponent(key + "." + sign(key)) + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800",
      "bcgl_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
    ] });
    return res.end();
  }

  if (req.method === "GET" && url.pathname === "/auth/logout") {
    const old = cookieValue(req, "bcgl_session"), dot = old.lastIndexOf(".");
    if (dot > 0) sessions.delete(old.slice(0, dot));
    res.writeHead(302, { location: "/", "set-cookie": "bcgl_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" });
    return res.end();
  }

  // Authenticated telemetry intake from each driver's local ATS/ETS2 companion.
  if (req.method === "POST" && url.pathname === "/api/telemetry/event") {
    const expectedKey = process.env.TELEMETRY_API_KEY || "";
    const suppliedKey = (req.headers.authorization || "").replace(/^Bearer\\s+/i, "");
    if (!expectedKey || suppliedKey.length !== expectedKey.length ||
        !crypto.timingSafeEqual(Buffer.from(suppliedKey), Buffer.from(expectedKey))) {
      return send(res, 401, { error: "Telemetry authentication failed." });
    }
    const body = await readBody(req);
    const allowedTypes = ["job-started", "job-finished"];
    if (!allowedTypes.includes(body.type) || !/^\\d{17,20}$/.test(String(body.driverId || "")) ||
        !["ATS", "ETS2"].includes(body.game) || typeof body.eventId !== "string" || body.eventId.length > 100) {
      return send(res, 400, { error: "Invalid telemetry event." });
    }
    if (!global.telemetryEventIds) global.telemetryEventIds = new Map();
    const now = Date.now();
    for (const [id, time] of global.telemetryEventIds) if (now - time > 6 * 60 * 60 * 1000) global.telemetryEventIds.delete(id);
    if (global.telemetryEventIds.has(body.eventId)) return send(res, 200, { ok: true, duplicate: true });
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channel = guild.channels.cache.find(c => c.name === "delivery-logs" && c.isTextBased());
    if (!channel) return send(res, 404, { error: "delivery-logs channel was not found." });
    const data = body.data && typeof body.data === "object" ? body.data : {};
    const pick = (...keys) => {
      for (const key of keys) if (data[key] !== undefined && data[key] !== null && String(data[key]).trim()) return String(data[key]).slice(0, 900);
      return "Not provided by game telemetry";
    };
    const started = body.type === "job-started";
    const { createEmbed } = require("./lib/embeds");
    const fields = [
      { name: "Driver", value: "<@" + body.driverId + ">", inline: true },
      { name: "Game", value: body.game, inline: true },
      { name: "Cargo", value: pick("cargo", "cargoName", "name", "jobCargo"), inline: false },
      { name: "Route", value: pick("route", "citySrc", "sourceCity", "source", "origin") + " → " + pick("cityDst", "destinationCity", "destination", "destinationName"), inline: false }
    ];
    if (!started) {
      fields.push({ name: "Distance", value: pick("jobDeliveredDistanceKm", "plannedDistanceKm", "distance", "plannedDistance", "jobDistance") + " km", inline: true });
      fields.push({ name: "Revenue", value: pick("jobDeliveredRevenue", "revenue", "income", "jobIncome"), inline: true });
    }
    const embed = createEmbed({
      title: started ? "🚚 Delivery Started Automatically" : "🏁 Delivery Completed Automatically",
      description: "Recorded directly from " + body.game + " telemetry.",
      color: started ? 0x3498DB : 0x2ECC71,
      fields,
      timestamp: true
    });
    await channel.send({ embeds: [embed] });
    global.telemetryEventIds.set(body.eventId, now);
    return send(res, 200, { ok: true });
  }

  if (url.pathname.startsWith("/api/")) {
    const session = await requireManager(req, res);
    if (!session) return;
    if (req.method === "GET" && url.pathname === "/api/me") return send(res, 200, { user: { username: session.username, roles: session.roles } });
    if (req.method === "GET" && url.pathname === "/api/applications") {
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const channel = await getReviewChannel(guild);
      if (!channel) return send(res, 404, { error: "Private applications-review channel was not found." });
      const messages = await channel.messages.fetch({ limit: 100 });
      const applications = messages.map(parseApplication).filter(Boolean).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
      return send(res, 200, { applications });
    }
    const decisionMatch = url.pathname.match(/^\/api\/applications\/(\d{17,20})\/decision$/);
    if (req.method === "POST" && decisionMatch) {
      const body = await readBody(req);
      if (!["approve", "deny"].includes(body.decision)) return send(res, 400, { error: "Choose approve or deny." });
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const channel = getReviewChannel(guild);
      if (!channel) return send(res, 404, { error: "Private applications-review channel was not found." });
      const message = await channel.messages.fetch(decisionMatch[1]);
      const app = parseApplication(message);
      if (!app) return send(res, 404, { error: "Application record could not be read." });
      if (app.status !== "Pending") return send(res, 409, { error: "This application has already been reviewed." });
      const approved = body.decision === "approve", status = approved ? "Approved" : "Denied";
      const embed = EmbedBuilder.from(message.embeds[0]).setColor(approved ? 0x2ECC71 : 0xE74C3C)
        .setFields(...message.embeds[0].fields.filter(field => !["Status","Decision"].includes(field.name)),
          { name: "Status", value: status, inline: true },
          { name: "Decision", value: "Reviewed by " + session.username + " (website)", inline: true });
      await message.edit({ embeds: [embed], components: [] });
      let dmDelivered = true;
      try {
        const applicant = await client.users.fetch(app.applicantId);
        const dmEmbed = new EmbedBuilder().setColor(approved ? 0x2ECC71 : 0xE74C3C)
          .setTitle(approved ? "🎉 Your BC Gold Logistics application was approved!" : "BC Gold Logistics Application Update")
          .setDescription(approved
            ? "Congratulations! Company management has approved your driver application. Welcome to BC Gold Logistics! Please check the server for your next steps."
            : "Thank you for your interest in BC Gold Logistics. After reviewing your application, company management has decided not to move forward at this time. We appreciate the time you took to apply.")
          .addFields({ name: "Application status", value: status })
          .setFooter({ text: "Driven by Excellence. United by the Road." }).setTimestamp();
        await applicant.send({ embeds: [dmEmbed] });
      } catch (error) { dmDelivered = false; console.error("Website decision DM failed:", error); }
      return send(res, 200, { ok: true, status, dmDelivered });
    }
    return send(res, 404, { error: "API route not found." });
  }

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    const file = path.join(__dirname, "..", "public", "index.html");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    return res.end(fs.readFileSync(file));
  }
  return send(res, 404, { error: "Not found." });
}

const port = Number(process.env.PORT || 3000);
http.createServer((req, res) => {
  handleRequest(req, res).catch(error => {
    console.error("HTTP request failed:", error);
    if (!res.headersSent) send(res, 500, { error: "The dashboard could not complete that request. Check the Render logs." });
    else res.end();
  });
}).listen(port, "0.0.0.0", () => console.log("BC Gold Logistics dashboard and health server listening on " + port));

async function start() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commandPayload });
  console.log("Guild slash commands registered.");
  await client.login(process.env.DISCORD_TOKEN);
}
start().catch(error => { console.error("Bot startup failed:", error); process.exitCode = 1; });

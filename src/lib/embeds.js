const { EmbedBuilder } = require("discord.js");
const BRAND = Object.freeze({ name: "BC Gold Logistics", tagline: "Driven by Excellence. United by the Road.", gold: 0xD4AF37, black: 0x111111, yellow: 0xF1C40F });
function createEmbed({ title, description, color = BRAND.gold, fields = [], timestamp = false, thumbnail, image, footer = BRAND.tagline } = {}) {
  const embed = new EmbedBuilder().setColor(color);
  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (fields.length) embed.addFields(fields);
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (image) embed.setImage(image);
  embed.setFooter({ text: footer });
  if (timestamp) embed.setTimestamp();
  return embed;
}
function createSuccessEmbed(title, description, fields = []) { return createEmbed({ title, description, fields, timestamp: true }); }
function createNoticeEmbed(title, description, fields = []) { return createEmbed({ title, description, fields, color: BRAND.yellow, timestamp: true }); }
module.exports = { BRAND, createEmbed, createSuccessEmbed, createNoticeEmbed };

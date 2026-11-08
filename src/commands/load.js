const {SlashCommandBuilder,PermissionFlagsBits,EmbedBuilder}=require("discord.js");
const {createEmbed}=require("../lib/embeds");
const MANAGERS=new Set(["Owner","President","Chief Executive Officer","Chief Operating Officer","Transportation Director","Transportation Manager","Dispatch Director","Dispatch Supervisor","Department Manager","Shift Manager","Supervisor"]);
const DRIVERS=new Set(["Company Driver","Senior Driver","Probationary Driver","Driver Trainer"]);
const data=new SlashCommandBuilder().setName("load").setDescription("Manage wholesale freight loads.")
.addSubcommand(s=>s.setName("create").setDescription("Create a wholesale freight load.")
 .addStringOption(o=>o.setName("reference").setDescription("Unique load reference").setRequired(true).setMaxLength(30))
 .addStringOption(o=>o.setName("customer").setDescription("Wholesale customer/account").setRequired(true).setMaxLength(100))
 .addStringOption(o=>o.setName("origin").setDescription("Pickup location").setRequired(true).setMaxLength(150))
 .addStringOption(o=>o.setName("destination").setDescription("Delivery location").setRequired(true).setMaxLength(150))
 .addStringOption(o=>o.setName("cargo").setDescription("Cargo description").setRequired(true).setMaxLength(150))
 .addStringOption(o=>o.setName("equipment").setDescription("Required equipment").setRequired(true).addChoices({name:"Dry Van",value:"Dry Van"},{name:"Refrigerated",value:"Refrigerated"},{name:"Flatbed",value:"Flatbed"},{name:"Step Deck",value:"Step Deck"},{name:"Tanker",value:"Tanker"},{name:"Other / Specialized",value:"Other / Specialized"}))
 .addStringOption(o=>o.setName("pickup").setDescription("Pickup appointment and timezone").setRequired(true).setMaxLength(100))
 .addStringOption(o=>o.setName("delivery").setDescription("Delivery appointment and timezone").setRequired(true).setMaxLength(100)))
.addSubcommand(s=>s.setName("assign").setDescription("Assign a company driver to a load.")
 .addStringOption(o=>o.setName("reference").setDescription("Load reference").setRequired(true))
 .addUserOption(o=>o.setName("driver").setDescription("Company driver").setRequired(true))
 .addStringOption(o=>o.setName("truck").setDescription("Company truck/unit number").setRequired(false))\n .addStringOption(o=>o.setName("trailer").setDescription("Company trailer/unit number").setRequired(false)))
.addSubcommand(s=>s.setName("status").setDescription("Update a load's operating status.")
 .addStringOption(o=>o.setName("reference").setDescription("Load reference").setRequired(true))
 .addStringOption(o=>o.setName("status").setDescription("New status").setRequired(true).addChoices({name:"Open",value:"Open"},{name:"Assigned",value:"Assigned"},{name:"Dispatched",value:"Dispatched"},{name:"In Transit",value:"In Transit"},{name:"At Pickup",value:"At Pickup"},{name:"At Delivery",value:"At Delivery"},{name:"Delivered",value:"Delivered"},{name:"On Hold",value:"On Hold"},{name:"Cancelled",value:"Cancelled"}))
 .addStringOption(o=>o.setName("notes").setDescription("Optional status notes").setRequired(false).setMaxLength(500)));
function manager(i){return i.memberPermissions.has(PermissionFlagsBits.Administrator)||i.member.roles.cache.some(r=>MANAGERS.has(r.name));}
async function loadMessage(channel,reference){const messages=await channel.messages.fetch({limit:100});return messages.find(m=>m.embeds.some(e=>e.fields?.some(f=>f.name==="Load reference"&&f.value===reference)));}
async function execute(i){
 if(!manager(i))return i.reply({content:"Dispatch and transportation management only.",ephemeral:true});
 await i.deferReply({ephemeral:true});
 const action=i.options.getSubcommand(),guild=i.guild;
 const channel=name=>guild.channels.cache.find(c=>c.name===name&&c.isTextBased());
 const board=channel("wholesale-load-board");
 if(!board)return i.editReply("The #wholesale-load-board channel was not found. Run /setup-company first.");
 if(action==="create"){
  const reference=i.options.getString("reference",true).trim().toUpperCase();
  if(await loadMessage(board,reference))return i.editReply("That load reference already exists. Use a unique reference.");
  const fields=[["Load reference",reference],["Wholesale customer",i.options.getString("customer",true)],["Origin",i.options.getString("origin",true)],["Destination",i.options.getString("destination",true)],["Cargo",i.options.getString("cargo",true)],["Equipment",i.options.getString("equipment",true)],["Pickup appointment",i.options.getString("pickup",true)],["Delivery appointment",i.options.getString("delivery",true)],["Status","Open"],["Assigned driver","Unassigned"],["Company unit","Unassigned"]];
  const embed=createEmbed({title:"📦 Wholesale Freight Load",description:"Company-fleet load record. Do not post private customer pricing or personal data here.",fields:fields.map(([name,value])=>({name,value,inline:["Load reference","Equipment","Status"].includes(name)})),timestamp:true});
  await board.send({embeds:[embed]});
  const log=channel("dispatch-reports");if(log)await log.send({embeds:[createEmbed({title:"Load Created",description:"Load **"+reference+"** entered by <@"+i.user.id+">.",timestamp:true})]});
  return i.editReply("Load **"+reference+"** created in #wholesale-load-board with status Open.");
 }
 const reference=i.options.getString("reference",true).trim().toUpperCase(),message=await loadMessage(board,reference);
 if(!message)return i.editReply("Load **"+reference+"** was not found in the load board.");
 const embed=EmbedBuilder.from(message.embeds[0]);
 if(action==="assign"){
  const driver=i.options.getUser("driver",true),member=await guild.members.fetch(driver.id);
  if(!member.roles.cache.some(r=>DRIVERS.has(r.name)))return i.editReply("That member does not have an approved company-driver role. Assign the correct driver role first.");
  const truck=i.options.getString("truck")||"Not assigned",trailer=i.options.getString("trailer")||"Not assigned";
  const fields=embed.data.fields||[];
  for(const [name,value] of [["Assigned driver","<@"+driver.id+">"],["Company unit",truck],["Company trailer",trailer],["Status","Assigned"]]){
   const field=fields.find(f=>f.name===name);if(field)field.value=value;else fields.push({name,value});
  }
  embed.setFields(fields).setTimestamp();
  await message.edit({embeds:[embed]});
  const target=channel("load-assignments");if(target)await target.send({content:"<@"+driver.id+">",embeds:[createEmbed({title:"Company Load Assignment",description:"Load **"+reference+"** has been assigned to <@"+driver.id+">.",fields:[{name:"Company unit",value:truck},{name:"Company trailer",value:trailer}],timestamp:true})]});
  return i.editReply("Load **"+reference+"** assigned to "+driver.user.tag+".");
 }
 const status=i.options.getString("status",true),notes=i.options.getString("notes");
 const fields=embed.data.fields||[],statusField=fields.find(f=>f.name==="Status");
 if(statusField)statusField.value=status;else fields.push({name:"Status",value:status});
 if(notes){const noteField=fields.find(f=>f.name==="Latest status note");if(noteField)noteField.value=notes;else fields.push({name:"Latest status note",value:notes});}
 embed.setFields(fields).setTimestamp();await message.edit({embeds:[embed]});
 const active=channel("active-shipments");if(active)await active.send({embeds:[createEmbed({title:"Load Status Updated",description:"**"+reference+"** — "+status+(notes?"\n"+notes:""),timestamp:true})]});
 if(status==="Delivered"){const done=channel("delivery-confirmations");if(done)await done.send({embeds:[createEmbed({title:"Delivery Confirmation",description:"Load **"+reference+"** marked delivered by <@"+i.user.id+">.",timestamp:true})]});}
 return i.editReply("Load **"+reference+"** updated to **"+status+"**.");
}
module.exports={data,execute};
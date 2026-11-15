const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

function command(name, approved) {
  return {
    data: new SlashCommandBuilder()
      .setName(name)
      .setDescription(approved ? "Approve a BC Gold Logistics driver application." : "Decline a BC Gold Logistics driver application.")
      .addUserOption(option =>
        option.setName("driver")
          .setDescription("The applicant to review.")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
      if (!interaction.guild) {
        return interaction.reply({ content: "This command can only be used inside the BC Gold Logistics server.", ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });
      const user = interaction.options.getUser("driver", true);
      const guild = interaction.guild;
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) return interaction.editReply("That user is not a member of this Discord server.");

      await Promise.all([guild.channels.fetch(), guild.roles.fetch()]);
      const reviewChannel = guild.channels.cache.find(
        channel => channel.name === "applications-review" && channel.isTextBased()
      );
      if (!reviewChannel) {
        return interaction.editReply("The private #applications-review channel was not found. Run /setup-company and check the bot's channel permissions.");
      }

      const messages = await reviewChannel.messages.fetch({ limit: 100 });
      const application = messages
        .filter(message => message.author.id === interaction.client.user.id && message.embeds.length)
        .filter(message => {
          const applicant = message.embeds[0].fields?.find(field => field.name === "Applicant")?.value || "";
          const status = message.embeds[0].fields?.find(field => field.name === "Status")?.value || "Pending";
          return applicant.includes(user.id) && status === "Pending";
        })
        .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
        .first();

      if (!application) {
        return interaction.editReply("No pending application record was found for " + user.tag + " in #applications-review.");
      }

      if (approved) {
        const probationaryRole = guild.roles.cache.find(role => role.name === "Probationary Driver");
        if (!probationaryRole) {
          return interaction.editReply("The Probationary Driver role was not found. Run /setup-company to create the company roles.");
        }
        try {
          if (probationaryRole.managed || probationaryRole.position >= guild.members.me.roles.highest.position) {
            return interaction.editReply("I can't assign Probationary Driver because the role is above my bot role. Move the bot role higher, then retry.");
          }
          await member.roles.add(probationaryRole, "Driver application approved by " + interaction.user.tag);
        } catch (error) {
          console.error("Could not assign Probationary Driver role:", error);
          return interaction.editReply("I couldn't assign the Probationary Driver role. Check Manage Roles and the bot role hierarchy. The application is still pending.");
        }
      }

      const status = approved ? "Approved" : "Denied";
      const fields = application.embeds[0].fields || [];
      const updatedFields = fields.filter(field => !["Status", "Decision"].includes(field.name));
      updatedFields.push({ name: "Status", value: status, inline: true });
      updatedFields.push({ name: "Decision", value: "Reviewed by " + interaction.user.tag, inline: true });
      const updatedEmbed = EmbedBuilder.from(application.embeds[0])
        .setColor(approved ? 0x2ECC71 : 0xE74C3C)
        .setFields(updatedFields)
        .setTimestamp();
      await application.edit({ embeds: [updatedEmbed], components: [] });

      let dmDelivered = true;
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor(approved ? 0x2ECC71 : 0xE74C3C)
          .setTitle(approved ? "🎉 Your BC Gold Logistics application was approved!" : "BC Gold Logistics Application Update")
          .setDescription(approved
            ? "Congratulations! Company management has approved your driver application. You have been assigned the Probationary Driver role. Welcome to BC Gold Logistics!"
            : "Thank you for your interest in BC Gold Logistics. After reviewing your application, company management has decided not to move forward at this time. We appreciate the time you took to apply.")
          .addFields({ name: "Application status", value: status })
          .setFooter({ text: "Driven by Excellence. United by the Road." })
          .setTimestamp();
        await user.send({ embeds: [dmEmbed] });
      } catch (error) {
        dmDelivered = false;
        console.error("Application decision DM failed:", error);
      }

      await reviewChannel.send({
        content: (approved ? "✅ Approved" : "❌ Denied") + ": <@" + user.id + "> — reviewed by <@" + interaction.user.id + ">."
      });

      return interaction.editReply(
        user.tag + " was marked **" + status + "**." +
        (approved ? " The Probationary Driver role was assigned." : "") +
        (dmDelivered ? " A DM was sent." : " Discord could not deliver the DM.") +
        " The application record was updated."
      );
    }
  };
}

module.exports = {
  approve: command("approve", true),
  deny: command("deny", false)
};

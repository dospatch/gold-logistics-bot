const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

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
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) {
        return interaction.editReply("That user is not a member of this Discord server.");
      }

      if (approved) {
        const roles = await interaction.guild.roles.fetch();
        const probationaryRole = roles.find(role => role.name === "Probationary Driver");
        if (!probationaryRole) {
          return interaction.editReply("The Probationary Driver role was not found. Run /setup-company to create the company roles.");
        }

        try {
          await member.roles.add(probationaryRole, "Driver application approved by " + interaction.user.tag);
        } catch (error) {
          console.error("Could not assign Probationary Driver role:", error);
          return interaction.editReply("The application was approved, but the bot could not assign the Probationary Driver role. Check the bot's Manage Roles permission and role hierarchy.");
        }
      }

      await interaction.guild.channels.fetch();
      const reviewChannel = interaction.guild.channels.cache.find(
        channel => channel.name === "applications-review" && channel.isTextBased()
      );
      if (reviewChannel) {
        await reviewChannel.send({
          content: (approved ? "✅ Approved" : "❌ Declined") + ": <@" + user.id + "> — reviewed by <@" + interaction.user.id + ">."
        });
      }

      await interaction.editReply(
        user.tag + (approved ? " was approved and assigned the Probationary Driver role." : " was declined.") +
        (reviewChannel ? " The review was recorded in #applications-review." : " The review channel was not found.")
      );
    }
  };
}

module.exports = {
  approve: command("approve", true),
  deny: command("deny", false)
};

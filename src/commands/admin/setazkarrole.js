const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success } = require('../../utils/embedBuilder');
const { trackCommand } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setazkarrole')
    .setDescription('Set the role to mention when sending azkar')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addRoleOption(o =>
      o.setName('role')
        .setDescription('Role to mention')
        .setRequired(true)
    ),

  async execute(interaction) {
    trackCommand('setazkarrole', interaction.user.id);
    const role = interaction.options.getRole('role');
    process.env[`AZKAR_ROLE_${interaction.guildId}`] = role.id;
    await interaction.reply({ embeds: [success('Azkar Role Set', `Will mention <@&${role.id}> for azkar`)] });
  },
};

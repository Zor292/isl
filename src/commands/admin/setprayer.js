const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success } = require('../../utils/embedBuilder');
const { trackCommand } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setprayer')
    .setDescription('Set the channel for automatic prayer time notifications')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(o =>
      o.setName('channel')
        .setDescription('The channel to send prayer times in')
        .setRequired(true)
    ),

  async execute(interaction) {
    trackCommand('setprayer', interaction.user.id);
    const channel = interaction.options.getChannel('channel');
    process.env[`PRAYER_OVERRIDE_${interaction.guildId}`] = channel.id;
    await interaction.reply({ embeds: [success('Prayer Channel Set', `Prayer times will be sent in <#${channel.id}>`)] });
  },
};

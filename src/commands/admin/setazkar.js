const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success } = require('../../utils/embedBuilder');
const { trackCommand } = require('../../utils/aiMonitor');

const channelConfig = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setazkar')
    .setDescription('Set the channel for automatic azkar notifications')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(o =>
      o.setName('channel')
        .setDescription('The channel to send azkar in')
        .setRequired(true)
    ),

  channelConfig,

  async execute(interaction) {
    trackCommand('setazkar', interaction.user.id);
    const channel = interaction.options.getChannel('channel');
    channelConfig[interaction.guildId] = { azkar: channel.id };
    process.env[`AZKAR_OVERRIDE_${interaction.guildId}`] = channel.id;
    await interaction.reply({ embeds: [success('Azkar Channel Set', `Azkar will be sent in <#${channel.id}>`)] });
  },
};

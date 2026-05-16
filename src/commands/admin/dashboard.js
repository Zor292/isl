const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dashboardEmbed } = require('../../utils/embedBuilder');
const { getQueueState, stats } = require('../../utils/musicQueue');
const { trackCommand } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Show bot dashboard with stats and queue')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    trackCommand('dashboard', interaction.user.id);
    const state = getQueueState(interaction.guildId);
    const embed = dashboardEmbed(state.items, state.nowPlaying, stats);
    await interaction.reply({ embeds: [embed] });
  },
};

const { SlashCommandBuilder } = require('discord.js');
const { stop } = require('../../utils/musicQueue');
const { success } = require('../../utils/embedBuilder');
const { trackCommand } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playback and clear the queue'),

  async execute(interaction) {
    trackCommand('stop', interaction.user.id);
    stop(interaction.guildId);
    await interaction.reply({ embeds: [success('Stopped', 'Playback stopped and queue cleared.')] });
  },
};

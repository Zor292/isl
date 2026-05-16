const { SlashCommandBuilder } = require('discord.js');
const { skip } = require('../../utils/musicQueue');
const { success } = require('../../utils/embedBuilder');
const { trackCommand } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current surah and play the next in queue'),

  async execute(interaction) {
    trackCommand('skip', interaction.user.id);
    skip(interaction.guildId);
    await interaction.reply({ embeds: [success('Skipped', 'Skipped to the next surah.')] });
  },
};

const { SlashCommandBuilder } = require('discord.js');
const { getPrayerTimes } = require('../../utils/prayerApi');
const { prayer, error } = require('../../utils/embedBuilder');
const config = require('../../../config/config');
const { trackCommand, trackError } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prayer')
    .setDescription('Show today\'s prayer times'),

  async execute(interaction) {
    trackCommand('prayer', interaction.user.id);
    await interaction.deferReply();
    try {
      const timings = await getPrayerTimes();
      const embed = prayer(timings, config.prayer.city);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      trackError(err, 'prayer command');
      await interaction.editReply({ embeds: [error('Error', 'Could not fetch prayer times.')] });
    }
  },
};

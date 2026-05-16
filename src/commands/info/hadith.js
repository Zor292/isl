const { SlashCommandBuilder } = require('discord.js');
const hadiths = require('../../data/hadiths');
const { hadithEmbed } = require('../../utils/embedBuilder');
const { trackCommand } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hadith')
    .setDescription('Get a random hadith'),

  async execute(interaction) {
    trackCommand('hadith', interaction.user.id);
    const h = hadiths[Math.floor(Math.random() * hadiths.length)];
    await interaction.reply({ embeds: [hadithEmbed(h)] });
  },
};

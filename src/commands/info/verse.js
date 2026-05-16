const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../../config/config');
const { trackCommand, trackError } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verse')
    .setDescription('Get a random Quran verse'),

  async execute(interaction) {
    trackCommand('verse', interaction.user.id);
    await interaction.deferReply();
    try {
      const surahId = Math.floor(Math.random() * 114) + 1;
      const res = await axios.get(`${config.quran.baseUrl}/verses/by_chapter/${surahId}?language=ar&words=true&per_page=5&page=1`);
      const verses = res.data.verses;
      const verse = verses[Math.floor(Math.random() * verses.length)];

      const chRes = await axios.get(`${config.quran.baseUrl}/chapters/${surahId}`);
      const chapter = chRes.data.chapter;

      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle(`📖 ${chapter.name_arabic} — آية ${verse.verse_number}`)
        .setDescription(verse.text_uthmani || verse.text_imlaei)
        .addFields({ name: 'Surah', value: `${chapter.name_simple} (${surahId}:${verse.verse_number})`, inline: true })
        .setFooter({ text: config.footer })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      trackError(err, 'verse command');
      await interaction.editReply({ content: 'Could not fetch a verse. Try again.' });
    }
  },
};

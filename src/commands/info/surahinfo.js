const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getSurahByName } = require('../../utils/quranApi');
const config = require('../../../config/config');
const { error } = require('../../utils/embedBuilder');
const { trackCommand } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('surahinfo')
    .setDescription('Get info about a specific surah')
    .addStringOption(o =>
      o.setName('surah')
        .setDescription('Surah name or number')
        .setRequired(true)
    ),

  async execute(interaction) {
    trackCommand('surahinfo', interaction.user.id);
    await interaction.deferReply();
    const input = interaction.options.getString('surah');
    const surah = await getSurahByName(input);
    if (!surah) {
      return interaction.editReply({ embeds: [error('Not Found', `No surah found for: ${input}`)] });
    }
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`📖 ${surah.name_arabic} — ${surah.name_simple}`)
      .addFields(
        { name: 'Surah Number', value: String(surah.id), inline: true },
        { name: 'Verses', value: String(surah.verses_count), inline: true },
        { name: 'Revelation Type', value: surah.revelation_place || 'Unknown', inline: true },
        { name: 'English Name', value: surah.translated_name?.name || '—', inline: true },
      )
      .setFooter({ text: config.footer })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  },
};

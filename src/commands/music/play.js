const { SlashCommandBuilder } = require('discord.js');
const { getSurahByName, getAudioUrl, resolveReciter } = require('../../utils/quranApi');
const { addToQueue } = require('../../utils/musicQueue');
const { quranEmbed, error } = require('../../utils/embedBuilder');
const { trackCommand, trackSurah, trackReciter, trackError } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a Quran surah in your voice channel')
    .addStringOption(o =>
      o.setName('surah')
        .setDescription('Surah name or number (required)')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('reciter')
        .setDescription('Reciter name (optional — random if not specified)')
        .setRequired(false)
    ),

  async execute(interaction) {
    trackCommand('play', interaction.user.id);

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({ embeds: [error('Not in Voice Channel', 'Please join a voice channel first.')], ephemeral: true });
    }

    await interaction.deferReply();

    const surahInput = interaction.options.getString('surah');
    const reciterInput = interaction.options.getString('reciter');

    try {
      const surah = await getSurahByName(surahInput);
      if (!surah) {
        return interaction.editReply({ embeds: [error('Surah Not Found', `Could not find surah: **${surahInput}**`)] });
      }

      const reciter = resolveReciter(reciterInput);
      const audioUrl = await getAudioUrl(surah.id, reciter.id);

      if (!audioUrl) {
        return interaction.editReply({ embeds: [error('Audio Not Found', 'Could not find audio for this surah/reciter combination.')] });
      }

      const item = { surah, reciter, audioUrl, requestedBy: interaction.user.id };
      const pos = await addToQueue(interaction.guildId, voiceChannel, item, interaction.client);

      trackSurah(surah.name_simple);
      trackReciter(reciter.name);

      const embed = quranEmbed(surah, reciter, pos - 1);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      trackError(err, 'play command');
      await interaction.editReply({ embeds: [error('Error', err.message)] });
    }
  },
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('🕌 Islamic Bot — Command Guide')
      .addFields(
        {
          name: '🎵 Music / Quran',
          value: [
            '`/play [surah] [reciter?]` — Play a surah in voice channel',
            '`/stop` — Stop playback & clear queue',
            '`/skip` — Skip current surah',
            '`/queue` — Show current queue',
            '`/volume [0-200]` — Adjust volume',
            '`/controlpanel` — Persistent controller embed',
          ].join('\n'),
        },
        {
          name: '📖 Islamic Info',
          value: [
            '`/prayer` — Today\'s prayer times',
            '`/hadith` — Random hadith',
            '`/azkar [type]` — Morning/Evening/Sleep/General azkar',
            '`/verse` — Random Quran verse',
            '`/surahinfo [name]` — Info about a surah',
            '`/reciters` — List available reciters',
            '`/names` — Random name from 99 Names of Allah',
          ].join('\n'),
        },
        {
          name: '⚙️ Admin',
          value: [
            '`/setazkar [channel]` — Set azkar channel',
            '`/setprayer [channel]` — Set prayer alerts channel',
            '`/setazkarrole [role]` — Set role to mention for azkar',
            '`/setcity [city] [country]` — Set prayer time city',
            '`/dashboard` — View bot stats & queue',
            '`/monitor` — AI monitoring report',
          ].join('\n'),
        },
      )
      .setFooter({ text: config.footer })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

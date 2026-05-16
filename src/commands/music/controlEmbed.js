const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../../config/config');

function buildControlEmbed(nowPlaying, queue, volume) {
  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('🎛️ Islamic Music Controller')
    .setFooter({ text: config.footer })
    .setTimestamp();

  embed.addFields({
    name: '🎵 Now Playing',
    value: nowPlaying
      ? `**${nowPlaying.surah.name_arabic}** (${nowPlaying.surah.name_simple})\n🎤 ${nowPlaying.reciter.name}`
      : '*Nothing playing*',
  });

  if (queue.length > 0) {
    embed.addFields({
      name: `📋 Queue (${queue.length})`,
      value: queue.slice(0, 5).map((q, i) => `${i + 1}. ${q.surah.name_arabic}`).join('\n'),
    });
  }

  embed.addFields({ name: '🔊 Volume', value: `${Math.round(volume * 100)}%`, inline: true });

  return embed;
}

function buildControlButtons(hasContent) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_pause_resume')
      .setLabel('⏸️ Pause / ▶️ Resume')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!hasContent),
    new ButtonBuilder()
      .setCustomId('music_skip')
      .setLabel('⏭️ Skip')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!hasContent),
    new ButtonBuilder()
      .setCustomId('music_stop')
      .setLabel('⏹️ Stop')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(!hasContent),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_vol_down')
      .setLabel('🔉 Vol -')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_vol_up')
      .setLabel('🔊 Vol +')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_queue')
      .setLabel('📋 Queue')
      .setStyle(ButtonStyle.Primary),
  );

  return [row, row2];
}

module.exports = { buildControlEmbed, buildControlButtons };

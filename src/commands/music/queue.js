const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getQueueState } = require('../../utils/musicQueue');
const config = require('../../../config/config');
const { trackCommand } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current playback queue'),

  async execute(interaction) {
    trackCommand('queue', interaction.user.id);
    const state = getQueueState(interaction.guildId);

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('📋 Playback Queue')
      .setFooter({ text: config.footer })
      .setTimestamp();

    if (state.nowPlaying) {
      embed.addFields({
        name: '▶️ Now Playing',
        value: `**${state.nowPlaying.surah.name_arabic}** — ${state.nowPlaying.reciter.name}`,
      });
    }

    if (state.items.length > 0) {
      embed.addFields({
        name: `⏳ Up Next (${state.items.length})`,
        value: state.items.map((q, i) => `${i + 1}. ${q.surah.name_arabic} — ${q.reciter.name}`).join('\n'),
      });
    } else {
      embed.addFields({ name: '⏳ Queue', value: 'Empty' });
    }

    await interaction.reply({ embeds: [embed] });
  },
};

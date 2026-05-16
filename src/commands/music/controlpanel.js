const { SlashCommandBuilder } = require('discord.js');
const { buildControlEmbed, buildControlButtons } = require('./controlEmbed');
const { getQueueState, setControlRef } = require('../../utils/musicQueue');
const { trackCommand } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('controlpanel')
    .setDescription('Display the persistent music control panel in this channel'),

  async execute(interaction) {
    trackCommand('controlpanel', interaction.user.id);
    const state = getQueueState(interaction.guildId);

    const msg = await interaction.reply({
      embeds: [buildControlEmbed(state.nowPlaying, state.items, state.volume)],
      components: buildControlButtons(!!state.nowPlaying),
      fetchReply: true,
    });

    setControlRef(interaction.guildId, {
      channelId: interaction.channelId,
      messageId: msg.id,
    });
  },
};

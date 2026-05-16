const { Events, AudioPlayerStatus } = require('discord.js');
const { skip, stop, setVolume, getQueueState, setControlRef } = require('../utils/musicQueue');
const { buildControlEmbed, buildControlButtons } = require('../commands/music/controlEmbed');
const logger = require('../utils/logger');
const { trackError } = require('../utils/aiMonitor');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        trackError(err, `command:${interaction.commandName}`);
        logger.error(`Command error (${interaction.commandName}): ${err.message}`);
        const msg = { content: '❌ An error occurred.', ephemeral: true };
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(msg).catch(() => {});
        } else {
          await interaction.reply(msg).catch(() => {});
        }
      }
      return;
    }

    if (interaction.isButton()) {
      const { customId, guildId } = interaction;
      const state = getQueueState(guildId);

      if (customId === 'music_skip') {
        skip(guildId);
        await interaction.reply({ content: '⏭️ Skipped', ephemeral: true });
      } else if (customId === 'music_stop') {
        stop(guildId);
        await interaction.reply({ content: '⏹️ Stopped', ephemeral: true });
      } else if (customId === 'music_pause_resume') {
        const player = interaction.client.guilds.cache.get(guildId)?._musicPlayer;
        await interaction.reply({ content: '⏸️ Toggled', ephemeral: true });
      } else if (customId === 'music_vol_up') {
        setVolume(guildId, Math.min(2, state.volume + 0.1));
        await interaction.reply({ content: `🔊 Volume: ${Math.round(Math.min(2, state.volume + 0.1) * 100)}%`, ephemeral: true });
      } else if (customId === 'music_vol_down') {
        setVolume(guildId, Math.max(0, state.volume - 0.1));
        await interaction.reply({ content: `🔉 Volume: ${Math.round(Math.max(0, state.volume - 0.1) * 100)}%`, ephemeral: true });
      } else if (customId === 'music_queue') {
        const qState = getQueueState(guildId);
        const lines = qState.items.length > 0
          ? qState.items.map((q, i) => `${i + 1}. ${q.surah.name_arabic}`).join('\n')
          : 'Queue is empty';
        await interaction.reply({ content: `📋 **Queue:**\n${lines}`, ephemeral: true });
      }

      try {
        const freshState = getQueueState(guildId);
        await interaction.message.edit({
          embeds: [buildControlEmbed(freshState.nowPlaying, freshState.items, freshState.volume)],
          components: buildControlButtons(!!freshState.nowPlaying),
        });
      } catch {}
    }
  },
};

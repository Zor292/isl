const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
} = require('@discordjs/voice');
const axios = require('axios');
const { PassThrough } = require('stream');
const logger = require('./logger');

const queues = new Map();
const stats = { totalRequests: 0, totalPlays: 0 };

function getQueue(guildId) {
  if (!queues.has(guildId)) {
    queues.set(guildId, {
      items: [],
      player: null,
      connection: null,
      nowPlaying: null,
      volume: 1,
      controlMessageRef: null,
    });
  }
  return queues.get(guildId);
}

async function connectToChannel(channel) {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: false,
  });
  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
  } catch {
    connection.destroy();
    throw new Error('فشل الاتصال بالروم الصوتي');
  }
  return connection;
}

async function playNext(guildId, client) {
  const queue = getQueue(guildId);
  if (queue.items.length === 0) {
    queue.nowPlaying = null;
    if (queue.controlMessageRef) updateControlEmbed(queue, client, guildId);
    return;
  }

  const item = queue.items.shift();
  queue.nowPlaying = item;
  stats.totalPlays++;

  try {
    const res = await axios({ url: item.audioUrl, method: 'GET', responseType: 'stream' });
    const passthrough = new PassThrough();
    res.data.pipe(passthrough);

    const resource = createAudioResource(passthrough, { inlineVolume: true });
    resource.volume.setVolume(queue.volume);

    if (!queue.player) {
      queue.player = createAudioPlayer();
      queue.connection.subscribe(queue.player);

      queue.player.on(AudioPlayerStatus.Idle, () => {
        playNext(guildId, client);
      });

      queue.player.on('error', (err) => {
        logger.error(`Player error in guild ${guildId}: ${err.message}`);
        playNext(guildId, client);
      });
    }

    queue.player.play(resource);
    if (queue.controlMessageRef) updateControlEmbed(queue, client, guildId);
  } catch (err) {
    logger.error(`Failed to stream audio: ${err.message}`);
    playNext(guildId, client);
  }
}

async function addToQueue(guildId, voiceChannel, item, client) {
  stats.totalRequests++;
  const queue = getQueue(guildId);

  if (!queue.connection) {
    queue.connection = await connectToChannel(voiceChannel);
    queue.connection.on(VoiceConnectionStatus.Disconnected, () => {
      queue.connection = null;
      queue.player = null;
      queue.nowPlaying = null;
      queue.items = [];
    });
  }

  queue.items.push(item);

  if (!queue.nowPlaying) {
    await playNext(guildId, client);
  }

  return queue.items.length;
}

function skip(guildId) {
  const queue = getQueue(guildId);
  if (queue.player) queue.player.stop();
}

function stop(guildId) {
  const queue = getQueue(guildId);
  queue.items = [];
  if (queue.player) queue.player.stop();
  if (queue.connection) queue.connection.destroy();
  queue.connection = null;
  queue.player = null;
  queue.nowPlaying = null;
}

function setVolume(guildId, vol) {
  const queue = getQueue(guildId);
  queue.volume = Math.max(0, Math.min(2, vol));
  if (queue.player?._state?.resource?.volume) {
    queue.player._state.resource.volume.setVolume(queue.volume);
  }
}

function getQueueState(guildId) {
  const queue = getQueue(guildId);
  return {
    nowPlaying: queue.nowPlaying,
    items: queue.items,
    volume: queue.volume,
  };
}

function setControlRef(guildId, ref) {
  const queue = getQueue(guildId);
  queue.controlMessageRef = ref;
}

async function updateControlEmbed(queue, client, guildId) {
  const ref = queue.controlMessageRef;
  if (!ref) return;
  try {
    const { buildControlEmbed, buildControlButtons } = require('../commands/music/controlEmbed');
    const channel = await client.channels.fetch(ref.channelId).catch(() => null);
    if (!channel) return;
    const msg = await channel.messages.fetch(ref.messageId).catch(() => null);
    if (!msg) return;
    await msg.edit({
      embeds: [buildControlEmbed(queue.nowPlaying, queue.items, queue.volume)],
      components: buildControlButtons(!!queue.nowPlaying),
    });
  } catch {}
}

module.exports = { addToQueue, skip, stop, setVolume, getQueueState, setControlRef, stats };

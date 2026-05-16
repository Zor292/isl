const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  NoSubscriberBehavior,
  StreamType,
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
    selfMute: false,
  });

  connection.on('stateChange', (oldState, newState) => {
    logger.info('Voice: ' + oldState.status + ' -> ' + newState.status);
  });

  connection.on('error', (err) => {
    logger.error('Voice error: ' + err.message);
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    return connection;
  } catch (err) {
    connection.destroy();
    throw new Error('فشل الاتصال بالروم الصوتي');
  }
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
    const response = await axios({
      url: item.audioUrl,
      method: 'GET',
      responseType: 'stream',
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'audio/mpeg, audio/*, */*' },
    });

    const passthrough = new PassThrough();
    response.data.pipe(passthrough);

    const resource = createAudioResource(passthrough, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true,
    });
    resource.volume.setVolume(queue.volume);

    if (!queue.player) {
      queue.player = createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
      });
      queue.connection.subscribe(queue.player);

      queue.player.on(AudioPlayerStatus.Idle, () => playNext(guildId, client));
      queue.player.on('error', (err) => {
        logger.error('Player error: ' + err.message);
        playNext(guildId, client);
      });
    }

    queue.player.play(resource);
    if (queue.controlMessageRef) updateControlEmbed(queue, client, guildId);
  } catch (err) {
    logger.error('Stream failed: ' + err.message);
    queue.nowPlaying = null;
    setTimeout(() => playNext(guildId, client), 2000);
  }
}

async function addToQueue(guildId, voiceChannel, item, client) {
  stats.totalRequests++;
  const queue = getQueue(guildId);

  if (!queue.connection || queue.connection.state.status === VoiceConnectionStatus.Destroyed) {
    queue.connection = await connectToChannel(voiceChannel);
    queue.player = null;

    queue.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(queue.connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(queue.connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        queue.connection.destroy();
        queue.connection = null;
        queue.player = null;
        queue.nowPlaying = null;
        queue.items = [];
      }
    });

    queue.connection.on(VoiceConnectionStatus.Destroyed, () => {
      queue.connection = null;
      queue.player = null;
      queue.nowPlaying = null;
      queue.items = [];
    });
  }

  queue.items.push(item);
  if (!queue.nowPlaying) await playNext(guildId, client);
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
  if (queue.player && queue.player.state && queue.player.state.resource && queue.player.state.resource.volume) {
    queue.player.state.resource.volume.setVolume(queue.volume);
  }
}

function getQueueState(guildId) {
  const queue = getQueue(guildId);
  return { nowPlaying: queue.nowPlaying, items: queue.items, volume: queue.volume };
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

const { Events, ActivityType } = require('discord.js');
const cron = require('node-cron');
const logger = require('../utils/logger');
const { getPrayerTimes, getNextPrayer, prayerNames } = require('../utils/prayerApi');
const { prayer, azkarEmbed, hadithEmbed } = require('../utils/embedBuilder');
const azkarData = require('../data/azkar');
const hadiths = require('../data/hadiths');
const config = require('../../config/config');

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    logger.info(`Bot ready: ${client.user.tag}`);

    client.user.setActivity('القرآن الكريم', { type: ActivityType.Listening });

    cron.schedule('0 6 * * *', async () => {
      await sendAzkar(client, 'morning', 'أذكار الصباح');
    });

    cron.schedule('0 16 * * *', async () => {
      await sendAzkar(client, 'evening', 'أذكار المساء');
    });

    cron.schedule('0 22 * * *', async () => {
      await sendAzkar(client, 'sleep', 'أذكار النوم');
    });

    cron.schedule('0 8 * * *', async () => {
      await sendHadith(client);
    });

    cron.schedule('*/30 * * * *', async () => {
      await checkPrayerTimes(client);
    });

    cron.schedule('0 0 * * *', async () => {
      await sendDailyPrayer(client);
    });
  },
};

async function sendAzkar(client, type, title) {
  for (const guild of client.guilds.cache.values()) {
    const channelId = process.env[`AZKAR_OVERRIDE_${guild.id}`] || config.channels.azkar;
    if (!channelId) continue;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) continue;

    const roleId = process.env[`AZKAR_ROLE_${guild.id}`] || config.roles.azkar;
    const embed = azkarEmbed(type, azkarData[type]);
    const content = roleId ? `<@&${roleId}>` : undefined;

    await channel.send({ content, embeds: [embed] }).catch(() => {});
  }
}

async function sendHadith(client) {
  for (const guild of client.guilds.cache.values()) {
    const channelId = process.env[`AZKAR_OVERRIDE_${guild.id}`] || config.channels.azkar;
    if (!channelId) continue;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) continue;
    const h = hadiths[Math.floor(Math.random() * hadiths.length)];
    await channel.send({ embeds: [hadithEmbed(h)] }).catch(() => {});
  }
}

async function sendDailyPrayer(client) {
  try {
    const timings = await getPrayerTimes();
    for (const guild of client.guilds.cache.values()) {
      const channelId = process.env[`PRAYER_OVERRIDE_${guild.id}`] || config.channels.prayer;
      if (!channelId) continue;
      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel) continue;
      const embed = prayer(timings, config.prayer.city);
      await channel.send({ embeds: [embed] }).catch(() => {});
    }
  } catch {}
}

async function checkPrayerTimes(client) {
  try {
    const timings = await getPrayerTimes();
    const next = getNextPrayer(timings);
    const now = new Date();
    const [h, m] = next.time.split(':').map(Number);
    if (now.getHours() === h && Math.abs(now.getMinutes() - m) < 1) {
      for (const guild of client.guilds.cache.values()) {
        const channelId = process.env[`PRAYER_OVERRIDE_${guild.id}`] || config.channels.prayer;
        if (!channelId) continue;
        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel) continue;
        await channel.send({
          content: `🕌 **حان وقت ${next.arabic}** — \`${next.time}\`\nاللهم اجعلنا من المصلين`,
        }).catch(() => {});
      }
    }
  } catch {}
}

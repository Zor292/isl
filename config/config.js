require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,

  prayer: {
    country: process.env.PRAYER_COUNTRY || 'SA',
    city: process.env.PRAYER_CITY || 'Riyadh',
    method: parseInt(process.env.PRAYER_METHOD) || 4,
  },

  channels: {
    azkar: process.env.AZKAR_CHANNEL_ID || null,
    prayer: process.env.PRAYER_CHANNEL_ID || null,
    dashboard: process.env.DASHBOARD_CHANNEL_ID || null,
  },

  roles: {
    azkar: process.env.AZKAR_ROLE_ID || null,
  },

  dashboard: {
    messageId: process.env.DASHBOARD_MESSAGE_ID || null,
  },

  quran: {
    baseUrl: 'https://api.quran.com/api/v4',
    audioBaseUrl: 'https://verses.quran.com',
  },

  colors: {
    primary: 0x000000,
    success: 0x000000,
    error: 0x000000,
    info: 0x000000,
    warning: 0x000000,
  },

  footer: 'by firas',
};

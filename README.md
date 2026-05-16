# 🕌 Islamic Discord Bot

A full-featured Islamic Discord Bot by **firas**.

---

## 📁 Project Structure

```
islamic-bot/
├── config/
│   └── config.js           — Central config (reads from .env)
├── src/
│   ├── commands/
│   │   ├── music/          — /play /stop /skip /queue /volume /controlpanel
│   │   ├── info/           — /prayer /hadith /azkar /verse /surahinfo /reciters /names /help
│   │   └── admin/          — /setazkar /setprayer /setazkarrole /setcity /dashboard /monitor
│   ├── events/
│   │   ├── ready.js        — Cron jobs: azkar, hadith, prayer alerts
│   │   └── interactionCreate.js — Command & button handler
│   ├── utils/
│   │   ├── quranApi.js     — quran.com API integration
│   │   ├── prayerApi.js    — aladhan.com prayer times
│   │   ├── musicQueue.js   — Queue system with auto-play
│   │   ├── embedBuilder.js — All embed builders
│   │   ├── aiMonitor.js    — AI Learning & Monitoring System
│   │   └── logger.js       — File + console logger
│   ├── data/
│   │   ├── hadiths.js      — Curated authentic hadiths
│   │   ├── azkar.js        — Morning/Evening/Sleep/General azkar
│   │   └── reciters.js     — Available Quran reciters
│   └── index.js            — Bot entry point
├── logs/                   — Auto-generated log files
├── deploy-commands.js      — Slash command deployer
├── .env                    — Environment variables
└── package.json
```

---

## ⚙️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure `.env`
```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id

PRAYER_COUNTRY=SA
PRAYER_CITY=Riyadh
PRAYER_METHOD=4

AZKAR_CHANNEL_ID=optional_channel_id
PRAYER_CHANNEL_ID=optional_channel_id
AZKAR_ROLE_ID=optional_role_id
```

### 3. Deploy Commands
```bash
node deploy-commands.js
```

### 4. Start the Bot
```bash
npm start
```

---

## 🎵 How `/play` Works

1. Join a voice channel
2. Use `/play surah:الفاتحة` — bot joins and plays
3. Use `/play surah:الكوثر` — goes into queue, plays after current ends
4. Optional: add `reciter:afasy` to choose a specific reciter
5. Use `/controlpanel` for a persistent control embed with buttons

---

## 🕌 Features

| Feature | Description |
|---|---|
| Quran Playback | Streams from quran.com API |
| Smart Queue | Auto-plays next surah when current ends |
| 10 Reciters | Including Afasy, AbdulBasit, Sudais, Ghamdi... |
| Prayer Times | Auto-alerts via aladhan.com API |
| Azkar | Morning / Evening / Sleep / General |
| Daily Hadith | Curated authentic hadiths |
| Random Verse | Random Quran verse display |
| 99 Names | Random name of Allah with meaning |
| Control Panel | Persistent embed with volume/skip/stop buttons |
| AI Monitor | Usage analytics & error tracking |
| Dashboard | Real-time bot stats |
| Admin Commands | Channel setup, city config, role mentions |

---

## 🚀 Railway Deployment

All secrets are loaded via environment variables. In Railway:
- Add all `.env` values as Railway variables
- Set start command: `node src/index.js`
- Run deploy step: `node deploy-commands.js`

---

*by firas*

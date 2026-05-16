const axios = require('axios');
const config = require('../../config/config');

const prayerNames = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

async function getPrayerTimes(date = new Date()) {
  const d = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const res = await axios.get(`https://api.aladhan.com/v1/timingsByCity/${d}`, {
    params: {
      city: config.prayer.city,
      country: config.prayer.country,
      method: config.prayer.method,
    },
  });
  return res.data.data.timings;
}

function getNextPrayer(timings) {
  const now = new Date();
  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  for (const p of prayers) {
    const [h, m] = timings[p].split(':').map(Number);
    const t = new Date();
    t.setHours(h, m, 0, 0);
    if (t > now) return { name: p, arabic: prayerNames[p], time: timings[p] };
  }
  return { name: 'Fajr', arabic: prayerNames['Fajr'], time: timings['Fajr'] };
}

module.exports = { getPrayerTimes, getNextPrayer, prayerNames };

const axios = require('axios');
const config = require('../../config/config');
const reciters = require('../data/reciters');

async function getSurahList() {
  const res = await axios.get(`${config.quran.baseUrl}/chapters?language=ar`);
  return res.data.chapters;
}

async function getSurahByName(name) {
  const chapters = await getSurahList();
  const normalized = name.trim().toLowerCase();
  return chapters.find(c =>
    c.name_simple.toLowerCase().includes(normalized) ||
    c.name_arabic.includes(name) ||
    c.translated_name?.name?.toLowerCase().includes(normalized) ||
    String(c.id) === normalized
  );
}

async function getReciterById(id) {
  const res = await axios.get(`${config.quran.baseUrl}/audio-files/${id}?per_page=1`);
  return res.data;
}

async function getAudioUrl(surahId, reciterId) {
  const res = await axios.get(`${config.quran.baseUrl}/chapter_recitations/${reciterId}/${surahId}`);
  return res.data.audio_file?.audio_url || null;
}

function resolveReciter(input) {
  if (!input) return reciters[Math.floor(Math.random() * reciters.length)];
  const normalized = input.trim().toLowerCase();
  return reciters.find(r =>
    r.aliases.some(a => a.toLowerCase().includes(normalized) || normalized.includes(a.toLowerCase()))
  ) || reciters[Math.floor(Math.random() * reciters.length)];
}

async function getSurahVerses(surahId) {
  const res = await axios.get(`${config.quran.baseUrl}/verses/by_chapter/${surahId}?language=ar&words=false&per_page=50`);
  return res.data.verses;
}

module.exports = { getSurahList, getSurahByName, getAudioUrl, resolveReciter, getSurahVerses };

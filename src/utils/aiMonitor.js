const logger = require('./logger');

const monitor = {
  commandUsage: {},
  errors: [],
  surahRequests: {},
  reciterRequests: {},
  peakHours: Array(24).fill(0),
  startTime: Date.now(),
};

function trackCommand(commandName, userId) {
  if (!monitor.commandUsage[commandName]) monitor.commandUsage[commandName] = 0;
  monitor.commandUsage[commandName]++;
  monitor.peakHours[new Date().getHours()]++;
  logger.info(`Command used: ${commandName} by ${userId}`);
}

function trackSurah(surahName) {
  if (!monitor.surahRequests[surahName]) monitor.surahRequests[surahName] = 0;
  monitor.surahRequests[surahName]++;
}

function trackReciter(reciterName) {
  if (!monitor.reciterRequests[reciterName]) monitor.reciterRequests[reciterName] = 0;
  monitor.reciterRequests[reciterName]++;
}

function trackError(error, context) {
  monitor.errors.push({ error: error.message, context, time: new Date().toISOString() });
  if (monitor.errors.length > 100) monitor.errors.shift();
  logger.error(`Error in ${context}: ${error.message}`);
}

function getMostUsed(obj, limit = 5) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k, v]) => `${k}: ${v}`);
}

function getPeakHour() {
  const max = Math.max(...monitor.peakHours);
  return monitor.peakHours.indexOf(max);
}

function getUptimeStr() {
  const ms = Date.now() - monitor.startTime;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function getReport() {
  return {
    uptime: getUptimeStr(),
    totalCommands: Object.values(monitor.commandUsage).reduce((a, b) => a + b, 0),
    topCommands: getMostUsed(monitor.commandUsage),
    topSurahs: getMostUsed(monitor.surahRequests),
    topReciters: getMostUsed(monitor.reciterRequests),
    peakHour: `${getPeakHour()}:00`,
    recentErrors: monitor.errors.slice(-5),
  };
}

module.exports = { trackCommand, trackSurah, trackReciter, trackError, getReport };

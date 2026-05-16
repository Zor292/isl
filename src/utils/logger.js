const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../logs/bot.log');
fs.mkdirSync(path.dirname(logFile), { recursive: true });

function timestamp() {
  return new Date().toISOString();
}

function write(level, msg) {
  const line = `[${timestamp()}] [${level.toUpperCase()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(line.trim());
}

module.exports = {
  info: (m) => write('info', m),
  warn: (m) => write('warn', m),
  error: (m) => write('error', m),
  debug: (m) => write('debug', m),
};

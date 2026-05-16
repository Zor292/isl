require('dotenv').config();

const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const config = require('../config/config');

async function deployCommands(commandsData) {
  const rest = new REST({ version: '10' }).setToken(config.token);
  logger.info(`Auto-deploying ${commandsData.length} commands...`);
  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commandsData }
  );
  logger.info('✅ Commands deployed successfully.');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

function loadCommands(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      loadCommands(full);
    } else if (entry.name.endsWith('.js') && entry.name !== 'controlEmbed.js') {
      const cmd = require(full);
      if (cmd.data && cmd.execute) {
        client.commands.set(cmd.data.name, cmd);
        logger.info(`Loaded command: ${cmd.data.name}`);
      }
    }
  }
}

loadCommands(path.join(__dirname, 'commands'));

const commandsData = [...client.commands.values()].map(c => c.data.toJSON());
deployCommands(commandsData).catch(err => logger.error(`Deploy failed: ${err.message}`));

const eventsDir = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsDir).filter(f => f.endsWith('.js'))) {
  const event = require(path.join(eventsDir, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(config.token).catch(err => {
  logger.error(`Login failed: ${err.message}`);
  process.exit(1);
});

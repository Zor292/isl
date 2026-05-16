require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];

function collectCommands(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectCommands(full);
    } else if (entry.name.endsWith('.js') && entry.name !== 'controlEmbed.js') {
      const cmd = require(full);
      if (cmd.data) commands.push(cmd.data.toJSON());
    }
  }
}

collectCommands(path.join(__dirname, 'src', 'commands'));

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  console.log(`Deploying ${commands.length} commands...`);
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands },
  );
  console.log('✅ Commands deployed successfully.');
})().catch(console.error);

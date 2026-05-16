const { SlashCommandBuilder } = require('discord.js');
const { setVolume } = require('../../utils/musicQueue');
const { success, error } = require('../../utils/embedBuilder');
const { trackCommand } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set playback volume (0-200)')
    .addIntegerOption(o =>
      o.setName('level')
        .setDescription('Volume level 0–200')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(200)
    ),

  async execute(interaction) {
    trackCommand('volume', interaction.user.id);
    const level = interaction.options.getInteger('level');
    setVolume(interaction.guildId, level / 100);
    await interaction.reply({ embeds: [success('Volume Updated', `Volume set to **${level}%**`)] });
  },
};

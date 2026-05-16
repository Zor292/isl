const { SlashCommandBuilder } = require('discord.js');
const azkarData = require('../../data/azkar');
const { azkarEmbed } = require('../../utils/embedBuilder');
const { trackCommand } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('azkar')
    .setDescription('Display Islamic azkar (dhikr)')
    .addStringOption(o =>
      o.setName('type')
        .setDescription('Type of azkar')
        .setRequired(true)
        .addChoices(
          { name: '🌅 Morning Azkar', value: 'morning' },
          { name: '🌆 Evening Azkar', value: 'evening' },
          { name: '🌙 Sleep Azkar', value: 'sleep' },
          { name: '📿 General Azkar', value: 'general' },
        )
    ),

  async execute(interaction) {
    trackCommand('azkar', interaction.user.id);
    const type = interaction.options.getString('type');
    const embed = azkarEmbed(type, azkarData[type]);
    await interaction.reply({ embeds: [embed] });
  },
};

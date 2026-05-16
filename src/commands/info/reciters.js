const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const reciters = require('../../data/reciters');
const config = require('../../../config/config');
const { trackCommand } = require('../../utils/aiMonitor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reciters')
    .setDescription('List all available Quran reciters'),

  async execute(interaction) {
    trackCommand('reciters', interaction.user.id);
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('🎤 Available Reciters')
      .setDescription(reciters.map((r, i) => `**${i + 1}.** ${r.name}\n└ Use: \`${r.aliases[0]}\``).join('\n\n'))
      .setFooter({ text: config.footer })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

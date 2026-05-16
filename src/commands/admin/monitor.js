const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getReport } = require('../../utils/aiMonitor');
const config = require('../../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('monitor')
    .setDescription('AI Learning & Monitoring System report')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const report = getReport();
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('🤖 AI Monitoring System Report')
      .addFields(
        { name: '⏱️ Uptime', value: report.uptime, inline: true },
        { name: '📊 Total Commands', value: String(report.totalCommands), inline: true },
        { name: '🕐 Peak Hour', value: report.peakHour, inline: true },
        { name: '🏆 Top Commands', value: report.topCommands.join('\n') || '—' },
        { name: '📖 Top Surahs', value: report.topSurahs.join('\n') || '—', inline: true },
        { name: '🎤 Top Reciters', value: report.topReciters.join('\n') || '—', inline: true },
        {
          name: '⚠️ Recent Errors',
          value: report.recentErrors.length > 0
            ? report.recentErrors.map(e => `\`${e.context}\`: ${e.error}`).join('\n')
            : 'No recent errors ✅',
        }
      )
      .setFooter({ text: config.footer })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

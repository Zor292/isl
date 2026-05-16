const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config/config');
const { trackCommand } = require('../../utils/aiMonitor');

const names = [
  { arabic: 'الله', transliteration: 'Allah', meaning: 'The One worthy of all worship' },
  { arabic: 'الرحمن', transliteration: 'Ar-Rahman', meaning: 'The Most Compassionate' },
  { arabic: 'الرحيم', transliteration: 'Ar-Raheem', meaning: 'The Most Merciful' },
  { arabic: 'الملك', transliteration: 'Al-Malik', meaning: 'The King, The Sovereign' },
  { arabic: 'القدوس', transliteration: 'Al-Quddus', meaning: 'The Most Holy' },
  { arabic: 'السلام', transliteration: 'As-Salam', meaning: 'The Source of Peace' },
  { arabic: 'المؤمن', transliteration: "Al-Mu'min", meaning: 'The Granter of Security' },
  { arabic: 'المهيمن', transliteration: 'Al-Muhaymin', meaning: 'The Guardian, The Protector' },
  { arabic: 'العزيز', transliteration: 'Al-Aziz', meaning: 'The Almighty' },
  { arabic: 'الجبار', transliteration: 'Al-Jabbar', meaning: 'The Compeller' },
  { arabic: 'المتكبر', transliteration: 'Al-Mutakabbir', meaning: 'The Supreme, The Majestic' },
  { arabic: 'الخالق', transliteration: 'Al-Khaliq', meaning: 'The Creator' },
  { arabic: 'البارئ', transliteration: "Al-Bari'", meaning: 'The Originator' },
  { arabic: 'المصور', transliteration: 'Al-Musawwir', meaning: 'The Fashioner of Forms' },
  { arabic: 'الغفار', transliteration: 'Al-Ghaffar', meaning: 'The All-Forgiving' },
  { arabic: 'القهار', transliteration: 'Al-Qahhar', meaning: 'The Subduer' },
  { arabic: 'الوهاب', transliteration: 'Al-Wahhab', meaning: 'The Bestower' },
  { arabic: 'الرزاق', transliteration: 'Ar-Razzaq', meaning: 'The Provider' },
  { arabic: 'الفتاح', transliteration: 'Al-Fattah', meaning: 'The Opener, The Judge' },
  { arabic: 'العليم', transliteration: "Al-'Aleem", meaning: 'The All-Knowing' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('names')
    .setDescription('Get a random name from the 99 Beautiful Names of Allah'),

  async execute(interaction) {
    trackCommand('names', interaction.user.id);
    const name = names[Math.floor(Math.random() * names.length)];
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('✨ من أسماء الله الحسنى')
      .addFields(
        { name: 'الاسم', value: `## ${name.arabic}`, inline: true },
        { name: 'Transliteration', value: name.transliteration, inline: true },
        { name: 'Meaning', value: name.meaning },
      )
      .setFooter({ text: config.footer })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success } = require('../../utils/embedBuilder');
const config = require('../../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setcity')
    .setDescription('Set the city for prayer time calculations')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o =>
      o.setName('city')
        .setDescription('City name (e.g. Mecca, Riyadh, Cairo)')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('country')
        .setDescription('Country code (e.g. SA, EG, AE)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const city = interaction.options.getString('city');
    const country = interaction.options.getString('country');
    config.prayer.city = city;
    config.prayer.country = country;
    await interaction.reply({ embeds: [success('City Updated', `Prayer times now calculated for **${city}, ${country}**`)] });
  },
};

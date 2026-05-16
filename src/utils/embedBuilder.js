const { EmbedBuilder } = require('discord.js');
const config = require('../../config/config');

function base(color = config.colors.primary) {
  return new EmbedBuilder()
    .setColor(color)
    .setFooter({ text: config.footer })
    .setTimestamp();
}

function success(title, description) {
  return base().setTitle(`✅ ${title}`).setDescription(description);
}

function error(title, description) {
  return base().setTitle(`❌ ${title}`).setDescription(description);
}

function info(title, description) {
  return base().setTitle(`📖 ${title}`).setDescription(description);
}

function prayer(timings, city) {
  const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const arabicNames = {
    Fajr: '🌙 الفجر',
    Sunrise: '🌅 الشروق',
    Dhuhr: '☀️ الظهر',
    Asr: '🌤️ العصر',
    Maghrib: '🌆 المغرب',
    Isha: '🌙 العشاء',
  };
  const fields = prayers.map(p => ({
    name: arabicNames[p],
    value: `\`${timings[p]}\``,
    inline: true,
  }));
  return base()
    .setTitle('🕌 مواقيت الصلاة')
    .setDescription(`**المدينة:** ${city}`)
    .addFields(fields);
}

function quranEmbed(surah, reciter, queuePos = 0) {
  return base()
    .setTitle(`📖 ${surah.name_arabic} - ${surah.name_simple}`)
    .setDescription(`**القارئ:** ${reciter.name}\n**عدد الآيات:** ${surah.verses_count}`)
    .addFields(
      { name: '🎵 الحالة', value: queuePos === 0 ? '▶️ يُشغَّل الآن' : `⏳ في قائمة الانتظار (${queuePos})`, inline: true },
      { name: '🔢 رقم السورة', value: String(surah.id), inline: true }
    );
}

function hadithEmbed(hadith) {
  return base()
    .setTitle('📜 حديث اليوم')
    .setDescription(`> ${hadith.text}`)
    .addFields(
      { name: '👤 الراوي', value: hadith.narrator, inline: true },
      { name: '📚 المصدر', value: hadith.source, inline: true }
    );
}

function azkarEmbed(type, azkarList) {
  const titles = {
    morning: '🌅 أذكار الصباح',
    evening: '🌆 أذكار المساء',
    sleep: '🌙 أذكار النوم',
    general: '📿 أذكار عامة',
  };
  const embed = base().setTitle(titles[type] || '📿 الأذكار');
  azkarList.slice(0, 8).forEach((z, i) => {
    embed.addFields({ name: `${i + 1}. ${z.count}`, value: z.text });
  });
  return embed;
}

function dashboardEmbed(queueInfo, nowPlaying, stats) {
  const embed = base()
    .setTitle('🕌 Islamic Bot — Dashboard')
    .setDescription('نظام التحكم المركزي');

  embed.addFields({
    name: '🎵 يُشغَّل الآن',
    value: nowPlaying
      ? `**${nowPlaying.surah.name_arabic}** — ${nowPlaying.reciter.name}`
      : '—',
  });

  embed.addFields({
    name: '📋 قائمة الانتظار',
    value: queueInfo.length > 0
      ? queueInfo.map((q, i) => `${i + 1}. ${q.surah.name_arabic}`).join('\n')
      : 'فارغة',
  });

  embed.addFields(
    { name: '📊 إجمالي الطلبات', value: String(stats.totalRequests), inline: true },
    { name: '🔄 مرات التشغيل', value: String(stats.totalPlays), inline: true }
  );

  return embed;
}

module.exports = { base, success, error, info, prayer, quranEmbed, hadithEmbed, azkarEmbed, dashboardEmbed };

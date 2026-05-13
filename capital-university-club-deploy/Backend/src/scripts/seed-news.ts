/**
 * Seed news items into media_posts table for landing page News section.
 * Run with: TS_NODE_TRANSPILE_ONLY=true node -r ts-node/register src/scripts/seed-news.ts
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { AppDataSource } from '../database/data-source';
import { MediaPost } from '../entities/MediaPost';

const NEWS: Array<Partial<MediaPost>> = [
  {
    title: 'فتح باب التسجيل لعضويات نادي جامعة العاصمة',
    description:
      'يعلن نادي جامعة العاصمة عن فتح باب التسجيل لعضويات النادي لجميع فئات الطلاب وأعضاء هيئة التدريس والموظفين والعاملين بالجامعة. تتنوع باقات العضوية لتناسب جميع الفئات مع تخفيضات حصرية للأعضاء الجدد. سجّل الآن واستمتع بجميع مرافق النادي الحديثة والتدريبات الاحترافية.',
    category: 'أخبار',
    images: ['uploads/news/club-hero.jpg'],
    date: new Date('2026-05-05'),
  },
  {
    title: 'فتح باب الاشتراك في الألعاب الرياضية وأكاديميات النادي',
    description:
      'يسعد نادي جامعة العاصمة أن يعلن عن فتح باب الاشتراك في جميع الأكاديميات الرياضية بالنادي للفصل الجديد، تشمل: كرة القدم، السباحة، الجمباز، التايكوندو، الكاراتيه، الإسكواش، الملاكمة، التنس وغيرها. تتوفر برامج تدريبية لمختلف الأعمار والمستويات بإشراف نخبة من المدربين المعتمدين.',
    category: 'إعلان',
    images: ['uploads/news/image1.jpg'],
    date: new Date('2026-05-08'),
  },
  {
    title: 'فريق كرة القدم بنادي جامعة العاصمة يحقق فوزاً مستحقاً',
    description:
      'حقّق فريق كرة القدم الأول بنادي جامعة العاصمة فوزاً مهماً في آخر مبارياته بنتيجة 3-1 على أحد المنافسين الأقوياء في الدوري. أداء مميز من اللاعبين وعمل جماعي رفع راية النادي عالياً. تتقدم إدارة النادي بخالص التهاني للفريق والجهاز الفني على هذا الإنجاز.',
    category: 'أخبار',
    images: ['uploads/news/football-juniors.jpg'],
    date: new Date('2026-05-10'),
  },
  {
    title: 'بطل الملاكمة بالنادي يتوج ببطولة الجمهورية',
    description:
      'حصل لاعب فريق الملاكمة بنادي جامعة العاصمة على لقب بطولة الجمهورية للملاكمة بعد مشوار رائع في البطولة وتفوق على عدد من الأبطال. هذا الإنجاز يضاف لسلسلة إنجازات النادي في الرياضات الفردية ويؤكد المستوى الفني العالي لمنظومة التدريب بالنادي.',
    category: 'أخبار',
    images: ['uploads/news/boxing.jpg'],
    date: new Date('2026-05-11'),
  },
  {
    title: 'تهنئة معالي رئيس الجامعة الأستاذ الدكتور قنديل لفريق كرة القدم',
    description:
      'تقدّم السيد الأستاذ الدكتور قنديل، رئيس جامعة العاصمة، بأحرّ التهاني لفريق كرة القدم بالنادي بمناسبة صعوده الرسمي إلى الدوري الممتاز "ب". وأشاد سيادته بالعمل الدؤوب لإدارة النادي والجهاز الفني وروح العزيمة التي أظهرها اللاعبون، مؤكداً دعم الجامعة الكامل للأنشطة الرياضية وكافة الأكاديميات.',
    category: 'أخبار',
    images: ['uploads/news/congratulations.jpg'],
    date: new Date('2026-05-12'),
  },
  {
    title: 'فريق كرة السلة يحقق المركز الأول في بطولة الجامعات',
    description:
      'أحرز فريق كرة السلة بنادي جامعة العاصمة المركز الأول في بطولة الجامعات المصرية لكرة السلة بعد فوزه في النهائي بفارق 12 نقطة. اللاعبون قدّموا أداءً رائعاً طوال البطولة ورفعوا اسم الجامعة عالياً.',
    category: 'أخبار',
    images: ['uploads/news/basketball.jpg'],
    date: new Date('2026-05-03'),
  },
  {
    title: 'انطلاق فعاليات بطولة الجمباز الفني والإيقاعي',
    description:
      'انطلقت فعاليات بطولة الجمباز الفني والإيقاعي بنادي جامعة العاصمة بمشاركة أكثر من 80 لاعبة من مختلف الفئات السنية. البطولة تستمر لمدة 3 أيام بمشاركة لجنة تحكيم محترفة، ويُتوقع أن تشهد منافسات قوية على المراكز الأولى.',
    category: 'فعاليات',
    images: ['uploads/news/gymnastics.jpg'],
    date: new Date('2026-04-28'),
  },
  {
    title: 'افتتاح أكاديمية التايكوندو بأحدث التجهيزات',
    description:
      'افتتح النادي رسمياً أكاديمية التايكوندو بفرع الهرم بأحدث التجهيزات والمعدات الرياضية الاحترافية. الأكاديمية تستقبل الأعمار من 6 سنوات فأكثر وتقدّم برامج تدريبية متدرجة وفق المعايير العالمية تحت إشراف مدربين معتمدين دولياً.',
    category: 'إعلان',
    images: ['uploads/news/taekwondo.jpg'],
    date: new Date('2026-04-22'),
  },
  {
    title: 'فعاليات اليوم الرياضي للأطفال بمشاركة 200 طفل',
    description:
      'احتفل نادي جامعة العاصمة باليوم الرياضي للأطفال بمشاركة أكثر من 200 طفل من أبناء أعضاء النادي. تضمنت الفعاليات سباقات ودياتية، مسابقات ترفيهية، وعروض للألعاب الرياضية المختلفة، وتم توزيع الجوائز والميداليات على المشاركين في جو من البهجة والمرح.',
    category: 'فعاليات',
    images: ['uploads/news/image2.jpg'],
    date: new Date('2026-04-15'),
  },
  {
    title: 'دورة تدريبية للحكام بإشراف الاتحاد المصري',
    description:
      'استضاف نادي جامعة العاصمة دورة تدريبية متخصصة للحكام في كرة القدم بإشراف الاتحاد المصري لكرة القدم. شارك في الدورة 30 حكماً من مختلف المحافظات، وتناولت أحدث القوانين الدولية، وتم منح المشاركين شهادات معتمدة.',
    category: 'أخبار',
    images: ['uploads/news/image3.jpg'],
    date: new Date('2026-04-08'),
  },

  // ─── ألبوم صور (تظهر تحت فلتر "الصور") ──────────────────────────
  {
    title: 'لقطات من تدريبات فريق كرة اليد',
    description:
      'مجموعة من الصور لتدريبات فريق كرة اليد بنادي جامعة العاصمة، تعكس روح الفريق والمستوى الفني العالي للاعبين.',
    category: 'صور',
    images: [
      'uploads/news/handball.jpg',
      'uploads/news/image4.jpg',
      'uploads/news/image5.jpg',
    ],
    date: new Date('2026-05-09'),
  },
  {
    title: 'صور من بطولة الاسكواش والتنس بفرع الزمالك',
    description:
      'تغطية مصورة لمنافسات بطولة الإسكواش والتنس التي نُظمت بفرع الزمالك، بمشاركة عدد كبير من اللاعبين والمتنافسين.',
    category: 'صور',
    images: [
      'uploads/news/squash.jpg',
      'uploads/news/tennis.jpg',
    ],
    date: new Date('2026-05-06'),
  },
  {
    title: 'ألبوم صور بطولة المصارعة الحرة',
    description:
      'صور من بطولة المصارعة الحرة التي استضافها النادي بمشاركة 40 لاعباً من مختلف الفئات والأوزان.',
    category: 'صور',
    images: [
      'uploads/news/wrestling.jpg',
      'uploads/news/image6.jpg',
    ],
    date: new Date('2026-05-01'),
  },
  {
    title: 'صور من احتفال النادي بعيد الرياضة',
    description:
      'صور تذكارية من احتفال النادي بعيد الرياضة بمشاركة الإدارة وأبطال النادي في مختلف الألعاب.',
    category: 'صور',
    images: [
      'uploads/news/image1.jpg',
      'uploads/news/image2.jpg',
      'uploads/news/club-hero.jpg',
    ],
    date: new Date('2026-04-25'),
  },

  // ─── الفيديوهات (تظهر تحت فلتر "الفيديوهات") ────────────────────
  {
    title: 'فيديو: من هنا يبدأ الأبطال',
    description:
      'فيديو ترويجي يعرض لمحات من تدريبات الأبطال داخل نادي جامعة العاصمة عبر مختلف الألعاب الرياضية.',
    category: 'فيديو',
    images: ['uploads/news/champions-start-here.jpg'],
    videoUrl: 'uploads/news/champions.mp4',
    videoDuration: '1:30',
    date: new Date('2026-05-12'),
  },
  {
    title: 'فيديو: تدريبات الملاكمة باحترافية',
    description:
      'لقطات من حصص تدريبات الملاكمة بالنادي، تظهر مستوى التحضير البدني والمهاري للمتنافسين.',
    category: 'فيديو',
    images: ['uploads/news/boxing.jpg'],
    videoUrl: 'uploads/news/boxing.mp4',
    videoDuration: '0:55',
    date: new Date('2026-05-04'),
  },
  {
    title: 'فيديو: مهارات كرة الريشة في بطولة النادي',
    description:
      'مقتطفات من منافسات كرة الريشة بنادي جامعة العاصمة، تعرض مهارة ودقة اللاعبين خلال البطولة.',
    category: 'فيديو',
    images: ['uploads/news/tennis.jpg'],
    videoUrl: 'uploads/news/badminton.mp4',
    videoDuration: '1:10',
    date: new Date('2026-04-30'),
  },

  // ─── فعالية إضافية ──────────────────────────────────────────────
  {
    title: 'بطولة الجمباز الإيقاعي - مرحلة المتقدمات',
    description:
      'انطلاق منافسات الجمباز الإيقاعي لمرحلة المتقدمات في بطولة النادي السنوية، بمشاركة لاعبات من جميع الفروع.',
    category: 'فعاليات',
    images: ['uploads/news/gymnastics-2.jpg'],
    date: new Date('2026-04-19'),
  },
];

async function main() {
  console.log('Connecting...');
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(MediaPost);

  // Wipe existing news (optional — keeps the seed idempotent)
  await repo.clear();
  console.log('Cleared existing media_posts.');

  for (const item of NEWS) {
    await repo.save(item);
    console.log(`  + ${item.title}`);
  }

  const count = await repo.count();
  console.log(`\nDone. ${count} news items in media_posts.`);
  await AppDataSource.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed-news failed:', err);
  process.exit(1);
});

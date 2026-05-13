import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Send,
  CheckCircle,
  HelpCircle,
  Users,
  Calendar,
  CreditCard,
  Baby,
  Trophy,
  Building2,
  Search,
  ChevronDown,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const CONTACT_EMAIL = "huc@hq.helwan.edu.eg";
const CLUB_LOCATION_URL = "https://maps.app.goo.gl/cvi5kAenfG6cPwBh6";
const CLUB_MAP_EMBED_URL =
  "https://maps.google.com/maps?hl=ar&q=%D8%AC%D8%A7%D9%85%D8%B9%D8%A9%20%D8%AD%D9%84%D9%88%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%A7%D9%87%D8%B1%D8%A9&z=13&output=embed";

interface FaqItem {
  q: string;
  a: string;
}
interface FaqCategory {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: FaqItem[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    key: "memberships",
    label: "العضويات والاشتراك",
    icon: Users,
    items: [
      {
        q: "كيف يمكنني التسجيل كعضو جديد في نادي جامعة العاصمة؟",
        a: "يمكنك التسجيل أونلاين من خلال صفحة \"سجّل الآن\" على الموقع، أو بزيارة مكتب التسجيل في أحد فروع النادي. يلزمك تجهيز: شهادة ميلاد سارية، بطاقة رقم قومي، صورتين شخصيتين، كشف طبي حديث، ودفع رسوم استمارة العضوية (250 جنيه مرة واحدة) بالإضافة إلى رسوم العضوية حسب الفئة.",
      },
      {
        q: "ما أنواع العضويات المتاحة؟",
        a: "النادي يقدّم 7 فئات: عضو هيئة تدريس، عضو عامل (4 شرائح حسب الراتب)، طالب أو رياضي متميز، عضو تابع (الأسرة)، عضو زائر، عضو موسمي مصري (6 أشهر)، وعضو موسمي للأجانب (شهر/6 أشهر/سنة). تفاصيل الأسعار في قسم العضويات بالموقع.",
      },
      {
        q: "هل أحتاج إلى أن أكون من منسوبي الجامعة للاشتراك؟",
        a: "لا، النادي مفتوح أيضاً للأعضاء الزوار من خارج الجامعة. رسوم العضوية للزائر 5000 جنيه سنوياً. الأعضاء من منسوبي الجامعة لهم أسعار خاصة.",
      },
      {
        q: "هل يمكنني تقسيط رسوم العضوية؟",
        a: "نعم، التقسيط متاح لبعض الفئات (هيئة التدريس، الموظفين، الطلاب، التابعين، الزائرين). عدد الأقساط يصل إلى 4 أقساط حسب الفئة. التقسيط غير متاح للعضوية الموسمية.",
      },
      {
        q: "هل تشمل الأسعار ضريبة القيمة المضافة؟",
        a: "لا، رسوم العضويات المعلنة لا تشمل ضريبة القيمة المضافة (14%). تُضاف الضريبة عند الدفع.",
      },
    ],
  },
  {
    key: "sports",
    label: "الألعاب الرياضية والأكاديميات",
    icon: Trophy,
    items: [
      {
        q: "ما الألعاب الرياضية المتاحة بالنادي؟",
        a: "النادي يقدّم 12 لعبة: كرة القدم، كرة السلة، الكرة الطائرة، التنس، السباحة، الجودو، الكاراتيه، الإسكواش، الشطرنج، الجمباز، كرة اليد، والملاكمة. تفاصيل كل لعبة من قسم الألعاب الرياضية على الموقع.",
      },
      {
        q: "كيف أشترك في أكاديمية لعبة معينة؟",
        a: "ادخل صفحة \"الألعاب الرياضية\"، اختار الفرع واللعبة، اضغط \"تعرف على تفاصيل الاشتراك\". هتلاقي كل التفاصيل: الفئات العمرية، الرسوم، الجدول، المدرب المسؤول، والمستندات المطلوبة.",
      },
      {
        q: "هل يلزمني أن أكون عضواً في النادي لأشترك في أكاديمية رياضية؟",
        a: "نعم، الاشتراك في الأكاديميات يستلزم عضوية سارية في النادي. لو إنت لاعب متميز قد تستفيد من فئة \"عضوية الرياضي المتميز\" برسوم 1000 جنيه سنوياً.",
      },
      {
        q: "هل توفّرون تدريبات للسيدات بشكل منفصل؟",
        a: "نعم، فرع الزمالك (كلية علوم الرياضة للبنات) مخصص للسيدات والفتيات بالكامل. كما تتوفر حصص مخصصة للسيدات في باقي الفروع لبعض الألعاب.",
      },
      {
        q: "ما الفئات العمرية المتاحة؟",
        a: "تختلف من لعبة لأخرى. عموماً: براعم (4-6 سنوات)، أشبال (7-9)، ناشئين (10-13)، شباب (14-17)، كبار (18+). تفاصيل كل لعبة في صفحتها المخصصة.",
      },
      {
        q: "هل في تدريبات تجريبية قبل الاشتراك؟",
        a: "نعم، يمكن حضور حصة تجريبية واحدة مجاناً بعد التواصل مع مدرب الأكاديمية لتحديد موعد مناسب.",
      },
    ],
  },
  {
    key: "kids",
    label: "إلحاق الأطفال",
    icon: Baby,
    items: [
      {
        q: "ما السن الأدنى لإلحاق طفلي بالنادي؟",
        a: "السن الأدنى للاشتراك في الأكاديميات الرياضية هو 4 سنوات (في كرة القدم والسباحة والجمباز). بعض الألعاب تبدأ من سن 6 أو 7 أو 8 سنوات.",
      },
      {
        q: "هل أحتاج لتسجيل ابني/ابنتي كعضو منفصل أم يكفي اشتراكي كأب؟",
        a: "الأبناء يندرجون تحت \"عضوية التابع\" (2000 جنيه سنوياً للطفل). كل تابع له بطاقة عضوية مستقلة وتمنحه دخول النادي والاشتراك في الأكاديميات.",
      },
      {
        q: "هل توجد منطقة آمنة للأطفال داخل النادي؟",
        a: "نعم، الفرع الرئيسي بجامعة العاصمة فيه منطقتان مخصصتان للأطفال (kids area) بإشراف متخصصين، مع أنشطة تعليمية وترفيهية. باقي الفروع فيها منطقة واحدة على الأقل.",
      },
      {
        q: "هل توجد حصص خاصة لرياض الأطفال (ما قبل المدرسة)؟",
        a: "نعم، أكاديميات كرة القدم والسباحة والجمباز والكاراتيه تقدّم حصص \"براعم\" مخصصة لمرحلة (4-6 سنوات) بإيقاع تأسيسي مرح يركّز على التآزر الحركي.",
      },
      {
        q: "هل يلزم وجود ولي الأمر أثناء التدريب؟",
        a: "للأطفال من 4 إلى 6 سنوات نُفضّل وجود ولي الأمر في أول حصتين. الأكبر سناً يكفي وجود ولي الأمر عند التوصيل والاستلام.",
      },
    ],
  },
  {
    key: "courts",
    label: "حجز الملاعب",
    icon: Calendar,
    items: [
      {
        q: "كيف أحجز ملعب أو مرفق رياضي؟",
        a: "من صفحة العضو الخاصة بك على الموقع، روح لـ \"حجز الملاعب\"، اختار الفرع والرياضة والملعب والوقت. الحجز يثبت بعد الدفع مباشرة عبر الموقع.",
      },
      {
        q: "هل يمكنني الحجز قبل وقت كبير؟",
        a: "نعم، يمكنك الحجز قبل أسبوعين كحد أقصى. الحجز المتأخر متاح حتى ساعة قبل الموعد إذا توفّر ملعب.",
      },
      {
        q: "هل يمكن إلغاء أو تعديل الحجز؟",
        a: "نعم، الإلغاء المجاني متاح حتى 24 ساعة قبل الموعد. الإلغاء بعد ذلك يخصم 50% من القيمة. التعديل (تغيير الوقت) متاح مجاناً قبل 6 ساعات من الموعد.",
      },
      {
        q: "كم سعر إيجار الملعب؟",
        a: "يختلف حسب الملعب والفرع. ملاعب التنس والإسكواش 150-200 جنيه/ساعة. ملاعب كرة القدم 250-400 جنيه/ساعة. ملاعب كرة السلة والطائرة 200-300 جنيه/ساعة.",
      },
      {
        q: "هل يمكن مشاركة الأصدقاء في الحجز؟",
        a: "نعم، بعد الحجز ستحصل على رابط مشاركة يمكنك إرساله للأصدقاء لينضموا للحجز. كل مشارك يجب أن يكون عضواً في النادي أو ضيفاً مصرّح به.",
      },
    ],
  },
  {
    key: "facilities",
    label: "المرافق والخدمات",
    icon: Building2,
    items: [
      {
        q: "ما المرافق الموجودة بالنادي؟",
        a: "الفرع الرئيسي فيه 26 ملعب، 3 حمامات سباحة، 2 مطعم، 2 منطقة أطفال، صالة جيم، وادي الفنون، مكتبة، ومنطقة اجتماعية. باقي الفروع لها مرافق متخصصة حسب الكلية.",
      },
      {
        q: "هل توجد حمامات سباحة مغطّاة؟",
        a: "نعم، فرع الزمالك يوفّر حمام سباحة مغطّى للسيدات. الفرع الرئيسي يضم حمام سباحة أولمبي مفتوح وآخر مغطّى للتدريبات في الشتاء.",
      },
      {
        q: "هل في مواقف سيارات؟",
        a: "نعم، كل الفروع توفّر مواقف سيارات مجانية للأعضاء. الفرع الرئيسي بالعاصمة الإدارية فيه مواقف لأكثر من 500 سيارة.",
      },
      {
        q: "هل توجد كافيتيريا أو مطعم؟",
        a: "نعم، الفرع الرئيسي فيه 2 مطعم بقائمة طعام صحية ومتنوعة، بالإضافة لكافيتيريا في كل فرع.",
      },
      {
        q: "هل توفّرون wifi مجاني؟",
        a: "نعم، الـ wifi متاح بسرعة عالية في كل أرجاء النادي مجاناً للأعضاء. يمكن الاتصال باستخدام رقم العضوية.",
      },
    ],
  },
  {
    key: "payments",
    label: "الرسوم والمدفوعات",
    icon: CreditCard,
    items: [
      {
        q: "ما طرق الدفع المتاحة؟",
        a: "نقبل: نقدي بمكاتب الفروع، بطاقات الائتمان (Visa / Mastercard)، التحويل البنكي، فوري والمحافظ الإلكترونية. الدفع أونلاين متاح للحجوزات والاشتراكات.",
      },
      {
        q: "كم رسوم التجديد السنوي؟",
        a: "تختلف حسب الفئة: عضو هيئة التدريس والعضو العامل 300 جنيه سنوياً، الطالب/الرياضي 1000 جنيه، التابع 2000 جنيه، الزائر 5000 جنيه. تفاصيلها في قسم العضويات.",
      },
      {
        q: "ماذا لو نسيت تجديد العضوية في موعدها؟",
        a: "العضوية المنتهية تعطّل صلاحيات الدخول مؤقتاً. يمكن التجديد المتأخر بدون غرامة خلال 30 يوماً. بعد ذلك يلزم إعادة الاشتراك بالكامل.",
      },
      {
        q: "هل توجد خصومات للعائلات؟",
        a: "نعم، الأسرة كاملة (عضو + زوج/زوجة + أبناء) تحصل على باقة عائلية بخصم 15% على إجمالي الاشتراك.",
      },
      {
        q: "هل يمكنني استرداد المبلغ لو لم أستطع استخدام العضوية؟",
        a: "خلال أول 14 يوم من الاشتراك: استرداد كامل ـ خصم 250 جنيه قيمة الاستمارة. بعد ذلك: استرداد جزئي حسب المدة المتبقية وفق سياسة النادي.",
      },
    ],
  },
  {
    key: "general",
    label: "أسئلة عامة",
    icon: HelpCircle,
    items: [
      {
        q: "ما مواعيد عمل النادي؟",
        a: "السبت إلى الخميس: من 6 صباحاً حتى 11 مساءً. الجمعة: من 8 صباحاً حتى 12 منتصف الليل. مواعيد الأكاديميات والحجوزات حسب الجدول الخاص بكل لعبة.",
      },
      {
        q: "هل توجد خدمة عملاء على مدار الساعة؟",
        a: "خدمة الواتساب وخدمة العملاء عبر الموقع متاحة 24 ساعة. الخط الأرضي (1913641) متاح من 8 صباحاً حتى 10 مساءً.",
      },
      {
        q: "هل النادي يستقبل ضيوف الأعضاء؟",
        a: "نعم، كل عضو له حق إدخال 4 ضيوف شهرياً مجاناً. كل ضيف إضافي 50 جنيه. الضيوف من خارج مصر يدخلون مجاناً مع العضو.",
      },
      {
        q: "هل يوفر النادي تأمين ضد إصابات التدريب؟",
        a: "نعم، كل لاعب مسجّل في أكاديمية يحصل على تأمين تكميلي يغطّي إصابات التدريب البسيطة والمتوسطة. للإصابات الكبيرة يلزم تأمين إضافي.",
      },
      {
        q: "كيف أتقدّم بشكوى أو اقتراح؟",
        a: "عبر النموذج في هذه الصفحة، أو بالإيميل على " + CONTACT_EMAIL + "، أو من \"خدمة العملاء\" في صفحة العضو. كل الشكاوى تتم متابعتها خلال 48 ساعة.",
      },
    ],
  },
];

const ContactPage: React.FC = () => {
  const { t } = useTranslation("landing");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>("memberships");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqSearch, setFaqSearch] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subjectLabels: Record<string, string> = {
      membership: "استفسار عن العضوية",
      vendor: "أن أكون مورد",
      reservation: "حجز ملعب أو نشاط",
      academies: "الاشتراك في أكاديمية رياضية",
      kids: "إلحاق الأطفال",
      complaint: "شكوى أو اقتراح",
      other: "آخر",
    };

    const selectedSubject = subjectLabels[formData.subject] || "رسالة من نموذج التواصل";
    const body = [
      `الاسم: ${formData.name}`,
      `البريد الإلكتروني: ${formData.email}`,
      `رقم الهاتف: ${formData.phone}`,
      `الموضوع: ${selectedSubject}`,
      "",
      "الرسالة:",
      formData.message,
    ].join("\n");

    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(selectedSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setIsSubmitted(false);
    }, 2500);
  };

  // FAQ filtering — by category + free-text search
  const activeCategory = FAQ_CATEGORIES.find((c) => c.key === activeFaqCategory) ?? FAQ_CATEGORIES[0];
  const filteredFaqItems = activeCategory.items.filter((it) => {
    if (!faqSearch.trim()) return true;
    const q = faqSearch.toLowerCase();
    return it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q);
  });

  return (
    <div className="bg-gray-50 font-cairo">
      {/* ── HERO (slim) ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0e1c38] hero-pattern">
        <div className="gradient-overlay">
          <div className="container mx-auto px-4 py-6 md:py-10 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {t("contact.title", "تواصل معنا")}
              </h1>
              <p className="mt-2 text-base md:text-lg text-white/95 font-bold leading-relaxed">
                {t(
                  "contact.subtitle",
                  "عايز تكون عضو، مورد، أو عندك استفسار؟ استخدم النموذج أدناه للتواصل معنا"
                )}
              </p>
              <div className="mt-3 flex items-center justify-center gap-3 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#f8941c] rounded-full animate-pulse" />
                  <span className="text-white/85 font-bold">
                    {t("contact.or_call", "أو اتصل بنا على")}
                  </span>
                </div>
                <a
                  href="tel:1913641"
                  className="text-[#f8941c] font-extrabold text-lg md:text-xl hover:text-[#ffd700] transition-colors"
                >
                  1913641
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Slim wave */}
        <div className="absolute bottom-0 left-0 right-0 leading-[0]">
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="w-full h-6 md:h-8" aria-hidden="true">
            <path
              d="M0 40L60 35C120 30 240 20 360 15C480 10 600 10 720 12.5C840 15 960 20 1080 22.5C1200 25 1320 25 1380 25L1440 25V40H0Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </section>

      {/* ── QUICK CONTACT STRIP ───────────────────────────────────── */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          <QuickCard
            icon={Phone}
            color="from-[#2596be] to-[#1a7a99]"
            title="اتصل بنا"
            primary="1913641"
            href="tel:1913641"
          />
          <QuickCard
            icon={Mail}
            color="from-[#f8941c] to-[#e07d10]"
            title="البريد الإلكتروني"
            primary={CONTACT_EMAIL}
            href={`mailto:${CONTACT_EMAIL}`}
          />
          <QuickCard
            icon={MapPin}
            color="from-[#10b981] to-[#059669]"
            title="الموقع"
            primary="على خرائط جوجل"
            href={CLUB_LOCATION_URL}
            external
          />
          <QuickCard
            icon={Clock}
            color="from-[#8b5cf6] to-[#6d28d9]"
            title="مواعيد العمل"
            primary="6ص - 11م"
          />
        </div>
      </section>

      {/* ── FORM + MAP ────────────────────────────────────────────── */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            {/* Form */}
            <div className="lg:col-span-3 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10">
              <div className="mb-6">
                <span className="inline-block text-[#f8941c] font-bold text-xs tracking-[0.2em] uppercase mb-2">
                  أرسل رسالة
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e1c38] mb-2">
                  املأ النموذج وسنتواصل معك
                </h2>
                <p className="text-gray-600">عادةً ما نرد خلال 24 ساعة عمل</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="الاسم الكامل" required>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="اكتب اسمك"
                      className="form-input"
                      required
                    />
                  </FormField>
                  <FormField label="رقم الهاتف" required>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+20 XXX XXX XXXX"
                      className="form-input"
                      required
                    />
                  </FormField>
                </div>

                <FormField label="البريد الإلكتروني" required>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className="form-input"
                    required
                  />
                </FormField>

                <FormField label="الموضوع">
                  <select name="subject" value={formData.subject} onChange={handleInputChange} className="form-input">
                    <option value="">اختر الموضوع المناسب</option>
                    <option value="membership">استفسار عن العضوية</option>
                    <option value="academies">الاشتراك في أكاديمية رياضية</option>
                    <option value="kids">إلحاق الأطفال</option>
                    <option value="reservation">حجز ملعب أو نشاط</option>
                    <option value="vendor">أن أكون مورد</option>
                    <option value="complaint">شكوى أو اقتراح</option>
                    <option value="other">آخر</option>
                  </select>
                </FormField>

                <FormField label="رسالتك" required>
                  <textarea
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="اكتب استفسارك أو رسالتك هنا..."
                    className="form-input resize-none"
                    required
                  />
                </FormField>

                <button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className={`w-full ${
                    isSubmitted
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gradient-to-r from-[#2596be] to-[#1a7a99] hover:from-[#1a7a99] hover:to-[#155e7a]"
                  } text-white py-4 rounded-2xl font-extrabold text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01] disabled:opacity-90 disabled:scale-100 flex items-center justify-center gap-2`}
                >
                  {isSubmitting ? (
                    <>جاري الإرسال...</>
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle className="w-5 h-5" /> تم الإرسال بنجاح!
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> إرسال الرسالة
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map + Working Hours */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="rounded-3xl shadow-xl overflow-hidden border border-gray-100 bg-white h-[280px] lg:h-[300px]">
                <iframe
                  src={CLUB_MAP_EMBED_URL}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="موقع النادي"
                />
              </div>

              <div className="rounded-3xl shadow-xl border border-gray-100 bg-gradient-to-br from-[#0e1c38] to-[#1a4d63] text-white p-6 flex-1">
                <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#f8941c]" /> ساعات العمل
                </h3>
                <div className="space-y-2 text-sm">
                  <Row left="السبت - الخميس" right="6:00 ص — 11:00 م" />
                  <Row left="الجمعة" right="8:00 ص — 12:00 ص" />
                </div>

                <h3 className="font-extrabold text-lg mt-6 mb-3 flex items-center gap-2">
                  <Facebook className="w-5 h-5 text-[#f8941c]" /> تابعنا
                </h3>
                <div className="flex gap-2">
                  <a
                    href="https://www.facebook.com/people/Helwan-University-Club/61554568482887/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-2.5 font-bold text-sm transition"
                  >
                    <Facebook className="w-4 h-4" /> Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/helwan.university.club/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-2.5 font-bold text-sm transition"
                  >
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-14 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Heading */}
            <div className="text-center mb-8">
              <span className="inline-block text-[#f8941c] font-extrabold text-sm tracking-[0.25em] uppercase mb-2">
                المساعدة السريعة
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0e1c38] tracking-tight mb-2">
                الأسئلة الشائعة
              </h2>
              <p className="text-gray-600 text-base max-w-2xl mx-auto">
                إجابات شاملة لأكثر الأسئلة شيوعاً حول العضوية، الأكاديميات الرياضية، إلحاق الأطفال، حجز الملاعب، والمدفوعات
              </p>
            </div>

            {/* Search box */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute end-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="ابحث في الأسئلة الشائعة..."
                  className="w-full bg-white border-2 border-gray-200 hover:border-[#2596be] focus:border-[#2596be] focus:ring-4 focus:ring-[#2596be]/15 outline-none px-12 py-3.5 rounded-full font-medium text-gray-800 transition"
                />
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {FAQ_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeFaqCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setActiveFaqCategory(cat.key);
                      setOpenFaqIndex(0);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                      isActive
                        ? "bg-gradient-to-r from-[#2596be] to-[#1a7a99] text-white border-transparent shadow-lg shadow-[#2596be]/30"
                        : "bg-white text-[#0e1c38] border-gray-200 hover:border-[#2596be] hover:text-[#2596be]"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Question list */}
            <div className="max-w-4xl mx-auto space-y-3">
              {filteredFaqItems.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
                  لا توجد نتائج مطابقة لبحثك في هذه الفئة. جرّب فئة أخرى أو كلمات بحث مختلفة.
                </div>
              ) : (
                filteredFaqItems.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={item.q}
                      className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${
                        isOpen ? "ring-2 ring-[#2596be]/30" : "ring-1 ring-gray-200"
                      }`}
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-start p-5 md:p-6 flex justify-between items-center gap-4"
                      >
                        <span className={`font-extrabold text-base md:text-lg leading-snug ${isOpen ? "text-[#2596be]" : "text-[#0e1c38]"}`}>
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`flex-shrink-0 w-5 h-5 text-[#2596be] transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`grid transition-all duration-500 ease-in-out ${
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="px-5 md:px-6 pb-5 md:pb-6 text-gray-700 leading-loose">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Help footer */}
            <div className="mt-10 bg-gradient-to-l from-[#0e1c38] to-[#1a4d63] rounded-3xl p-8 md:p-10 text-center text-white shadow-xl">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 text-[#f8941c]" />
              <h3 className="text-xl md:text-2xl font-extrabold mb-2">لم تجد إجابة سؤالك؟</h3>
              <p className="text-white/85 mb-4">فريق خدمة العملاء جاهز لمساعدتك في أي استفسار</p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="tel:1913641"
                  className="inline-flex items-center gap-2 bg-[#f8941c] hover:bg-[#e07d10] text-white px-6 py-3 rounded-full font-bold transition"
                >
                  <Phone className="w-4 h-4" /> 1913641
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold border border-white/30 transition"
                >
                  <Mail className="w-4 h-4" /> راسلنا بالإيميل
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .gradient-overlay {
          background: linear-gradient(135deg, rgba(10, 26, 68, 0.95) 0%, rgba(14, 28, 56, 0.9) 100%);
        }
        .hero-pattern {
          background-image:
            radial-gradient(circle at 20% 50%, rgba(253, 191, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(253, 191, 0, 0.1) 0%, transparent 50%);
        }
        .form-input {
          width: 100%;
          border: 2px solid #e5e7eb;
          border-radius: 1rem;
          padding: 0.875rem 1.25rem;
          font-size: 0.95rem;
          background: white;
          transition: all 0.25s;
          outline: none;
        }
        .form-input:focus {
          border-color: #2596be;
          box-shadow: 0 0 0 4px rgba(37, 150, 190, 0.15);
        }
      `}</style>
    </div>
  );
};

// ─── Helper sub-components ───────────────────────────────────────────
const QuickCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  primary: string;
  href?: string;
  external?: boolean;
}> = ({ icon: Icon, color, title, primary, href, external }) => {
  const inner = (
    <div className="group bg-white hover:bg-white rounded-3xl shadow-md hover:shadow-xl ring-1 ring-gray-100 hover:ring-[#2596be]/30 p-5 transition-all duration-300 hover:-translate-y-1 h-full">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-xs font-bold text-gray-500 mb-1">{title}</p>
      <p className="text-base md:text-lg font-extrabold text-[#0e1c38] group-hover:text-[#2596be] transition-colors truncate" dir="ltr">
        {primary}
      </p>
    </div>
  );
  if (!href) return inner;
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
      {inner}
    </a>
  );
};

const FormField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
  label,
  required,
  children,
}) => (
  <div>
    <label className="block text-gray-800 font-bold mb-1.5 text-sm">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const Row: React.FC<{ left: string; right: string }> = ({ left, right }) => (
  <div className="flex justify-between items-center border-b border-white/10 pb-2 last:border-b-0">
    <span className="text-white/85 font-semibold">{left}</span>
    <span className="text-[#f8941c] font-extrabold">{right}</span>
  </div>
);

export default ContactPage;

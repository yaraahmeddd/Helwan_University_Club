import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, Phone, Mail, MapPin, Calendar, Users, Clock, Award, CheckCircle, ChevronRight } from "lucide-react";
import SiteNavbar from "../components/SiteNavbar";

interface AgeGroup {
    label: string;
    note?: string;
}

interface SportInfo {
    key: string;
    nameAr: string;
    nameEn: string;
    tagline: string;
    description: string;
    image: string;
    coverImage?: string;
    branches: string[];
    ageGroups: AgeGroup[];
    schedule: string;
    coachInfo: string;
    fee: string;
    requirements: string[];
    benefits: string[];
}

const asset = (p: string) => `/assets/${p}`;

const SPORTS_DB: Record<string, SportInfo> = {
    football: {
        key: "football",
        nameAr: "كرة القدم",
        nameEn: "Football",
        tagline: "أكاديمية كرة القدم بنادي جامعة العاصمة",
        description:
            "تأسست أكاديمية كرة القدم بنادي جامعة العاصمة عام 2023 لتقديم برنامج تدريبي احترافي للناشئين بإشراف مدربين معتمدين من الاتحاد المصري لكرة القدم. تركّز الأكاديمية على تنمية المهارات الفنية والتكتيكية، اللياقة البدنية، والروح الرياضية للاعبين منذ المراحل الأولى.",
        image: asset("sports/football-juniors.jpg"),
        coverImage: asset("gallery/champions-start-here.jpg"),
        branches: ["الفرع الرئيسي - جامعة العاصمة", "فرع الهرم - كلية علوم الرياضة للبنين"],
        ageGroups: [
            { label: "براعم (4 - 6 سنوات)", note: "تدريبات تأسيسية للحركة والتآزر" },
            { label: "أشبال (7 - 9 سنوات)", note: "تنمية المهارات الأساسية" },
            { label: "ناشئين (10 - 12 سنة)", note: "اللعب التكتيكي البسيط" },
            { label: "متقدمين (13 - 15 سنة)", note: "تدريب فني وبدني شامل" },
            { label: "شباب (16 - 18 سنة)", note: "إعداد للمنافسات الرسمية" },
        ],
        schedule: "3 حصص أسبوعياً (الأحد - الثلاثاء - الخميس) من 4:00 م إلى 6:00 م",
        coachInfo: "كابتن محمد سعد - مدرب معتمد من الفيفا، مع 4 مساعدين متخصصين",
        fee: "من 600 ج.م شهرياً (يختلف حسب الفئة العمرية)",
        requirements: [
            "شهادة ميلاد سارية",
            "صورة شخصية حديثة",
            "تقرير طبي يفيد بسلامة اللاعب من الناحية الصحية",
            "موافقة ولي الأمر (للقاصرين)",
        ],
        benefits: [
            "تدريب على أيدي مدربين معتمدين",
            "ملاعب عشب طبيعي بمواصفات FIFA",
            "تقييم ربع سنوي لكل لاعب",
            "مشاركة في البطولات المحلية",
            "زي تدريب رسمي للأكاديمية",
        ],
    },

    basketball: {
        key: "basketball",
        nameAr: "كرة السلة",
        nameEn: "Basketball",
        tagline: "أكاديمية كرة السلة بنادي جامعة العاصمة",
        description:
            "انطلقت أكاديمية كرة السلة بنادي جامعة العاصمة عام 2023 وتُعد من الأكاديميات الواعدة على مستوى الجامعات. تقدّم برامج تدريبية احترافية لتنمية المهارات الفردية والجماعية بإشراف مدربين من المنتخب الوطني السابق.",
        image: asset("sports/basketball.jpg"),
        coverImage: asset("sports/basketball-2.jpg"),
        branches: ["الفرع الرئيسي - جامعة العاصمة", "فرع المطرية - كلية الهندسة"],
        ageGroups: [
            { label: "أشبال (8 - 10 سنوات)" },
            { label: "ناشئين (11 - 13 سنة)" },
            { label: "متقدمين (14 - 16 سنة)" },
            { label: "شباب (17 - 19 سنة)" },
        ],
        schedule: "حصتان أسبوعياً (السبت - الأربعاء) من 5:00 م إلى 7:00 م",
        coachInfo: "كابتن خالد نجيب - مدرب سابق بمنتخب الناشئين",
        fee: "550 ج.م شهرياً",
        requirements: [
            "شهادة ميلاد",
            "صورتان شخصيتان",
            "كشف طبي حديث",
        ],
        benefits: [
            "صالة مغطاة بمعايير دولية",
            "كرات تدريب احترافية",
            "مباريات أسبوعية داخلية",
            "حقيبة تدريب وزي رسمي",
        ],
    },

    swimming: {
        key: "swimming",
        nameAr: "السباحة",
        nameEn: "Swimming",
        tagline: "أكاديمية السباحة بنادي جامعة العاصمة",
        description:
            "افتُتحت أكاديمية السباحة بالنادي عام 2023 مع تجهيز حمامات السباحة الأولمبية بمواصفات معتمدة. تقدم برامج للمبتدئين ومستويات متقدمة بإشراف مدربين معتمدين من الاتحاد المصري للسباحة.",
        image: asset("sports/aerobic-gymnastics.jpg"),
        coverImage: asset("gallery/image1.jpg"),
        branches: ["الفرع الرئيسي - جامعة العاصمة", "فرع الزمالك - كلية علوم الرياضة للبنات"],
        ageGroups: [
            { label: "براعم (4 - 6 سنوات)", note: "تأقلم وأساسيات السلامة في الماء" },
            { label: "مبتدئين (7 - 10 سنوات)", note: "تعلّم الطرق الأربع للسباحة" },
            { label: "متوسط (11 - 14 سنة)", note: "تحسين السرعة والتقنية" },
            { label: "متقدم (15 سنة فأكثر)", note: "تدريب احترافي" },
        ],
        schedule: "3 حصص أسبوعياً (الأحد - الثلاثاء - الخميس) من 3:00 م إلى 5:00 م",
        coachInfo: "كابتن مونا إبراهيم - حاصلة على شهادات تدريب دولية",
        fee: "700 ج.م شهرياً",
        requirements: [
            "شهادة ميلاد",
            "كشف طبي يثبت السلامة من أمراض الجلد والأذن",
            "صورتان شخصيتان",
        ],
        benefits: [
            "حمام سباحة بطول 50 متر",
            "مياه معالجة يومياً",
            "أدوات تدريب احترافية",
            "بطل/ة جوائز شهرية للمتميزين",
        ],
    },

    tennis: {
        key: "tennis",
        nameAr: "التنس",
        nameEn: "Tennis",
        tagline: "أكاديمية التنس بنادي جامعة العاصمة",
        description:
            "أكاديمية التنس بنادي جامعة العاصمة افتتحت أبوابها عام 2023 وتهدف إلى تأهيل لاعبين على أعلى مستوى عبر ملاعب ترابية وأخرى صلبة بمواصفات احترافية.",
        image: asset("sports/tennis.jpg"),
        branches: ["الفرع الرئيسي - جامعة العاصمة"],
        ageGroups: [
            { label: "أطفال (6 - 9 سنوات)" },
            { label: "ناشئين (10 - 14 سنة)" },
            { label: "شباب (15 سنة فأكثر)" },
            { label: "كبار - فئة الترفيه" },
        ],
        schedule: "حصتان أسبوعياً مرنة حسب الفئة",
        coachInfo: "كابتن طارق السيد - حكم دولي سابق",
        fee: "800 ج.م شهرياً",
        requirements: ["شهادة ميلاد", "كشف طبي", "صورتان شخصيتان"],
        benefits: ["3 ملاعب احترافية", "إضاءة ليلية", "تأجير مضارب للمبتدئين", "بطولات داخلية ربع سنوية"],
    },

    boxing: {
        key: "boxing",
        nameAr: "الملاكمة",
        nameEn: "Boxing",
        tagline: "أكاديمية الملاكمة بنادي جامعة العاصمة",
        description:
            "تأسست أكاديمية الملاكمة بالنادي عام 2023 وحققت إنجازات مبكرة بحصول لاعبيها على ميداليات في بطولة الجمهورية. تركّز على بناء اللياقة، المهارات الفنية، والانضباط الذهني.",
        image: asset("sports/boxing.jpg"),
        branches: ["فرع الهرم - كلية علوم الرياضة للبنين"],
        ageGroups: [
            { label: "ناشئين (10 - 13 سنة)" },
            { label: "شباب (14 - 17 سنة)" },
            { label: "كبار (18 سنة فأكثر)" },
        ],
        schedule: "4 حصص أسبوعياً (الأحد إلى الخميس) من 6:00 م إلى 8:00 م",
        coachInfo: "كابتن حسام فتحي - بطل سابق ومدرب معتمد",
        fee: "650 ج.م شهرياً",
        requirements: ["شهادة ميلاد", "كشف طبي شامل + رسم قلب", "موافقة ولي الأمر"],
        benefits: ["حلبة احترافية مطابقة للمعايير", "معدات حماية مجانية للمبتدئين", "تدريب وزن وأداء بدني"],
    },

    karate: {
        key: "karate",
        nameAr: "الكاراتيه",
        nameEn: "Karate",
        tagline: "أكاديمية الكاراتيه بنادي جامعة العاصمة",
        description:
            "أكاديمية الكاراتيه بنادي جامعة العاصمة بدأت في 2023 وتقدّم منهج كاراتيه شوتوكان المعتمد عالمياً، مع نظام احتفال بترقية الأحزمة كل 6 أشهر.",
        image: asset("sports/taekwondo.jpg"),
        branches: ["الفرع الرئيسي - جامعة العاصمة", "فرع الزمالك - كلية علوم الرياضة للبنات"],
        ageGroups: [
            { label: "براعم (4 - 6 سنوات)" },
            { label: "أشبال (7 - 9 سنوات)" },
            { label: "ناشئين (10 - 13 سنة)" },
            { label: "شباب (14 - 17 سنة)" },
            { label: "كبار (18 سنة فأكثر)" },
        ],
        schedule: "حصتان أسبوعياً مرنة",
        coachInfo: "كابتن أحمد حسن - حزام أسود الدرجة الخامسة",
        fee: "500 ج.م شهرياً",
        requirements: ["شهادة ميلاد", "كشف طبي", "صورتان شخصيتان"],
        benefits: ["صالة مخصصة بمعايير ITF", "زي رسمي للأكاديمية", "اختبارات حزام مجانية"],
    },

    volleyball: {
        key: "volleyball",
        nameAr: "الكرة الطائرة",
        nameEn: "Volleyball",
        tagline: "أكاديمية الكرة الطائرة بنادي جامعة العاصمة",
        description:
            "افتُتحت أكاديمية الكرة الطائرة عام 2023 لتأهيل لاعبين ولاعبات للمشاركة في بطولات الجامعات. تركّز على المهارات الجماعية والتكتيك.",
        image: asset("sports/handball.jpg"),
        branches: ["الفرع الرئيسي - جامعة العاصمة"],
        ageGroups: [
            { label: "ناشئين (10 - 13 سنة)" },
            { label: "شباب (14 - 17 سنة)" },
            { label: "كبار - فريق المنافسات" },
        ],
        schedule: "3 حصص أسبوعياً",
        coachInfo: "كابتن سارة مصطفى - مدربة وطنية معتمدة",
        fee: "450 ج.م شهرياً",
        requirements: ["شهادة ميلاد", "كشف طبي"],
        benefits: ["ملعبان مغطّى ومفتوح", "تدريب للجنسين كلٌ على حدة"],
    },

    handball: {
        key: "handball",
        nameAr: "كرة اليد",
        nameEn: "Handball",
        tagline: "أكاديمية كرة اليد بنادي جامعة العاصمة",
        description:
            "أكاديمية كرة اليد بدأت نشاطها في 2023 وتعتبر من الأكاديميات الواعدة بفضل وجود مدربين معتمدين من الاتحاد المصري لكرة اليد.",
        image: asset("sports/handball-2.jpg"),
        branches: ["فرع الهرم - كلية علوم الرياضة للبنين", "فرع المطرية - كلية الهندسة"],
        ageGroups: [
            { label: "أشبال (9 - 11 سنة)" },
            { label: "ناشئين (12 - 15 سنة)" },
            { label: "شباب (16 - 19 سنة)" },
        ],
        schedule: "3 حصص أسبوعياً (السبت - الإثنين - الأربعاء)",
        coachInfo: "كابتن إبراهيم نصر - مدرب معتمد من اتحاد كرة اليد",
        fee: "500 ج.م شهرياً",
        requirements: ["شهادة ميلاد", "كشف طبي"],
        benefits: ["صالة احترافية", "تدريب على أجهزة لياقة"],
    },

    squash: {
        key: "squash",
        nameAr: "الإسكواش",
        nameEn: "Squash",
        tagline: "أكاديمية الإسكواش بنادي جامعة العاصمة",
        description:
            "أكاديمية الإسكواش بالنادي تأسست عام 2023 مع تجهيز 3 ملاعب احترافية بمواصفات الاتحاد الدولي. تركز على المهارات الفردية والسرعة الذهنية.",
        image: asset("sports/squash.jpg"),
        branches: ["الفرع الرئيسي - جامعة العاصمة"],
        ageGroups: [
            { label: "ناشئين (8 - 12 سنة)" },
            { label: "شباب (13 - 18 سنة)" },
            { label: "كبار - فئة الترفيه" },
        ],
        schedule: "حصتان أسبوعياً",
        coachInfo: "كابتن نور كمال - لاعب سابق بالمنتخب",
        fee: "700 ج.م شهرياً",
        requirements: ["شهادة ميلاد", "كشف طبي"],
        benefits: ["3 ملاعب احترافية بزجاج خلفي شفاف", "إضاءة LED احترافية"],
    },

    chess: {
        key: "chess",
        nameAr: "الشطرنج",
        nameEn: "Chess",
        tagline: "أكاديمية الشطرنج بنادي جامعة العاصمة",
        description:
            "أكاديمية الشطرنج بالنادي بدأت في 2023 لتنمية مهارات التفكير الاستراتيجي والذكاء عند مختلف الأعمار. تنظّم بطولات شهرية داخلية.",
        image: asset("sports/wrestling.jpg"),
        branches: ["الفرع الرئيسي - جامعة العاصمة"],
        ageGroups: [
            { label: "أطفال (5 - 9 سنوات)" },
            { label: "ناشئين (10 - 14 سنة)" },
            { label: "شباب (15 سنة فأكثر)" },
            { label: "كبار" },
        ],
        schedule: "حصتان أسبوعياً (السبت + الثلاثاء)",
        coachInfo: "أستاذ محمد فتحي - حاصل على لقب أستاذ دولي",
        fee: "350 ج.م شهرياً",
        requirements: ["شهادة ميلاد", "صورتان شخصيتان"],
        benefits: ["قاعة مجهزة", "بطولات شهرية بجوائز", "تدريب جماعي وفردي"],
    },

    judo: {
        key: "judo",
        nameAr: "الجودو",
        nameEn: "Judo",
        tagline: "أكاديمية الجودو بنادي جامعة العاصمة",
        description:
            "تأسست أكاديمية الجودو عام 2023 بإشراف مدربين معتمدين من الاتحاد الدولي للجودو. تركّز على بناء القوة والانضباط والاحترام.",
        image: asset("sports/kungfu.jpg"),
        branches: ["فرع الهرم - كلية علوم الرياضة للبنين"],
        ageGroups: [
            { label: "ناشئين (8 - 12 سنة)" },
            { label: "شباب (13 - 17 سنة)" },
            { label: "كبار (18 سنة فأكثر)" },
        ],
        schedule: "3 حصص أسبوعياً",
        coachInfo: "كابتن طارق الحديدي - حزام أسود الدرجة السادسة",
        fee: "550 ج.م شهرياً",
        requirements: ["شهادة ميلاد", "كشف طبي شامل"],
        benefits: ["تاتامي احترافي", "زي رياضي رسمي", "اختبارات حزام منتظمة"],
    },

    gymnastics: {
        key: "gymnastics",
        nameAr: "الجمباز",
        nameEn: "Gymnastics",
        tagline: "أكاديمية الجمباز بنادي جامعة العاصمة",
        description:
            "أكاديمية الجمباز الفني والإيقاعي بدأت في 2023 لتقديم تدريب احترافي للبنين والبنات مع التركيز على المرونة والتوازن والقوة العضلية.",
        image: asset("sports/gymnastics.jpg"),
        coverImage: asset("sports/gymnastics-2.jpg"),
        branches: ["فرع الزمالك - كلية علوم الرياضة للبنات"],
        ageGroups: [
            { label: "براعم (3 - 5 سنوات)" },
            { label: "ناشئين (6 - 9 سنوات)" },
            { label: "متقدمات (10 - 13 سنة)" },
            { label: "متخصصات (14 سنة فأكثر)" },
        ],
        schedule: "3 حصص أسبوعياً",
        coachInfo: "كابتن دينا حسني - لاعبة سابقة بالمنتخب",
        fee: "650 ج.م شهرياً",
        requirements: ["شهادة ميلاد", "كشف طبي يثبت السلامة من إصابات العمود الفقري"],
        benefits: ["صالة مجهزة بأحدث الأجهزة", "حصص فردية للمتقدمات", "عروض سنوية"],
    },
};

const ALIASES: Record<string, string> = {
    soccer: "football",
    "football_juniors": "football",
    "table-tennis": "tennis",
    badminton: "tennis",
    aikido: "karate",
    taekwondo: "karate",
    wrestling: "judo",
    aerobic: "gymnastics",
    "rhythmic": "gymnastics",
    "speed-ball": "tennis",
    "kung-fu": "judo",
    archery: "tennis",
    bowling: "tennis",
    rollerskating: "gymnastics",
    ballet: "gymnastics",
    artistic: "gymnastics",
    "field-events": "football",
};

const resolveSportKey = (raw: string | undefined): string => {
    if (!raw) return "football";
    const key = raw.toLowerCase().trim();
    if (SPORTS_DB[key]) return key;
    if (ALIASES[key]) return ALIASES[key];
    return "football";
};

const SportInfoPage: React.FC = () => {
    const { sportKey } = useParams<{ sportKey: string }>();
    const navigate = useNavigate();
    const finalKey = resolveSportKey(sportKey);
    const sport = SPORTS_DB[finalKey];

    // Navigate back to landing with proper tab
    const goToLandingTab = (tab: string) => {
        const targetPath = tab === "home" ? "/" : `/?tab=${encodeURIComponent(tab)}`;
        navigate(targetPath);
    };

    const allSports = Object.values(SPORTS_DB);

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            <SiteNavbar activeTab="Sports" onTabChange={goToLandingTab} />

            {/* Hero with sport image */}
            <section className="relative h-[55vh] min-h-[460px] mt-[88px] overflow-hidden">
                <img
                    src={sport.coverImage || sport.image}
                    alt={sport.nameAr}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                    key={sport.key}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-[#0e1c38]/95 via-[#0e1c38]/70 to-[#0e1c38]/40" />
                <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-end pb-12 gap-3">
                    <Link
                        to="/?tab=Sports"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-bold self-end"
                    >
                        <ChevronRight className="w-4 h-4" /> العودة لقائمة الألعاب
                    </Link>
                    <p className="text-[#f8941c] font-extrabold tracking-[0.2em] text-sm md:text-base">
                        {sport.nameEn.toUpperCase()}
                    </p>
                    <h1 className="text-3xl md:text-5xl font-black text-white max-w-3xl">
                        {sport.tagline}
                    </h1>
                    <p className="text-white/85 text-lg max-w-2xl font-medium">
                        تأسست عام 2023 ضمن منظومة أكاديميات النادي
                    </p>

                    {/* Sport selector — switches the entire page dynamically */}
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <label className="text-white/90 font-bold text-sm">اختر اللعبة:</label>
                        <div className="relative">
                            <select
                                value={sport.key}
                                onChange={(e) => navigate(`/sport/${e.target.value}`)}
                                className="bg-white/95 text-[#0e1c38] font-bold rounded-full pl-10 pr-5 py-2.5 text-sm shadow-lg ring-1 ring-white/40 hover:ring-[#f8941c] focus:outline-none focus:ring-2 focus:ring-[#f8941c] appearance-none cursor-pointer min-w-[220px]"
                            >
                                {allSports.map((s) => (
                                    <option key={s.key} value={s.key}>
                                        {s.nameAr}
                                    </option>
                                ))}
                            </select>
                            <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0e1c38] rotate-90 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </section>

            {/* About + branches */}
            <section className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-md p-8">
                        <h2 className="text-2xl font-extrabold text-[#0e1c38] mb-4 flex items-center gap-3">
                            <span className="w-1 h-7 bg-[#f8941c] rounded-full" /> نبذة عن الأكاديمية
                        </h2>
                        <p className="text-gray-700 leading-loose text-base md:text-lg">{sport.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 text-center">
                            <InfoTile icon={Calendar} label="التأسيس" value="2023" />
                            <InfoTile icon={Users} label="المدرب الرئيسي" value={sport.coachInfo.split(" - ")[0]} />
                            <InfoTile icon={Clock} label="الجدول" value="مرن أسبوعياً" />
                            <InfoTile icon={Award} label="الرسوم" value={sport.fee.split(" ").slice(0, 2).join(" ")} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#2596be] to-[#1a7a99] rounded-3xl shadow-md p-8 text-white">
                        <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-3">
                            <MapPin className="w-6 h-6 text-[#f8941c]" /> الفروع المتاحة
                        </h2>
                        <ul className="space-y-3">
                            {sport.branches.map((b, i) => (
                                <li key={i} className="flex items-start gap-3 text-base">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#f8941c]" />
                                    <span className="font-semibold">{b}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Age groups */}
            <section className="container mx-auto px-6 py-8">
                <div className="bg-white rounded-3xl shadow-md p-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e1c38] mb-6 flex items-center gap-3">
                        <span className="w-1 h-8 bg-[#f8941c] rounded-full" /> الفئات العمرية المتاحة
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sport.ageGroups.map((g, i) => (
                            <div
                                key={i}
                                className="border border-gray-200 hover:border-[#2596be] rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br from-white to-blue-50/30"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-[#2596be]/10 text-[#2596be] flex items-center justify-center font-bold">
                                        {i + 1}
                                    </div>
                                    <h3 className="font-extrabold text-lg text-[#0e1c38]">{g.label}</h3>
                                </div>
                                {g.note && <p className="text-gray-600 text-sm">{g.note}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How to subscribe */}
            <section className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl shadow-md p-8">
                        <h2 className="text-2xl font-extrabold text-[#0e1c38] mb-5 flex items-center gap-3">
                            <span className="w-1 h-7 bg-[#f8941c] rounded-full" /> خطوات الاشتراك
                        </h2>
                        <ol className="space-y-4 text-gray-700">
                            {[
                                "تجهيز المستندات المطلوبة (شهادة ميلاد، صور شخصية، كشف طبي).",
                                "التوجّه إلى مكتب التسجيل في الفرع المناسب أو التسجيل أونلاين عبر الموقع.",
                                "تحديد الفئة العمرية المناسبة بعد مقابلة مع المدرب.",
                                "دفع رسوم الاشتراك الشهرية أو السنوية.",
                                "استلام كارنيه العضوية وزي التدريب الرسمي.",
                                "بدء التدريب وفقاً للجدول المحدد.",
                            ].map((step, i) => (
                                <li key={i} className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f8941c] text-white font-extrabold flex items-center justify-center text-sm">
                                        {i + 1}
                                    </span>
                                    <span className="leading-relaxed pt-1">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="bg-white rounded-3xl shadow-md p-8">
                        <h2 className="text-2xl font-extrabold text-[#0e1c38] mb-5 flex items-center gap-3">
                            <span className="w-1 h-7 bg-[#f8941c] rounded-full" /> المستندات المطلوبة
                        </h2>
                        <ul className="space-y-3 mb-6">
                            {sport.requirements.map((r, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700">
                                    <CheckCircle className="w-5 h-5 text-[#2596be] flex-shrink-0 mt-0.5" /> {r}
                                </li>
                            ))}
                        </ul>

                        <h3 className="font-extrabold text-[#0e1c38] mb-3 mt-6">مميزات الاشتراك</h3>
                        <ul className="space-y-2">
                            {sport.benefits.map((b, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700">
                                    <span className="text-[#f8941c] flex-shrink-0">★</span> {b}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Schedule & Coach card */}
            <section className="container mx-auto px-6 py-8">
                <div className="bg-gradient-to-l from-[#0e1c38] to-[#1a4d63] rounded-3xl shadow-xl p-8 md:p-10 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <Clock className="w-8 h-8 text-[#f8941c] mb-3" />
                            <h3 className="font-extrabold text-lg mb-2">جدول التدريبات</h3>
                            <p className="text-white/85">{sport.schedule}</p>
                        </div>
                        <div>
                            <Users className="w-8 h-8 text-[#f8941c] mb-3" />
                            <h3 className="font-extrabold text-lg mb-2">المدرب المسؤول</h3>
                            <p className="text-white/85">{sport.coachInfo}</p>
                        </div>
                        <div>
                            <Award className="w-8 h-8 text-[#f8941c] mb-3" />
                            <h3 className="font-extrabold text-lg mb-2">الرسوم الشهرية</h3>
                            <p className="text-white/85">{sport.fee}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="container mx-auto px-6 py-12">
                <div className="bg-[#f8941c] rounded-3xl p-10 md:p-12 text-center text-white shadow-xl">
                    <h2 className="text-2xl md:text-4xl font-extrabold mb-3">جاهز للانضمام؟</h2>
                    <p className="text-white/95 text-lg mb-6 max-w-xl mx-auto">
                        سجّل الآن واحجز مكانك في {sport.tagline}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => navigate("/re")}
                            className="bg-white text-[#0e1c38] hover:bg-gray-100 px-8 py-3.5 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            سجّل الآن
                        </button>
                        <a
                            href="#contact"
                            className="bg-[#0e1c38] hover:bg-[#1a4d63] text-white px-8 py-3.5 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            تواصل معنا
                        </a>
                    </div>
                </div>
            </section>

            {/* Contact section */}
            <section id="contact" className="bg-white py-14">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-10">
                        <p className="text-[#f8941c] font-bold text-sm tracking-[0.2em] uppercase mb-2">
                            بيانات التواصل
                        </p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0e1c38]">تواصل مع إدارة الأكاديمية</h2>
                        <p className="text-gray-600 mt-3">للاستفسار عن الاشتراك أو الفئات العمرية أو الجدول</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <ContactCard
                            icon={Phone}
                            title="اتصل بنا"
                            primary="02 - 2999 1111"
                            secondary="01001 - 110 - 005"
                        />
                        <ContactCard
                            icon={Mail}
                            title="البريد الإلكتروني"
                            primary="info@capital-club.eg"
                            secondary={`academy.${sport.key}@capital-club.eg`}
                        />
                        <ContactCard
                            icon={MapPin}
                            title="مقر الأكاديمية"
                            primary={sport.branches[0]}
                            secondary={sport.branches[1] || ""}
                        />
                    </div>

                    <div className="mt-10 max-w-5xl mx-auto bg-gray-50 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            <h3 className="font-extrabold text-xl text-[#0e1c38] mb-2">مواعيد العمل</h3>
                            <p className="text-gray-700">السبت إلى الخميس: من 9 صباحاً حتى 10 مساءً</p>
                            <p className="text-gray-700">الجمعة: من 2 ظهراً حتى 10 مساءً</p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-start md:justify-end">
                            <a
                                href="https://www.facebook.com/people/Helwan-University-Club/61554568482887/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#1877f2] hover:bg-[#125dba] text-white px-5 py-2.5 rounded-full font-semibold transition"
                            >
                                Facebook
                            </a>
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=جامعة+العاصمة+القاهرة"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#2596be] hover:bg-[#1e7e9e] text-white px-5 py-2.5 rounded-full font-semibold transition inline-flex items-center gap-2"
                            >
                                <MapPin className="w-4 h-4" /> الموقع على الخريطة
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer note */}
            <div className="bg-[#0e1c38] py-6 text-center text-white/70 text-sm">
                <button
                    onClick={() => navigate("/?tab=Sports")}
                    className="inline-flex items-center gap-2 hover:text-white transition"
                >
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" /> العودة لقائمة الألعاب الرياضية
                </button>
            </div>
        </div>
    );
};

const InfoTile: React.FC<{ icon: React.ComponentType<{ className?: string }>; label: string; value: string }> = ({ icon: Icon, label, value }) => (
    <div className="bg-gray-50 rounded-2xl p-4">
        <Icon className="w-5 h-5 text-[#2596be] mx-auto mb-2" />
        <div className="text-xs text-gray-500 font-semibold mb-1">{label}</div>
        <div className="font-extrabold text-[#0e1c38] text-sm">{value}</div>
    </div>
);

const ContactCard: React.FC<{ icon: React.ComponentType<{ className?: string }>; title: string; primary: string; secondary?: string }> = ({
    icon: Icon,
    title,
    primary,
    secondary,
}) => (
    <div className="bg-gradient-to-br from-white to-blue-50/40 border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
        <div className="w-14 h-14 rounded-2xl bg-[#2596be]/10 text-[#2596be] flex items-center justify-center mb-4 mx-auto">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-[#0e1c38] text-lg text-center mb-2">{title}</h3>
        <p className="text-gray-800 font-bold text-center" dir="ltr">{primary}</p>
        {secondary && <p className="text-gray-500 text-sm text-center mt-1" dir="ltr">{secondary}</p>}
    </div>
);

export default SportInfoPage;

import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Phone, Mail, MapPin, Calendar, Users, Clock, Award, CheckCircle, ChevronRight } from "lucide-react";
import SiteNavbar from '@/components/SiteNavbar';

interface AgeGroup {
    label_ar: string;
    label_en: string;
    note_ar?: string;
    note_en?: string;
}

interface SportInfo {
    key: string;
    nameAr: string;
    nameEn: string;
    tagline_ar: string;
    tagline_en: string;
    description_ar: string;
    description_en: string;
    image: string;
    coverImage?: string;
    branches_ar: string[];
    branches_en: string[];
    ageGroups: AgeGroup[];
    schedule_ar: string;
    schedule_en: string;
    coachInfo_ar: string;
    coachInfo_en: string;
    fee_ar: string;
    fee_en: string;
    requirements_ar: string[];
    requirements_en: string[];
    benefits_ar: string[];
    benefits_en: string[];
}

const asset = (p: string) => `/assets/${p}`;

const SPORTS_DB: Record<string, SportInfo> = {
    football: {
        key: "football",
        nameAr: "كرة القدم",
        nameEn: "Football",
        tagline_ar: "أكاديمية كرة القدم بنادي جامعة العاصمة",
        tagline_en: "Football Academy at Capital University Club",
        description_ar:
            "تأسست أكاديمية كرة القدم بنادي جامعة العاصمة عام 2023 لتقديم برنامج تدريبي احترافي للناشئين بإشراف مدربين معتمدين من الاتحاد المصري لكرة القدم. تركّز الأكاديمية على تنمية المهارات الفنية والتكتيكية، اللياقة البدنية، والروح الرياضية للاعبين منذ المراحل الأولى.",
        description_en:
            "The Football Academy at Capital University Club was founded in 2023 to provide a professional training program for young players supervised by coaches certified by the Egyptian Football Association. The academy focuses on developing technical and tactical skills, physical fitness, and sportsmanship from the earliest stages.",
        image: asset("sports/football-juniors.jpg"),
        coverImage: asset("gallery/champions-start-here.jpg"),
        branches_ar: ["الفرع الرئيسي - جامعة العاصمة", "فرع الهرم - كلية علوم الرياضة للبنين"],
        branches_en: ["Main Branch - Capital University", "Haram Branch - Faculty of Sports Science (Boys)"],
        ageGroups: [
            { label_ar: "براعم (4 - 6 سنوات)", label_en: "Toddlers (4 - 6 years)", note_ar: "تدريبات تأسيسية للحركة والتآزر", note_en: "Foundational movement and coordination training" },
            { label_ar: "أشبال (7 - 9 سنوات)", label_en: "Cubs (7 - 9 years)", note_ar: "تنمية المهارات الأساسية", note_en: "Basic skills development" },
            { label_ar: "ناشئين (10 - 12 سنة)", label_en: "Juniors (10 - 12 years)", note_ar: "اللعب التكتيكي البسيط", note_en: "Basic tactical play" },
            { label_ar: "متقدمين (13 - 15 سنة)", label_en: "Advanced (13 - 15 years)", note_ar: "تدريب فني وبدني شامل", note_en: "Comprehensive technical and physical training" },
            { label_ar: "شباب (16 - 18 سنة)", label_en: "Youth (16 - 18 years)", note_ar: "إعداد للمنافسات الرسمية", note_en: "Preparation for official competitions" },
        ],
        schedule_ar: "3 حصص أسبوعياً (الأحد - الثلاثاء - الخميس) من 4:00 م إلى 6:00 م",
        schedule_en: "3 sessions/week (Sun - Tue - Thu) from 4:00 PM to 6:00 PM",
        coachInfo_ar: "كابتن محمد سعد - مدرب معتمد من الفيفا، مع 4 مساعدين متخصصين",
        coachInfo_en: "Capt. Mohamed Saad - FIFA certified coach, with 4 specialized assistants",
        fee_ar: "من 600 ج.م شهرياً (يختلف حسب الفئة العمرية)",
        fee_en: "From 600 EGP/month (varies by age group)",
        requirements_ar: ["شهادة ميلاد سارية", "صورة شخصية حديثة", "تقرير طبي يفيد بسلامة اللاعب من الناحية الصحية", "موافقة ولي الأمر (للقاصرين)"],
        requirements_en: ["Valid birth certificate", "Recent personal photo", "Medical report confirming player's health fitness", "Guardian consent (for minors)"],
        benefits_ar: ["تدريب على أيدي مدربين معتمدين", "ملاعب عشب طبيعي بمواصفات FIFA", "تقييم ربع سنوي لكل لاعب", "مشاركة في البطولات المحلية", "زي تدريب رسمي للأكاديمية"],
        benefits_en: ["Training by certified coaches", "Natural grass pitches to FIFA standards", "Quarterly assessment for each player", "Participation in local tournaments", "Official academy training kit"],
    },

    basketball: {
        key: "basketball",
        nameAr: "كرة السلة",
        nameEn: "Basketball",
        tagline_ar: "أكاديمية كرة السلة بنادي جامعة العاصمة",
        tagline_en: "Basketball Academy at Capital University Club",
        description_ar:
            "انطلقت أكاديمية كرة السلة بنادي جامعة العاصمة عام 2023 وتُعد من الأكاديميات الواعدة على مستوى الجامعات. تقدّم برامج تدريبية احترافية لتنمية المهارات الفردية والجماعية بإشراف مدربين من المنتخب الوطني السابق.",
        description_en:
            "The Basketball Academy at Capital University Club launched in 2023 and is considered one of the most promising academies at the university level. It offers professional training programs to develop individual and team skills under the supervision of former national team coaches.",
        image: asset("sports/basketball.jpg"),
        coverImage: asset("sports/basketball-2.jpg"),
        branches_ar: ["الفرع الرئيسي - جامعة العاصمة", "فرع المطرية - كلية الهندسة"],
        branches_en: ["Main Branch - Capital University", "Matariya Branch - Faculty of Engineering"],
        ageGroups: [
            { label_ar: "أشبال (8 - 10 سنوات)", label_en: "Cubs (8 - 10 years)" },
            { label_ar: "ناشئين (11 - 13 سنة)", label_en: "Juniors (11 - 13 years)" },
            { label_ar: "متقدمين (14 - 16 سنة)", label_en: "Advanced (14 - 16 years)" },
            { label_ar: "شباب (17 - 19 سنة)", label_en: "Youth (17 - 19 years)" },
        ],
        schedule_ar: "حصتان أسبوعياً (السبت - الأربعاء) من 5:00 م إلى 7:00 م",
        schedule_en: "2 sessions/week (Sat - Wed) from 5:00 PM to 7:00 PM",
        coachInfo_ar: "كابتن خالد نجيب - مدرب سابق بمنتخب الناشئين",
        coachInfo_en: "Capt. Khaled Nagib - Former junior national team coach",
        fee_ar: "550 ج.م شهرياً",
        fee_en: "550 EGP/month",
        requirements_ar: ["شهادة ميلاد", "صورتان شخصيتان", "كشف طبي حديث"],
        requirements_en: ["Birth certificate", "Two personal photos", "Recent medical checkup"],
        benefits_ar: ["صالة مغطاة بمعايير دولية", "كرات تدريب احترافية", "مباريات أسبوعية داخلية", "حقيبة تدريب وزي رسمي"],
        benefits_en: ["Indoor court with international standards", "Professional training balls", "Weekly internal matches", "Training bag and official kit"],
    },

    swimming: {
        key: "swimming",
        nameAr: "السباحة",
        nameEn: "Swimming",
        tagline_ar: "أكاديمية السباحة بنادي جامعة العاصمة",
        tagline_en: "Swimming Academy at Capital University Club",
        description_ar:
            "افتُتحت أكاديمية السباحة بالنادي عام 2023 مع تجهيز حمامات السباحة الأولمبية بمواصفات معتمدة. تقدم برامج للمبتدئين ومستويات متقدمة بإشراف مدربين معتمدين من الاتحاد المصري للسباحة.",
        description_en:
            "The Swimming Academy opened in 2023 with Olympic pools fitted to certified standards. It offers beginner and advanced programs under coaches certified by the Egyptian Swimming Federation.",
        image: asset("sports/aerobic-gymnastics.jpg"),
        coverImage: asset("gallery/image1.jpg"),
        branches_ar: ["الفرع الرئيسي - جامعة العاصمة", "فرع الزمالك - كلية علوم الرياضة للبنات"],
        branches_en: ["Main Branch - Capital University", "Zamalek Branch - Faculty of Sports Science (Girls)"],
        ageGroups: [
            { label_ar: "براعم (4 - 6 سنوات)", label_en: "Toddlers (4 - 6 years)", note_ar: "تأقلم وأساسيات السلامة في الماء", note_en: "Water safety fundamentals and acclimatization" },
            { label_ar: "مبتدئين (7 - 10 سنوات)", label_en: "Beginners (7 - 10 years)", note_ar: "تعلّم الطرق الأربع للسباحة", note_en: "Learning the four swimming strokes" },
            { label_ar: "متوسط (11 - 14 سنة)", label_en: "Intermediate (11 - 14 years)", note_ar: "تحسين السرعة والتقنية", note_en: "Improving speed and technique" },
            { label_ar: "متقدم (15 سنة فأكثر)", label_en: "Advanced (15+ years)", note_ar: "تدريب احترافي", note_en: "Professional training" },
        ],
        schedule_ar: "3 حصص أسبوعياً (الأحد - الثلاثاء - الخميس) من 3:00 م إلى 5:00 م",
        schedule_en: "3 sessions/week (Sun - Tue - Thu) from 3:00 PM to 5:00 PM",
        coachInfo_ar: "كابتن مونا إبراهيم - حاصلة على شهادات تدريب دولية",
        coachInfo_en: "Capt. Mona Ibrahim - Holder of international coaching certificates",
        fee_ar: "700 ج.م شهرياً",
        fee_en: "700 EGP/month",
        requirements_ar: ["شهادة ميلاد", "كشف طبي يثبت السلامة من أمراض الجلد والأذن", "صورتان شخصيتان"],
        requirements_en: ["Birth certificate", "Medical report confirming freedom from skin and ear conditions", "Two personal photos"],
        benefits_ar: ["حمام سباحة بطول 50 متر", "مياه معالجة يومياً", "أدوات تدريب احترافية", "بطل/ة جوائز شهرية للمتميزين"],
        benefits_en: ["50-metre swimming pool", "Daily treated water", "Professional training equipment", "Monthly awards for top performers"],
    },

    tennis: {
        key: "tennis",
        nameAr: "التنس",
        nameEn: "Tennis",
        tagline_ar: "أكاديمية التنس بنادي جامعة العاصمة",
        tagline_en: "Tennis Academy at Capital University Club",
        description_ar:
            "أكاديمية التنس بنادي جامعة العاصمة افتتحت أبوابها عام 2023 وتهدف إلى تأهيل لاعبين على أعلى مستوى عبر ملاعب ترابية وأخرى صلبة بمواصفات احترافية.",
        description_en:
            "The Tennis Academy at Capital University Club opened in 2023 aiming to develop top-level players through clay and hard courts built to professional standards.",
        image: asset("sports/tennis.jpg"),
        branches_ar: ["الفرع الرئيسي - جامعة العاصمة"],
        branches_en: ["Main Branch - Capital University"],
        ageGroups: [
            { label_ar: "أطفال (6 - 9 سنوات)", label_en: "Children (6 - 9 years)" },
            { label_ar: "ناشئين (10 - 14 سنة)", label_en: "Juniors (10 - 14 years)" },
            { label_ar: "شباب (15 سنة فأكثر)", label_en: "Youth (15+ years)" },
            { label_ar: "كبار - فئة الترفيه", label_en: "Adults - Recreational" },
        ],
        schedule_ar: "حصتان أسبوعياً مرنة حسب الفئة",
        schedule_en: "2 flexible sessions/week per group",
        coachInfo_ar: "كابتن طارق السيد - حكم دولي سابق",
        coachInfo_en: "Capt. Tarek El-Sayed - Former international referee",
        fee_ar: "800 ج.م شهرياً",
        fee_en: "800 EGP/month",
        requirements_ar: ["شهادة ميلاد", "كشف طبي", "صورتان شخصيتان"],
        requirements_en: ["Birth certificate", "Medical checkup", "Two personal photos"],
        benefits_ar: ["3 ملاعب احترافية", "إضاءة ليلية", "تأجير مضارب للمبتدئين", "بطولات داخلية ربع سنوية"],
        benefits_en: ["3 professional courts", "Night lighting", "Racket rental for beginners", "Quarterly internal tournaments"],
    },

    boxing: {
        key: "boxing",
        nameAr: "الملاكمة",
        nameEn: "Boxing",
        tagline_ar: "أكاديمية الملاكمة بنادي جامعة العاصمة",
        tagline_en: "Boxing Academy at Capital University Club",
        description_ar:
            "تأسست أكاديمية الملاكمة بالنادي عام 2023 وحققت إنجازات مبكرة بحصول لاعبيها على ميداليات في بطولة الجمهورية. تركّز على بناء اللياقة، المهارات الفنية، والانضباط الذهني.",
        description_en:
            "The Boxing Academy was founded in 2023 and achieved early milestones with its players winning medals in the Republic Championship. It focuses on building fitness, technical skills, and mental discipline.",
        image: asset("sports/boxing.jpg"),
        branches_ar: ["فرع الهرم - كلية علوم الرياضة للبنين"],
        branches_en: ["Haram Branch - Faculty of Sports Science (Boys)"],
        ageGroups: [
            { label_ar: "ناشئين (10 - 13 سنة)", label_en: "Juniors (10 - 13 years)" },
            { label_ar: "شباب (14 - 17 سنة)", label_en: "Youth (14 - 17 years)" },
            { label_ar: "كبار (18 سنة فأكثر)", label_en: "Adults (18+ years)" },
        ],
        schedule_ar: "4 حصص أسبوعياً (الأحد إلى الخميس) من 6:00 م إلى 8:00 م",
        schedule_en: "4 sessions/week (Sun - Thu) from 6:00 PM to 8:00 PM",
        coachInfo_ar: "كابتن حسام فتحي - بطل سابق ومدرب معتمد",
        coachInfo_en: "Capt. Hossam Fathi - Former champion and certified coach",
        fee_ar: "650 ج.م شهرياً",
        fee_en: "650 EGP/month",
        requirements_ar: ["شهادة ميلاد", "كشف طبي شامل + رسم قلب", "موافقة ولي الأمر"],
        requirements_en: ["Birth certificate", "Comprehensive medical checkup + ECG", "Guardian consent"],
        benefits_ar: ["حلبة احترافية مطابقة للمعايير", "معدات حماية مجانية للمبتدئين", "تدريب وزن وأداء بدني"],
        benefits_en: ["Professional ring to standard specifications", "Free protective equipment for beginners", "Weight and physical performance training"],
    },

    karate: {
        key: "karate",
        nameAr: "الكاراتيه",
        nameEn: "Karate",
        tagline_ar: "أكاديمية الكاراتيه بنادي جامعة العاصمة",
        tagline_en: "Karate Academy at Capital University Club",
        description_ar:
            "أكاديمية الكاراتيه بنادي جامعة العاصمة بدأت في 2023 وتقدّم منهج كاراتيه شوتوكان المعتمد عالمياً، مع نظام احتفال بترقية الأحزمة كل 6 أشهر.",
        description_en:
            "The Karate Academy at Capital University Club started in 2023 and delivers the globally recognized Shotokan Karate curriculum, with a belt promotion ceremony every 6 months.",
        image: asset("sports/taekwondo.jpg"),
        branches_ar: ["الفرع الرئيسي - جامعة العاصمة", "فرع الزمالك - كلية علوم الرياضة للبنات"],
        branches_en: ["Main Branch - Capital University", "Zamalek Branch - Faculty of Sports Science (Girls)"],
        ageGroups: [
            { label_ar: "براعم (4 - 6 سنوات)", label_en: "Toddlers (4 - 6 years)" },
            { label_ar: "أشبال (7 - 9 سنوات)", label_en: "Cubs (7 - 9 years)" },
            { label_ar: "ناشئين (10 - 13 سنة)", label_en: "Juniors (10 - 13 years)" },
            { label_ar: "شباب (14 - 17 سنة)", label_en: "Youth (14 - 17 years)" },
            { label_ar: "كبار (18 سنة فأكثر)", label_en: "Adults (18+ years)" },
        ],
        schedule_ar: "حصتان أسبوعياً مرنة",
        schedule_en: "2 flexible sessions/week",
        coachInfo_ar: "كابتن أحمد حسن - حزام أسود الدرجة الخامسة",
        coachInfo_en: "Capt. Ahmed Hassan - 5th Dan Black Belt",
        fee_ar: "500 ج.م شهرياً",
        fee_en: "500 EGP/month",
        requirements_ar: ["شهادة ميلاد", "كشف طبي", "صورتان شخصيتان"],
        requirements_en: ["Birth certificate", "Medical checkup", "Two personal photos"],
        benefits_ar: ["صالة مخصصة بمعايير ITF", "زي رسمي للأكاديمية", "اختبارات حزام مجانية"],
        benefits_en: ["Dedicated hall to ITF standards", "Official academy uniform", "Free belt grading tests"],
    },

    volleyball: {
        key: "volleyball",
        nameAr: "الكرة الطائرة",
        nameEn: "Volleyball",
        tagline_ar: "أكاديمية الكرة الطائرة بنادي جامعة العاصمة",
        tagline_en: "Volleyball Academy at Capital University Club",
        description_ar:
            "افتُتحت أكاديمية الكرة الطائرة عام 2023 لتأهيل لاعبين ولاعبات للمشاركة في بطولات الجامعات. تركّز على المهارات الجماعية والتكتيك.",
        description_en:
            "The Volleyball Academy opened in 2023 to qualify male and female players for university tournaments. It focuses on team skills and tactical play.",
        image: asset("sports/handball.jpg"),
        branches_ar: ["الفرع الرئيسي - جامعة العاصمة"],
        branches_en: ["Main Branch - Capital University"],
        ageGroups: [
            { label_ar: "ناشئين (10 - 13 سنة)", label_en: "Juniors (10 - 13 years)" },
            { label_ar: "شباب (14 - 17 سنة)", label_en: "Youth (14 - 17 years)" },
            { label_ar: "كبار - فريق المنافسات", label_en: "Adults - Competition Team" },
        ],
        schedule_ar: "3 حصص أسبوعياً",
        schedule_en: "3 sessions/week",
        coachInfo_ar: "كابتن سارة مصطفى - مدربة وطنية معتمدة",
        coachInfo_en: "Capt. Sara Mostafa - Certified national coach",
        fee_ar: "450 ج.م شهرياً",
        fee_en: "450 EGP/month",
        requirements_ar: ["شهادة ميلاد", "كشف طبي"],
        requirements_en: ["Birth certificate", "Medical checkup"],
        benefits_ar: ["ملعبان مغطّى ومفتوح", "تدريب للجنسين كلٌ على حدة"],
        benefits_en: ["Indoor and outdoor courts", "Separate training for each gender"],
    },

    handball: {
        key: "handball",
        nameAr: "كرة اليد",
        nameEn: "Handball",
        tagline_ar: "أكاديمية كرة اليد بنادي جامعة العاصمة",
        tagline_en: "Handball Academy at Capital University Club",
        description_ar:
            "أكاديمية كرة اليد بدأت نشاطها في 2023 وتعتبر من الأكاديميات الواعدة بفضل وجود مدربين معتمدين من الاتحاد المصري لكرة اليد.",
        description_en:
            "The Handball Academy began its activity in 2023 and is considered one of the most promising academies thanks to coaches certified by the Egyptian Handball Federation.",
        image: asset("sports/handball-2.jpg"),
        branches_ar: ["فرع الهرم - كلية علوم الرياضة للبنين", "فرع المطرية - كلية الهندسة"],
        branches_en: ["Haram Branch - Faculty of Sports Science (Boys)", "Matariya Branch - Faculty of Engineering"],
        ageGroups: [
            { label_ar: "أشبال (9 - 11 سنة)", label_en: "Cubs (9 - 11 years)" },
            { label_ar: "ناشئين (12 - 15 سنة)", label_en: "Juniors (12 - 15 years)" },
            { label_ar: "شباب (16 - 19 سنة)", label_en: "Youth (16 - 19 years)" },
        ],
        schedule_ar: "3 حصص أسبوعياً (السبت - الإثنين - الأربعاء)",
        schedule_en: "3 sessions/week (Sat - Mon - Wed)",
        coachInfo_ar: "كابتن إبراهيم نصر - مدرب معتمد من اتحاد كرة اليد",
        coachInfo_en: "Capt. Ibrahim Nasr - Handball Federation certified coach",
        fee_ar: "500 ج.م شهرياً",
        fee_en: "500 EGP/month",
        requirements_ar: ["شهادة ميلاد", "كشف طبي"],
        requirements_en: ["Birth certificate", "Medical checkup"],
        benefits_ar: ["صالة احترافية", "تدريب على أجهزة لياقة"],
        benefits_en: ["Professional hall", "Fitness equipment training"],
    },

    squash: {
        key: "squash",
        nameAr: "الإسكواش",
        nameEn: "Squash",
        tagline_ar: "أكاديمية الإسكواش بنادي جامعة العاصمة",
        tagline_en: "Squash Academy at Capital University Club",
        description_ar:
            "أكاديمية الإسكواش بالنادي تأسست عام 2023 مع تجهيز 3 ملاعب احترافية بمواصفات الاتحاد الدولي. تركز على المهارات الفردية والسرعة الذهنية.",
        description_en:
            "The Squash Academy was founded in 2023 with 3 professional courts built to international federation standards. It focuses on individual skills and mental speed.",
        image: asset("sports/squash.jpg"),
        branches_ar: ["الفرع الرئيسي - جامعة العاصمة"],
        branches_en: ["Main Branch - Capital University"],
        ageGroups: [
            { label_ar: "ناشئين (8 - 12 سنة)", label_en: "Juniors (8 - 12 years)" },
            { label_ar: "شباب (13 - 18 سنة)", label_en: "Youth (13 - 18 years)" },
            { label_ar: "كبار - فئة الترفيه", label_en: "Adults - Recreational" },
        ],
        schedule_ar: "حصتان أسبوعياً",
        schedule_en: "2 sessions/week",
        coachInfo_ar: "كابتن نور كمال - لاعب سابق بالمنتخب",
        coachInfo_en: "Capt. Nour Kamal - Former national team player",
        fee_ar: "700 ج.م شهرياً",
        fee_en: "700 EGP/month",
        requirements_ar: ["شهادة ميلاد", "كشف طبي"],
        requirements_en: ["Birth certificate", "Medical checkup"],
        benefits_ar: ["3 ملاعب احترافية بزجاج خلفي شفاف", "إضاءة LED احترافية"],
        benefits_en: ["3 professional courts with transparent back glass", "Professional LED lighting"],
    },

    chess: {
        key: "chess",
        nameAr: "الشطرنج",
        nameEn: "Chess",
        tagline_ar: "أكاديمية الشطرنج بنادي جامعة العاصمة",
        tagline_en: "Chess Academy at Capital University Club",
        description_ar:
            "أكاديمية الشطرنج بالنادي بدأت في 2023 لتنمية مهارات التفكير الاستراتيجي والذكاء عند مختلف الأعمار. تنظّم بطولات شهرية داخلية.",
        description_en:
            "The Chess Academy at the club started in 2023 to develop strategic thinking skills and intelligence across all ages. Monthly internal tournaments are organized.",
        image: asset("sports/wrestling.jpg"),
        branches_ar: ["الفرع الرئيسي - جامعة العاصمة"],
        branches_en: ["Main Branch - Capital University"],
        ageGroups: [
            { label_ar: "أطفال (5 - 9 سنوات)", label_en: "Children (5 - 9 years)" },
            { label_ar: "ناشئين (10 - 14 سنة)", label_en: "Juniors (10 - 14 years)" },
            { label_ar: "شباب (15 سنة فأكثر)", label_en: "Youth (15+ years)" },
            { label_ar: "كبار", label_en: "Adults" },
        ],
        schedule_ar: "حصتان أسبوعياً (السبت + الثلاثاء)",
        schedule_en: "2 sessions/week (Sat + Tue)",
        coachInfo_ar: "أستاذ محمد فتحي - حاصل على لقب أستاذ دولي",
        coachInfo_en: "Prof. Mohamed Fathi - International Master title holder",
        fee_ar: "350 ج.م شهرياً",
        fee_en: "350 EGP/month",
        requirements_ar: ["شهادة ميلاد", "صورتان شخصيتان"],
        requirements_en: ["Birth certificate", "Two personal photos"],
        benefits_ar: ["قاعة مجهزة", "بطولات شهرية بجوائز", "تدريب جماعي وفردي"],
        benefits_en: ["Fully equipped hall", "Monthly tournaments with prizes", "Group and individual training"],
    },

    judo: {
        key: "judo",
        nameAr: "الجودو",
        nameEn: "Judo",
        tagline_ar: "أكاديمية الجودو بنادي جامعة العاصمة",
        tagline_en: "Judo Academy at Capital University Club",
        description_ar:
            "تأسست أكاديمية الجودو عام 2023 بإشراف مدربين معتمدين من الاتحاد الدولي للجودو. تركّز على بناء القوة والانضباط والاحترام.",
        description_en:
            "The Judo Academy was founded in 2023 under coaches certified by the International Judo Federation. It focuses on building strength, discipline, and respect.",
        image: asset("sports/kungfu.jpg"),
        branches_ar: ["فرع الهرم - كلية علوم الرياضة للبنين"],
        branches_en: ["Haram Branch - Faculty of Sports Science (Boys)"],
        ageGroups: [
            { label_ar: "ناشئين (8 - 12 سنة)", label_en: "Juniors (8 - 12 years)" },
            { label_ar: "شباب (13 - 17 سنة)", label_en: "Youth (13 - 17 years)" },
            { label_ar: "كبار (18 سنة فأكثر)", label_en: "Adults (18+ years)" },
        ],
        schedule_ar: "3 حصص أسبوعياً",
        schedule_en: "3 sessions/week",
        coachInfo_ar: "كابتن طارق الحديدي - حزام أسود الدرجة السادسة",
        coachInfo_en: "Capt. Tarek El-Hadeedi - 6th Dan Black Belt",
        fee_ar: "550 ج.م شهرياً",
        fee_en: "550 EGP/month",
        requirements_ar: ["شهادة ميلاد", "كشف طبي شامل"],
        requirements_en: ["Birth certificate", "Comprehensive medical checkup"],
        benefits_ar: ["تاتامي احترافي", "زي رياضي رسمي", "اختبارات حزام منتظمة"],
        benefits_en: ["Professional tatami", "Official sports uniform", "Regular belt grading tests"],
    },

    gymnastics: {
        key: "gymnastics",
        nameAr: "الجمباز",
        nameEn: "Gymnastics",
        tagline_ar: "أكاديمية الجمباز بنادي جامعة العاصمة",
        tagline_en: "Gymnastics Academy at Capital University Club",
        description_ar:
            "أكاديمية الجمباز الفني والإيقاعي بدأت في 2023 لتقديم تدريب احترافي للبنين والبنات مع التركيز على المرونة والتوازن والقوة العضلية.",
        description_en:
            "The Artistic and Rhythmic Gymnastics Academy started in 2023 to provide professional training for boys and girls, focusing on flexibility, balance, and muscular strength.",
        image: asset("sports/gymnastics.jpg"),
        coverImage: asset("sports/gymnastics-2.jpg"),
        branches_ar: ["فرع الزمالك - كلية علوم الرياضة للبنات"],
        branches_en: ["Zamalek Branch - Faculty of Sports Science (Girls)"],
        ageGroups: [
            { label_ar: "براعم (3 - 5 سنوات)", label_en: "Toddlers (3 - 5 years)" },
            { label_ar: "ناشئين (6 - 9 سنوات)", label_en: "Juniors (6 - 9 years)" },
            { label_ar: "متقدمات (10 - 13 سنة)", label_en: "Advanced (10 - 13 years)" },
            { label_ar: "متخصصات (14 سنة فأكثر)", label_en: "Specialized (14+ years)" },
        ],
        schedule_ar: "3 حصص أسبوعياً",
        schedule_en: "3 sessions/week",
        coachInfo_ar: "كابتن دينا حسني - لاعبة سابقة بالمنتخب",
        coachInfo_en: "Capt. Dina Hosni - Former national team player",
        fee_ar: "650 ج.م شهرياً",
        fee_en: "650 EGP/month",
        requirements_ar: ["شهادة ميلاد", "كشف طبي يثبت السلامة من إصابات العمود الفقري"],
        requirements_en: ["Birth certificate", "Medical report confirming spinal health"],
        benefits_ar: ["صالة مجهزة بأحدث الأجهزة", "حصص فردية للمتقدمات", "عروض سنوية"],
        benefits_en: ["Hall equipped with the latest apparatus", "Individual sessions for advanced students", "Annual shows"],
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
    const { t, i18n } = useTranslation("landing");
    const isAr = i18n.language?.startsWith("ar");

    const finalKey = resolveSportKey(sportKey);
    const sport = SPORTS_DB[finalKey];

    // helpers to pick the right language field
    const s = <T,>(ar: T, en: T) => (isAr ? ar : en);

    // Navigate back to landing with proper tab
    const goToLandingTab = (tab: string) => {
        const targetPath = tab === "home" ? "/" : `/?tab=${encodeURIComponent(tab)}`;
        navigate(targetPath);
    };

    const allSports = Object.values(SPORTS_DB);

    // Subscription steps
    const steps_ar = [
        "تجهيز المستندات المطلوبة (شهادة ميلاد، صور شخصية، كشف طبي).",
        "التوجّه إلى مكتب التسجيل في الفرع المناسب أو التسجيل أونلاين عبر الموقع.",
        "تحديد الفئة العمرية المناسبة بعد مقابلة مع المدرب.",
        "دفع رسوم الاشتراك الشهرية أو السنوية.",
        "استلام كارنيه العضوية وزي التدريب الرسمي.",
        "بدء التدريب وفقاً للجدول المحدد.",
    ];
    const steps_en = [
        "Prepare the required documents (birth certificate, personal photos, medical checkup).",
        "Visit the registration office at the appropriate branch or register online via the website.",
        "Determine the appropriate age group after a meeting with the coach.",
        "Pay the monthly or annual subscription fees.",
        "Receive the membership card and official training kit.",
        "Start training according to the assigned schedule.",
    ];
    const steps = isAr ? steps_ar : steps_en;

    return (
        <div className="min-h-screen bg-gray-50" dir={isAr ? "rtl" : "ltr"}>
            <SiteNavbar activeTab="Sports" onTabChange={goToLandingTab} />

            {/* Hero with sport image */}
            <section className="relative h-[55vh] min-h-[460px] mt-[88px] overflow-hidden">
                <img
                    src={sport.coverImage || sport.image}
                    alt={isAr ? sport.nameAr : sport.nameEn}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                    key={sport.key}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-[#0e1c38]/95 via-[#0e1c38]/70 to-[#0e1c38]/40" />
                <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-end pb-12 gap-3">
                    <Link
                        to="/?tab=Sports"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-bold self-end"
                    >
                        <ChevronRight className="w-4 h-4" /> {t("sports.back_to_sports", "العودة لقائمة الألعاب")}
                    </Link>
                    <p className="text-[#f8941c] font-extrabold tracking-[0.2em] text-sm md:text-base">
                        {sport.nameEn.toUpperCase()}
                    </p>
                    <h1 className="text-3xl md:text-5xl font-black text-white max-w-3xl">
                        {s(sport.tagline_ar, sport.tagline_en)}
                    </h1>
                    <p className="text-white/85 text-lg max-w-2xl font-medium">
                        {t("sports.founded_2023", "تأسست عام 2023 ضمن منظومة أكاديميات النادي")}
                    </p>

                    {/* Sport selector */}
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <label className="text-white/90 font-bold text-sm">{t("sports.select_sport", "اختر اللعبة:")}</label>
                        <div className="relative">
                            <select
                                value={sport.key}
                                onChange={(e) => navigate(`/sport/${e.target.value}`)}
                                className="bg-white/95 text-[#0e1c38] font-bold rounded-full pl-10 pr-5 py-2.5 text-sm shadow-lg ring-1 ring-white/40 hover:ring-[#f8941c] focus:outline-none focus:ring-2 focus:ring-[#f8941c] appearance-none cursor-pointer min-w-[220px]"
                            >
                                {allSports.map((sp) => (
                                    <option key={sp.key} value={sp.key}>
                                        {isAr ? sp.nameAr : sp.nameEn}
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
                            <span className="w-1 h-7 bg-[#f8941c] rounded-full" /> {t("sports.about_academy", "نبذة عن الأكاديمية")}
                        </h2>
                        <p className="text-gray-700 leading-loose text-base md:text-lg">{s(sport.description_ar, sport.description_en)}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 text-center">
                            <InfoTile icon={Calendar} label={t("sports.stats.founded", "التأسيس")} value="2023" />
                            <InfoTile icon={Users} label={t("sports.stats.coaches", "المدرب الرئيسي")} value={s(sport.coachInfo_ar, sport.coachInfo_en).split(" - ")[0]} />
                            <InfoTile icon={Clock} label={t("sports.schedule_label", "الجدول")} value={t("sports.flexible_weekly", "مرن أسبوعياً")} />
                            <InfoTile icon={Award} label={t("sports.fees_label", "الرسوم")} value={s(sport.fee_ar, sport.fee_en).split(" ").slice(0, 2).join(" ")} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#2596be] to-[#1a7a99] rounded-3xl shadow-md p-8 text-white">
                        <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-3">
                            <MapPin className="w-6 h-6 text-[#f8941c]" /> {t("sports.available_branches", "الفروع المتاحة")}
                        </h2>
                        <ul className="space-y-3">
                            {s(sport.branches_ar, sport.branches_en).map((b, i) => (
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
                        <span className="w-1 h-8 bg-[#f8941c] rounded-full" /> {t("sports.age_groups", "الفئات العمرية المتاحة")}
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
                                    <h3 className="font-extrabold text-lg text-[#0e1c38]">{s(g.label_ar, g.label_en)}</h3>
                                </div>
                                {(isAr ? g.note_ar : g.note_en) && <p className="text-gray-600 text-sm">{s(g.note_ar, g.note_en)}</p>}
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
                            <span className="w-1 h-7 bg-[#f8941c] rounded-full" /> {t("sports.subscription_steps", "خطوات الاشتراك")}
                        </h2>
                        <ol className="space-y-4 text-gray-700">
                            {steps.map((step, i) => (
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
                            <span className="w-1 h-7 bg-[#f8941c] rounded-full" /> {t("sports.required_docs", "المستندات المطلوبة")}
                        </h2>
                        <ul className="space-y-3 mb-6">
                            {s(sport.requirements_ar, sport.requirements_en).map((r, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700">
                                    <CheckCircle className="w-5 h-5 text-[#2596be] flex-shrink-0 mt-0.5" /> {r}
                                </li>
                            ))}
                        </ul>

                        <h3 className="font-extrabold text-[#0e1c38] mb-3 mt-6">{t("sports.subscription_benefits", "مميزات الاشتراك")}</h3>
                        <ul className="space-y-2">
                            {s(sport.benefits_ar, sport.benefits_en).map((b, i) => (
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
                            <h3 className="font-extrabold text-lg mb-2">{t("sports.training_schedule", "جدول التدريبات")}</h3>
                            <p className="text-white/85">{s(sport.schedule_ar, sport.schedule_en)}</p>
                        </div>
                        <div>
                            <Users className="w-8 h-8 text-[#f8941c] mb-3" />
                            <h3 className="font-extrabold text-lg mb-2">{t("sports.head_coach", "المدرب المسؤول")}</h3>
                            <p className="text-white/85">{s(sport.coachInfo_ar, sport.coachInfo_en)}</p>
                        </div>
                        <div>
                            <Award className="w-8 h-8 text-[#f8941c] mb-3" />
                            <h3 className="font-extrabold text-lg mb-2">{t("sports.monthly_fees", "الرسوم الشهرية")}</h3>
                            <p className="text-white/85">{s(sport.fee_ar, sport.fee_en)}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="container mx-auto px-6 py-12">
                <div className="bg-[#f8941c] rounded-3xl p-10 md:p-12 text-center text-white shadow-xl">
                    <h2 className="text-2xl md:text-4xl font-extrabold mb-3">{t("sports.cta.title", "جاهز للانضمام؟")}</h2>
                    <p className="text-white/95 text-lg mb-6 max-w-xl mx-auto">
                        {t("sports.register_now_cta", "سجّل الآن واحجز مكانك في")} {s(sport.tagline_ar, sport.tagline_en)}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => navigate("/re")}
                            className="bg-white text-[#0e1c38] hover:bg-gray-100 px-8 py-3.5 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            {t("auth.register", "سجّل الآن")}
                        </button>
                        <a
                            href="#contact"
                            className="bg-[#0e1c38] hover:bg-[#1a4d63] text-white px-8 py-3.5 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            {t("nav.contact", "تواصل معنا")}
                        </a>
                    </div>
                </div>
            </section>

            {/* Contact section */}
            <section id="contact" className="bg-white py-14">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-10">
                        <p className="text-[#f8941c] font-bold text-sm tracking-[0.2em] uppercase mb-2">
                            {t("sports.contact_info_label", "بيانات التواصل")}
                        </p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0e1c38]">{t("sports.contact_academy", "تواصل مع إدارة الأكاديمية")}</h2>
                        <p className="text-gray-600 mt-3">{t("sports.contact_subtitle", "للاستفسار عن الاشتراك أو الفئات العمرية أو الجدول")}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <ContactCard
                            icon={Phone}
                            title={t("contact.phone", "اتصل بنا")}
                            primary="02 - 2999 1111"
                            secondary="01001 - 110 - 005"
                        />
                        <ContactCard
                            icon={Mail}
                            title={t("contact.email", "البريد الإلكتروني")}
                            primary="info@capital-club.eg"
                            secondary={`academy.${sport.key}@capital-club.eg`}
                        />
                        <ContactCard
                            icon={MapPin}
                            title={t("sports.academy_location", "مقر الأكاديمية")}
                            primary={s(sport.branches_ar, sport.branches_en)[0]}
                            secondary={s(sport.branches_ar, sport.branches_en)[1] || ""}
                        />
                    </div>

                    <div className="mt-10 max-w-5xl mx-auto bg-gray-50 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            <h3 className="font-extrabold text-xl text-[#0e1c38] mb-2">{t("contact.hours.title", "مواعيد العمل")}</h3>
                            <p className="text-gray-700">{t("sports.hours_sat_thu", "السبت إلى الخميس: من 9 صباحاً حتى 10 مساءً")}</p>
                            <p className="text-gray-700">{t("sports.hours_fri", "الجمعة: من 2 ظهراً حتى 10 مساءً")}</p>
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
                                <MapPin className="w-4 h-4" /> {t("contact.map", "الموقع على الخريطة")}
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
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" /> {t("sports.back_to_sports_footer", "العودة لقائمة الألعاب الرياضية")}
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

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
    label_ar: "العضويات والاشتراك",
    label_en: "Memberships & Subscriptions",
    icon: Users,
    items: [
      {
        q_ar: "كيف يمكنني التسجيل كعضو جديد في نادي جامعة العاصمة؟",
        a_ar: "يمكنك التسجيل أونلاين من خلال صفحة \"سجّل الآن\" على الموقع، أو بزيارة مكتب التسجيل في أحد فروع النادي. يلزمك تجهيز: شهادة ميلاد سارية، بطاقة رقم قومي، صورتين شخصيتين، كشف طبي حديث، ودفع رسوم استمارة العضوية (250 جنيه مرة واحدة) بالإضافة إلى رسوم العضوية حسب الفئة.",
        q_en: "How can I register as a new member at Capital University Club?",
        a_en: "You can register online through the \"Register Now\" page, or by visiting the registration office at one of our branches. Required documents: valid birth certificate, national ID, 2 personal photos, recent medical checkup, and paying the membership form fee (250 EGP once) plus the membership fee based on the category."
      },
      {
        q_ar: "ما أنواع العضويات المتاحة؟",
        a_ar: "النادي يقدّم 7 فئات: عضو هيئة تدريس، عضو عامل (4 شرائح حسب الراتب)، طالب أو رياضي متميز، عضو تابع (الأسرة)، عضو زائر، عضو موسمي مصري (6 أشهر)، وعضو موسمي للأجانب (شهر/6 أشهر/سنة). تفاصيل الأسعار في قسم العضويات بالموقع.",
        q_en: "What types of memberships are available?",
        a_en: "The club offers 7 categories: faculty member, working member (4 brackets based on salary), student or exceptional athlete, dependent member (family), visitor member, Egyptian seasonal member (6 months), and foreign seasonal member (month/6 months/year). Price details are in the Memberships section."
      },
      {
        q_ar: "هل أحتاج إلى أن أكون من منسوبي الجامعة للاشتراك؟",
        a_ar: "لا، النادي مفتوح أيضاً للأعضاء الزوار من خارج الجامعة. رسوم العضوية للزائر 5000 جنيه سنوياً. الأعضاء من منسوبي الجامعة لهم أسعار خاصة.",
        q_en: "Do I need to be affiliated with the university to subscribe?",
        a_en: "No, the club is also open to visitor members from outside the university. The visitor membership fee is 5000 EGP annually. University affiliates enjoy special prices."
      },
      {
        q_ar: "هل يمكنني تقسيط رسوم العضوية؟",
        a_ar: "نعم، التقسيط متاح لبعض الفئات (هيئة التدريس، الموظفين، الطلاب، التابعين، الزائرين). عدد الأقساط يصل إلى 4 أقساط حسب الفئة. التقسيط غير متاح للعضوية الموسمية.",
        q_en: "Can I pay membership fees in installments?",
        a_en: "Yes, installments are available for some categories (faculty, staff, students, dependents, visitors). The number of installments goes up to 4 depending on the category. Installments are not available for seasonal memberships."
      },
      {
        q_ar: "هل تشمل الأسعار ضريبة القيمة المضافة؟",
        a_ar: "لا، رسوم العضويات المعلنة لا تشمل ضريبة القيمة المضافة (14%). تُضاف الضريبة عند الدفع.",
        q_en: "Do prices include VAT?",
        a_en: "No, the advertised membership fees do not include VAT (14%). Tax is added upon payment."
      }
    ],
  },
  {
    key: "sports",
    label_ar: "الألعاب الرياضية والأكاديميات",
    label_en: "Sports & Academies",
    icon: Trophy,
    items: [
      {
        q_ar: "ما الألعاب الرياضية المتاحة بالنادي؟",
        a_ar: "النادي يقدّم 12 لعبة: كرة القدم، كرة السلة، الكرة الطائرة، التنس، السباحة، الجودو، الكاراتيه، الإسكواش، الشطرنج، الجمباز، كرة اليد، والملاكمة. تفاصيل كل لعبة من قسم الألعاب الرياضية على الموقع.",
        q_en: "What sports are available at the club?",
        a_en: "The club offers 12 sports: Football, Basketball, Volleyball, Tennis, Swimming, Judo, Karate, Squash, Chess, Gymnastics, Handball, and Boxing. Details for each sport are in the Sports section."
      },
      {
        q_ar: "كيف أشترك في أكاديمية لعبة معينة؟",
        a_ar: "ادخل صفحة \"الألعاب الرياضية\"، اختار الفرع واللعبة، اضغط \"تعرف على تفاصيل الاشتراك\". هتلاقي كل التفاصيل: الفئات العمرية، الرسوم، الجدول، المدرب المسؤول، والمستندات المطلوبة.",
        q_en: "How do I subscribe to a specific sports academy?",
        a_en: "Go to the \"Sports\" page, select the branch and sport, and click \"Subscription Details\". You will find all details: age groups, fees, schedule, responsible coach, and required documents."
      },
      {
        q_ar: "هل يلزمني أن أكون عضواً في النادي لأشترك في أكاديمية رياضية؟",
        a_ar: "نعم، الاشتراك في الأكاديميات يستلزم عضوية سارية في النادي. لو إنت لاعب متميز قد تستفيد من فئة \"عضوية الرياضي المتميز\" برسوم 1000 جنيه سنوياً.",
        q_en: "Do I need to be a club member to join a sports academy?",
        a_en: "Yes, academy subscriptions require an active club membership. If you are an exceptional athlete, you might benefit from the \"Exceptional Athlete Membership\" at 1000 EGP annually."
      },
      {
        q_ar: "هل توفّرون تدريبات للسيدات بشكل منفصل؟",
        a_ar: "نعم، فرع الزمالك (كلية علوم الرياضة للبنات) مخصص للسيدات والفتيات بالكامل. كما تتوفر حصص مخصصة للسيدات في باقي الفروع لبعض الألعاب.",
        q_en: "Do you provide separate training for ladies?",
        a_en: "Yes, the Zamalek branch (Faculty of Sports Science for Girls) is entirely dedicated to ladies and girls. Dedicated ladies' classes are also available in other branches for certain sports."
      },
      {
        q_ar: "ما الفئات العمرية المتاحة؟",
        a_ar: "تختلف من لعبة لأخرى. عموماً: براعم (4-6 سنوات)، أشبال (7-9)، ناشئين (10-13)، شباب (14-17)، كبار (18+). تفاصيل كل لعبة في صفحتها المخصصة.",
        q_en: "What age groups are available?",
        a_en: "It varies by sport. Generally: Toddlers (4-6 years), Cubs (7-9), Juniors (10-13), Youth (14-17), Adults (18+). Details for each sport are on its dedicated page."
      },
      {
        q_ar: "هل في تدريبات تجريبية قبل الاشتراك؟",
        a_ar: "نعم، يمكن حضور حصة تجريبية واحدة مجاناً بعد التواصل مع مدرب الأكاديمية لتحديد موعد مناسب.",
        q_en: "Are there trial sessions before subscribing?",
        a_en: "Yes, you can attend one free trial session after contacting the academy coach to schedule a suitable time."
      }
    ],
  },
  {
    key: "kids",
    label_ar: "إلحاق الأطفال",
    label_en: "Kids Enrollment",
    icon: Baby,
    items: [
      {
        q_ar: "ما السن الأدنى لإلحاق طفلي بالنادي؟",
        a_ar: "السن الأدنى للاشتراك في الأكاديميات الرياضية هو 4 سنوات (في كرة القدم والسباحة والجمباز). بعض الألعاب تبدأ من سن 6 أو 7 أو 8 سنوات.",
        q_en: "What is the minimum age to enroll my child?",
        a_en: "The minimum age for sports academies is 4 years (in Football, Swimming, and Gymnastics). Some sports start at 6, 7, or 8 years old."
      },
      {
        q_ar: "هل أحتاج لتسجيل ابني/ابنتي كعضو منفصل أم يكفي اشتراكي كأب؟",
        a_ar: "الأبناء يندرجون تحت \"عضوية التابع\" (2000 جنيه سنوياً للطفل). كل تابع له بطاقة عضوية مستقلة وتمنحه دخول النادي والاشتراك في الأكاديميات.",
        q_en: "Do I need to register my child as a separate member or is my membership enough?",
        a_en: "Children fall under the \"Dependent Membership\" (2000 EGP annually per child). Each dependent has an independent membership card granting club access and academy subscription."
      },
      {
        q_ar: "هل توجد منطقة آمنة للأطفال داخل النادي؟",
        a_ar: "نعم، الفرع الرئيسي بجامعة العاصمة فيه منطقتان مخصصتان للأطفال (kids area) بإشراف متخصصين، مع أنشطة تعليمية وترفيهية. باقي الفروع فيها منطقة واحدة على الأقل.",
        q_en: "Is there a safe kids area inside the club?",
        a_en: "Yes, the main branch has two dedicated kids areas supervised by specialists, with educational and recreational activities. Other branches have at least one kids area."
      },
      {
        q_ar: "هل توجد حصص خاصة لرياض الأطفال (ما قبل المدرسة)؟",
        a_ar: "نعم، أكاديميات كرة القدم والسباحة والجمباز والكاراتيه تقدّم حصص \"براعم\" مخصصة لمرحلة (4-6 سنوات) بإيقاع تأسيسي مرح يركّز على التآزر الحركي.",
        q_en: "Are there special classes for kindergarteners (preschool)?",
        a_en: "Yes, Football, Swimming, Gymnastics, and Karate academies offer \"Toddler\" classes tailored for the 4-6 age group, focusing on motor coordination with a fun foundational rhythm."
      },
      {
        q_ar: "هل يلزم وجود ولي الأمر أثناء التدريب؟",
        a_ar: "للأطفال من 4 إلى 6 سنوات نُفضّل وجود ولي الأمر في أول حصتين. الأكبر سناً يكفي وجود ولي الأمر عند التوصيل والاستلام.",
        q_en: "Is a parent required to be present during training?",
        a_en: "For children aged 4 to 6, we prefer a parent to be present during the first two sessions. For older children, parent presence is only required for drop-off and pick-up."
      }
    ],
  },
  {
    key: "courts",
    label_ar: "حجز الملاعب",
    label_en: "Court Reservations",
    icon: Calendar,
    items: [
      {
        q_ar: "كيف أحجز ملعب أو مرفق رياضي؟",
        a_ar: "من صفحة العضو الخاصة بك على الموقع، روح لـ \"حجز الملاعب\"، اختار الفرع والرياضة والملعب والوقت. الحجز يثبت بعد الدفع مباشرة عبر الموقع.",
        q_en: "How do I book a court or sports facility?",
        a_en: "From your member page on the website, go to \"Court Reservations\", select the branch, sport, court, and time. The booking is confirmed immediately after online payment."
      },
      {
        q_ar: "هل يمكنني الحجز قبل وقت كبير؟",
        a_ar: "نعم، يمكنك الحجز قبل أسبوعين كحد أقصى. الحجز المتأخر متاح حتى ساعة قبل الموعد إذا توفّر ملعب.",
        q_en: "Can I book far in advance?",
        a_en: "Yes, you can book up to two weeks in advance. Late booking is available up to one hour before the time if a court is available."
      },
      {
        q_ar: "هل يمكن إلغاء أو تعديل الحجز؟",
        a_ar: "نعم، الإلغاء المجاني متاح حتى 24 ساعة قبل الموعد. الإلغاء بعد ذلك يخصم 50% من القيمة. التعديل (تغيير الوقت) متاح مجاناً قبل 6 ساعات من الموعد.",
        q_en: "Can I cancel or modify a reservation?",
        a_en: "Yes, free cancellation is available up to 24 hours before the time. Cancellations after that deduct 50% of the value. Modification (time change) is free up to 6 hours before."
      },
      {
        q_ar: "كم سعر إيجار الملعب؟",
        a_ar: "يختلف حسب الملعب والفرع. ملاعب التنس والإسكواش 150-200 جنيه/ساعة. ملاعب كرة القدم 250-400 جنيه/ساعة. ملاعب كرة السلة والطائرة 200-300 جنيه/ساعة.",
        q_en: "What is the court rental price?",
        a_en: "It varies by court and branch. Tennis and Squash courts are 150-200 EGP/hour. Football pitches are 250-400 EGP/hour. Basketball and Volleyball courts are 200-300 EGP/hour."
      },
      {
        q_ar: "هل يمكن مشاركة الأصدقاء في الحجز؟",
        a_ar: "نعم، بعد الحجز ستحصل على رابط مشاركة يمكنك إرساله للأصدقاء لينضموا للحجز. كل مشارك يجب أن يكون عضواً في النادي أو ضيفاً مصرّح به.",
        q_en: "Can I share the reservation with friends?",
        a_en: "Yes, after booking you will receive a shareable link to send to friends to join the reservation. Every participant must be a club member or an authorized guest."
      }
    ],
  },
  {
    key: "facilities",
    label_ar: "المرافق والخدمات",
    label_en: "Facilities & Services",
    icon: Building2,
    items: [
      {
        q_ar: "ما المرافق الموجودة بالنادي؟",
        a_ar: "الفرع الرئيسي فيه 26 ملعب، 3 حمامات سباحة، 2 مطعم، 2 منطقة أطفال، صالة جيم، وادي الفنون، مكتبة، ومنطقة اجتماعية. باقي الفروع لها مرافق متخصصة حسب الكلية.",
        q_en: "What facilities are in the club?",
        a_en: "The main branch has 26 courts, 3 swimming pools, 2 restaurants, 2 kids areas, a gym, Arts Valley, a library, and a social area. Other branches have specialized facilities based on the faculty."
      },
      {
        q_ar: "هل توجد حمامات سباحة مغطّاة؟",
        a_ar: "نعم، فرع الزمالك يوفّر حمام سباحة مغطّى للسيدات. الفرع الرئيسي يضم حمام سباحة أولمبي مفتوح وآخر مغطّى للتدريبات في الشتاء.",
        q_en: "Are there indoor swimming pools?",
        a_en: "Yes, the Zamalek branch offers an indoor pool for ladies. The main branch features an outdoor Olympic pool and an indoor pool for winter training."
      },
      {
        q_ar: "هل في مواقف سيارات؟",
        a_ar: "نعم، كل الفروع توفّر مواقف سيارات مجانية للأعضاء. الفرع الرئيسي بالعاصمة الإدارية فيه مواقف لأكثر من 500 سيارة.",
        q_en: "Are there parking lots?",
        a_en: "Yes, all branches provide free parking for members. The main branch has parking for over 500 cars."
      },
      {
        q_ar: "هل توجد كافيتيريا أو مطعم؟",
        a_ar: "نعم، الفرع الرئيسي فيه 2 مطعم بقائمة طعام صحية ومتنوعة، بالإضافة لكافيتيريا في كل فرع.",
        q_en: "Is there a cafeteria or restaurant?",
        a_en: "Yes, the main branch has 2 restaurants with a healthy and diverse menu, plus a cafeteria in every branch."
      },
      {
        q_ar: "هل توفّرون wifi مجاني؟",
        a_ar: "نعم، الـ wifi متاح بسرعة عالية في كل أرجاء النادي مجاناً للأعضاء. يمكن الاتصال باستخدام رقم العضوية.",
        q_en: "Do you provide free Wi-Fi?",
        a_en: "Yes, high-speed Wi-Fi is available throughout the club for free for members. You can connect using your membership number."
      }
    ],
  },
  {
    key: "payments",
    label_ar: "الرسوم والمدفوعات",
    label_en: "Fees & Payments",
    icon: CreditCard,
    items: [
      {
        q_ar: "ما طرق الدفع المتاحة؟",
        a_ar: "نقبل: نقدي بمكاتب الفروع، بطاقات الائتمان (Visa / Mastercard)، التحويل البنكي، فوري والمحافظ الإلكترونية. الدفع أونلاين متاح للحجوزات والاشتراكات.",
        q_en: "What payment methods are available?",
        a_en: "We accept: cash at branch offices, credit cards (Visa / Mastercard), bank transfer, Fawry, and e-wallets. Online payment is available for bookings and subscriptions."
      },
      {
        q_ar: "كم رسوم التجديد السنوي؟",
        a_ar: "تختلف حسب الفئة: عضو هيئة التدريس والعضو العامل 300 جنيه سنوياً، الطالب/الرياضي 1000 جنيه، التابع 2000 جنيه، الزائر 5000 جنيه. تفاصيلها في قسم العضويات.",
        q_en: "What are the annual renewal fees?",
        a_en: "It varies by category: Faculty and Working Member 300 EGP annually, Student/Athlete 1000 EGP, Dependent 2000 EGP, Visitor 5000 EGP. Details are in the Memberships section."
      },
      {
        q_ar: "ماذا لو نسيت تجديد العضوية في موعدها؟",
        a_ar: "العضوية المنتهية تعطّل صلاحيات الدخول مؤقتاً. يمكن التجديد المتأخر بدون غرامة خلال 30 يوماً. بعد ذلك يلزم إعادة الاشتراك بالكامل.",
        q_en: "What if I forget to renew my membership on time?",
        a_en: "An expired membership temporarily suspends entry privileges. Late renewal without a penalty is possible within 30 days. After that, a full re-subscription is required."
      },
      {
        q_ar: "هل توجد خصومات للعائلات؟",
        a_ar: "نعم، الأسرة كاملة (عضو + زوج/زوجة + أبناء) تحصل على باقة عائلية بخصم 15% على إجمالي الاشتراك.",
        q_en: "Are there family discounts?",
        a_en: "Yes, the entire family (member + spouse + children) gets a family package with a 15% discount on the total subscription."
      },
      {
        q_ar: "هل يمكنني استرداد المبلغ لو لم أستطع استخدام العضوية؟",
        a_ar: "خلال أول 14 يوم من الاشتراك: استرداد كامل ـ خصم 250 جنيه قيمة الاستمارة. بعد ذلك: استرداد جزئي حسب المدة المتبقية وفق سياسة النادي.",
        q_en: "Can I get a refund if I can't use the membership?",
        a_en: "During the first 14 days: full refund minus 250 EGP for the form. After that: partial refund based on the remaining period according to club policy."
      }
    ],
  },
  {
    key: "general",
    label_ar: "أسئلة عامة",
    label_en: "General Questions",
    icon: HelpCircle,
    items: [
      {
        q_ar: "ما مواعيد عمل النادي؟",
        a_ar: "السبت إلى الخميس: من 6 صباحاً حتى 11 مساءً. الجمعة: من 8 صباحاً حتى 12 منتصف الليل. مواعيد الأكاديميات والحجوزات حسب الجدول الخاص بكل لعبة.",
        q_en: "What are the club's working hours?",
        a_en: "Saturday to Thursday: 6 AM to 11 PM. Friday: 8 AM to Midnight. Academy and booking times are according to each sport's schedule."
      },
      {
        q_ar: "هل توجد خدمة عملاء على مدار الساعة؟",
        a_ar: "خدمة الواتساب وخدمة العملاء عبر الموقع متاحة 24 ساعة. الخط الأرضي (1913641) متاح من 8 صباحاً حتى 10 مساءً.",
        q_en: "Is customer service available 24/7?",
        a_en: "WhatsApp and website customer service are available 24/7. The landline (1913641) is available from 8 AM to 10 PM."
      },
      {
        q_ar: "هل النادي يستقبل ضيوف الأعضاء؟",
        a_ar: "نعم، كل عضو له حق إدخال 4 ضيوف شهرياً مجاناً. كل ضيف إضافي 50 جنيه. الضيوف من خارج مصر يدخلون مجاناً مع العضو.",
        q_en: "Does the club welcome guests of members?",
        a_en: "Yes, each member is entitled to bring 4 guests per month for free. Every additional guest is 50 EGP. Guests from outside Egypt enter for free with the member."
      },
      {
        q_ar: "هل يوفر النادي تأمين ضد إصابات التدريب؟",
        a_ar: "نعم، كل لاعب مسجّل في أكاديمية يحصل على تأمين تكميلي يغطّي إصابات التدريب البسيطة والمتوسطة. للإصابات الكبيرة يلزم تأمين إضافي.",
        q_en: "Does the club provide insurance against training injuries?",
        a_en: "Yes, every player registered in an academy gets supplementary insurance covering minor to moderate training injuries. For major injuries, additional insurance is required."
      },
      {
        q_ar: "كيف أتقدّم بشكوى أو اقتراح؟",
        a_ar: "عبر النموذج في هذه الصفحة، أو بالإيميل على " + CONTACT_EMAIL + "، أو من \"خدمة العملاء\" في صفحة العضو. كل الشكاوى تتم متابعتها خلال 48 ساعة.",
        q_en: "How do I submit a complaint or suggestion?",
        a_en: "Via the form on this page, or by emailing " + CONTACT_EMAIL + ", or through \"Customer Service\" on the member page. All complaints are followed up within 48 hours."
      }
    ],
  },
];
const ContactPage: React.FC = () => {
  const { t, i18n } = useTranslation("landing");
  const isArabic = i18n.language?.toLowerCase().startsWith("ar");
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
    return (isArabic ? it.q_ar : it.q_en).toLowerCase().includes(q) || (isArabic ? it.a_ar : it.a_en).toLowerCase().includes(q);
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
            title={t("contact.phone", "اتصل بنا")}
            primary="1913641"
            href="tel:1913641"
          />
          <QuickCard
            icon={Mail}
            color="from-[#f8941c] to-[#e07d10]"
            title={t("contact.email", "البريد الإلكتروني")}
            primary={CONTACT_EMAIL}
            href={`mailto:${CONTACT_EMAIL}`}
          />
          <QuickCard
            icon={MapPin}
            color="from-[#10b981] to-[#059669]"
            title={t("contact.map", "الموقع")}
            primary={t("common.map_location", "على خرائط جوجل")}
            href={CLUB_LOCATION_URL}
            external
          />
          <QuickCard
            icon={Clock}
            color="from-[#8b5cf6] to-[#6d28d9]"
            title={t("contact.hours.title", "مواعيد العمل")}
            primary={t("contact.hours.sat_thu_time", "6ص - 11م")}
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
                  {t("contact.form.title", "أرسل رسالة")}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e1c38] mb-2">
                  {t("contact.form.subtitle", "املأ النموذج وسنتواصل معك")}
                </h2>
                <p className="text-gray-600">{t("contact.form.reply_time", "عادةً ما نرد خلال 24 ساعة عمل")}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label={t("contact.form.name", "الاسم الكامل")} required>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t("contact.form.name_placeholder", "اكتب اسمك")}
                      className="form-input"
                      required
                    />
                  </FormField>
                  <FormField label={t("contact.form.phone", "رقم الهاتف")} required>
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

                <FormField label={t("contact.email", "البريد الإلكتروني")} required>
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

                <FormField label={t("contact.form.subject", "الموضوع")}>
                  <select name="subject" value={formData.subject} onChange={handleInputChange} className="form-input">
                    <option value="">{t("contact.form.subject_empty", "اختر الموضوع المناسب")}</option>
                    <option value="membership">{t("contact.form.subj_membership", "استفسار عن العضوية")}</option>
                    <option value="academies">{t("contact.form.subj_academies", "الاشتراك في أكاديمية رياضية")}</option>
                    <option value="kids">{t("contact.form.subj_kids", "إلحاق الأطفال")}</option>
                    <option value="reservation">{t("contact.form.subj_reservation", "حجز ملعب أو نشاط")}</option>
                    <option value="vendor">{t("contact.form.subj_vendor", "أن أكون مورد")}</option>
                    <option value="complaint">{t("contact.form.subj_complaint", "شكوى أو اقتراح")}</option>
                    <option value="other">{t("contact.form.subj_other", "آخر")}</option>
                  </select>
                </FormField>

                <FormField label={t("contact.form.message", "رسالتك")} required>
                  <textarea
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={t("contact.form.message_placeholder", "اكتب استفسارك أو رسالتك هنا...")}
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
                    <>{t("contact.form.sending", "جاري الإرسال...")}</>
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle className="w-5 h-5" /> {t("contact.form.success", "تم الإرسال بنجاح!")}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> {t("contact.form.submit", "إرسال الرسالة")}
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
                  <Clock className="w-5 h-5 text-[#f8941c]" /> {t("contact.hours.title", "ساعات العمل")}
                </h3>
                <div className="space-y-2 text-sm">
                  <Row left={t("contact.hours.sat_thu", "السبت - الخميس")} right={t("contact.hours.sat_thu_time", "6:00 ص — 11:00 م")} />
                  <Row left={t("contact.hours.fri", "الجمعة")} right={t("contact.hours.fri_time", "8:00 ص — 12:00 ص")} />
                </div>

                <h3 className="font-extrabold text-lg mt-6 mb-3 flex items-center gap-2">
                  <Facebook className="w-5 h-5 text-[#f8941c]" /> {t("contact.social.title", "تابعنا")}
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
                {t("contact.faq_section.quick_help", "المساعدة السريعة")}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0e1c38] tracking-tight mb-2">
                {t("contact.faq_section.title", "الأسئلة الشائعة")}
              </h2>
              <p className="text-gray-600 text-base max-w-2xl mx-auto">
                {t("contact.faq_section.subtitle", "إجابات شاملة لأكثر الأسئلة شيوعاً حول العضوية، الأكاديميات الرياضية، إلحاق الأطفال، حجز الملاعب، والمدفوعات")}
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
                  placeholder={t("contact.faq_section.search_placeholder", "ابحث في الأسئلة الشائعة...")}
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
                    <Icon className="w-4 h-4" /> {isArabic ? cat.label_ar : cat.label_en}
                  </button>
                );
              })}
            </div>

            {/* Question list */}
            <div className="max-w-4xl mx-auto space-y-3">
              {filteredFaqItems.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
                  {t("contact.faq_section.no_results", "لا توجد نتائج مطابقة لبحثك في هذه الفئة. جرّب فئة أخرى أو كلمات بحث مختلفة.")}
                </div>
              ) : (
                filteredFaqItems.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={item.q_en}
                      className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${
                        isOpen ? "ring-2 ring-[#2596be]/30" : "ring-1 ring-gray-200"
                      }`}
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-start p-5 md:p-6 flex justify-between items-center gap-4"
                      >
                        <span className={`font-extrabold text-base md:text-lg leading-snug ${isOpen ? "text-[#2596be]" : "text-[#0e1c38]"}`}>
                          {isArabic ? item.q_ar : item.q_en}
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
                            {isArabic ? item.a_ar : item.a_en}
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
              <h3 className="text-xl md:text-2xl font-extrabold mb-2">{t("contact.faq_section.not_found", "لم تجد إجابة سؤالك؟")}</h3>
              <p className="text-white/85 mb-4">{t("contact.faq_section.customer_service", "فريق خدمة العملاء جاهز لمساعدتك في أي استفسار")}</p>
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
                  <Mail className="w-4 h-4" /> {t("contact.faq_section.email_us", "راسلنا بالإيميل")}
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

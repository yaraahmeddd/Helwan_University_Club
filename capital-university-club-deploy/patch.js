const fs = require('fs');

let content = fs.readFileSync('Frontend/src/components/LandingPageComponents/ContactUs.tsx', 'utf8');

// 1. Interfaces
content = content.replace(
  'interface FaqItem {\n  q: string;\n  a: string;\n}',
  'interface FaqItem {\n  q_ar: string;\n  a_ar: string;\n  q_en: string;\n  a_en: string;\n}'
);
content = content.replace(
  'interface FaqCategory {\n  key: string;\n  label: string;\n  icon: React.ComponentType<{ className?: string }>;\n  items: FaqItem[];\n}',
  'interface FaqCategory {\n  key: string;\n  label_ar: string;\n  label_en: string;\n  icon: React.ComponentType<{ className?: string }>;\n  items: FaqItem[];\n}'
);

// 2. Add isArabic
content = content.replace(
  'const { t } = useTranslation("landing");',
  'const { t, i18n } = useTranslation("landing");\n  const isArabic = i18n.language?.toLowerCase().startsWith("ar");'
);

// 3. Update FAQ items rendering
content = content.replace(
  'return it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q);',
  'return (isArabic ? it.q_ar : it.q_en).toLowerCase().includes(q) || (isArabic ? it.a_ar : it.a_en).toLowerCase().includes(q);'
);

content = content.replace(
  '<Icon className="w-4 h-4" /> {cat.label}',
  '<Icon className="w-4 h-4" /> {isArabic ? cat.label_ar : cat.label_en}'
);

content = content.replace(
  'key={item.q}',
  'key={item.q_en}'
);

content = content.replace(
  '{item.q}',
  '{isArabic ? item.q_ar : item.q_en}'
);

content = content.replace(
  '{item.a}',
  '{isArabic ? item.a_ar : item.a_en}'
);

// 4. Update hardcoded text with t()
content = content.replace(
  'title="اتصل بنا"',
  'title={t("contact.phone", "اتصل بنا")}'
);
content = content.replace(
  'title="البريد الإلكتروني"',
  'title={t("contact.email", "البريد الإلكتروني")}'
);
content = content.replace(
  'title="الموقع"',
  'title={t("contact.map", "الموقع")}'
);
content = content.replace(
  'primary="على خرائط جوجل"',
  'primary={t("common.map_location", "على خرائط جوجل")}'
);
content = content.replace(
  'title="مواعيد العمل"',
  'title={t("contact.hours.title", "مواعيد العمل")}'
);
content = content.replace(
  'primary="6ص - 11م"',
  'primary={t("contact.hours.sat_thu_time", "6ص - 11م")}'
);

content = content.replace(
  'أرسل رسالة',
  '{t("contact.form.title", "أرسل رسالة")}'
);
content = content.replace(
  'املأ النموذج وسنتواصل معك',
  '{t("contact.form.subtitle", "املأ النموذج وسنتواصل معك")}'
);
content = content.replace(
  'عادةً ما نرد خلال 24 ساعة عمل',
  '{t("contact.form.reply_time", "عادةً ما نرد خلال 24 ساعة عمل")}'
);

content = content.replace('label="الاسم الكامل"', 'label={t("contact.form.name", "الاسم الكامل")}');
content = content.replace('placeholder="اكتب اسمك"', 'placeholder={t("contact.form.name_placeholder", "اكتب اسمك")}');

content = content.replace('label="رقم الهاتف"', 'label={t("contact.form.phone", "رقم الهاتف")}');
content = content.replace('label="البريد الإلكتروني"', 'label={t("contact.form.email", "البريد الإلكتروني")}');

content = content.replace('label="الموضوع"', 'label={t("contact.form.subject", "الموضوع")}');
content = content.replace('>اختر الموضوع المناسب<', '>{t("contact.form.subject_empty", "اختر الموضوع المناسب")}<');
content = content.replace('>استفسار عن العضوية<', '>{t("contact.form.subj_membership", "استفسار عن العضوية")}<');
content = content.replace('>الاشتراك في أكاديمية رياضية<', '>{t("contact.form.subj_academies", "الاشتراك في أكاديمية رياضية")}<');
content = content.replace('>إلحاق الأطفال<', '>{t("contact.form.subj_kids", "إلحاق الأطفال")}<');
content = content.replace('>حجز ملعب أو نشاط<', '>{t("contact.form.subj_reservation", "حجز ملعب أو نشاط")}<');
content = content.replace('>أن أكون مورد<', '>{t("contact.form.subj_vendor", "أن أكون مورد")}<');
content = content.replace('>شكوى أو اقتراح<', '>{t("contact.form.subj_complaint", "شكوى أو اقتراح")}<');
content = content.replace('>آخر<', '>{t("contact.form.subj_other", "آخر")}<');

content = content.replace('label="رسالتك"', 'label={t("contact.form.message", "رسالتك")}');
content = content.replace('placeholder="اكتب استفسارك أو رسالتك هنا..."', 'placeholder={t("contact.form.message_placeholder", "اكتب استفسارك أو رسالتك هنا...")}');

content = content.replace('>جاري الإرسال...<', '>{t("contact.form.sending", "جاري الإرسال...")}<');
content = content.replace('تم الإرسال بنجاح!', '{t("contact.form.success", "تم الإرسال بنجاح!")}');
content = content.replace('إرسال الرسالة', '{t("contact.form.submit", "إرسال الرسالة")}');

content = content.replace('ساعات العمل', '{t("contact.hours.title", "ساعات العمل")}');
content = content.replace('left="السبت - الخميس"', 'left={t("contact.hours.sat_thu", "السبت - الخميس")}');
content = content.replace('right="6:00 ص — 11:00 م"', 'right={t("contact.hours.sat_thu_time", "6:00 ص — 11:00 م")}');
content = content.replace('left="الجمعة"', 'left={t("contact.hours.fri", "الجمعة")}');
content = content.replace('right="8:00 ص — 12:00 ص"', 'right={t("contact.hours.fri_time", "8:00 ص — 12:00 ص")}');

content = content.replace('تابعنا', '{t("contact.social.title", "تابعنا")}');

content = content.replace('المساعدة السريعة', '{t("contact.faq_section.quick_help", "المساعدة السريعة")}');
content = content.replace('الأسئلة الشائعة', '{t("contact.faq_section.title", "الأسئلة الشائعة")}');
content = content.replace(
  'إجابات شاملة لأكثر الأسئلة شيوعاً حول العضوية، الأكاديميات الرياضية، إلحاق الأطفال، حجز الملاعب، والمدفوعات',
  '{t("contact.faq_section.subtitle", "إجابات شاملة لأكثر الأسئلة شيوعاً حول العضوية، الأكاديميات الرياضية، إلحاق الأطفال، حجز الملاعب، والمدفوعات")}'
);

content = content.replace('placeholder="ابحث في الأسئلة الشائعة..."', 'placeholder={t("contact.faq_section.search_placeholder", "ابحث في الأسئلة الشائعة...")}');

content = content.replace(
  'لا توجد نتائج مطابقة لبحثك في هذه الفئة. جرّب فئة أخرى أو كلمات بحث مختلفة.',
  '{t("contact.faq_section.no_results", "لا توجد نتائج مطابقة لبحثك في هذه الفئة. جرّب فئة أخرى أو كلمات بحث مختلفة.")}'
);

content = content.replace('لم تجد إجابة سؤالك؟', '{t("contact.cta.no_answer", "لم تجد إجابة سؤالك؟")}');
content = content.replace('فريق خدمة العملاء جاهز لمساعدتك في أي استفسار', '{t("contact.cta.support_ready", "فريق خدمة العملاء جاهز لمساعدتك في أي استفسار")}');
content = content.replace('راسلنا بالإيميل', '{t("contact.cta.email_us", "راسلنا بالإيميل")}');


// Now replace FAQ_CATEGORIES. It is huge, so we just replace the whole array declaration.
// We'll extract it using regex and replace it with a new one.

const newFaqCategories = `
const FAQ_CATEGORIES: FaqCategory[] = [
  {
    key: "memberships",
    label_ar: "العضويات والاشتراك",
    label_en: "Memberships & Subscriptions",
    icon: Users,
    items: [
      {
        q_ar: "كيف يمكنني التسجيل كعضو جديد في نادي جامعة العاصمة؟",
        a_ar: "يمكنك التسجيل أونلاين من خلال صفحة \\"سجّل الآن\\" على الموقع، أو بزيارة مكتب التسجيل في أحد فروع النادي. يلزمك تجهيز: شهادة ميلاد سارية، بطاقة رقم قومي، صورتين شخصيتين، كشف طبي حديث، ودفع رسوم استمارة العضوية (250 جنيه مرة واحدة) بالإضافة إلى رسوم العضوية حسب الفئة.",
        q_en: "How can I register as a new member at Capital University Club?",
        a_en: "You can register online through the \\"Register Now\\" page, or by visiting the registration office at one of our branches. Required documents: valid birth certificate, national ID, 2 personal photos, recent medical checkup, and paying the membership form fee (250 EGP once) plus the membership fee based on the category."
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
        a_ar: "ادخل صفحة \\"الألعاب الرياضية\\"، اختار الفرع واللعبة، اضغط \\"تعرف على تفاصيل الاشتراك\\". هتلاقي كل التفاصيل: الفئات العمرية، الرسوم، الجدول، المدرب المسؤول، والمستندات المطلوبة.",
        q_en: "How do I subscribe to a specific sports academy?",
        a_en: "Go to the \\"Sports\\" page, select the branch and sport, and click \\"Subscription Details\\". You will find all details: age groups, fees, schedule, responsible coach, and required documents."
      },
      {
        q_ar: "هل يلزمني أن أكون عضواً في النادي لأشترك في أكاديمية رياضية؟",
        a_ar: "نعم، الاشتراك في الأكاديميات يستلزم عضوية سارية في النادي. لو إنت لاعب متميز قد تستفيد من فئة \\"عضوية الرياضي المتميز\\" برسوم 1000 جنيه سنوياً.",
        q_en: "Do I need to be a club member to join a sports academy?",
        a_en: "Yes, academy subscriptions require an active club membership. If you are an exceptional athlete, you might benefit from the \\"Exceptional Athlete Membership\\" at 1000 EGP annually."
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
        a_ar: "الأبناء يندرجون تحت \\"عضوية التابع\\" (2000 جنيه سنوياً للطفل). كل تابع له بطاقة عضوية مستقلة وتمنحه دخول النادي والاشتراك في الأكاديميات.",
        q_en: "Do I need to register my child as a separate member or is my membership enough?",
        a_en: "Children fall under the \\"Dependent Membership\\" (2000 EGP annually per child). Each dependent has an independent membership card granting club access and academy subscription."
      },
      {
        q_ar: "هل توجد منطقة آمنة للأطفال داخل النادي؟",
        a_ar: "نعم، الفرع الرئيسي بجامعة العاصمة فيه منطقتان مخصصتان للأطفال (kids area) بإشراف متخصصين، مع أنشطة تعليمية وترفيهية. باقي الفروع فيها منطقة واحدة على الأقل.",
        q_en: "Is there a safe kids area inside the club?",
        a_en: "Yes, the main branch has two dedicated kids areas supervised by specialists, with educational and recreational activities. Other branches have at least one kids area."
      },
      {
        q_ar: "هل توجد حصص خاصة لرياض الأطفال (ما قبل المدرسة)؟",
        a_ar: "نعم، أكاديميات كرة القدم والسباحة والجمباز والكاراتيه تقدّم حصص \\"براعم\\" مخصصة لمرحلة (4-6 سنوات) بإيقاع تأسيسي مرح يركّز على التآزر الحركي.",
        q_en: "Are there special classes for kindergarteners (preschool)?",
        a_en: "Yes, Football, Swimming, Gymnastics, and Karate academies offer \\"Toddler\\" classes tailored for the 4-6 age group, focusing on motor coordination with a fun foundational rhythm."
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
        a_ar: "من صفحة العضو الخاصة بك على الموقع، روح لـ \\"حجز الملاعب\\"، اختار الفرع والرياضة والملعب والوقت. الحجز يثبت بعد الدفع مباشرة عبر الموقع.",
        q_en: "How do I book a court or sports facility?",
        a_en: "From your member page on the website, go to \\"Court Reservations\\", select the branch, sport, court, and time. The booking is confirmed immediately after online payment."
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
        a_ar: "عبر النموذج في هذه الصفحة، أو بالإيميل على " + CONTACT_EMAIL + "، أو من \\"خدمة العملاء\\" في صفحة العضو. كل الشكاوى تتم متابعتها خلال 48 ساعة.",
        q_en: "How do I submit a complaint or suggestion?",
        a_en: "Via the form on this page, or by emailing " + CONTACT_EMAIL + ", or through \\"Customer Service\\" on the member page. All complaints are followed up within 48 hours."
      }
    ],
  },
];
`;

const startIndex = content.indexOf('const FAQ_CATEGORIES: FaqCategory[] = [');
const endIndex = content.indexOf('const ContactPage: React.FC = () => {');
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newFaqCategories + content.substring(endIndex);
}

fs.writeFileSync('Frontend/src/components/LandingPageComponents/ContactUs.tsx', content, 'utf8');

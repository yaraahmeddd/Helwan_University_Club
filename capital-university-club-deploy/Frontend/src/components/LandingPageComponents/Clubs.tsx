import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface ClubData {
  id: string;
  code?: string;
  nameAr: string;
  nameEn?: string;
  locationAr?: string;
  locationEn?: string;
  courts: number;
  pools: number;
  restaurants: number;
  kidsArea: number;
}

// ─── Auto-rotating image carousel for each branch ────────────────────
const AutoBranchImages: React.FC<{ images: string[]; alt: string; intervalMs?: number }> = ({
  images,
  alt,
  intervalMs = 3500,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [images.join("|")]);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [images.length, intervalMs]);

  if (!images.length) return null;

  return (
    <div className="relative w-full max-w-sm aspect-square drop-shadow-2xl">
      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={alt}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-contain rounded-3xl transition-opacity duration-[1800ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Tiny dots */}
      {images.length > 1 && (
        <div className="absolute -bottom-4 inset-x-0 flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-[#FDBF00]" : "w-1.5 bg-[#0e1c38]/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const mapsUrlFor = (loc: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;

const asset = (p: string) => `/assets/${p}`;

const BRANCH_IMAGES_BY_CODE: Record<string, string[]> = {
  MAIN: [
    asset("branches/main-capital.png"),
    asset("branches/BrancheHU1.jpg"),
    asset("branches/BrancheHU5.jpg"),
    asset("branches/BrancheHU9.jpg"),
  ],
  HARAM: [
    asset("branches/haram-boys.png"),
    asset("branches/BrancheHU2.jpg"),
    asset("branches/BrancheHU6.jpg"),
    asset("branches/BrancheHU10.jpg"),
  ],
  ZAMALEK: [
    asset("branches/zamalek-girls.png"),
    asset("branches/BrancheHU3.jpg"),
    asset("branches/BrancheHU7.jpg"),
    asset("branches/BrancheHU11.jpg"),
  ],
  MATARIA: [
    asset("branches/mataria-engineering.png"),
    asset("branches/BrancheHU4.jpg"),
    asset("branches/BrancheHU8.jpg"),
  ],
};
const DEFAULT_BRANCH_IMAGES = [asset("club.png")];


interface ClubsProps {
  onNavigate?: (tab: string) => void;
}

const Clubs: React.FC<ClubsProps> = ({ onNavigate }) => {
  const { t, i18n } = useTranslation("landing");
  const isArabic = i18n.language?.toLowerCase().startsWith('ar');
  const asset = (name: string) => `/assets/${name}`;
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [clubsData, setClubsData] = useState<ClubData[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('social');

  const currentClub =
    clubsData.find(club => club.id === selectedClub) ||
    clubsData[0] ||
    ({ id: "", nameAr: "", nameEn: "", locationAr: "", locationEn: "", courts: 0, pools: 0, restaurants: 0, kidsArea: 0 } as ClubData);
  const currentClubName = currentClub
    ? (isArabic ? (currentClub.nameAr || currentClub.nameEn || "") : (currentClub.nameEn || currentClub.nameAr || ""))
    : "";
  const currentClubLocation = currentClub
    ? (isArabic ? (currentClub.locationAr || currentClub.locationEn || "") : (currentClub.locationEn || currentClub.locationAr || ""))
    : "";

  const servicesData = {
    social: {
      nameAr: 'منطقة اجتماعية',
      descriptionAr: 'استمتع بأوقات رائعة مع الأصدقاء والعائلة في منطقتنا الاجتماعية الفاخرة المجهزة بكل وسائل الراحة.',
      image: asset('social-area.png')
    },
    kids: {
      nameAr: 'منطقة الأطفال',
      descriptionAr: 'منطقة آمنة وممتعة للأطفال مع أنشطة تعليمية وترفيهية متنوعة تحت إشراف متخصصين.',
      image: asset('kids-area.png')
    },
    wadi: {
      nameAr: 'وادي الفنون',
      descriptionAr: 'استكشف عالم الفنون والإبداع في وادي الفنون حيث يمكنك تطوير مهاراتك الفنية والثقافية.',
      image: asset('wadi-fenoon.png')
    },
    restaurants: {
      nameAr: 'المطاعم',
      descriptionAr: 'تمتع بتجربة طهي فريدة في مطاعمنا الراقية التي تقدم أشهى الأطباق المحلية والعالمية.',
      image: asset('restaurants.png')
    },
    library: {
      nameAr: 'المكتبة',
      descriptionAr: 'مكتبة حديثة تضم آلاف الكتب والمراجع في مختلف المجالات للقراءة والاستزادة من المعرفة.',
      image: asset('library.png')
    }
  };

  const currentService = servicesData[selectedService as keyof typeof servicesData] || servicesData.social;

  const contactCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const faqItemsRef = useRef<(HTMLDetailsElement | null)[]>([]);
  const branchSwiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    // // Add Cairo font to document head
    // const link = document.createElement('link');
    // link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap';
    // link.rel = 'stylesheet';
    // document.head.appendChild(link);

    // // Set document direction
    // document.documentElement.dir = 'rtl';
    // document.documentElement.lang = 'ar';

    // Intersection Observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    // Observe contact cards and FAQ items
    contactCardsRef.current.forEach((card) => card && observer.observe(card));
    faqItemsRef.current.forEach((item) => item && observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchBranches = async () => {
      try {
        const response = await api.get('/register/branches');
        const raw = Array.isArray(response?.data?.branches) ? response.data.branches : [];
        const mapped: ClubData[] = raw.map((branch: any, idx: number) => ({
          id: String(branch.id),
          code: branch.code ? String(branch.code).toUpperCase() : undefined,
          nameAr: String(branch.name_ar || branch.name_en || `#${branch.id}`),
          nameEn: String(branch.name_en || branch.name_ar || `#${branch.id}`),
          locationAr: String(branch.location_ar || branch.location_en || ""),
          locationEn: String(branch.location_en || branch.location_ar || ""),
          courts: idx === 0 ? 26 : 20,
          pools: idx === 0 ? 3 : 2,
          restaurants: idx === 0 ? 2 : 1,
          kidsArea: idx === 0 ? 2 : 1,
        }));

        if (isMounted) {
          setClubsData(mapped);
          setSelectedClub(mapped[0]?.id || "");
        }
      } catch {
        if (isMounted) {
          setClubsData([]);
          setSelectedClub("");
        }
      }
    };

    fetchBranches();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!clubsData.length || !selectedClub || !branchSwiperRef.current) {
      return;
    }

    const selectedIndex = clubsData.findIndex((club) => club.id === selectedClub);
    if (selectedIndex >= 0 && selectedIndex !== branchSwiperRef.current.activeIndex) {
      branchSwiperRef.current.slideTo(selectedIndex);
    }
  }, [selectedClub, clubsData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after success
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setIsSubmitted(false);
    }, 2000);
  };


  const faqItems = [
    {
      question: "كيف يمكنني التسجيل كعضو جديد؟",
      answer: "يمكنك التسجيل من خلال زيارة فرعنا في المعادي أو التواصل معنا عبر الهاتف. سيقوم فريقنا بمساعدتك في اختيار باقة العضوية المناسبة.",
    },
    {
      question: "ما هي وسائل الدفع المتاحة؟",
      answer: "نقبل الدفع النقدي، بطاقات الائتمان، والتحويل البنكي. كما نوفر خيارات الدفع بالتقسيط لبعض الباقات.",
    },
    {
      question: "هل يمكنني إلغاء العضوية؟",
      answer: "نعم، يمكنك إلغاء العضوية وفقًا لسياسة الإلغاء الخاصة بنا. يرجى الاتصال بخدمة العملاء لمزيد من التفاصيل.",
    },
    {
      question: "هل توفرون مواقف للسيارات؟",
      answer: "نعم، يتوفر موقف واسع للسيارات مجانًا لجميع الأعضاء والزوار.",
    },
  ];

  const socialLinks = [
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: "https://www.facebook.com/share/1ADZY7CcCU/?mibextid=wwXIfr",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      href: "https://www.instagram.com/helwan.university.club/",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      href: "https://x.com/Helwan_HUC",
    },
  ];

  return (
    <div className="font-cairo bg-gray-50" >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-l from-[#2596be] via-[#2ba0c9] to-[#4ab3d6] hero-pattern">
        <div className="gradient-overlay">
          <div className="container mx-auto px-4 py-6 md:py-10">
            <div className="max-w-4xl mx-auto text-center text-white animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {t("clubs.title", "الفروع")}
              </h1>
            </div>
          </div>
        </div>
        {/* Decorative Wave — slim */}
        <div className="absolute bottom-0 left-0 right-0 leading-[0]">
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-6 md:h-8">
            <path d="M0 40L60 35C120 30 240 20 360 15C480 10 600 10 720 12.5C840 15 960 20 1080 22.5C1200 25 1320 25 1380 25L1440 25V40H0Z" fill="#F9FAFB" />
          </svg>
        </div>
      </section>
      {/* Club Cards */}
      <section className="py-10 md:py-14 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Left: Dropdown */}
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-[#0e1c38] font-bold mb-3 text-lg">{t("clubs.select_branch", "اختر الفرع")}</label>
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-[#FDBF00] text-[#0e1c38] px-0 py-3 rounded-none font-bold text-lg appearance-none cursor-pointer focus:outline-none bg-no-repeat bg-right"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FDBF00' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      paddingRight: '20px'
                    }}
                  >
                    {clubsData.map((club) => (
                      <option key={club.id} value={club.id} style={{ backgroundColor: '#0e1c38', color: 'white' }}>
                        {isArabic ? (club.nameAr || club.nameEn) : (club.nameEn || club.nameAr)}
                      </option>
                    ))}
                  </select>
                </div>

                {clubsData.length > 1 && (
                  <div className="pt-1">
                    <Swiper
                      modules={[Pagination]}
                      onSwiper={(swiper) => {
                        branchSwiperRef.current = swiper;
                      }}
                      onSlideChange={(swiper) => {
                        const club = clubsData[swiper.activeIndex];
                        if (club && club.id !== selectedClub) {
                          setSelectedClub(club.id);
                        }
                      }}
                      spaceBetween={10}
                      slidesPerView={1.25}
                      breakpoints={{
                        640: { slidesPerView: 1.8 },
                        1024: { slidesPerView: 1.5 },
                      }}
                      pagination={{ clickable: true }}
                      dir={isArabic ? 'rtl' : 'ltr'}
                      className="pb-7"
                    >
                      {clubsData.map((club) => {
                        const label = isArabic ? (club.nameAr || club.nameEn) : (club.nameEn || club.nameAr);
                        const isSelected = club.id === selectedClub;
                        return (
                          <SwiperSlide key={club.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedClub(club.id)}
                              className={`w-full rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                                isSelected
                                  ? 'border-[#FDBF00] bg-[#FDBF00]/20 text-[#0e1c38]'
                                  : 'border-[#c9d3e5] bg-white text-[#0e1c38] hover:border-[#FDBF00]'
                              }`}
                            >
                              {label}
                            </button>
                          </SwiperSlide>
                        );
                      })}
                    </Swiper>
                  </div>
                )}

                {/* Address — clickable, opens Google Maps with branch name */}
                <div className="space-y-3 pt-4">
                  <a
                    href={mapsUrlFor(`${currentClubName} ${currentClubLocation}`.trim() || currentClubName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("common.map_location", "افتح الموقع على الخريطة")}
                    className="w-full flex items-center justify-start gap-3 text-[#0e1c38] hover:text-[#FDBF00] py-3 px-4 rounded-lg transition-all duration-300 group cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="40.791" height="55.504" viewBox="0 0 40.791 55.504" className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                      <g id="placeholder-filled-point" opacity="1">
                        <path id="Path_8" data-name="Path 8" d="M29.352,0A20.439,20.439,0,0,0,8.9,20.452,20.761,20.761,0,0,0,10.661,28.8c5.113,11.135,14.941,22.952,17.782,26.3a1.112,1.112,0,0,0,1.7,0c2.9-3.352,12.669-15.169,17.782-26.36A19.849,19.849,0,0,0,49.69,20.4,20.33,20.33,0,0,0,29.352,0Zm0,31.076A10.624,10.624,0,1,1,39.919,20.452,10.644,10.644,0,0,1,29.352,31.076Z" transform="translate(-8.9 0)" fill="currentColor" />
                      </g>
                    </svg>
                    <span className="font-bold underline-offset-4 group-hover:underline">{currentClubLocation || t("common.address", "Address")}</span>
                  </a>
                </div>
              </div>

              {/* Middle: Branch image carousel — auto-rotates slowly */}
              <div className="flex justify-center lg:justify-center">
                <AutoBranchImages
                  images={BRANCH_IMAGES_BY_CODE[currentClub.code ?? ""] ?? DEFAULT_BRANCH_IMAGES}
                  alt={currentClubName || t("clubs.title", "Branches")}
                />
              </div>

              {/* Right: Content */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-4xl font-bold text-[#0e1c38] mb-2">{currentClubName}</h3>
                  <div className="w-16 h-1 bg-[#FDBF00]"></div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-12 bg-[#FDBF00]"></div>
                    <div>
                      <div className="text-4xl font-bold text-[#FDBF00]">{currentClub.courts}</div>
                      <div className="text-[#0e1c38] text-sm">{t("clubs.courts", "ملاعب")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-12 bg-[#FDBF00]"></div>
                    <div>
                      <div className="text-4xl font-bold text-[#FDBF00]">{currentClub.pools}</div>
                      <div className="text-[#0e1c38] text-sm">{t("clubs.pools", "حمامات سباحة")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-12 bg-[#FDBF00]"></div>
                    <div>
                      <div className="text-4xl font-bold text-[#FDBF00]">{currentClub.restaurants}</div>
                      <div className="text-[#0e1c38] text-sm">{t("clubs.restaurants", "مطاعم")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-12 bg-[#FDBF00]"></div>
                    <div>
                      <div className="text-4xl font-bold text-[#FDBF00]">{currentClub.kidsArea}</div>
                      <div className="text-[#0e1c38] text-sm">{t("clubs.kids_area", "منطقة أطفال")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sport Academies */}
      <section className="py-20  bg-[#0e1c38]">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-16">
              <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-12">{t("clubs.academies_title", "الأكاديميات الرياضية")}</h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {/* Left: Dropdown and Content */}
                <div className="lg:col-span-1 space-y-8">
                  {/* Sport Dropdown */}
                  <div>
                    <select className="w-full bg-[#0e1c38] border-b-2 border-[#FDBF00] text-white px-4 py-3 rounded-none font-bold text-lg appearance-none cursor-pointer focus:outline-none bg-no-repeat bg-right"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FDBF00' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        paddingRight: '20px'
                      }}
                    >
                      <option value="football" style={{ backgroundColor: '#0e1c38', color: 'white' }}>{t("sports.names.football", "كرة القدم")}</option>
                      <option value="tennis" style={{ backgroundColor: '#0e1c38', color: 'white' }}>{t("sports.names.tennis", "التنس")}</option>
                      <option value="swimming" style={{ backgroundColor: '#0e1c38', color: 'white' }}>{t("sports.names.swimming", "السباحة")}</option>
                      <option value="basketball" style={{ backgroundColor: '#0e1c38', color: 'white' }}>{t("sports.names.basketball", "كرة السلة")}</option>
                    </select>
                  </div>

                  {/* Statistics */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <div>
                        <div className="text-4xl font-bold text-[#FDBF00]">554</div>
                        <div className="text-white font-semibold">{t("clubs.players", "لاعبين")}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <div>
                        <div className="text-4xl font-bold text-[#FDBF00]">16</div>
                        <div className="text-white font-semibold">{t("clubs.coaches", "مدربين")}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h12v2H6zm0 5h12v2H6zm0 5h12v2H6z" />
                      </svg>
                      <div>
                        <div className="text-4xl font-bold text-[#FDBF00]">3</div>
                        <div className="text-white font-semibold">{t("clubs.courts", "ملاعب")}</div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white leading-relaxed text-base">
                    {t("clubs.academy_desc", "الأكاديمية هي واحدة من أكبر أكاديميات كرة القدم في المنطقة. يبدأ التسجيل من 4 سنوات لكلا الجنسين. يتم تقييم اللاعبين على أساس ربع سنوي.")}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => window.location.href = '/re'} className="flex-1 border-2 border-[#FDBF00] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#FDBF00] hover:text-white transition-all duration-300">
                      {t("clubs.become_member", "كن عضوا")}
                    </button>
                    <button onClick={() => onNavigate?.('Sports')} className="flex-1 border-2 border-gray-900 text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-900 hover:text-white transition-all duration-300">
                      {t("clubs.more_details", "المزيد من التفاصيل")}
                    </button>
                  </div>
                </div>

                {/* Right: Football Player Image */}
                <div className="lg:col-span-2 relative flex items-center justify-center">
                  <img
                    src={asset('HUC football.jpg')}
                    alt="لاعب كرة القدم"
                    className="w-full max-w-lg rounded-3xl shadow-2xl object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gym Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-5xl md:text-6xl font-extrabold text-[#0e1c38] mb-6">{t("clubs.gym.title", "صالة الألعاب الرياضية")}</h2>
                  <div className="w-20 h-1 bg-[#FDBF00] rounded-full"></div>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed">
                  {t("clubs.gym.desc", "صالة الألعاب الرياضية لدينا مزودة بأحدث المعدات والمدربين الشخصيين المحترفين، جاهزة لمساعدتك على تحقيق أحلامك الصحية والبدنية والعيش بنمط حياة صحي.")}
                </p>

                <button className="bg-[#FDBF00] hover:bg-[#e6ac00] text-[#0e1c38] px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl inline-block">
                  {t("clubs.subscribe_now", "اشترك الآن")}
                </button>
              </div>

              {/* Right: Image */}
              <div className="relative">
                <div className="relative h-96 lg:h-full min-h-96 overflow-hidden rounded-2xl shadow-2xl">
                  {/* Yellow accent bar on left */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FDBF00] z-10"></div>

                  {/* Gym Image */}
                  <img
                    src={asset('gym.png')}
                    alt="صالة الألعاب الرياضية"
                    className="w-full h-full object-cover"
                  />

                  {/* Yellow accent shape */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FDBF00]/10 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Another Services */}
      <section className="py-20 bg-[#0e1c38]">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">{t("clubs.other_services", "خدمات أخرى")}</h1>
              <div className="w-20 h-1 bg-[#FDBF00] rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Image */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl h-96 lg:h-full min-h-96">
                  {/* Yellow border frame */}
                  <div className="absolute inset-0 border-8 border-[#FDBF00] transform -rotate-3 pointer-events-none z-10"></div>

                  {/* Service Image */}
                  <img
                    src={currentService.image}
                    alt={t(`clubs.services.${selectedService}.name`, currentService.nameAr)}
                    className="w-full h-full object-cover relative z-0 transition-all duration-500"
                  />
                </div>
              </div>

              {/* Right: Content */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6">{t(`clubs.services.${selectedService}.name`, currentService.nameAr)}</h2>
                  <div className="w-20 h-1 bg-[#FDBF00] rounded-full"></div>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed">
                  {t(`clubs.services.${selectedService}.desc`, currentService.descriptionAr)}
                </p>

                {/* Service Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedService('social')}
                    className={`p-4 border-2 transition-all duration-300 font-bold text-lg rounded-lg ${selectedService === 'social'
                      ? 'border-[#FDBF00] bg-[#FDBF00] text-[#0e1c38]'
                      : 'border-white/30 text-white hover:border-[#FDBF00]'
                      }`}
                  >
                    {t("clubs.services.social.name", "منطقة اجتماعية")}
                  </button>

                  <button
                    onClick={() => setSelectedService('kids')}
                    className={`p-4 border-2 transition-all duration-300 font-bold text-lg rounded-lg ${selectedService === 'kids'
                      ? 'border-[#FDBF00] bg-[#FDBF00] text-[#0e1c38]'
                      : 'border-white/30 text-white hover:border-[#FDBF00]'
                      }`}
                  >
                    {t("clubs.services.kids.name", "منطقة الأطفال")}
                  </button>

                  <button
                    onClick={() => setSelectedService('wadi')}
                    className={`p-4 border-2 transition-all duration-300 font-bold text-lg rounded-lg ${selectedService === 'wadi'
                      ? 'border-[#FDBF00] bg-[#FDBF00] text-[#0e1c38]'
                      : 'border-white/30 text-white hover:border-[#FDBF00]'
                      }`}
                  >
                    {t("clubs.services.wadi.name", "وادي الفنون")}
                  </button>

                  <button
                    onClick={() => setSelectedService('restaurants')}
                    className={`p-4 border-2 transition-all duration-300 font-bold text-lg rounded-lg ${selectedService === 'restaurants'
                      ? 'border-[#FDBF00] bg-[#FDBF00] text-[#0e1c38]'
                      : 'border-white/30 text-white hover:border-[#FDBF00]'
                      }`}
                  >
                    {t("clubs.services.restaurants.name", "المطاعم")}
                  </button>

                  <button
                    onClick={() => setSelectedService('library')}
                    className={`p-4 border-2 transition-all duration-300 font-bold text-lg rounded-lg sm:col-span-2 ${selectedService === 'library'
                      ? 'border-[#FDBF00] bg-[#FDBF00] text-[#0e1c38]'
                      : 'border-white/30 text-white hover:border-[#FDBF00]'
                      }`}
                  >
                    {t("clubs.services.library.name", "المكتبة")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#0e1c38] py-4">
        <div className="max-w-5xl mx-auto px-6">
          <div className="h-px w-full bg-white/20"></div>
        </div>
      </div>

      <style>{`
        .gradient-overlay {
          background: linear-gradient(135deg, rgba(10, 26, 68, 0.95) 0%, rgba(14, 28, 56, 0.9) 100%);
        }
        
        .hero-pattern {
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(253, 191, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(253, 191, 0, 0.1) 0%, transparent 50%);
        }
        
        .map-container {
          position: relative;
          width: 100%;
          height: 450px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Clubs;

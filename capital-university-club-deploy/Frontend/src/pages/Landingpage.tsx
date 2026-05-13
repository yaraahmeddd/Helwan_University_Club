import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  MapPin, Calendar,
  ArrowRight, Phone, Mail, Facebook, Instagram, Twitter, Menu, X, User, LogOut, LayoutDashboard, ChevronDown
} from "lucide-react";
import ReservationPage from "./ReservationPage.js";
import ContactUs from "../components/LandingPageComponents/ContactUs";
import LastNews from "../components/LandingPageComponents/LastNews";
import MediaGallery from "../components/LandingPageComponents/MediaGallery";
import Clubs from "../components/LandingPageComponents/Clubs";
import SportDetailedPG from "./SportDetailedPG";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
const HUCLogo = "/assets/HUC_logo.jpeg";
const CapuniLogo = "/assets/capuni.png";
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/navigation';
// @ts-ignore
import 'swiper/css/pagination';
// @ts-ignore
import 'swiper/css/effect-coverflow';

import { motion } from "framer-motion";
import api from "../services/axios";

interface MembershipPlan {
  id: number;
  name_ar: string;
  name_en?: string;
  price: number;
  currency: string;
  duration_months: number;
}

interface BackendMediaPost {
  id: number;
  title: string;
  images?: string[];
  date?: string;
}

interface HomeNewsItem {
  id: number;
  title: string;
  image: string;
}

interface BranchItem {
  id: number;
  code?: string;
  name_en?: string;
  name_ar?: string;
  location_en?: string | null;
  location_ar?: string | null;
  phone?: string | null;
}

const EgFlagIcon = ({ className = "w-5 h-3.5 rounded-sm shadow-sm" }: { className?: string }) => (
  <svg viewBox="0 0 60 40" className={className} aria-hidden="true">
    <rect width="60" height="40" fill="#CE1126" />
    <rect y="13.333" width="60" height="13.333" fill="#FFFFFF" />
    <rect y="26.666" width="60" height="13.334" fill="#000000" />
    <circle cx="30" cy="20" r="2.4" fill="#C8A951" />
  </svg>
);

const GbFlagIcon = ({ className = "w-5 h-3.5 rounded-sm shadow-sm" }: { className?: string }) => (
  <svg viewBox="0 0 60 40" className={className} aria-hidden="true">
    <rect width="60" height="40" fill="#012169" />
    <polygon points="0,0 7,0 60,34 60,40 53,40 0,6" fill="#FFFFFF" />
    <polygon points="60,0 53,0 0,34 0,40 7,40 60,6" fill="#FFFFFF" />
    <polygon points="0,0 3.5,0 60,36.5 60,40 56.5,40 0,3.5" fill="#C8102E" />
    <polygon points="60,0 56.5,0 0,36.5 0,40 3.5,40 60,3.5" fill="#C8102E" />
    <rect x="24" width="12" height="40" fill="#FFFFFF" />
    <rect y="14" width="60" height="12" fill="#FFFFFF" />
    <rect x="26" width="8" height="40" fill="#C8102E" />
    <rect y="16" width="60" height="8" fill="#C8102E" />
  </svg>
);

const BACKEND_URL = "http://localhost:3000";
const asset = (p: string) => `/assets/${p}`;
const DEFAULT_NEWS_IMAGE = asset("HUC Picture Full.jpg");

// ─── Branch image carousel — auto-rotates slowly while hovered ───────────────
const BranchImageCarousel: React.FC<{ images: string[]; alt: string }> = ({ images, alt }) => {
  const [index, setIndex] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);

  React.useEffect(() => {
    if (!hovered || images.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [hovered, images.length]);

  if (!images.length) return null;

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={alt}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Tiny dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
          {images.map((_, i) => (
            <span
              key={i}
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Google Maps search URL for a given location string
const mapsUrlFor = (loc: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;

const normalizeImageUrl = (url?: string): string => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${BACKEND_URL}/${url}`;
};

const toBranchRouteId = (branch: BranchItem): string => {
  const signal = `${branch.code || ""} ${branch.name_en || ""} ${branch.name_ar || ""}`.toLowerCase();
  if (signal.includes("helwan") || signal.includes("حلوان")) return "helwan";
  if (signal.includes("maadi") || signal.includes("المعادي")) return "maadi";
  if (signal.includes("tagamoa") || signal.includes("tajamoa") || signal.includes("التجمع")) return "tagamoa";
  if (signal.includes("zayed") || signal.includes("زايد")) return "zayed";
  return String(branch.id);
};


const STAFF_ROLES = new Set([
  "ADMIN", "SPORTS_DIRECTOR", "SPORTS_OFFICER", "FINANCIAL_DIRECTOR",
  "REGISTRATION_STAFF", "TEAM_MANAGER", "SUPPORT", "AUDITOR", "STAFF",
]);

function getDashboardPath(role: string, status?: string): string {
  if (STAFF_ROLES.has(role)) return "/staff/dashboard";
  if (role === "TEAM_MEMBER") return "/team-member/dashboard";
  if (role === "MEMBER") {
    const s = (status ?? "").trim().toLowerCase();
    return s === "active" ? "/member/dashboard" : "/member/pending";
  }
  return "/";
}

function getRoleLabel(role: string, t: any): string {
  const map: Record<string, string> = {
    ADMIN: t("roles.admin", "لوحة الإدارة"),
    SPORTS_DIRECTOR: t("roles.sports_director", "مدير الرياضة"),
    SPORTS_OFFICER: t("roles.sports_officer", "موظف رياضي"),
    FINANCIAL_DIRECTOR: t("roles.financial_director", "المدير المالي"),
    REGISTRATION_STAFF: t("roles.registration_staff", "موظف التسجيل"),
    TEAM_MANAGER: t("roles.team_manager", "مدير الفريق"),
    SUPPORT: t("roles.support", "الدعم الفني"),
    AUDITOR: t("roles.auditor", "المدقق المالي"),
    STAFF: t("roles.staff", "لوحة الموظفين"),
    MEMBER: t("roles.member", "لوحة العضو"),
    TEAM_MEMBER: t("roles.team_member", "لوحة عضو الفريق"),
  };
  return map[role] ?? t("roles.default", "لوحة التحكم");
}

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "home";
  });
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Sync tab when URL query changes (e.g., user clicked a deep-link from another page)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlTab = params.get("tab");
    if (urlTab && urlTab !== activeTab) setActiveTab(urlTab);
  }, [location.search]);  // eslint-disable-line react-hooks/exhaustive-deps
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation("landing");
  const isArabic = i18n.language?.toLowerCase().startsWith("ar");

  // 1️⃣ State لتخزين خطط العضوية من الباك اند
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [latestNewsItems, setLatestNewsItems] = useState<HomeNewsItem[]>([]);
  const [loadingLatestNews, setLoadingLatestNews] = useState(true);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  // 2️⃣ جلب البيانات من الباك اند
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/memberships');
        if (response.ok) {
          const data: unknown = await response.json();
          const plans = Array.isArray(data) ? (data as MembershipPlan[]) : [];

          // Official display order: Faculty → Employee salary brackets (high→low) → Student → Dependent → Visitor → Seasonal → Foreigners
          const displayOrder = [
            'WRK-FAC',     // عضو هيئة التدريس
            'WRK-S4',      // موظف 10,000+
            'WRK-S3',      // موظف 8-10K
            'WRK-S2',      // موظف 5-8K
            'WRK-S1',      // موظف < 5K
            'STU-Y',       // طالب / رياضي
            'DEP-Y',       // تابع
            'VIS-Y',       // زائر
            'SEAS-6',      // موسمي مصري
            'FOR-Y-USD',   // أجانب — سنة
            'FOR-H-USD',   // أجانب — 6 أشهر
            'FOR-M-USD',   // أجانب — شهر
          ];
          const orderIndex = (p: MembershipPlan): number => {
            const idx = displayOrder.indexOf(((p as unknown as { plan_code?: string }).plan_code) || '');
            return idx === -1 ? 999 : idx;
          };
          const sortedData = [...plans].sort((a, b) => orderIndex(a) - orderIndex(b));
          setMembershipPlans(sortedData);
        }
      } catch (error) {
        console.error("Failed to load membership plans:", error);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');

    const validTabs = new Set([
      'home',
      'clubs',
      'Sports',
      'memberships',
      'lastNews',
      'mediaGallery',
      'contact us',
      'reservations',
    ]);

    if (tab && validTabs.has(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;

    const fetchLatestNews = async () => {
      try {
        setLoadingLatestNews(true);
        const response = await api.get('/media-posts');
        const backendPosts: BackendMediaPost[] =
          response.data?.success && Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        const sortedPosts = [...backendPosts].sort((a, b) => {
          const aTime = a.date ? new Date(a.date).getTime() : 0;
          const bTime = b.date ? new Date(b.date).getTime() : 0;
          return bTime - aTime || b.id - a.id;
        });

        const mappedPosts: HomeNewsItem[] = sortedPosts.map((post) => ({
          id: Number(post.id),
          title: post.title || t("news.no_title", 'بدون عنوان'),
          image: normalizeImageUrl(post.images?.[0]) || DEFAULT_NEWS_IMAGE,
        }));

        if (isMounted) {
          setLatestNewsItems(mappedPosts.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to load latest news for home page:', error);
        if (isMounted) {
          setLatestNewsItems([]);
        }
      } finally {
        if (isMounted) {
          setLoadingLatestNews(false);
        }
      }
    };

    fetchLatestNews();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const response = await api.get("/register/branches");
        const list: BranchItem[] = Array.isArray(response?.data?.branches) ? response.data.branches : [];
        if (isMounted) {
          setBranches(list);
        }
      } catch (error) {
        console.error("Failed to load branches:", error);
        if (isMounted) {
          setBranches([]);
        }
      } finally {
        if (isMounted) {
          setLoadingBranches(false);
        }
      }
    };

    fetchBranches();

    return () => {
      isMounted = false;
    };
  }, []);

  // const testimonials = [
  //   {
  //     name: t("testimonials.person1_name", "عمر عبد الرحمن"),
  //     rating: 5,
  //     text: t("testimonials.person1_text", "من اول تدريب وانا حاسس بتغيير كبير والحمدلله دلوقتي بقيت أعرف وضع الجسم والطريقة الصحيحة للتدريب.")
  //   },
  //   {
  //     name: t("testimonials.person2_name", "يوسف السيد"),
  //     rating: 5,
  //     text: t("testimonials.person2_text", "النادي هنا مش بس معدات، المدربين عندهم خبرة، والتركيز على النتيجة خلاني اتطور بسرعة.")
  //   },
  //   {
  //     name: t("testimonials.person3_name", "منى خالد"),
  //     rating: 5,
  //     text: t("testimonials.person3_text", "خدمات ممتازة، المكان نضيف، وحبيت الاهتمام بالتغذية وبرنامج التمرين.")
  //   }
  // ];

  const newsItems = [
    { id: 1, title: t("newsItems.dummy1", "نادي جامعة العاصمة يتقالك مع محمد صلاح وساندو علي"), image: "/api/placeholder/300/200" },
    { id: 2, title: t("newsItems.dummy2", "بطولة داخلية الاسبوع ده في فرع المعادي"), image: "/api/placeholder/300/200" },
    { id: 3, title: t("newsItems.dummy3", "حملة تخفيضات على الاشتراكات السنوية"), image: "/api/placeholder/300/200" },
    { id: 4, title: t("newsItems.dummy4", "تدريب مجاني لليوم العالمي للرياضة"), image: "/api/placeholder/300/200" }
  ];

  const visibleNewsItems = latestNewsItems.length > 0 ? latestNewsItems : newsItems.slice(0, 3);

  // const renderStars = (rating: number) =>
  //   Array(5)
  //     .fill(0)
  //     .map((_, i) => (
  //       <Star
  //         key={i}
  //         className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
  //       />
  //     ));

  const SectionTitle = ({ title, subtitle, centered = true, isDark = false }: { title: string; subtitle: string; centered?: boolean; isDark?: boolean }) => (
    <div className={`mb-16 ${centered ? "text-center" : "text-start"}`}>
      <span className="text-[#f8941c] font-bold tracking-wider uppercase text-sm">{t("common.club_name", "نادي جامعه العاصمة")}</span>
      <h2 className={`text-4xl md:text-5xl font-extrabold mt-2 mb-4 ${isDark ? "text-white" : "text-[#0e1c38]"}`}>{title}</h2>
      <div className={`h-1.5 w-24 bg-[#2596be] rounded-full mb-6 ${centered ? "mx-auto" : "me-auto"}`}></div>
      <p className={`text-lg font-normal max-w-2xl mx-auto leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>{subtitle}</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            {/* Hero Section — cinematic video background */}
            <section className="relative h-[72vh] sm:h-[85vh] min-h-[520px] sm:min-h-[600px] flex items-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <video
                  src={asset("videos/champions.mp4")}
                  poster={asset("gallery/champions-start-here.jpg")}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
                {/* Cinematic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0e1c38]/95 via-[#0e1c38]/65 to-[#0e1c38]/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-16 sm:pt-20">
                <div className="max-w-3xl text-white text-start">
                  <h1 className="text-3xl sm:text-4xl md:text-7xl font-black mb-4 sm:mb-6 leading-tight mt-0">
                    {t("hero.title", "نادي جامعة العاصمة")}<br />
                    <span className="text-[#f8941c] text-3xl sm:text-4xl md:text-5xl font-extrabold" style={{ letterSpacing: '0.03em' }}>{t("hero.subtitle", "روح المنافسة.. طاقة المستقبل ")}</span>
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 text-gray-200 font-normal leading-relaxed max-w-xl">
                    {t("hero.description", "انضم لأكبر مجتمع رياضي جامعي بمرافق حديثة، مدربين محترفين، وبرامج تناسب كل المستويات، وتجهيزات عالمية لخدمة أكثر من 5000 عضو.")}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => window.location.href = '/re'} className="bg-[#f8941c] hover:bg-[#e07d10] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 hover:-translate-y-1 font-bold text-base sm:text-lg flex items-center gap-2">
                      {t("auth.register", "سجل الآن")} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </button>
                    {/* <button onClick={() => setActiveTab("sports")} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full transition-all duration-300 border border-white/30 font-bold text-lg hover:border-white/60">
                      استعرض الرياضات
                    </button> */}
                  </div>
                </div>
              </div>
            </section>

            {/* Branches Section */}
            <section className="py-24 bg-gray-50 overflow-hidden">
              <div className="container mx-auto px-6">
                <SectionTitle
                  title={t("branches.title", "فروعنا المتميزة")}
                  subtitle={t("branches.subtitle", "اختر الفرع الأقرب إليك واستمتع بتجربة رياضية متكاملة بأحدث التجهيزات.")}
                />

                <Swiper
                  key={i18n.dir()}
                  effect={'coverflow'}
                  grabCursor={true}
                  centeredSlides={true}
                  slidesPerView={'auto'}
                  initialSlide={0}
                  coverflowEffect={{
                    rotate: 0,
                    stretch: 0,
                    depth: 100,
                    modifier: 2.5,
                    slideShadows: false,
                  }}
                  pagination={{ clickable: true }}
                  navigation={true}
                  loop={true}
                  modules={[EffectCoverflow, Pagination, Navigation]}
                  className="w-full py-10"
                >
                  {(loadingBranches
                    ? []
                    : branches.map((branch, idx) => {
                        const routeId = toBranchRouteId(branch);
                        const branchName = isArabic
                          ? (branch.name_ar || branch.name_en || `#${branch.id}`)
                          : (branch.name_en || branch.name_ar || `#${branch.id}`);
                        const branchLocation = isArabic
                          ? (branch.location_ar || branch.location_en || t("common.not_available", "Not available"))
                          : (branch.location_en || branch.location_ar || t("common.not_available", "N/A"));
                        const branchImagesMap: Record<string, string[]> = {
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
                        const fallbackBranches = [
                          asset("branches/BrancheHU1.jpg"),
                          asset("branches/BrancheHU2.jpg"),
                          asset("branches/BrancheHU3.jpg"),
                          asset("branches/BrancheHU4.jpg"),
                        ];
                        const images = branchImagesMap[branch.code ?? ""]
                          ?? [fallbackBranches[idx % fallbackBranches.length] ?? asset("club.png")];

                        // Map link query — prefer Arabic location for better results in EG
                        const mapsQuery = branch.location_ar || branch.location_en || branchName;

                        return {
                          id: routeId,
                          name: branchName,
                          location: branchLocation,
                          images,
                          mapsQuery,
                          isMain: idx === 0,
                        };
                      })
                  ).map((branch) => (
                    <SwiperSlide key={`${branch.id}-${branch.name}`} className="w-[85vw] md:w-[900px] bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
                      <div className="flex flex-col md:flex-row h-full">
                        <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden">
                          <div className="absolute inset-0 bg-[#0e1c38]/10 z-10 pointer-events-none"></div>
                          <BranchImageCarousel images={branch.images} alt={branch.name} />
                          <div className="absolute top-6 end-6 z-20 bg-white/90 backdrop-blur-sm px-5 py-2 rounded-xl text-sm font-bold text-[#2596be] shadow-lg">
                            {branch.isMain ? t("branches.main_branch", "Main Branch") : t("branches.new_branch", "New Branch")}
                          </div>
                        </div>

                        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-start">
                          <h3 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#0e1c38]">{branch.name}</h3>
                          <p className="text-gray-500 mb-8 font-normal text-lg leading-relaxed">
                            {t("branches.branch_description", { branch_name: branch.name, defaultValue: `يوفر ${branch.name} تجربة رياضية متكاملة بمساحات خضراء واسعة، حمامات سباحة أولمبية، وملاعب مجهزة بأعلى المعايير.` })}
                          </p>

                          <div className="grid grid-cols-2 gap-6 mb-10">
                            {/* Location — clickable, opens Google Maps */}
                            <a
                              href={mapsUrlFor(branch.mapsQuery)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 group hover:bg-blue-50/60 rounded-xl p-2 -m-2 transition-colors duration-300"
                              title={t("common.map_location", "افتح الموقع على الخريطة")}
                            >
                              <div className="bg-blue-50 group-hover:bg-[#2596be] p-3 rounded-xl text-[#2596be] group-hover:text-white transition-colors duration-300">
                                <MapPin className="w-6 h-6" />
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 block mb-1">{t("common.location", "الموقع")}</span>
                                <span className="font-bold text-gray-900 group-hover:text-[#2596be] transition-colors duration-300 underline-offset-4 group-hover:underline">{branch.location}</span>
                              </div>
                            </a>

                            <div className="flex items-center gap-3">
                              <div className="bg-blue-50 p-3 rounded-xl text-[#2596be]">
                                <Calendar className="w-6 h-6" />
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 block mb-1">{t("common.schedule", "المواعيد")}</span>
                                <span className="font-bold text-gray-900">{t("common.all_week", "طوال الأسبوع")}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <button className="flex-1 bg-[#2596be] hover:bg-[#1e7e9e] text-white py-4 rounded-xl transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl flex justify-center items-center gap-2" onClick={() => { window.location.href = `/branches/${branch.id}`; }}>
                              {t("branches.explore_btn", "استكشف النادي")} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </section>

            {/* Video Highlights Section */}
            <section className="relative py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
              {/* Decorative gold accent */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#f8941c]/40 to-transparent" />

              <div className="container mx-auto px-6 relative">
                <div className="text-center mb-14">
                  <span className="inline-block text-[#f8941c] font-extrabold text-base sm:text-lg md:text-xl tracking-[0.2em] uppercase mb-4">
                    {t("highlights.tagline", "أبطالنا في الميدان")}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-[#0e1c38] tracking-tight mb-3">
                    {t("highlights.title", "لقطات من إنجازات النادي")}
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                    {t("highlights.subtitle", "شاهد لمحات من تدريبات لاعبينا وأبطالنا في مختلف الرياضات داخل النادي")}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-5">
                    <span className="h-px w-8 bg-[#f8941c]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f8941c]" />
                    <span className="h-px w-8 bg-[#f8941c]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { src: "videos/champions.mp4",  poster: "gallery/champions-start-here.jpg", titleKey: "highlights.video1", titleFb: "من هنا يبدأ الأبطال", catKey: "highlights.cat_training", catFb: "تدريبات" },
                    { src: "videos/boxing.mp4",     poster: "sports/boxing.jpg",                titleKey: "highlights.video2", titleFb: "الملاكمة - قوة وتركيز",  catKey: "highlights.cat_boxing",  catFb: "ملاكمة" },
                    { src: "videos/badminton.mp4",  poster: "sports/tennis.jpg",                titleKey: "highlights.video3", titleFb: "كرة الريشة - مهارة ودقة", catKey: "highlights.cat_racket",  catFb: "كرة الريشة" },
                  ].map((v, i) => (
                    <div
                      key={i}
                      className="group relative rounded-2xl overflow-hidden bg-[#0e1c38] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 ring-1 ring-black/5"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <video
                          src={asset(v.src)}
                          poster={asset(v.poster)}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          onMouseEnter={(e) => { (e.currentTarget as HTMLVideoElement).play().catch(() => {}); }}
                          onMouseLeave={(e) => { const el = e.currentTarget as HTMLVideoElement; el.pause(); el.currentTime = 0; }}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1c38] via-[#0e1c38]/30 to-transparent pointer-events-none" />

                        {/* Play indicator */}
                        <div className="absolute top-4 end-4 w-12 h-12 rounded-full bg-[#f8941c]/90 backdrop-blur flex items-center justify-center shadow-lg ring-2 ring-white/30 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white text-base">▶</span>
                        </div>

                        {/* Caption overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                          <span className="inline-block bg-[#f8941c]/95 text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-2">
                            {t(v.catKey, v.catFb)}
                          </span>
                          <h3 className="text-lg font-extrabold leading-tight">
                            {t(v.titleKey, v.titleFb)}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Sports Academies Section */}
            <section className="py-20 bg-[#0e1c38] relative overflow-hidden text-start">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="text-white z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("sports.academies_title", "الأكاديميات الرياضية")}</h2>
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                      {t("sports.academies_description", "يعد نادي جامعة العاصمة منظمة للأكاديميات الرياضية، وكل منظمة تتطور مع أحدث المعايير الرياضية والتدريبية. نحن نستهدف إلى توفير المزيد من الفرص والتنافس والتطوير للأعضاء من جميع الأعمار.")}
                    </p>
                    <button onClick={() => handleTabChange("Sports")} className="border-2 border-[#f8941c] text-[#f8941c] hover:bg-[#f8941c] hover:text-white px-8 py-3 rounded-full transition-all duration-300 font-bold text-lg">
                      {t("sports.discover_btn", "اكتشف معنا الألعاب الرياضية")}                    </button>
                  </div>
                  <div className="flex justify-center">
                    <div className="grid grid-cols-6 gap-6 max-w-md">
                      {[
                        { icon: <img src={asset("football.png")} alt="Football" className="w-8 h-8 brightness-0 invert" />, name: 'football' },
                        { icon: <img src={asset("volleyball.png")} alt="Volleyball" className="w-8 h-8 brightness-0 invert" />, name: 'volleyball' },
                        { icon: <img src={asset("basketball.png")} alt="Basketball" className="w-8 h-8 brightness-0 invert" />, name: 'basketball' },
                        { icon: <img src={asset("squash.png")} alt="Squash" className="w-8 h-8 brightness-0 invert" />, name: 'squash' },
                        { icon: <img src={asset("tennis.png")} alt="Tennis" className="w-8 h-8 brightness-0 invert" />, name: 'tennis' },
                        { icon: <img src={asset("swimming.svg")} alt="Swimming" className="w-8 h-8 brightness-0 invert" />, name: 'swimming' },
                      ].map((sport, i) => (
                        <button key={i} onClick={() => handleTabChange("Sports")} className="w-16 h-16 bg-white/10 hover:bg-[#f8941c]/20 rounded-lg flex items-center justify-center text-3xl transition-all duration-300 hover:scale-110 cursor-pointer border border-white/10 hover:border-[#f8941c]/50">
                          {sport.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* News Section - Moved after Sports */}
            <section className="py-20 bg-gray-50">
              <div className="container mx-auto px-4">
                <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-gray-900">{t("news.title", "اخر الاخبار")}</h2>
                <p className="text-center text-gray-600 mb-16 text-lg font-normal">{t("news.subtitle", "تابع آخر أخبار النادي والفعاليات")}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(loadingLatestNews ? [] : visibleNewsItems).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer"
                      onClick={() => { window.location.href = `/news/${item.id}`; }}
                    >
                      <div className="overflow-hidden">
                        <img src={item.image} alt={item.title} className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-base text-center leading-relaxed text-gray-800 group-hover:text-[#2596be] transition-colors">{item.title}</h3>
                        <button className="mt-4 text-[#2596be] font-semibold hover:text-[#f8941c] transition-colors text-sm">{t("news.read_more", "اقرأ المزيد ←")}</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => handleTabChange("lastNews")}
                    className="bg-[#2596be] hover:bg-[#1e7e9e] text-white px-8 py-4 rounded-full transition-all duration-300 font-bold text-lg flex items-center gap-2"
                  >
                    {t("news.see_more", "عرض المزيد")} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </section>

            {/* Testimonials */}

            {/* Stats */}
            {/* <div className="bg-[#0e1c38] text-white py-10 border-b border-white/10">
              <div className="container mx-auto px-6 flex flex-wrap justify-around gap-8 text-center">
                {[
                  { num: "+5000", label: "عضو نشط" },
                  { num: "+20", label: "مدرب محترف" },
                  { num: "3", label: "فروع رئيسية" },
                  { num: "+15", label: "رياضة متنوعة" },
                ].map((stat, idx) => (
                  <div key={idx} className="flex flex-col group cursor-default">
                    <span className="text-4xl md:text-5xl font-bold text-[#f8941c] group-hover:scale-110 transition-transform duration-300">{stat.num}</span>
                    <span className="text-gray-300 text-sm mt-2 font-normal">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div> */}

            {/* App Download */}
            <section className="pt-10 pb-0 bg-[#0e1c38] relative overflow-hidden">
              <div className="container mx-auto px-4 relative z-10">
                <div className="relative flex items-center justify-center py-12 md:py-16">
                  <img src={asset("Uber rewards.png")} alt="App Screenshot Left" className="hidden md:block absolute start-0 md:-start-8 lg:-start-14 xl:-start-20 w-48 md:w-80 lg:w-102 translate-y-11" />
                  <img src={asset("Gold iphone.png")} alt="App Screenshot Right" className="hidden md:block absolute end-0 md:-end-8 lg:-end-14 xl:-end-20 w-48 md:w-80 lg:w-95 translate-y-12" />
                  <div className="text-center text-white max-w-4xl">
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight tracking-wide md:tracking-wider">
                      {t("app.points_title_part1", "استفد ")}<span className="text-[#f8941c]">{t("app.points_title_part2", "بالنقاط")}</span> {t("app.points_title_part3", "من خلال")}
                    </h2>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 font-semibold tracking-wide md:tracking-wider">
                      {t("app.app_title", "تطبيق نادي جامعه العاصمة")}
                    </h2>
                    <p className="text-white/90 mb-10 text-lg md:text-xl lg:text-2xl tracking-wide md:tracking-wider font-normal">
                      {t("app.subtitle", "حمل التطبيق الآن واستمتع بمميزات حصرية")}
                    </p>
                    <div className="flex flex-col items-center gap-4">
                      <img src={asset("Layer 12 copy.png")} alt="Google Play" className="h-14 hover:scale-110 transition-transform duration-300 cursor-pointer drop-shadow-lg" />
                      <img src={asset("Layer 28.png")} alt="App Store" className="h-14 hover:scale-110 transition-transform duration-300 cursor-pointer drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        );

      // 👇 هنا الأجزاء اللي كانت بتسبب الخطأ - رجعتها كاملة
      case "events":
        return (
          <div className="container mx-auto px-4 py-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-gray-900">{t("news.events_title", "اخر الاحداث")}</h2>
            <p className="text-center text-gray-600 mb-16 text-lg font-normal">{t("news.events_subtitle", "الفعاليات والمسابقات القادمة")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="bg-blue-50 rounded-2xl h-48 mb-6"></div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">{t("news.placeholder_event_title", "حدث رياضي")} {i + 1}</h3>
                    <p className="text-gray-600 mb-6">{t("news.placeholder_event_desc", "وصف مختصر عن الحدث الرياضي والفعاليات المصاحبة")}</p>
                    <button className="text-[#0b2f8f] hover:text-[#ff9900] font-bold transition-colors">{t("news.learn_more", "اعرف المزيد ←")}</button>
                  </div>
                ))}
            </div>
          </div>
        );

      case "sports":
        return (
          <div className="container mx-auto px-4 py-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-gray-900">{t("sports.title", "الرياضات")}</h2>
            <p className="text-center text-gray-600 mb-16 text-lg font-normal">{t("sports.subtitle", "اختر رياضتك المفضلة")}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                t("sports.names.football", "كرة القدم"), t("sports.names.swimming", "السباحة"), t("sports.names.basketball", "كرة السلة"), t("sports.names.tennis", "التنس"),
                t("sports.names.gymnastics", "الجمباز"), t("sports.names.handball", "كرة اليد"), t("sports.names.karate", "الكاراتيه"), t("sports.names.boxing", "الملاكمة")
              ].map((sport, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 group">
                  <div className="bg-blue-50 group-hover:bg-blue-100 rounded-full w-24 h-24 mx-auto mb-6 transition-all duration-300"></div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#0b2f8f] transition-colors">{sport}</h3>
                </div>
              ))}
            </div>
          </div>
        );

      case "reservations":
        return (
          <div className="min-h-screen bg-gray-50 py-24 animate-fade-in">
            <div className="container mx-auto px-6">
              <SectionTitle title={t("reservations.title", "حجز الملاعب")} subtitle={t("reservations.subtitle", "نظام حجز ذكي وسهل لتنظيم وقتك الرياضي مع صحابك.")} />

              <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
                <div className="md:w-1/3 bg-[#0e1c38] p-10 text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 start-0 w-full h-full bg-[#2596be] opacity-20 rounded-full blur-3xl transform rtl:translate-x-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-6 border-b border-white/20 pb-4">{t("reservations.instructions_title", "تعليمات هامة")}</h3>
                    <ul className="text-sm space-y-4 text-gray-300">
                      <li className="flex items-start gap-2"><span className="text-[#f8941c]">•</span> {t("reservations.instruction_1", "يرجى الحضور قبل الموعد بـ 15 دقيقة.")}</li>
                      <li className="flex items-start gap-2"><span className="text-[#f8941c]">•</span> {t("reservations.instruction_2", "الإلغاء متاح قبل 24 ساعة مجانًا.")}</li>
                      <li className="flex items-start gap-2"><span className="text-[#f8941c]">•</span> {t("reservations.instruction_3", "يجب ارتداء الملابس الرياضية المناسبة.")}</li>
                    </ul>
                  </div>
                  <div className="mt-12 relative z-10">
                    <p className="text-xs text-gray-400 mb-2">{t("reservations.help_title", "للمساعدة الفورية")}</p>
                    <div className="flex items-center gap-3 text-[#f8941c] font-bold text-2xl">
                      <Phone className="w-6 h-6" /> 1913641
                    </div>
                  </div>
                </div>
                <div className="md:w-2/3 p-10">
                  <ReservationPage />
                </div>
              </div>
            </div>
          </div>
        );

      // 👇 هنا قسم العضويات اللي مربوط بالباك اند
      case "memberships":
        return (
          <div className="container mx-auto px-6 py-30">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-gray-900 px-4">{t("memberships.title", "العضويات")}</h2>
            <p className="text-center text-gray-600 mb-16 text-lg font-normal px-4">{t("memberships.subtitle", "اختر الباقة الأنسب لك")}</p>

            {loadingPlans ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
              </div>
            ) : membershipPlans.length === 0 ? (
              <div className="text-center py-20 text-gray-500 text-xl">{t("memberships.no_plans", "لا توجد خطط متاحة حالياً، يرجى المحاولة لاحقاً.")}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                {membershipPlans.map((plan, i) => (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-3xl shadow-xl p-8 md:p-10 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full min-h-[560px] ${
                      i === 2
                        ? "border-4 border-[#f8941c] ring-4 ring-[#f8941c]/20 transform md:scale-105"
                        : "hover:shadow-2xl"
                    }`}
                  >
                    {/* Title — fixed height keeps all titles aligned */}
                    <h3 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 px-2 min-h-[80px] flex items-center justify-center">
                      {isArabic ? (plan.name_ar || plan.name_en || "") : (plan.name_en || plan.name_ar || "")}
                    </h3>

                    {/* Price — fixed height keeps all prices aligned */}
                    <div className="text-4xl md:text-5xl font-bold text-center text-[#2596be] mb-6 min-h-[110px] flex flex-col items-center justify-center">
                      <div>
                        {plan.price} <span className="text-xl md:text-2xl">{plan.currency}</span>
                      </div>
                      <span className="text-sm md:text-base text-gray-500 mt-2">
                        {plan.duration_months === 12
                          ? t("memberships.yearly", "سنويًا")
                          : plan.duration_months === 1
                          ? t("memberships.monthly", "شهريًا")
                          : t("memberships.every_x_months", { count: plan.duration_months, defaultValue: `كل ${plan.duration_months} شهور` })}
                      </span>
                    </div>

                    {/* Benefits — flex-1 pushes button to bottom */}
                    <ul className="space-y-4 px-2 flex-1">
                      <li className="flex items-center gap-3">
                        <span className="text-green-500 text-2xl">✓</span>
                        <span className="text-base md:text-lg">{t("memberships.benefit_access", "دخول النادي واستخدام المرافق")}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="text-green-500 text-2xl">✓</span>
                        <span className="text-base md:text-lg">{t("memberships.benefit_discount", "خصم على الأنشطة الرياضية")}</span>
                      </li>
                      {plan.price > 1000 && (
                        <li className="flex items-center gap-3">
                          <span className="text-green-500 text-2xl">✓</span>
                          <span className="text-base md:text-lg">{t("memberships.benefit_invites", "دعوات مجانية للأصدقاء")}</span>
                        </li>
                      )}
                    </ul>

                    {/* Subscribe button — always at the bottom of the card */}
                    <button
                      onClick={() => { window.location.href = "/re"; }}
                      className={`mt-8 w-full py-4 rounded-2xl font-bold text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                        i === 2
                          ? "bg-[#f8941c] hover:bg-[#e07d10] text-white"
                          : "bg-[#2596be] hover:bg-[#1e7e9e] text-white"
                      }`}
                    >
                      {t("memberships.subscribe", "اشترك الآن")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "contact us":
        return <ContactUs />;
      case "lastNews":
        return <LastNews />;
      case "mediaGallery":
        return <MediaGallery />;
      case "clubs":
        return <Clubs onNavigate={handleTabChange} />;
      case "Sports":
        return <SportDetailedPG />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" dir={i18n.dir()}>
      {/* Premium Sticky Header — Club logo at start (right in RTL), University logo + actions at end (left in RTL) */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_24px_rgba(14,28,56,0.08)]"
          : "bg-white shadow-[0_2px_12px_rgba(14,28,56,0.04)]"
          } py-2`}
      >
        {/* Gold accent strip — adds the premium feel */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#f8941c]/60 to-transparent pointer-events-none" />

        <div className="w-full px-3 sm:px-6 md:px-12 lg:px-16">
          <div className="flex items-center justify-between gap-3">

            {/* 1. CLUB LOGO ─ start side (right in RTL) ───────────────────── */}
            <div
              className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
              onClick={() => handleTabChange("home")}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2596be]/20 via-transparent to-[#f8941c]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex w-14 h-14 sm:w-16 sm:h-16 md:w-[68px] md:h-[68px] items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-gray-200/80 overflow-hidden group-hover:ring-[#2596be]/40 group-hover:shadow-lg transition-all duration-300">
                  <img src={HUCLogo} alt={t("common.club_name", "نادي جامعة العاصمة")} className="w-full h-full object-contain p-1" />
                </div>
              </div>
              <div className="hidden md:flex flex-col leading-tight">
                <span className="font-extrabold text-base sm:text-lg md:text-xl text-[#0e1c38] tracking-tight">نادي جامعة العاصمة</span>
                <span className="text-[12px] font-semibold text-[#2596be] tracking-[0.18em] uppercase">Capital University Club</span>
              </div>
            </div>

            {/* 2. NAVIGATION (Center) — premium pill design with gradient active state ── */}
            <nav className="hidden xl:flex items-center gap-1 mx-auto">
              {[
                { key: "home", label: t("nav.home", "الرئيسية") },
                { key: "clubs", label: t("nav.clubs", "الفروع") },
                { key: "Sports", label: t("nav.sports", "الألعاب الرياضية") },
                { key: "memberships", label: t("nav.memberships", "العضويات") },
                { key: "lastNews", label: t("nav.news", "اخر الأخبار") },
                { key: "contact us", label: t("nav.contact", "تواصل معنا") },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`relative font-bold text-[14.5px] px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 tracking-tight ${activeTab === tab.key
                    ? "text-white"
                    : "text-[#3d4a63] hover:text-[#0e1c38]"
                    }`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  {activeTab === tab.key ? (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: "spring", duration: 0.55, bounce: 0.18 }}
                      className="absolute inset-0 z-0 bg-gradient-to-r from-[#2596be] to-[#1a7a99] rounded-full shadow-lg shadow-[#2596be]/30 ring-1 ring-white/30"
                    />
                  ) : (
                    <span className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-[#2596be]/0 opacity-0 hover:opacity-100 hover:to-[#2596be]/8 rounded-full transition-opacity duration-300" />
                  )}
                </button>
              ))}
            </nav>

            {/* 3. ACTIONS — language + auth (left in RTL) ──── */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#2596be] px-3 py-1.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  {i18n.language.startsWith('ar') ? <EgFlagIcon /> : <GbFlagIcon />}
                  <span className="text-sm font-bold text-gray-700">
                    {i18n.language.startsWith('ar') ? 'AR' : 'EN'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {langDropdownOpen && (
                  <div
                    className="absolute end-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in"
                    onMouseLeave={() => setLangDropdownOpen(false)}
                  >
                    <button
                      onClick={() => { i18n.changeLanguage('ar'); setLangDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-start text-sm font-semibold transition-colors ${i18n.language.startsWith('ar') ? 'bg-blue-50 text-[#2596be]' : 'text-[#0e1c38] hover:bg-gray-50'}`}
                    >
                      <EgFlagIcon />
                      AR
                    </button>
                    <button
                      onClick={() => { i18n.changeLanguage('en'); setLangDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-start text-sm font-semibold transition-colors ${i18n.language.startsWith('en') ? 'bg-blue-50 text-[#2596be]' : 'text-[#0e1c38] hover:bg-gray-50'}`}
                    >
                      <GbFlagIcon />
                      EN
                    </button>
                  </div>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="hidden md:block h-5 w-px bg-gray-200"></div>

              {/* Buttons Group */}
              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  /* Logged-in: Avatar + Dropdown */
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen((v) => !v)}
                      className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#2596be] px-3 py-1.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      {/* Avatar circle with initials */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2596be] to-[#0e1c38] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user.fullName?.charAt(0) ?? <User className="w-4 h-4" />}
                      </div>
                      <div className="text-start leading-tight">
                        <p className="font-bold text-[#0e1c38] text-xs whitespace-nowrap">{user.fullName}</p>
                        <p className="text-[#2596be] text-[10px] font-semibold whitespace-nowrap">{getRoleLabel(user.role, t)}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Panel */}
                    {userDropdownOpen && (
                      <div
                        className="absolute end-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in"
                        onMouseLeave={() => setUserDropdownOpen(false)}
                      >
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                          <p className="font-bold text-[#0e1c38] text-sm truncate">{user.fullName}</p>
                          <p className="text-[#2596be] text-xs font-semibold">{getRoleLabel(user.role, t)}</p>
                        </div>
                        <button
                          onClick={() => { navigate(getDashboardPath(user.role, (user as any).status)); setUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-start text-sm font-semibold text-[#0e1c38] hover:bg-blue-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#2596be]" />
                          {getRoleLabel(user.role, t)}
                        </button>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-start text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                        >
                          <LogOut className="w-4 h-4" />
                          {t("auth.logout", "تسجيل الخروج")}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Login Button - Ghost/Outline Style */}
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="text-[#0e1c38] hover:bg-gray-50 px-4 py-2 rounded-full transition-all duration-300 font-bold text-sm flex items-center gap-2 whitespace-nowrap border border-transparent hover:border-gray-200"
                    >
                      <User className="w-4 h-4" /> {t("auth.login", "تسجيل الدخول")}
                    </button>

                    {/* Register Button - Primary CTA */}
                    <button
                      onClick={() => window.location.href = '/re'}
                      className="bg-[#f8941c] hover:bg-[#e07d10] text-white px-4 py-2 rounded-full transition-all duration-300 font-bold text-sm shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                    >
                      <User className="w-4 h-4" /> {t("auth.register", "سجل الآن")}
                    </button>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="xl:hidden p-2 text-[#0e1c38] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0e1c38] text-white p-4 sm:p-6 animate-fade-in flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center mb-5">
            <span className="font-extrabold text-2xl text-[#f8941c]">{t("nav.menu", "القائمة")}</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Language Switcher */}
          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl mb-6 border border-white/10">
            <button
              onClick={() => { i18n.changeLanguage('ar'); }}
              className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold transition-all ${i18n.language.startsWith('ar') ? 'bg-[#f8941c] text-white shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              <EgFlagIcon className="w-5 h-3.5 rounded-sm" /> AR
            </button>
            <button
              onClick={() => { i18n.changeLanguage('en'); }}
              className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold transition-all ${i18n.language.startsWith('en') ? 'bg-[#f8941c] text-white shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              <GbFlagIcon className="w-5 h-3.5 rounded-sm" /> EN
            </button>
          </div>

          <nav className="flex flex-col gap-2.5 flex-1">
            {[
              { key: "home", label: t("nav.home", "الرئيسية") },
              { key: "clubs", label: t("nav.clubs", "الفروع") },
              { key: "Sports", label: t("nav.sports", "الرياضات") },
              { key: "memberships", label: t("nav.memberships", "العضويات") },
              { key: "lastNews", label: t("nav.news", "اخر الاخبار") },
              { key: "contact us", label: t("nav.contact", "تواصل معنا") },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => { handleTabChange(item.key); setMobileMenuOpen(false); }}
                className={`w-full text-start py-3.5 px-4 rounded-xl font-bold text-xl transition-all ${activeTab === item.key ? "bg-[#f8941c] text-white shadow-md" : "bg-white/5 hover:bg-white/10 text-gray-200"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          {user ? (
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2596be] to-[#0e1c38] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {user.fullName?.charAt(0)}
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-sm">{user.fullName}</p>
                  <p className="text-[#f8941c] text-xs font-semibold">{getRoleLabel(user.role, t)}</p>
                </div>
              </div>
              <button
                onClick={() => { navigate(getDashboardPath(user.role, (user as any).status)); setMobileMenuOpen(false); }}
                className="w-full bg-[#2596be] text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5" /> {getRoleLabel(user.role, t)}
              </button>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full bg-red-500/20 border border-red-400/30 text-red-300 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" /> {t("auth.logout", "تسجيل الخروج")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => { window.location.href = '/login'; setMobileMenuOpen(false); }}
              className="w-full bg-white text-[#0e1c38] py-4 rounded-xl font-bold text-lg mt-4"
            >
              {t("auth.login", "تسجيل دخول")}
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="pt-20">{renderContent()}</main>

      {/* Footer */}
      <footer className="bg-[#0e1c38] text-white pt-20 pb-10 rounded-t-[3rem] mt-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">

            <div className="max-w-sm">
              <div className="flex items-center gap-4 mb-6">
                <img src={HUCLogo} alt={t("common.club_name", "نادي جامعه العاصمة")} className="w-16 h-16 object-contain bg-white rounded-lg p-2" />
                <div>
                  <h3 className="font-bold text-2xl">{t("common.club_name", "نادي جامعه العاصمة")}</h3>
                  <p className="text-[#f8941c] font-medium">{t("footer.slogan", "عراقة.. رياضة.. حياة")}</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 font-normal">
                {t("footer.description", "مؤسسة رياضية رائدة تقدم مجتمعًا رياضيًا متكاملًا بخدمات عالمية تناسب جميع أفراد الأسرة.")}
              </p>
              {/* App Download Buttons in Footer */}
              <div className="flex flex-wrap gap-4">
                <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 border border-white/10 p-2 rounded-lg transition-all">
                  <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" className="h-8" />
                </a>
                <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 border border-white/10 p-2 rounded-lg transition-all">
                  <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" className="h-8" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 md:gap-24">
              <div>
                <h4 className="font-bold text-lg mb-6 text-white">{t("footer.important_links", "روابط هامة")}</h4>
                <ul className="space-y-4 text-gray-400">
                  <li><button onClick={() => handleTabChange("home")} className="hover:text-[#f8941c] transition-colors">{t("nav.home", "الرئيسية")}</button></li>
                  <li><button onClick={() => handleTabChange("sports")} className="hover:text-[#f8941c] transition-colors">{t("nav.sports", "الرياضات")}</button></li>
                  <li><button onClick={() => handleTabChange("memberships")} className="hover:text-[#f8941c] transition-colors">{t("nav.memberships", "العضويات")}</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6 text-white">{t("footer.contact_us", "تواصل معنا")}</h4>
                <ul className="space-y-4 text-gray-400 text-sm">
                  <li className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#f8941c]" />
                    <a
                      href="https://maps.app.goo.gl/QHexupLs17Y7u7rF6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      {t("common.map_location", "الموقع على الخريطة")}
                    </a>
                  </li>
                  <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-[#f8941c]" /> 1913641</li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#f8941c]" />
                    <a href="mailto:huc@hq.helwan.edu.eg" className="hover:text-white transition-colors">
                      huc@hq.helwan.edu.eg
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm">{t("footer.copyright", { year: new Date().getFullYear(), defaultValue: `© ${new Date().getFullYear()} نادي جامعه العاصمة — جميع الحقوق محفوظة` })}</p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/share/1ADZY7CcCU/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1877F2] transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="https://www.instagram.com/helwan.university.club/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#E4405F] transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="https://x.com/Helwan_HUC" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1DA1F2] transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;



import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, Menu, X, User, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const HUCLogo = "/assets/HUC_logo.jpeg";

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

interface SiteNavbarProps {
  /** Current active tab key — used to highlight the menu item */
  activeTab?: string;
  /** Called when a menu item is clicked. If omitted, the navbar navigates to "/?tab=<key>" */
  onTabChange?: (tabKey: string) => void;
  /** Show or hide the login / register buttons */
  showAuthButtons?: boolean;
}

export const SiteNavbar: React.FC<SiteNavbarProps> = ({
  activeTab = "",
  onTabChange,
  showAuthButtons = true,
}) => {
  const { t, i18n } = useTranslation("landing");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleTab = (key: string) => {
    if (onTabChange) {
      onTabChange(key);
      return;
    }
    navigate(key === "home" ? "/" : `/?tab=${encodeURIComponent(key)}`);
  };

  const navTabs = [
    { key: "home", label: t("nav.home", "الرئيسية") },
    { key: "clubs", label: t("nav.clubs", "الفروع") },
    { key: "Sports", label: t("nav.sports", "الألعاب الرياضية") },
    { key: "memberships", label: t("nav.memberships", "العضويات") },
    { key: "lastNews", label: t("nav.news", "آخر الأخبار") },
    { key: "contact us", label: t("nav.contact", "تواصل معنا") },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_24px_rgba(14,28,56,0.08)]"
            : "bg-white shadow-[0_2px_12px_rgba(14,28,56,0.04)]"
        } py-2`}
      >
        {/* Gold accent strip */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#f8941c]/60 to-transparent pointer-events-none" />

        <div className="w-full px-3 sm:px-6 md:px-12 lg:px-16">
          <div className="flex items-center justify-between gap-3">
            {/* 1. CLUB LOGO + brand */}
            <div
              className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
              onClick={() => handleTab("home")}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2596be]/20 via-transparent to-[#f8941c]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex w-14 h-14 sm:w-16 sm:h-16 md:w-[68px] md:h-[68px] items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-gray-200/80 overflow-hidden group-hover:ring-[#2596be]/40 group-hover:shadow-lg transition-all duration-300">
                  <img src={HUCLogo} alt="نادي جامعة العاصمة" className="w-full h-full object-contain p-1" />
                </div>
              </div>
              <div className="hidden md:flex flex-col leading-tight">
                <span className="font-extrabold text-base sm:text-lg md:text-xl text-[#0e1c38] tracking-tight">
                  نادي جامعة العاصمة
                </span>
                <span className="text-[12px] font-semibold text-[#2596be] tracking-[0.18em] uppercase">
                  Capital University Club
                </span>
              </div>
            </div>

            {/* 2. NAVIGATION (Center) — premium pills */}
            <nav className="hidden xl:flex items-center gap-1 mx-auto">
              {navTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTab(tab.key)}
                  className={`relative font-bold text-[14.5px] px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 tracking-tight ${
                    activeTab === tab.key
                      ? "text-white"
                      : "text-[#3d4a63] hover:text-[#0e1c38]"
                  }`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  {activeTab === tab.key ? (
                    <motion.span
                      layoutId="site-nav-pill"
                      transition={{ type: "spring", duration: 0.55, bounce: 0.18 }}
                      className="absolute inset-0 z-0 bg-gradient-to-r from-[#2596be] to-[#1a7a99] rounded-full shadow-lg shadow-[#2596be]/30 ring-1 ring-white/30"
                    />
                  ) : (
                    <span className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-[#2596be]/0 opacity-0 hover:opacity-100 hover:to-[#2596be]/8 rounded-full transition-opacity duration-300" />
                  )}
                </button>
              ))}
            </nav>

            {/* 3. ACTIONS */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#2596be] px-3 py-1.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  {i18n.language.startsWith("ar") ? <EgFlagIcon /> : <GbFlagIcon />}
                  <span className="text-sm font-bold text-gray-700">
                    {i18n.language.startsWith("ar") ? "AR" : "EN"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      langDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {langDropdownOpen && (
                  <div
                    className="absolute end-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in"
                    onMouseLeave={() => setLangDropdownOpen(false)}
                  >
                    <button
                      onClick={() => {
                        i18n.changeLanguage("ar");
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-start text-sm font-semibold transition-colors ${
                        i18n.language.startsWith("ar")
                          ? "bg-blue-50 text-[#2596be]"
                          : "text-[#0e1c38] hover:bg-gray-50"
                      }`}
                    >
                      <EgFlagIcon /> AR
                    </button>
                    <button
                      onClick={() => {
                        i18n.changeLanguage("en");
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-start text-sm font-semibold transition-colors ${
                        i18n.language.startsWith("en")
                          ? "bg-blue-50 text-[#2596be]"
                          : "text-[#0e1c38] hover:bg-gray-50"
                      }`}
                    >
                      <GbFlagIcon /> EN
                    </button>
                  </div>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="hidden md:block h-5 w-px bg-gray-200"></div>

              {/* Auth section */}
              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen((v) => !v)}
                      className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#2596be] px-3 py-1.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2596be] to-[#0e1c38] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user.fullName?.charAt(0) ?? <User className="w-4 h-4" />}
                      </div>
                      <div className="text-start leading-tight">
                        <p className="font-bold text-[#0e1c38] text-xs whitespace-nowrap">{user.fullName}</p>
                        <p className="text-[#2596be] text-[10px] font-semibold whitespace-nowrap">{user.role}</p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          userDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {userDropdownOpen && (
                      <div
                        className="absolute end-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in"
                        onMouseLeave={() => setUserDropdownOpen(false)}
                      >
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                          <p className="font-bold text-[#0e1c38] text-sm truncate">{user.fullName}</p>
                          <p className="text-[#2596be] text-xs font-semibold">{user.role}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigate("/dashboard");
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-start text-sm font-semibold text-[#0e1c38] hover:bg-blue-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#2596be]" /> لوحة التحكم
                        </button>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-start text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                        >
                          <LogOut className="w-4 h-4" /> {t("auth.logout", "تسجيل الخروج")}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  showAuthButtons && (
                    <>
                      <button
                        onClick={() => (window.location.href = "/login")}
                        className="text-[#0e1c38] hover:bg-gray-50 px-4 py-2 rounded-full transition-all duration-300 font-bold text-sm flex items-center gap-2 whitespace-nowrap border border-transparent hover:border-gray-200"
                      >
                        <User className="w-4 h-4" /> {t("auth.login", "تسجيل الدخول")}
                      </button>
                      <button
                        onClick={() => (window.location.href = "/re")}
                        className="bg-[#f8941c] hover:bg-[#e07d10] text-white px-4 py-2 rounded-full transition-all duration-300 font-bold text-sm shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                      >
                        <User className="w-4 h-4" /> {t("auth.register", "سجل الآن")}
                      </button>
                    </>
                  )
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

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0e1c38] text-white p-4 sm:p-6 animate-fade-in flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center mb-5">
            <span className="font-extrabold text-2xl text-[#f8941c]">{t("nav.menu", "القائمة")}</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl mb-6 border border-white/10">
            <button
              onClick={() => i18n.changeLanguage("ar")}
              className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold transition-all ${
                i18n.language.startsWith("ar")
                  ? "bg-[#f8941c] text-white shadow-md"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <EgFlagIcon className="w-5 h-3.5 rounded-sm" /> AR
            </button>
            <button
              onClick={() => i18n.changeLanguage("en")}
              className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold transition-all ${
                i18n.language.startsWith("en")
                  ? "bg-[#f8941c] text-white shadow-md"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <GbFlagIcon className="w-5 h-3.5 rounded-sm" /> EN
            </button>
          </div>

          <nav className="flex flex-col gap-2.5 flex-1">
            {navTabs.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  handleTab(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-start py-3.5 px-4 rounded-xl font-bold text-xl transition-all ${
                  activeTab === item.key
                    ? "bg-[#f8941c] text-white shadow-md"
                    : "bg-white/5 hover:bg-white/10 text-gray-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {!user && showAuthButtons && (
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => {
                  window.location.href = "/login";
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-white text-[#0e1c38] py-3.5 rounded-xl font-bold"
              >
                {t("auth.login", "تسجيل الدخول")}
              </button>
              <button
                onClick={() => {
                  window.location.href = "/re";
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#f8941c] text-white py-3.5 rounded-xl font-bold"
              >
                {t("auth.register", "سجل الآن")}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SiteNavbar;

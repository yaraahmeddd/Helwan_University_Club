import { useTranslation } from 'react-i18next';
import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/axios';
import i18n from "../i18n";

interface Sport {
    id: string;
    nameAr: string;
    descriptionAr: string;
    foundedYear: number;
    players: number;
    coaches: number;
    courts: number;
    image: string;
    heroImage: string;
    achievements: Achievement[];
    facilities: Facility[];
}

interface Achievement {
    id: number;
    year: string;
    titleAr: string;
    descriptionAr: string;
}

interface Facility {
    id: number;
    nameAr: string;
    size: string;
    image: string;
    descriptionAr: string;
}

interface BranchOption {
    id: number;
    name_ar?: string;
    name_en?: string;
}

interface BranchSportOption {
    id: number;
    code?: string;
    name_ar?: string;
    name_en?: string;
}

const extractBranchSports = (payload: unknown): BranchSportOption[] => {
    if (!payload || typeof payload !== 'object') return [];
    const root = payload as { data?: unknown; sports?: unknown };

    if (Array.isArray(root.data)) return root.data as BranchSportOption[];
    if (Array.isArray(root.sports)) return root.sports as BranchSportOption[];

    if (root.data && typeof root.data === 'object') {
        const nested = root.data as { data?: unknown; sports?: unknown };
        if (Array.isArray(nested.data)) return nested.data as BranchSportOption[];
        if (Array.isArray(nested.sports)) return nested.sports as BranchSportOption[];
    }

    return [];
};

const resolveSportKey = (sport: BranchSportOption): string => {
    const signal = `${sport.code || ''} ${sport.name_en || ''} ${sport.name_ar || ''}`.toLowerCase();
    if (signal.includes('football') || signal.includes('soccer') || signal.includes('قدم')) return 'football';
    if (signal.includes('swim') || signal.includes('سباح')) return 'swimming';
    return `sport-${sport.id}`;
};

const SportDetailedPG: React.FC = () => {
  const { t, i18n } = useTranslation("landing");
    const asset = (name: string) => `/assets/${name}`;
    const isArabic = i18n.language?.toLowerCase().startsWith('ar');
    const [selectedSport, setSelectedSport] = useState<string>('');
    const [selectedClub, setSelectedClub] = useState<string>('');
    const [branches, setBranches] = useState<BranchOption[]>([]);
    const [branchSports, setBranchSports] = useState<BranchSportOption[]>([]);
    const [loadingBranchSports, setLoadingBranchSports] = useState(false);
    const [branchSportsError, setBranchSportsError] = useState<string | null>(null);
    const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);
    const [currentFacilityIndex, setCurrentFacilityIndex] = useState(0);
    const [email, setEmail] = useState<string>('');

    const sports: Record<string, Sport> = {
        football: {
            id: 'football',
            nameAr: 'كرة القدم',
            descriptionAr: 'أكاديمية كرة القدم من أكبر الأكاديميات في المنطقة. يبدأ الاشتراك من سن 4 سنوات للجنسين. يتم تقييم اللاعبين بشكل ربع سنوي',
            foundedYear: 2003,
            players: 4261,
            coaches: 112,
            courts: 30,
            image: asset('club.png'),
            heroImage: asset('club.png'),
            achievements: [
                {
                    id: 1,
                    year: '2015 - 2016',
                    titleAr: 'بطولة القاهرة',
                    descriptionAr: 'المركز الأول'
                },
                {
                    id: 2,
                    year: '2015 - 2016',
                    titleAr: 'كأس مصر',
                    descriptionAr: 'المركز الثاني - فريق U2003'
                },
                {
                    id: 3,
                    year: '2015 - 2016',
                    titleAr: 'دوري الناشئين',
                    descriptionAr: 'المركز الثاني - فريق U2004'
                },
                {
                    id: 4,
                    year: '2016 - 2017',
                    titleAr: 'بطولة القاهرة',
                    descriptionAr: 'المركز الأول - فريق U2003'
                },
                {
                    id: 5,
                    year: '2016 - 2017',
                    titleAr: 'دوري الناشئين',
                    descriptionAr: 'المركز الثاني - فريق U2004'
                },
                {
                    id: 6,
                    year: '2016',
                    titleAr: 'كأس مصر',
                    descriptionAr: 'المركز الثاني - فريق U2004'
                }
            ],
            facilities: [
                {
                    id: 1,
                    nameAr: 'ملعب كرة القدم',
                    size: '6,440 م²',
                    image: asset('club.png'),
                    descriptionAr: 'ملعب كرة قدم احترافي برؤية 360 درجة'
                },
                {
                    id: 2,
                    nameAr: 'أرضية التدريب',
                    size: '5,000 م²',
                    image: asset('club.png'),
                    descriptionAr: 'مرافق تدريب متقدمة'
                },
                {
                    id: 3,
                    nameAr: 'مركز الأكاديمية',
                    size: '3,500 م²',
                    image: asset('club.png'),
                    descriptionAr: 'مركز تدريب أكاديمي حديث'
                }
            ]
        },
        swimming: {
            id: 'swimming',
            nameAr: 'السباحة',
            descriptionAr: 'مرافق سباحة حديثة بمعايير أولمبية',
            foundedYear: 2005,
            players: 2150,
            coaches: 45,
            courts: 5,
            image: asset('club.png'),
            heroImage: asset('club.png'),
            achievements: [
                {
                    id: 1,
                    year: '2018 - 2019',
                    titleAr: 'البطولة الوطنية',
                    descriptionAr: 'المركز الأول'
                },
                {
                    id: 2,
                    year: '2019 - 2020',
                    titleAr: 'المنافسة الإقليمية',
                    descriptionAr: 'المركز الثاني'
                }
            ],
            facilities: [
                {
                    id: 1,
                    nameAr: 'حمام السباحة الأولمبي',
                    size: '2,500 م²',
                    image: asset('club.png'),
                    descriptionAr: 'حمام سباحة بمعايير أولمبية'
                }
            ]
        }
    };


    const availableSports = useMemo(
        () =>
            branchSports.map((sport) => ({
                value: resolveSportKey(sport),
                labelAr: (i18n.language === 'ar' ? (sport.name_ar || sport.name_en) : (sport.name_en || sport.name_ar)) || t("sports.default_sport", "رياضة"),
                labelEn: sport.name_en || sport.name_ar || t("sports.default_sport_en", "Sport"),
            })),
        [branchSports, t]
    );

    const currentSport = useMemo(() => {
        if (selectedSport && sports[selectedSport]) return sports[selectedSport];
        const selected = availableSports.find((s) => s.value === selectedSport);
        return {
            id: selectedSport || 'football',
            nameAr: selected?.labelAr || t("sports.default_sport", "رياضة"),
            descriptionAr: t("sports.default_description", "تفاصيل هذه الرياضة غير متاحة حالياً."),
            foundedYear: 0,
            players: 0,
            coaches: 0,
            courts: 0,
            image: asset('club.png'),
            heroImage: asset('club.png'),
            achievements: [
                {
                    id: 1,
                    year: '—',
                    titleAr: t("sports.no_achievements_title", "لا يوجد سجل متاح"),
                    descriptionAr: t("sports.no_achievements_desc", "سيتم تحديث الإنجازات قريباً."),
                },
            ],
            facilities: [
                {
                    id: 1,
                    nameAr: t("sports.default_facility", "مرافق النادي"),
                    size: '-',
                    image: asset('club.png'),
                    descriptionAr: t("sports.default_facility_desc", "سيتم تحديث بيانات المرافق قريباً."),
                },
            ],
        } as Sport;
    }, [selectedSport, availableSports, t]);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await api.get('/register/branches');
                const list: BranchOption[] = Array.isArray(res?.data?.branches) ? res.data.branches : [];
                setBranches(list);
                setSelectedClub(list.length > 0 ? String(list[0].id) : '');
            } catch {
                setBranches([]);
                setSelectedClub('');
            }
        };

        void fetchBranches();
    }, []);

    useEffect(() => {
        if (!selectedClub) {
            setBranchSports([]);
            setSelectedSport('');
            setBranchSportsError(null);
            return;
        }

        const fetchSportsByBranch = async () => {
            try {
                setLoadingBranchSports(true);
                setBranchSportsError(null);
                const res = await api.get(`/branches/${selectedClub}/sports`);
                const list = extractBranchSports(res?.data);
                setBranchSports(list);
                setSelectedSport(list.length > 0 ? resolveSportKey(list[0]) : '');
            } catch {
                setBranchSports([]);
                setSelectedSport('');
                setBranchSportsError(t("sports.load_failed", "Failed to load sports for this branch"));
            } finally {
                setLoadingBranchSports(false);
            }
        };
        void fetchSportsByBranch();
    }, [selectedClub, t]);

    useEffect(() => {
        setCurrentAchievementIndex(0);
        setCurrentFacilityIndex(0);
    }, [selectedSport]);

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`شكراً لاشتراكك! سنرسل لك آخر الأخبار على: ${email}`);
        setEmail('');
    };

    const nextAchievement = () => {
        setCurrentAchievementIndex((prev) => (prev + 1) % currentSport.achievements.length);
    };

    const prevAchievement = () => {
        setCurrentAchievementIndex((prev) => (prev - 1 + currentSport.achievements.length) % currentSport.achievements.length);
    };

    const nextFacility = () => {
        setCurrentFacilityIndex((prev) => (prev + 1) % currentSport.facilities.length);
    };

    const prevFacility = () => {
        setCurrentFacilityIndex((prev) => (prev - 1 + currentSport.facilities.length) % currentSport.facilities.length);
    };

    return (
        <div className="font-cairo bg-gray-50" >
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-[#0e1c38] min-h-screen flex items-center">
                <div className="absolute inset-0">
                    <img
                        src={currentSport.heroImage}
                        alt={t(`sports.info.${currentSport.id}.name`, currentSport.nameAr)}
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0e1c38] via-[#0e1c38]/80 to-transparent"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-white order-2 lg:order-1">
                            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                                {t("sports.academy_title", "أكاديمية جامعة العاصمة {{sport}}", { sport: t(`sports.info.${currentSport.id}.name`, currentSport.nameAr) })}
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                                {t(`sports.info.${currentSport.id}.desc`, currentSport.descriptionAr)}
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => { window.location.href = `/sport/${currentSport.id}`; }}
                                    className="bg-[#FDBF00] hover:bg-[#ffd700] text-[#0e1c38] px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    {t("sports.cta.details", "تعرف على تفاصيل الاشتراك")}
                                </button>
                            </div>
                        </div>

                        {/* Right - Dropdowns */}
                        <div className="space-y-6 order-1 lg:order-2">
                            {/* Branch Dropdown */}
                            <div className="relative">
                                <select
                                    value={selectedClub}
                                    onChange={(e) => setSelectedClub(e.target.value)}
                                    className="w-full bg-[#0A1A44] border-2 border-[#FDBF00] text-white px-6 py-4 rounded-full font-bold text-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FDBF00]"
                                >
                                    {branches.length === 0 ? (
                                        <option value="">{t("sports.no_branches")}</option>
                                    ) : (
                                        branches.map((branch) => (
                                            <option key={branch.id} value={String(branch.id)}>
                                                {isArabic ? ((i18n.language === 'ar' ? (branch.name_ar || branch.name_en) : (branch.name_en || branch.name_ar)) || `#${branch.id}`) : (branch.name_en || branch.name_ar || `#${branch.id}`)}
                                            </option>
                                        ))
                                    )}
                                </select>
                                <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#FDBF00] pointer-events-none" />
                            </div>

                            {/* Sport Dropdown */}
                            <div className="relative">
                                <select
                                    value={selectedSport}
                                    onChange={(e) => setSelectedSport(e.target.value)}
                                    disabled={loadingBranchSports || availableSports.length === 0}
                                    className="w-full bg-[#0A1A44] border-2 border-[#FDBF00] text-white px-6 py-4 rounded-full font-bold text-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FDBF00]"
                                >
                                    {loadingBranchSports ? (
                                        <option value="">{t("sports.loading")}</option>
                                    ) : branchSportsError ? (
                                        <option value="">{branchSportsError}</option>
                                    ) : availableSports.length === 0 ? (
                                        <option value="">{t("sports.no_sports_for_branch")}</option>
                                    ) : (
                                        availableSports.map((sport) => (
                                            <option key={sport.value} value={sport.value}>
                                                {isArabic ? sport.labelAr : sport.labelEn}
                                            </option>
                                        ))
                                    )}
                                </select>
                                <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#FDBF00] pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left - Description */}
                        <div className="order-2 lg:order-1">
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">{t(`sports.info.${currentSport.id}.name`, currentSport.nameAr)}</h2>
                            <p className="text-gray-700 text-lg leading-relaxed mb-8">
                                {t(`sports.info.${currentSport.id}.desc`, currentSport.descriptionAr)}
                            </p>
                            <button onClick={() => window.location.href = '/re'} className="bg-[#FDBF00] hover:bg-[#ffd700] text-[#0e1c38] px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                                {t("sports.cta.become_member", "كن عضواً")}
                            </button>
                        </div>

                        {/* Right - Stats */}
                        <div className="grid grid-cols-2 gap-8 order-1 lg:order-2">
                            {/* Starting Year */}
                            <div className="relative">
                                <div className="text-6xl font-extrabold text-[#FDBF00] mb-2">
                                    {currentSport.foundedYear}
                                </div>
                                <div className="text-gray-600 font-semibold text-lg">{t("sports.stats.founded", "سنة التأسيس")}</div>
                            </div>

                            {/* Players */}
                            <div className="relative">
                                <div className="text-6xl font-extrabold text-[#FDBF00] mb-2">
                                    {currentSport.players.toLocaleString()}
                                </div>
                                <div className="text-gray-600 font-semibold text-lg">{t("sports.stats.players", "لاعب")}</div>
                            </div>

                            {/* Coaches */}
                            <div className="relative">
                                <div className="text-6xl font-extrabold text-[#FDBF00] mb-2">
                                    {currentSport.coaches}
                                </div>
                                <div className="text-gray-600 font-semibold text-lg">{t("sports.stats.coaches", "مدرب")}</div>
                            </div>

                            {/* Courts */}
                            <div className="relative">
                                <div className="text-6xl font-extrabold text-[#FDBF00] mb-2">
                                    {currentSport.courts}
                                </div>
                                <div className="text-gray-600 font-semibold text-lg">{t("sports.stats.court", "ملعب")}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* History/Achievements Timeline Section */}
            <section className="py-24 bg-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img
                        src={currentSport.heroImage}
                        alt="background"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {t("sports.history_title", "سجل أكاديمية جامعة العاصمة {{sport}}", { sport: t(`sports.info.${currentSport.id}.name`, currentSport.nameAr) })}
                        </h2>
                        <p className="text-gray-300 text-lg">
                            {t("sports.history_subtitle", "أفضل الإنجازات لأكاديمية جامعة العاصمة {{sport}}", { sport: t(`sports.info.${currentSport.id}.name`, currentSport.nameAr) })}
                        </p>
                    </div>

                    {/* Timeline Carousel */}
                    <div className="relative max-w-5xl mx-auto">
                        <div className="flex items-center justify-between gap-4 md:gap-8">
                            {/* Left Arrow */}
                            <button
                                onClick={nextAchievement}
                                className="flex-shrink-0 bg-[#FDBF00] hover:bg-[#ffd700] text-[#0e1c38] p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Timeline Items */}
                            <div className="flex-1 overflow-hidden">
                                <div className="relative h-64 flex items-center justify-center">
                                    {currentSport.achievements.map((achievement, index) => (
                                        <div
                                            key={achievement.id}
                                            className={`absolute w-full md:w-4/5 transition-all duration-500 ${index === currentAchievementIndex
                                                ? 'opacity-100 scale-100 z-20'
                                                : 'opacity-0 scale-75 z-0'
                                                }`}
                                        >
                                            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg border border-white/30 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
                                                <div className="bg-[#FDBF00] text-[#0e1c38] font-bold text-lg md:text-xl px-6 py-2 rounded-full inline-block mb-6">
                                                    {achievement.year}
                                                </div>
                                                <h3 className="text-2xl md:text-3xl font-bold mb-4">{t(`sports.info.${currentSport.id}.achievements.${achievement.id}.title`, achievement.titleAr)}</h3>
                                                <p className="text-gray-200 text-lg">{t(`sports.info.${currentSport.id}.achievements.${achievement.id}.desc`, achievement.descriptionAr)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Arrow */}
                            <button
                                onClick={prevAchievement}
                                className="flex-shrink-0 bg-[#FDBF00] hover:bg-[#ffd700] text-[#0e1c38] p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                        </div>

                        {/* Dots Navigation */}
                        <div className="flex justify-center gap-3 mt-12">
                            {currentSport.achievements.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentAchievementIndex(index)}
                                    className={`transition-all duration-300 rounded-full ${index === currentAchievementIndex
                                        ? 'bg-[#FDBF00] w-8 h-3'
                                        : 'bg-white/40 w-3 h-3 hover:bg-white/60'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Facilities Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t("sports.facilities.title", "مرافقنا")}</h2>
                        <p className="text-gray-600 text-lg">
                            {t("sports.facilities.subtitle", "مرافق حديثة للتدريب والمنافسة")}
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            {/* Facility Image */}
                            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl mb-8">
                                <img
                                    src={currentSport.facilities[currentFacilityIndex].image}
                                    alt={t(`sports.info.${currentSport.id}.facilities.${currentSport.facilities[currentFacilityIndex].id}.name`, currentSport.facilities[currentFacilityIndex].nameAr)}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                {/* Select Club Dropdown */}
                                <div className="absolute top-6 left-6 right-6 z-10">
                                    <select
                                        value={selectedClub}
                                        onChange={(e) => setSelectedClub(e.target.value)}
                                        className="w-full md:w-64 bg-[#0A1A44] border-2 border-[#FDBF00] text-white px-6 py-3 rounded-full font-bold text-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FDBF00]"
                                    >
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={String(branch.id)}>
                                                {isArabic ? ((i18n.language === 'ar' ? (branch.name_ar || branch.name_en) : (branch.name_en || branch.name_ar)) || `#${branch.id}`) : (branch.name_en || branch.name_ar || `#${branch.id}`)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Navigation Arrows */}
                                <button
                                    onClick={prevFacility}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextFacility}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>

                                {/* Facility Info */}
                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <h3 className="text-3xl font-bold mb-2">
                                        {t(`sports.info.${currentSport.id}.facilities.${currentSport.facilities[currentFacilityIndex].id}.name`, currentSport.facilities[currentFacilityIndex].nameAr)}
                                    </h3>
                                    <p className="text-white/90">
                                        {t("sports.facilities.size", "بحجم {{size}}", { size: currentSport.facilities[currentFacilityIndex].size })}
                                    </p>
                                </div>
                            </div>

                            {/* Facility Description */}
                            <div className="bg-gray-50 rounded-2xl p-8 text-center">
                                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                                    {t(`sports.info.${currentSport.id}.facilities.${currentSport.facilities[currentFacilityIndex].id}.desc`, currentSport.facilities[currentFacilityIndex].descriptionAr)}
                                </p>
                                <div className="flex justify-center gap-4">
                                    {currentSport.facilities.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentFacilityIndex(index)}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentFacilityIndex ? 'bg-[#0e1c38] w-8' : 'bg-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default SportDetailedPG;


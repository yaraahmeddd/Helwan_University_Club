import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Clock, MapPin, Phone, User,
  Download, CalendarX, LogOut, ShieldCheck, ChevronDown, Car
} from 'lucide-react';
import { useSecurityDashboardBookings, type DisplayBooking, type Guest } from '@/hooks/useSecurityDashboardBookings';
import { useSports } from '@/hooks/useSports';
import { useLocalizedTranslation } from '@/hooks/useLocalizedTranslation';

// ─── UTILS ───────────────────────────────────────────────────────────────────

function timeToMinutes(t: string): number {
  const [h = 0, m = 0] = t.split(':').map(Number);
  return h * 60 + m;
}

function format12h(t: string): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  // User requested to swap: afternoon/PM (h >= 12) is called صباحاً, and AM is called مساءً
  const suffix = h >= 12 ? 'صباحاً' : 'مساءً';
  const hr12 = h % 12 || 12;
  return `${hr12}:${m.toString().padStart(2, '0')} ${suffix}`;
}

function getSlotType(start: string, end: string, bookingDateStr?: string): 'current' | 'all' | 'past' {
  const now = new Date();
  
  if (bookingDateStr) {
    const bookingDate = new Date(bookingDateStr);
    if (bookingDate.toDateString() !== now.toDateString()) {
      return 'all';
    }
  }

  const currentMins = now.getHours() * 60 + now.getMinutes();
  const startMins = timeToMinutes(start);
  const endMins = timeToMinutes(end);

  if (currentMins >= endMins) return 'past';
  if (endMins > currentMins && startMins <= currentMins + 60) return 'current';
  return 'all';
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

function generateMockData(): DisplayBooking[] {
  const now = new Date();
  const h = now.getHours();
  const pad = (n: number) => n.toString().padStart(2, '0');

  const tMinus1 = `${pad(h - 1)}:00`;
  const tMinus0 = `${pad(h - 1)}:30`;
  const tCurr0 = `${pad(h)}:00`;
  const tCurr1 = `${pad(h)}:30`;
  const tPlus1 = `${pad(h + 1)}:00`;
  const tPlus2 = `${pad(h + 2)}:00`;
  const tPlus3 = `${pad(h + 3)}:00`;

  return [
    {
      id: 'bk-001', personName: 'أحمد محمد علي', phoneNumber: '01012345678',
      membershipId: 'HC-00441', memberType: 'عضو',
      fieldName: 'ملعب كرة القدم 1', startTime: tMinus1, endTime: tMinus0,
      sport: 'كرة القدم', guests: [{ name: 'محمود سامي', phone: '01198765432', relation: 'صديق', nationalId: null, frontIdUrl: null, backIdUrl: null }] as Guest[],
      frontIdUrl: 'https://picsum.photos/seed/front1/400/300',
      backIdUrl: 'https://picsum.photos/seed/back1/400/300',
      status: 'completed', bookingCreatedAt: new Date().toISOString(),
      participantsCount: 2, nationalId: '123456789', email: 'email@example.com',
      parkingCarsCount: 0, bookingDate: new Date().toISOString().split('T')[0],
    },
    {
      id: 'bk-002', personName: 'سارة أحمد سليم', phoneNumber: '01098765432',
      membershipId: 'HC-00512', memberType: 'عضو',
      fieldName: 'حمام السباحة', startTime: tCurr0, endTime: tPlus1,
      sport: 'السباحة', guests: [] as Guest[],
      frontIdUrl: 'https://picsum.photos/seed/front2/400/300', backIdUrl: null,
      status: 'confirmed', bookingCreatedAt: new Date().toISOString(),
      participantsCount: 1, nationalId: '987654321', email: null,
      parkingCarsCount: 2, bookingDate: new Date().toISOString().split('T')[0],
    },
    {
      id: 'bk-003', personName: 'محمود عبد الرحمن', phoneNumber: '01234567890',
      membershipId: 'HC-00289', memberType: 'عضو',
      fieldName: 'ملعب السلة', startTime: tCurr1, endTime: tPlus2,
      sport: 'كرة السلة', guests: [{ name: 'ياسر عرفات', phone: '0112346678', relation: 'ضيف', nationalId: null, frontIdUrl: null, backIdUrl: null }] as Guest[],
      frontIdUrl: 'https://picsum.photos/seed/front3/400/300',
      backIdUrl: 'https://picsum.photos/seed/back3/400/300',
      status: 'confirmed', bookingCreatedAt: new Date().toISOString(),
      participantsCount: 2, nationalId: '456789123', email: null,
      parkingCarsCount: 1, bookingDate: new Date().toISOString().split('T')[0],
    },
    {
      id: 'bk-004', personName: 'مريم حسن إبراهيم', phoneNumber: '01123456789',
      membershipId: 'HC-00317', memberType: 'عضو',
      fieldName: 'ملعب التنس', startTime: tPlus2, endTime: tPlus3,
      sport: 'التنس', guests: [] as Guest[],
      frontIdUrl: null, backIdUrl: 'https://picsum.photos/seed/back4/400/300',
      status: 'pending_payment', bookingCreatedAt: new Date().toISOString(),
      participantsCount: 1, nationalId: null, email: null,
      parkingCarsCount: 0, bookingDate: new Date().toISOString().split('T')[0],
    },
    {
      id: 'bk-005', personName: 'يوسف إبراهيم عمر', phoneNumber: '01001122334',
      membershipId: 'HC-00773', memberType: 'عضو',
      fieldName: 'ملعب التنس', startTime: '19:00', endTime: '20:30',
      sport: 'التنس', guests: [] as Guest[],
      frontIdUrl: 'https://picsum.photos/seed/front6/400/300',
      backIdUrl: 'https://picsum.photos/seed/back6/400/300',
      participantsCount: 1,
      nationalId: '789123456',
      email: null,
      status: 'confirmed', bookingCreatedAt: new Date().toISOString(),
      parkingCarsCount: 0, bookingDate: new Date().toISOString().split('T')[0],
    },
  ];
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

export default function SecurityDashboardPage() {
  const { t: tCommon } = useLocalizedTranslation('common');
  const [sportFilter, setSportFilter] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [lightbox, setLightbox] = useState<{ url: string; label: string; name: string } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<DisplayBooking | null>(null);

  // Fetch sports from API
  const { sports, loading: sportsLoading } = useSports();

  const selectedSportId = useMemo(() => {
    if (sportFilter === 'الكل') return undefined;
    return sports.find(s => s.name_ar === sportFilter)?.id;
  }, [sportFilter, sports]);

  // Fetch bookings from API, passing the selected sportId to filter in the database
  const { displayBookings, loading, error: apiError } = useSecurityDashboardBookings({ sportId: selectedSportId });
  
  // Build sport filter list from API (with "الكل" at start)
  const sportFilterOptions = useMemo(() => {
    const sportNames = sports.map(s => s.name_ar);
    return ['الكل', ...sportNames];
  }, [sports]);
  
  // Reset sport filter if current selection is not in the new list
  useEffect(() => {
    if (sportFilter !== 'الكل' && !sportFilterOptions.includes(sportFilter)) {
      setSportFilter('الكل');
    }
  }, [sportFilterOptions]);
  
  // Use API bookings, fallback to mock data if loading or error
  const bookingsData = loading ? generateMockData() : displayBookings.length > 0 ? displayBookings : generateMockData();

  const filteredData = useMemo(() => {
    let result = [...bookingsData].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    if (sportFilter !== 'الكل') {
      result = result.filter(b => b.sport === sportFilter);
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter(b => 
        b.personName.toLowerCase().includes(q) || 
        b.phoneNumber.includes(q) ||
        b.membershipId.includes(q)
      );
    }

    return result;
  }, [sportFilter, debouncedSearch, bookingsData]);

  const hasActiveFilters = sportFilter !== 'الكل' || searchQuery.trim() !== '';

  const handleClearFilters = () => {
    setSportFilter('الكل');
    setSearchQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightbox) setLightbox(null);
        else if (selectedBooking) setSelectedBooking(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox, selectedBooking]);

  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
  const closestBookingId = useMemo(() => {
    return filteredData.find(b => timeToMinutes(b.endTime) > nowMins)?.id;
  }, [filteredData, nowMins]);

  const currentBookings = filteredData.filter(b => getSlotType(b.startTime, b.endTime, b.bookingDate) === 'current');
  const allOtherBookings = filteredData.filter(b => getSlotType(b.startTime, b.endTime, b.bookingDate) !== 'current');

  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] font-sans text-right relative">
      {/* Subtle Blue Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      {/* ── 1. HEADER ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between h-[80px] px-8 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center gap-4">
          <img
            src="/assets/HUC_logo.jpeg"
            alt="شعار نادي جامعة العاصمة"
            className="w-12 h-12 object-contain rounded-2xl shadow-sm border border-slate-100 p-0.5"
          />
          <div className="h-8 w-px bg-slate-200" aria-hidden="true" />
          <div className="flex flex-col">
            <h1 className="text-slate-900 font-black text-xl md:text-2xl tracking-tight leading-tight m-0">
              لوحة مراقبة الحجوزات
            </h1>
            <p className="text-xs font-bold text-slate-500 mt-0.5">البوابة الأمنية والنفاذ</p>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/login'}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all font-bold text-sm"
        >
          <span className="hidden md:inline">تسجيل الخروج</span>
          <LogOut size={16} strokeWidth={2.5} />
        </button>
      </header>

      {/* ── 2. FILTER BAR ── */}
      <div className="sticky top-[80px] z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col md:flex-row md:items-center gap-5">
          <div className="relative w-full md:w-[380px] shrink-0">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن اسم العضو أو رقم الهاتف..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-full py-3 pr-11 pl-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-400 transition-all"
            />
          </div>

          <div className="flex-1 flex items-center">
            <div className="relative shrink-0 w-full md:w-auto">
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                disabled={sportsLoading}
                className="appearance-none w-full bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-full py-3 pl-11 pr-5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 hover:border-slate-300 transition-all cursor-pointer min-w-[180px] shadow-sm"
              >
                {sportsLoading ? (
                  <option value="الكل">{tCommon('loadingSports')}</option>
                ) : (
                  sportFilterOptions.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleClearFilters}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
                >
                  <X size={14} strokeWidth={2.5} /> مسح الفلاتر
                </motion.button>
              )}
            </AnimatePresence>
            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              {filteredData.length.toLocaleString('ar-EG')} نتيجة
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN CONTENT ── */}
      <main className="max-w-[1600px] mx-auto px-8 py-10 pb-32 flex flex-col gap-12 relative z-10">
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-1">{tCommon('loading')}</h3>
            <p className="text-sm font-medium text-slate-500">{tCommon('loadingBookings')}</p>
          </motion.div>
        )}

        {apiError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20 mt-4 bg-red-50 rounded-3xl border border-red-100">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-red-500">
              <X size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-red-700 mb-1">خطأ في التحميل</h3>
            <p className="text-sm font-medium text-red-600">{apiError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
            >
              إعادة المحاولة
            </button>
          </motion.div>
        )}

        {!loading && !apiError && filteredData.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <CalendarX size={28} className="text-slate-400" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">لا توجد حجوزات</h3>
            <p className="text-sm font-medium text-slate-500">جرّب تغيير الفلتر أو البحث بكلمة مختلفة</p>
          </motion.div>
        )}

        {!loading && !apiError && filteredData.length > 0 && (
          <>
            {/* ── SECTION 1: NOW & NEXT 1 HR ── */}
            {currentBookings.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6 px-1">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">حالياً وخلال ساعة</h2>
                    <p className="text-sm font-medium text-slate-500">الحجوزات النشطة في الوقت الحالي</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence mode="popLayout">
                    {currentBookings.map((b, i) => (
                      <BookingCard key={`curr-${b.id}`} booking={b} index={i} type="current" isNext={b.id === closestBookingId} onClick={() => setSelectedBooking(b)} onThumbClick={setLightbox} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {/* ── SECTION 2: ALL DAY ── */}
            {allOtherBookings.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6 px-1 pt-8 border-t border-slate-100">
                  <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center">
                    <CalendarX className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">سجل الحجوزات</h2>
                    <p className="text-sm font-medium text-slate-500">باقي الحجوزات في قاعدة البيانات</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence mode="popLayout">
                    {allOtherBookings.map((b, i) => {
                      const type = getSlotType(b.startTime, b.endTime, b.bookingDate);
                      return <BookingCard key={`all-${b.id}`} booking={b} index={i} type={type} isNext={b.id === closestBookingId} onClick={() => setSelectedBooking(b)} onThumbClick={setLightbox} />;
                    })}
                  </AnimatePresence>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* ── 4. POPUP & LIGHTBOX ── */}
      <AnimatePresence>
        {selectedBooking && <MemberDetailPopup booking={selectedBooking} onClose={() => setSelectedBooking(null)} onThumbClick={setLightbox} />}
        {lightbox && <LightboxOverlay lightbox={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── BOOKING CARD ────────────────────────────────────────────────────────────

function BookingCard({
  booking, index, type, isNext, onClick, onThumbClick
}: {
  booking: DisplayBooking, index: number, type: 'current' | 'all' | 'past', isNext: boolean, onClick: () => void, onThumbClick: (v: any) => void
}) {
  const isCurrent = type === 'current';
  const isPast = type === 'past';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      onClick={onClick}
      className={`relative flex flex-col bg-white rounded-[2rem] cursor-pointer transition-all duration-300 border ${isNext
        ? 'border-blue-200 shadow-[0_4px_24px_-4px_rgba(37,99,235,0.15)] hover:shadow-[0_8px_32px_-4px_rgba(37,99,235,0.25)] hover:-translate-y-1'
        : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-1'
        } overflow-hidden group`}
    >
      <div className={`absolute right-0 top-0 bottom-0 w-1.5 transition-colors ${isNext ? 'bg-blue-600' : isPast ? 'bg-slate-200' : 'bg-slate-800'
        }`} />

      <div className={`flex justify-between items-center p-6 pb-4 border-b border-slate-50 ${isPast ? 'opacity-50' : ''}`}>
        <div className="flex flex-col gap-1">
          <div className={`flex items-center gap-2 text-xl font-black tracking-tight ${isNext ? 'text-blue-600' : 'text-slate-900'}`}>
            <span className="flex gap-1.5">
              {format12h(booking.startTime)}
              <span className="text-slate-300 font-medium px-1">-</span>
              {format12h(booking.endTime)}
            </span>
          </div>
          {booking.bookingDate && (
             <span className="text-xs font-bold text-slate-400">
               {new Date(booking.bookingDate).toLocaleDateString('ar-EG')}
             </span>
          )}
        </div>

        {isNext ? (
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> التالي
          </div>
        ) : isCurrent ? (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
            نشط
          </div>
        ) : isPast ? (
          <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
            منتهي
          </div>
        ) : null}
      </div>

      <div className={`p-6 flex-1 flex flex-col gap-4 ${isPast ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-slate-500 font-black text-xl bg-slate-100 border border-slate-200`}>
            {[...booking.personName.trim()][0]}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 leading-tight mb-0.5">{booking.personName}</h3>
            <div className="text-[13px] text-slate-500 font-medium tracking-wider" dir="ltr">
              {booking.phoneNumber}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 flex justify-between items-end">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 py-2 px-3 rounded-xl border border-slate-100">
          <MapPin size={14} className="text-slate-400" />
          {booking.fieldName}
        </div>

        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <SmallThumb url={booking.frontIdUrl} label="صورة الوجه" name={booking.personName} onClick={onThumbClick} />
          <SmallThumb url={booking.backIdUrl} label="صورة الظهر" name={booking.personName} onClick={onThumbClick} />
        </div>
      </div>
    </motion.article>
  );
}

function SmallThumb({ url, label, name, onClick }: { url: string | null, label: string, name: string, onClick: (v: any) => void }) {
  if (!url) {
    return (
      <div className="w-10 h-8 rounded-lg border border-dashed border-red-200 bg-red-50 flex items-center justify-center" title={`${label} مفقودة`}>
        <X size={12} className="text-red-400" />
      </div>
    );
  }
  return (
    <button onClick={() => onClick({ url, label, name })} className="w-12 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all">
      <img src={url} alt={label} className="w-full h-full object-cover" />
    </button>
  );
}

// ─── FULL INFO POPUP ─────────────────────────────────────────────────────────

function MemberDetailPopup({ booking, onClose, onThumbClick }: { booking: DisplayBooking; onClose: () => void; onThumbClick: (v: any) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative"
        dir="rtl"
      >
        <div className="h-32 bg-slate-900 relative">
          <button onClick={onClose} className="absolute top-6 left-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm">
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex justify-between items-end">
            <div className="w-32 h-32 bg-white rounded-[2rem] p-2 shadow-xl">
              <div className="w-full h-full bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-4xl font-black text-slate-400">
                 {[...booking.personName.trim()][0]}
              </div>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-xl font-bold text-sm border border-emerald-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> تم التحقق
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-1">{booking.personName}</h2>
            <div className="flex gap-3 text-sm font-bold text-slate-500">
              <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-700">{booking.memberType}</span>
              <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-mono">{booking.membershipId}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6">
            <div>
              <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5"><Phone size={12} /> رقم الهاتف</p>
              <p className="text-slate-900 font-bold tracking-widest text-lg" dir="ltr">{booking.phoneNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12} /> الملعب</p>
              <p className="text-slate-900 font-bold text-lg">{booking.fieldName}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-4 px-2">تفاصيل الحجز</h3>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">الوقت</span>
                  <span className="font-black text-blue-600 text-lg tracking-wider bg-blue-50 px-4 py-1 rounded-full">{format12h(booking.startTime)} - {format12h(booking.endTime)}</span>
                </div>
                <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <span className="text-sm font-bold text-slate-500 flex items-center gap-2"><Car size={16} /> مواقف السيارات</span>
                  <span className={`font-bold ${booking.parkingCarsCount > 0 ? 'text-slate-800' : 'text-slate-400'}`}>
                    {booking.parkingCarsCount > 0 ? `${booking.parkingCarsCount} سيارة` : 'بدون سيارة'}
                  </span>
                </div>
                <div className="px-5 py-4 flex justify-between items-center bg-slate-50/50">
                  <span className="text-sm font-bold text-slate-500">مرفقات الهوية</span>
                  <div className="flex gap-2">
                    <SmallThumb url={booking.frontIdUrl} label="صورة الوجه" name={booking.personName} onClick={onThumbClick} />
                    <SmallThumb url={booking.backIdUrl} label="صورة الظهر" name={booking.personName} onClick={onThumbClick} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900 mb-4 px-2 flex justify-between items-center">
                المرافقون
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{booking.guests.length} ضيوف</span>
              </h3>
              {booking.guests.length === 0 ? (
                <div className="text-center text-sm font-bold text-slate-400 py-8 border border-dashed border-slate-200 rounded-3xl bg-slate-50">لا يوجد ضيوف مسجلين</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {booking.guests.map((g: Guest, i: number) => (
                    <GuestRow key={i} g={g} onThumbClick={onThumbClick} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── GUEST ROW ───────────────────────────────────────────────────────────────

function GuestRow({ g, onThumbClick }: { g: Guest, onThumbClick: (v: any) => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = g.nationalId || g.frontIdUrl || g.backIdUrl;
  
  return (
    <div className="flex flex-col bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-colors overflow-hidden">
      <div 
        className={`flex justify-between items-center p-4 ${hasDetails ? 'cursor-pointer' : ''}`} 
        onClick={() => hasDetails && setExpanded(!expanded)}
      >
        <div>
          <div className="font-bold text-base text-slate-900 mb-0.5">{g.name}</div>
          <div className="text-xs font-medium text-slate-500 tracking-wider" dir="ltr">{g.phone}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-100">{g.relation}</span>
          {hasDetails && (
            <ChevronDown size={18} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50/50"
          >
            <div className="p-4 pt-0 border-t border-slate-100 flex flex-col gap-3 mt-2">
              {g.nationalId && (
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-slate-500 font-bold">الرقم القومي</span>
                  <span className="font-bold text-slate-800 tracking-widest" dir="ltr">{g.nationalId}</span>
                </div>
              )}
              {(g.frontIdUrl || g.backIdUrl) && (
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-slate-500 font-bold">مرفقات الهوية</span>
                  <div className="flex gap-2">
                    <SmallThumb url={g.frontIdUrl} label="صورة الوجه" name={g.name} onClick={onThumbClick} />
                    <SmallThumb url={g.backIdUrl} label="صورة الظهر" name={g.name} onClick={onThumbClick} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── LIGHTBOX OVERLAY ────────────────────────────────────────────────────────

function LightboxOverlay({ lightbox, onClose }: { lightbox: any; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-700/50"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-5 bg-slate-800/50 backdrop-blur-sm border-b border-white/5 absolute top-0 w-full z-10">
          <h3 className="text-white font-bold text-sm ml-4 truncate drop-shadow-md">صورة {lightbox.label} — {lightbox.name}</h3>
          <div className="flex shrink-0 gap-2">
            <button onClick={() => downloadImage(lightbox.url, `id.jpg`)} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-blue-500/80 text-white rounded-full transition-colors backdrop-blur-md"><Download size={18} strokeWidth={2.5} /></button>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-red-500/80 text-white rounded-full transition-colors backdrop-blur-md"><X size={18} strokeWidth={2.5} /></button>
          </div>
        </div>
        <div className="relative flex-1 overflow-auto bg-black p-4 flex items-center justify-center min-h-[50vh]">
          <img src={lightbox.url} alt={lightbox.label} className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl" />
        </div>
        <div className="bg-orange-500/10 backdrop-blur-md border-t border-orange-500/20 p-3.5 flex justify-center items-center">
          <span className="text-orange-400 text-xs font-bold tracking-wide flex items-center gap-2"><ShieldCheck size={14} /> هذه الصورة سرية — للاستخدام الأمني فقط</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/axios';
import { Calendar, Play, ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Category, NewsCategory, NewsItem } from './new';
import { useTranslation } from 'react-i18next';

const BACKEND_URL = 'http://localhost:3000';
const DEFAULT_IMAGE = '/api/placeholder/800/600';

interface BackendMediaPost {
  id: number;
  title: string;
  description?: string;
  category: string;
  images?: string[];
  videoUrl?: string;
  videoDuration?: string;
  date?: string;
}

type FilterKey = 'all' | NewsCategory;

const normalizeImageUrl = (url?: string): string => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${BACKEND_URL}/${url}`;
};

const formatDate = (date?: string): string => {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
};

const normalizeSearchText = (value = ''): string => {
  return value
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[^\u0600-\u06FFa-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const mapMediaCategory = (category: string): NewsCategory => {
  const normalized = normalizeSearchText(category);

  if (normalized.includes('فيديو')) return 'videos';
  if (normalized.includes('فعاليات') || normalized.includes('حدث')) return 'events';
  if (normalized.includes('عرض') && normalized.includes('ترويجي')) return 'promotions';
  if (normalized.includes('اخبار') || normalized.includes('خبر')) return 'news';
  if (normalized.includes('اعلان')) return 'announcements';
  if (normalized.includes('صيانه')) return 'maintenance';
  if (normalized.includes('صور')) return 'photos';

  return 'photos';
};

const LastNews: React.FC = () => {
  const { t } = useTranslation("landing");
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(8);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(8);
  }, [activeFilter]);
  
  // Reader Modal State
  const [selectedPostDetails, setSelectedPostDetails] = useState<BackendMediaPost | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  const categories: Category[] = [
    { id: 'all', name: 'all', label: t('news.cats.all', 'الكل') },
    { id: 'photos', name: 'photos', label: t('news.cats.photos', 'الصور') },
    { id: 'videos', name: 'videos', label: t('news.cats.videos', 'الفيديوهات') },
    { id: 'events', name: 'events', label: t('news.cats.events', 'الفعاليات') },
    { id: 'news', name: 'news', label: t('news.cats.news', 'الأخبار') },
  ];

  useEffect(() => {
    const fetchMediaPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/media-posts');
        const backendPosts: BackendMediaPost[] =
          response.data?.success && Array.isArray(response.data?.data) ? response.data.data : [];

        const sortedPosts = [...backendPosts].sort((a, b) => {
          const aTime = a.date ? new Date(a.date).getTime() : 0;
          const bTime = b.date ? new Date(b.date).getTime() : 0;
          return bTime - aTime || b.id - a.id;
        });

        const mappedPosts: NewsItem[] = sortedPosts.map((post) => {
          const primaryImage = normalizeImageUrl(post.images?.[0]);
          const formattedDate = formatDate(post.date);

          return {
            id: Number(post.id),
            title: post.title || t('news.no_title', 'بدون عنوان'),
            excerpt: post.description || t('news.no_desc', 'لا يوجد وصف لهذا المنشور.'),
            content: post.description || '',
            image: primaryImage || DEFAULT_IMAGE,
            category: mapMediaCategory(post.category),
            sourceCategory: post.category || '',
            date: formattedDate,
            timeAgo: formattedDate,
          };
        });

        setPosts(mappedPosts);
      } catch (error) {
        console.error('Failed to fetch media posts for LastNews:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaPosts();
  }, [t]);

  const openPostDetails = async (postId: number) => {
    try {
        const response = await api.get(`/media-posts/${postId}`);
        if (response.data.success) {
            setSelectedPostDetails(response.data.data);
            setIsReaderOpen(true);
            document.body.style.overflow = 'hidden'; // Lock background scroll
        }
    } catch (error) {
        console.error('Failed to fetch single post:', error);
    }
  };

  const closeReader = () => {
      setIsReaderOpen(false);
      setTimeout(() => setSelectedPostDetails(null), 500); // Wait for animation
      document.body.style.overflow = '';
  };

  // Logic for 1 Big + 4 Smaller on featured
  const featuredNews = useMemo(() => posts.slice(0, 5), [posts]); // Slice 5 for 1 big + 4 small
  const secondaryFeatured = useMemo(() => featuredNews.slice(1), [featuredNews]); // 4 items
  const featuredMain = featuredNews[0];

  const filteredNews = useMemo(() => {
    const sourcePosts = activeFilter !== 'all' ? posts : posts.slice(5);
    return sourcePosts.filter((item) => activeFilter === 'all' || item.category === activeFilter);
  }, [activeFilter, posts]);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#0e1c38] font-['Cairo'] pb-24" dir="rtl">
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;800;900&display=swap');
            
            @keyframes scaleUp {
                from { opacity: 0; transform: scale(0.95) translateY(20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            @keyframes slideUpFullscreen {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }

            @keyframes fadeOutFullscreen {
                from { transform: translateY(0); }
                to { transform: translateY(100%); }
            }

            .animate-reader-open {
                animation: slideUpFullscreen 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }

            .animate-reader-close {
                animation: fadeOutFullscreen 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }

            .grid-item-reveal {
                animation: scaleUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
            }
            
            .hide-scroll::-webkit-scrollbar { display: none; }
        `}} />

        {/* Editorial Header — slim */}
        <header className="px-6 md:px-12 py-6 md:py-10 bg-[#0e1c38] relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1526] to-[#0e1c38] z-0"></div>

            <div className="max-w-[1400px] mx-auto relative z-10 text-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                        {t('news.lastNews_title', 'آخر الأخبار')}
                    </h1>
                    <p className="mt-2 text-base md:text-lg text-gray-100 font-bold max-w-2xl leading-relaxed">
                        {t('news.lastNews_subtitle', 'تغطية حصرية لأهم الأحداث، الإنجازات، والفعاليات داخل النادي.')}
                    </p>
                </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
            {/* Filter Pills - Moved below the header */}
            <div className="flex gap-2 overflow-x-auto hide-scroll pb-6 w-full justify-center border-b border-gray-100 mb-12">
                {categories.map((filter) => (
                    <button 
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id as FilterKey)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap border ${
                            activeFilter === filter.id 
                            ? 'bg-[#2596be] border-[#2596be] text-white shadow-[0_4px_10px_rgba(37,150,190,0.3)]' 
                            : 'bg-white border-gray-200 text-gray-500 hover:border-[#2596be] hover:text-[#2596be]'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
            {loading ? (
                <div className="h-[40vh] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-[#2596be] rounded-full animate-spin"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-32">
                    <h2 className="text-3xl font-black text-gray-300">{t('news.no_coverage', 'لا توجد تغطية حالياً.')}</h2>
                </div>
            ) : (
                <>
                    {/* Featured Section (1 Big + 4 Small) */}
                    {activeFilter === 'all' && featuredMain && (
                        <div className="mb-20">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-r-4 border-[#2596be] pr-4">{t('news.featured', 'الأخبار المميزة')}</h2>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 auto-rows-[minmax(200px,auto)]">
                                {/* 1 BIG HERO */}
                                <div 
                                    className="lg:col-span-8 lg:row-span-2 group cursor-pointer relative overflow-hidden bg-gray-100 rounded-[2rem] grid-item-reveal min-h-[400px]"
                                    onClick={() => openPostDetails(featuredMain.id)}
                                >
                                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0e1c38]/90 via-[#0e1c38]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                                    
                                    <img 
                                        src={featuredMain.image} 
                                        alt={featuredMain.title} 
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                                    />

                                    <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="bg-[#2596be] text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                                                {featuredMain.sourceCategory}
                                            </span>
                                            <span className="text-white/80 text-sm font-medium flex items-center gap-1.5">
                                                <Calendar size={14} /> {featuredMain.date}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 group-hover:-translate-y-2 transition-transform duration-500 line-clamp-2">
                                            {featuredMain.title}
                                        </h2>
                                        <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden group-hover:w-24 transition-all duration-700">
                                            <div className="w-full h-full bg-[#2596be] -translate-x-full group-hover:translate-x-0 transition-transform duration-700 delay-100" />
                                        </div>
                                    </div>
                                    
                                    {featuredMain.category === 'videos' && (
                                        <div className="absolute top-8 left-8 z-20 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:bg-white group-hover:text-[#2596be] transition-colors duration-500">
                                            <Play size={24} className="ml-1" fill="currentColor" />
                                        </div>
                                    )}
                                </div>

                                {/* 4 SMALL ITEMS */}
                                <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6">
                                    {secondaryFeatured.map((post, i) => (
                                        <div 
                                            key={post.id}
                                            className="group cursor-pointer relative overflow-hidden bg-gray-50 rounded-2xl grid-item-reveal flex flex-col h-full min-h-[200px]"
                                            style={{ animationDelay: `${(i + 1) * 0.1}s` }}
                                            onClick={() => openPostDetails(post.id)}
                                        >
                                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0e1c38]/90 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                                            <img 
                                                src={post.image} 
                                                alt={post.title} 
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 z-20 p-5 flex flex-col justify-end">
                                                <h3 className="text-white font-bold leading-snug line-clamp-3 group-hover:-translate-y-1 transition-transform duration-300">
                                                    {post.title}
                                                </h3>
                                            </div>
                                            {post.category === 'videos' && (
                                                <div className="absolute top-4 left-4 z-20 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                                                    <Play size={14} className="ml-0.5" fill="currentColor" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* All Other News Standard Grid */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 border-r-4 border-[#2596be] pr-4">
                          {(() => {
                            switch (activeFilter) {
                              case 'all':    return t('news.all_featured',  'جميع الأحداث المميزة');
                              case 'news':   return t('news.all_news',      'جميع الأخبار');
                              case 'photos': return t('news.all_photos',    'جميع الصور');
                              case 'videos': return t('news.all_videos',    'جميع الفيديوهات');
                              case 'events': return t('news.all_events',    'جميع الفعاليات');
                              default:       return t('news.all_news',      'جميع الأخبار');
                            }
                          })()}
                        </h2>
                        
                        {filteredNews.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 font-bold">{t('news.no_results', 'لا توجد نتائج مطابقة.')}</div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredNews.slice(0, visibleCount).map((post, i) => (
                                        <div 
                                            key={post.id}
                                            className={`group cursor-pointer relative overflow-hidden bg-gray-50 rounded-3xl grid-item-reveal flex flex-col shadow-sm hover:shadow-xl transition-shadow duration-500`}
                                            style={{ animationDelay: `${(i % 8 + 1) * 0.05}s` }}
                                            onClick={() => openPostDetails(post.id)}
                                        >
                                            <div className="relative aspect-[4/3] overflow-hidden">
                                                <img 
                                                    src={post.image} 
                                                    alt={post.title} 
                                                    className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                                                />
                                                {post.category === 'videos' && (
                                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                                        <div className="w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                                                            <Play size={20} className="ml-1" fill="currentColor" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between bg-white group-hover:bg-gray-50 transition-colors duration-500 border border-t-0 border-gray-100 rounded-b-3xl">
                                                <div>
                                                    <span className="text-[#2596be] text-xs font-black tracking-wider uppercase mb-3 block">
                                                        {post.sourceCategory}
                                                    </span>
                                                    <h3 className="text-xl font-bold text-[#0e1c38] leading-snug mb-3 group-hover:text-[#2596be] transition-colors duration-300 line-clamp-2">
                                                        {post.title}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                                                    <span className="text-gray-400 text-sm font-medium flex items-center gap-1.5">
                                                        <Calendar size={14} /> {post.date}
                                                    </span>
                                                    <ArrowUpRight size={18} className="text-gray-300 group-hover:text-[#2596be] group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-300" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {filteredNews.length > visibleCount && (
                                    <div className="mt-12 flex justify-center">
                                        <button 
                                            onClick={() => setVisibleCount(prev => prev + 8)}
                                            className="px-8 py-3 bg-white border-2 border-gray-100 text-[#0e1c38] font-bold rounded-full hover:border-[#2596be] hover:text-[#2596be] transition-all duration-300 shadow-sm hover:shadow-md"
                                        >
                                            {t('news.load_more', 'عرض المزيد من الأخبار')}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </main>

        {/* FULL SCREEN EDITORIAL READER MODAL */}
        {selectedPostDetails && (
            <div 
                className={`fixed inset-0 z-[200] bg-white overflow-y-auto ${isReaderOpen ? 'animate-reader-open' : 'animate-reader-close'}`}
                dir="rtl"
            >
                {/* Floating Controls */}
                <div className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center z-[210] pointer-events-none bg-gradient-to-b from-white via-white/80 to-transparent">
                    <button 
                        onClick={closeReader}
                        className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[#0e1c38] shadow-sm pointer-events-auto hover:bg-gray-50 hover:shadow-md hover:-translate-x-1 transition-all duration-300"
                    >
                        <ArrowLeft size={24} />
                    </button>
                </div>

                {/* Article Content */}
                <article className="max-w-4xl mx-auto px-6 py-24 md:py-32 min-h-screen">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="bg-[#2596be]/10 text-[#2596be] px-4 py-1.5 rounded-full text-sm font-black tracking-wider">
                            {selectedPostDetails.category}
                        </span>
                        <span className="text-gray-400 text-sm font-medium flex items-center gap-1.5">
                            <Calendar size={16} /> {formatDate(selectedPostDetails.date)}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0e1c38] leading-[1.3] mb-12">
                        {selectedPostDetails.title}
                    </h1>

                    {/* Full Uncropped Photo */}
                    <div className="rounded-[2rem] overflow-hidden bg-gray-50 mb-12 shadow-sm border border-gray-100 flex items-center justify-center">
                        <img 
                            src={normalizeImageUrl(selectedPostDetails.images?.[0]) || DEFAULT_IMAGE} 
                            alt={selectedPostDetails.title}
                            className="w-full h-auto max-h-[75vh] object-contain"
                        />
                    </div>

                    {/* Details / Description */}
                    <div className="prose prose-lg prose-headings:font-bold prose-a:text-[#2596be] text-gray-700 font-medium leading-loose max-w-none mb-16 whitespace-pre-wrap text-lg md:text-xl">
                        {selectedPostDetails.description || t('news.no_details', 'لا يوجد تفاصيل إضافية لهذا المنشور.')}
                    </div>

                    {selectedPostDetails.category === 'فيديو' && selectedPostDetails.videoUrl && (
                        <div className="mt-12 rounded-3xl overflow-hidden bg-gray-100 aspect-video shadow-xl border border-gray-100">
                            {selectedPostDetails.videoUrl.endsWith('.mp4') || selectedPostDetails.videoUrl.includes('uploads/news/') ? (
                                <video 
                                    src={`/assets/videos/${selectedPostDetails.videoUrl.split('/').pop()}`} 
                                    className="w-full h-full object-contain bg-black"
                                    controls
                                />
                            ) : (
                                <iframe 
                                    src={selectedPostDetails.videoUrl.replace('watch?v=', 'embed/')} 
                                    className="w-full h-full"
                                    allowFullScreen 
                                    title="Video Player"
                                />
                            )}
                        </div>
                    )}

                    {/* Article Footer */}
                    <div className="mt-20 pt-10 border-t border-gray-100 flex justify-center">
                        <button 
                            onClick={closeReader}
                            className="px-8 py-4 bg-[#0e1c38] text-white rounded-full font-bold hover:bg-[#2596be] hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-[#0e1c38]/20"
                        >
                            {t('news.back_to_news', 'العودة للأخبار')}
                        </button>
                    </div>
                </article>
            </div>
        )}
    </div>
  );
};

export default LastNews;

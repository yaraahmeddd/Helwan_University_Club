import React, { useState, useEffect } from 'react';
import api from '../services/axios';
import { Play, Calendar, ArrowUpRight } from 'lucide-react';

interface MediaPost {
    id: string;
    title: string;
    description: string;
    category: "صور" | "فيديو" | "فعاليات" | "عرض ترويجي" | "حدث" | "إعلان" | "أخبار" | "الصيانة";
    images?: string[];
    videoUrl?: string;
    date: string;
}

const BACKEND_URL = "http://localhost:3000";

const MediaTestingPage: React.FC = () => {
    const [posts, setPosts] = useState<MediaPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await api.get('/media-posts');
                if (response.data.success) {
                    setPosts(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const normalizeImage = (post: MediaPost) => {
        const img = post.images?.[0];
        if (!img) return "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800";
        return img.startsWith('http') ? img : `${BACKEND_URL}/${img}`;
    };

    const featuredPost = posts[0];
    const gridPosts = posts.slice(1);

    return (
        <div className="min-h-screen bg-[#fdfdfd] font-['Cairo'] text-[#0e1c38] selection:bg-[#f8941c] selection:text-white pb-24" dir="rtl">
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700;800;900&display=swap');
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .skeleton-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .6; }
                }
            `}} />

            {/* Elevated Header */}
            <header className="container mx-auto px-6 pt-24 pb-16 max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-4 opacity-0 animate-fade-in-up">
                            <div className="h-1 w-12 bg-[#2596be] rounded-full"></div>
                            <span className="text-[#f8941c] font-black tracking-widest uppercase text-sm">نادي جامعة العاصمة</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter opacity-0 animate-fade-in-up leading-none text-[#0e1c38]" style={{ animationDelay: '0.1s' }}>
                            المركز الإعلامي
                        </h1>
                    </div>
                    <div className="opacity-0 animate-fade-in-up md:text-left" style={{ animationDelay: '0.2s' }}>
                        <p className="text-gray-500 font-medium max-w-sm text-lg leading-relaxed">
                            تغطية حصرية لأحدث الفعاليات، الأخبار، واللحظات المميزة في مجتمعنا الرياضي.
                        </p>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 max-w-7xl">
                {loading ? (
                    <div className="space-y-16">
                        {/* Featured Skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-8 aspect-video bg-gray-100 rounded-[2rem] skeleton-pulse w-full"></div>
                            <div className="lg:col-span-4 space-y-4">
                                <div className="h-6 w-24 bg-gray-100 rounded-md skeleton-pulse"></div>
                                <div className="h-12 w-full bg-gray-100 rounded-md skeleton-pulse"></div>
                                <div className="h-12 w-3/4 bg-gray-100 rounded-md skeleton-pulse"></div>
                                <div className="h-24 w-full bg-gray-100 rounded-md skeleton-pulse mt-6"></div>
                            </div>
                        </div>
                        {/* Grid Skeletons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex flex-col space-y-4">
                                    <div className="aspect-[4/3] bg-gray-100 rounded-[2rem] skeleton-pulse w-full"></div>
                                    <div className="h-5 w-20 bg-gray-100 rounded-md skeleton-pulse"></div>
                                    <div className="h-8 w-full bg-gray-100 rounded-md skeleton-pulse"></div>
                                    <div className="h-16 w-full bg-gray-100 rounded-md skeleton-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-32 text-gray-400">
                        <div className="text-6xl mb-6">📷</div>
                        <h2 className="text-2xl font-bold text-[#0e1c38] mb-2">لا توجد وسائط</h2>
                        <p className="text-gray-500">عد لاحقاً لرؤية أحدث التغطيات.</p>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {/* Featured Post (Index 0) */}
                        {featuredPost && (
                            <article className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                                <div className="lg:col-span-8 relative rounded-[2rem] overflow-hidden bg-gray-100 shadow-xl transition-shadow duration-500 group-hover:shadow-2xl">
                                    <div className="aspect-video w-full relative">
                                        <img 
                                            src={normalizeImage(featuredPost)} 
                                            alt={featuredPost.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-[#0e1c38]/5 transition-colors duration-500 group-hover:bg-transparent"></div>
                                        
                                        {featuredPost.category === 'فيديو' && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-20 h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:bg-[#2596be] transition-colors duration-500 shadow-xl">
                                                    <Play size={32} className="text-white ml-2 fill-current" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="lg:col-span-4 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className="px-4 py-1.5 bg-[#f8941c]/10 text-[#f8941c] font-bold text-sm rounded-full">
                                            {featuredPost.category}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium">
                                            <Calendar size={14} />
                                            <span>{featuredPost.date}</span>
                                        </div>
                                    </div>
                                    
                                    <h2 className="text-3xl lg:text-4xl font-black leading-tight mb-6 text-[#0e1c38] group-hover:text-[#2596be] transition-colors duration-300">
                                        {featuredPost.title}
                                    </h2>
                                    
                                    <p className="text-gray-500 text-lg leading-relaxed line-clamp-3 mb-8">
                                        {featuredPost.description || 'لا يوجد وصف متاح لهذا المنشور. انقر للمزيد من التفاصيل والمحتوى المتعلق بهذه التغطية الحصرية.'}
                                    </p>

                                    <div className="flex items-center gap-2 text-[#0e1c38] font-bold group-hover:text-[#f8941c] transition-colors w-fit">
                                        <span>عرض التفاصيل</span>
                                        <ArrowUpRight size={20} className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </article>
                        )}

                        {/* Standard Grid for remaining posts */}
                        {gridPosts.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                                {gridPosts.map((post) => (
                                    <article key={post.id} className="group cursor-pointer flex flex-col">
                                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-6 bg-gray-100 shadow-md transition-shadow duration-500 group-hover:shadow-xl">
                                            <img 
                                                src={normalizeImage(post)} 
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-[#0e1c38]/5 transition-colors duration-500 group-hover:bg-transparent"></div>
                                            
                                            {post.category === 'فيديو' && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:bg-[#2596be] group-hover:text-white transition-all duration-300">
                                                        <Play size={20} className="text-[#0e1c38] group-hover:text-white ml-1 fill-current transition-colors" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col px-1">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-black text-[#f8941c] uppercase tracking-wider">
                                                    {post.category}
                                                </span>
                                                <span className="text-xs font-semibold text-gray-400">
                                                    {post.date}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold leading-snug mb-3 text-[#0e1c38] group-hover:text-[#2596be] transition-colors duration-300 line-clamp-2">
                                                {post.title}
                                            </h3>

                                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                                                {post.description || 'لا يوجد وصف. انقر لاستكشاف المزيد.'}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MediaTestingPage;

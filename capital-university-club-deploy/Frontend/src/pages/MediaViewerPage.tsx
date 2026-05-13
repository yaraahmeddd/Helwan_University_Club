import React, { useState, useEffect } from 'react';
import api from '../services/axios';
import { X, Calendar, Play, ArrowLeft, ArrowUpRight } from 'lucide-react';

interface MediaPost {
    id: string;
    title: string;
    description: string;
    category: string;
    images?: string[];
    videoUrl?: string;
    date: string;
}

const BACKEND_URL = "http://localhost:3000";

const MediaViewerPage: React.FC = () => {
    const [posts, setPosts] = useState<MediaPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    
    // Reader Modal State
    const [selectedPost, setSelectedPost] = useState<MediaPost | null>(null);
    const [isReaderOpen, setIsReaderOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    const fetchSinglePost = async (id: string) => {
        try {
            // Fulfilling the requirement to use the single-post API
            const response = await api.get(`/media-posts/${id}`);
            if (response.data.success) {
                setSelectedPost(response.data.data);
                setIsReaderOpen(true);
                document.body.style.overflow = 'hidden'; // Lock background scroll
            }
        } catch (error) {
            console.error('Failed to fetch single post:', error);
        }
    };

    const closeReader = () => {
        setIsReaderOpen(false);
        setTimeout(() => {
            setSelectedPost(null);
            setCurrentImageIndex(0);
        }, 500); // Wait for animation
        document.body.style.overflow = '';
    };

    const normalizeImage = (post: MediaPost) => {
        const img = post.images?.[0];
        if (!img) return null;
        return img.startsWith('http') ? img : `${BACKEND_URL}/${img}`;
    };

    // Get all normalized images
    const getAllImages = (post: MediaPost | null) => {
        if (!post?.images) return [];
        return post.images.map(img => 
            img.startsWith('http') ? img : `${BACKEND_URL}/${img}`
        );
    };

    const getCurrentImage = () => {
        const images = getAllImages(selectedPost);
        return images[currentImageIndex] || null;
    };

    const handlePrevImage = () => {
        const images = getAllImages(selectedPost);
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleNextImage = () => {
        const images = getAllImages(selectedPost);
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return new Intl.DateTimeFormat('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        } catch {
            return dateStr;
        }
    };

    const filters = ['all', 'صور', 'فيديو', 'أخبار', 'فعاليات'];

    const filteredPosts = posts.filter(post => 
        activeFilter === 'all' || post.category === activeFilter
    );

    return (
        <div className="min-h-screen bg-[#ffffff] text-[#0e1c38] font-['Cairo']" dir="rtl">
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

            {/* Editorial Header */}
            <header className="px-6 md:px-12 pt-20 pb-12 border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-4 text-[#0e1c38]">
                            المركز<br />الإعلامي.
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 font-light max-w-md leading-relaxed">
                            تغطية حصرية لأهم الأحداث، الأخبار، والفعاليات داخل النادي.
                        </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto hide-scroll pb-2 w-full md:w-auto">
                        {filters.map((filter) => (
                            <button 
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${
                                    activeFilter === filter 
                                    ? 'bg-[#0e1c38] text-white' 
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                {filter === 'all' ? 'الكل' : filter}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
                {loading ? (
                    <div className="h-[60vh] flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#2596be] rounded-full animate-spin"></div>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-32">
                        <h2 className="text-3xl font-black text-gray-300">لا توجد تغطية حالياً.</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {filteredPosts.map((post, i) => (
                            <div 
                                key={post.id}
                                className={`group cursor-pointer relative overflow-hidden bg-gray-50 rounded-3xl grid-item-reveal flex flex-col shadow-sm hover:shadow-xl transition-shadow duration-500`}
                                style={{ animationDelay: `${(i + 1) * 0.1}s` }}
                                onClick={() => fetchSinglePost(post.id)}
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    {normalizeImage(post) && (
                                        <img 
                                            src={normalizeImage(post)!} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                                        />
                                    )}
                                    {post.category === 'فيديو' && (
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
                                            {post.category}
                                        </span>
                                        <h3 className="text-xl md:text-2xl font-bold text-[#0e1c38] leading-snug mb-3 group-hover:text-[#2596be] transition-colors duration-300">
                                            {post.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                                        <span className="text-gray-400 text-sm font-medium flex items-center gap-1.5">
                                            <Calendar size={14} /> {formatDate(post.date)}
                                        </span>
                                        <ArrowUpRight size={18} className="text-gray-300 group-hover:text-[#2596be] group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-300" />
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </main>

            {/* FULL SCREEN EDITORIAL READER MODAL */}
            {selectedPost && (
                <div 
                    className={`fixed inset-0 z-[200] bg-white overflow-y-auto ${isReaderOpen ? 'animate-reader-open' : 'animate-reader-close'}`}
                    dir="rtl"
                >
                    {/* Floating Controls */}
                    <div className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-[210] pointer-events-none">
                        <button 
                            onClick={closeReader}
                            className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#0e1c38] shadow-lg pointer-events-auto hover:bg-white hover:scale-110 transition-all duration-300"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    </div>

                    {/* Parallax Hero Header with Image Carousel */}
                    <div className="relative h-[60vh] md:h-[75vh] w-full bg-[#0e1c38] overflow-hidden group">
                        {getCurrentImage() ? (
                            <img 
                                src={getCurrentImage()!} 
                                alt={selectedPost.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-500"
                            />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />

                        {/* Image Navigation Arrows (only show if multiple images) */}
                        {selectedPost && getAllImages(selectedPost).length > 1 && (
                            <>
                                {/* Previous Button */}
                                <button 
                                    onClick={handlePrevImage}
                                    className="absolute left-6 md:left-8 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#0e1c38] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white shadow-lg"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* Next Button */}
                                <button 
                                    onClick={handleNextImage}
                                    className="absolute right-6 md:right-8 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#0e1c38] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white shadow-lg"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                {/* Image Counter */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold">
                                    {currentImageIndex + 1} / {getAllImages(selectedPost).length}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Article Content - Pulled up to overlap the image */}
                    <article className="relative z-10 max-w-4xl mx-auto -mt-32 md:-mt-48 bg-white rounded-t-[3rem] px-8 py-16 md:px-16 md:py-20 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] min-h-[50vh]">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="bg-[#2596be]/10 text-[#2596be] px-4 py-1.5 rounded-full text-sm font-black tracking-wider">
                                {selectedPost.category}
                            </span>
                            <span className="text-gray-400 text-sm font-medium flex items-center gap-1.5">
                                <Calendar size={16} /> {formatDate(selectedPost.date)}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-[#0e1c38] leading-[1.2] mb-12">
                            {selectedPost.title}
                        </h1>

                        <div className="prose prose-lg prose-headings:font-bold prose-a:text-[#2596be] text-gray-600 font-medium leading-loose max-w-none mb-16 whitespace-pre-wrap text-lg md:text-xl">
                            {selectedPost.description || 'لا يوجد تفاصيل إضافية لهذا المنشور.'}
                        </div>

                        {/* Image Gallery Thumbnails (for photo posts with multiple images) */}
                        {selectedPost.category !== 'فيديو' && getAllImages(selectedPost).length > 1 && (
                            <div className="mb-16">
                                <h3 className="text-lg font-bold text-[#0e1c38] mb-4">الصور ({getAllImages(selectedPost).length})</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {getAllImages(selectedPost).map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 hover:border-[#2596be] ${
                                                currentImageIndex === index 
                                                    ? 'border-[#2596be] ring-2 ring-[#2596be]/30 shadow-lg' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img 
                                                src={img} 
                                                alt={`thumbnail-${index}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                            {currentImageIndex === index && (
                                                <div className="absolute inset-0 bg-[#2596be]/20 flex items-center justify-center">
                                                    <div className="w-6 h-6 bg-[#2596be] rounded-full border-2 border-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedPost.category === 'فيديو' && selectedPost.videoUrl && (
                            <div className="mt-12 rounded-3xl overflow-hidden bg-gray-100 aspect-video shadow-xl border border-gray-100">
                                <iframe 
                                    src={selectedPost.videoUrl.replace('watch?v=', 'embed/')} 
                                    className="w-full h-full"
                                    allowFullScreen 
                                    title="Video Player"
                                />
                            </div>
                        )}

                        {/* Article Footer */}
                        <div className="mt-20 pt-8 border-t border-gray-100 flex justify-center">
                            <button 
                                onClick={closeReader}
                                className="px-8 py-4 bg-[#0e1c38] text-white rounded-full font-bold hover:bg-[#2596be] hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-[#0e1c38]/20"
                            >
                                العودة للمركز الإعلامي
                            </button>
                        </div>
                    </article>
                </div>
            )}
        </div>
    );
};

export default MediaViewerPage;

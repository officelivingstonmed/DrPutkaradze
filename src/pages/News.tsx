import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { Post } from '../types/posts';

export function News() {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('published', true)
          .order('published_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const getTitle = (post: Post) => {
    if (language === 'ka') return post.title_ka;
    if (language === 'ru') return post.title_ru;
    return post.title_en;
  };

  const getContent = (post: Post) => {
    if (language === 'ka') return post.content_ka;
    if (language === 'ru') return post.content_ru;
    return post.content_en;
  };

  const getExcerpt = (content: string, maxLength: number = 150) => {
    const stripped = content.replace(/[#*_`]/g, ''); // Remove markdown
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(
      language === 'ka' ? 'ka-GE' : language === 'ru' ? 'ru-RU' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-24 md:py-32 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Newspaper className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium tracking-wide">{t('nav.news')}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight georgian-text">
            {t('news.title')}
          </h1>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-500/50" />
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-cyan-500/50" />
          </div>

          <p className="text-lg text-slate-400 leading-relaxed georgian-text">
            {t('news.subtitle')}
          </p>
        </motion.div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <Link
                  to={`/news/${post.id}`}
                  className="group block h-full bg-gradient-to-b from-slate-800/60 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-500 hover:border-cyan-500/30 hover:shadow-[0_0_40px_-12px_rgba(34,211,238,0.3)]"
                >
                  {/* Image */}
                  {post.image_path && (
                    <div className="relative aspect-video overflow-hidden bg-slate-800">
                      <img
                        src={supabase.storage.from('post-images').getPublicUrl(post.image_path).data.publicUrl}
                        alt={getTitle(post)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          // Hide broken image
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Date */}
                    <p className="text-xs text-cyan-400/80 mb-2">
                      {formatDate(post.published_at)}
                    </p>

                    {/* Title */}
                    <h2 className="text-lg font-semibold text-white mb-3 group-hover:text-cyan-50 transition-colors georgian-text line-clamp-2">
                      {getTitle(post)}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-slate-400 text-sm leading-relaxed mb-4 georgian-text line-clamp-3">
                      {getExcerpt(getContent(post))}
                    </p>

                    {/* Read More Link */}
                    <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium group-hover:gap-3 transition-all">
                      <span>{t('news.readMore')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="h-[2px] bg-gradient-to-r from-cyan-500 to-teal-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
              <Newspaper className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-400 text-lg georgian-text">{t('news.noPosts')}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

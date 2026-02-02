import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Newspaper, Loader2, Calendar } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { Post } from '../types/posts';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export function NewsPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        navigate('/news');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .eq('published', true)
          .single();

        if (error || !data) {
          navigate('/news');
          return;
        }

        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        navigate('/news');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const getTitle = () => {
    if (language === 'ka') return post.title_ka;
    if (language === 'ru') return post.title_ru;
    return post.title_en;
  };

  const getContent = () => {
    if (language === 'ka') return post.content_ka;
    if (language === 'ru') return post.content_ru;
    return post.content_en;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(
      language === 'ka' ? 'ka-GE' : language === 'ru' ? 'ru-RU' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  const renderContent = () => {
    const content = getContent();
    const html = marked(content) as string;
    return DOMPurify.sanitize(html);
  };

  return (
    <div className="min-h-screen bg-dark-900 py-24 md:py-32 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="georgian-text">{t('news.backToNews')}</span>
          </Link>
        </motion.div>

        {/* Article */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-b from-slate-800/60 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden"
        >
          {/* Featured Image */}
          {post.image_path && (
            <div className="relative aspect-video">
              <img
                src={supabase.storage.from('post-images').getPublicUrl(post.image_path).data.publicUrl}
                alt={getTitle()}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-400 text-xs font-medium tracking-wide">{t('nav.news')}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 tracking-tight georgian-text">
              {getTitle()}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Calendar className="w-4 h-4 text-cyan-400/70" />
                <span className="georgian-text">
                  {t('news.publishedOn')} {formatDate(post.published_at)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div
              className="prose prose-invert prose-lg max-w-none georgian-text
                prose-headings:text-white prose-headings:font-semibold
                prose-p:text-slate-300 prose-p:leading-relaxed
                prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white
                prose-ul:text-slate-300 prose-ol:text-slate-300
                prose-li:marker:text-cyan-400
                prose-blockquote:border-l-cyan-500 prose-blockquote:text-slate-400
                prose-code:text-cyan-300 prose-code:bg-slate-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-slate-800/50 prose-pre:border prose-pre:border-slate-700/50"
              dangerouslySetInnerHTML={{ __html: renderContent() }}
            />
          </div>
        </motion.article>

        {/* Back to News */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <Link
            to="/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 text-slate-300 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 hover:text-white transition-all group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="georgian-text">{t('news.backToNews')}</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

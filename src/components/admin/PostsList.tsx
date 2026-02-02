import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, Plus, Search, Filter, ChevronDown, Edit2, Trash2,
  Eye, EyeOff, Loader2, AlertCircle, FileText, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Post } from '../../types/posts';
import { PostForm } from './PostForm';
import { useLanguage } from '../../contexts/LanguageContext';

// Stat Card Component
const StatCard = ({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'cyan' | 'emerald' | 'amber'
}) => {
  const colors = {
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
  };

  return (
    <div className={`relative bg-gradient-to-br ${colors[color]} border rounded-xl p-4 backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${colors[color].split(' ').pop()}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
};

export function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { language } = useLanguage();

  // Translations
  const t = {
    title: language === 'ka' ? 'სიახლეების მართვა' : language === 'ru' ? 'Управление новостями' : 'News Management',
    subtitle: language === 'ka' ? 'შექმენით და მართეთ სიახლეები' : language === 'ru' ? 'Создавайте и управляйте новостями' : 'Create and manage news posts',
    totalPosts: language === 'ka' ? 'სულ პოსტები' : language === 'ru' ? 'Всего постов' : 'Total Posts',
    published: language === 'ka' ? 'გამოქვეყნებული' : language === 'ru' ? 'Опубликовано' : 'Published',
    drafts: language === 'ka' ? 'მონახაზები' : language === 'ru' ? 'Черновики' : 'Drafts',
    createPost: language === 'ka' ? 'პოსტის შექმნა' : language === 'ru' ? 'Создать пост' : 'Create Post',
    search: language === 'ka' ? 'ძებნა...' : language === 'ru' ? 'Поиск...' : 'Search...',
    all: language === 'ka' ? 'ყველა' : language === 'ru' ? 'Все' : 'All',
    edit: language === 'ka' ? 'რედაქტირება' : language === 'ru' ? 'Редактировать' : 'Edit',
    delete: language === 'ka' ? 'წაშლა' : language === 'ru' ? 'Удалить' : 'Delete',
    deleteConfirm: language === 'ka' ? 'დარწმუნებული ხართ?' : language === 'ru' ? 'Вы уверены?' : 'Are you sure?',
    noPosts: language === 'ka' ? 'პოსტები არ მოიძებნა' : language === 'ru' ? 'Посты не найдены' : 'No posts found',
    draft: language === 'ka' ? 'მონახაზი' : language === 'ru' ? 'Черновик' : 'Draft',
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.deleteConfirm)) return;

    setDeletingId(id);
    try {
      // Get the post to delete its image if exists
      const post = posts.find(p => p.id === id);
      if (post?.image_path) {
        await supabase.storage.from('post-images').remove([post.image_path]);
      }

      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;

      setPosts(posts.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  const togglePublished = async (post: Post) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ published: !post.published })
        .eq('id', post.id);

      if (error) throw error;

      setPosts(posts.map(p =>
        p.id === post.id ? { ...p, published: !p.published } : p
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
    }
  };

  const getTitle = (post: Post) => {
    if (language === 'ka') return post.title_ka;
    if (language === 'ru') return post.title_ru;
    return post.title_en;
  };

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' ||
      (filter === 'published' && post.published) ||
      (filter === 'draft' && !post.published);

    const title = getTitle(post).toLowerCase();
    const matchesSearch = !searchQuery || title.includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalPosts = posts.length;
  const publishedCount = posts.filter(p => p.published).length;
  const draftCount = posts.filter(p => !p.published).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{t.title}</h2>
            <p className="text-sm text-slate-400">{t.subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => { setEditingPost(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white rounded-lg font-medium hover:from-cyan-400 hover:to-cyan-300 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>{t.createPost}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={FileText} label={t.totalPosts} value={totalPosts} color="cyan" />
        <StatCard icon={Eye} label={t.published} value={publishedCount} color="emerald" />
        <StatCard icon={EyeOff} label={t.drafts} value={draftCount} color="amber" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="pl-9 pr-8 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50 transition-colors"
          >
            <option value="all">{t.all}</option>
            <option value="published">{t.published}</option>
            <option value="draft">{t.drafts}</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:border-cyan-500/50 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <p className="text-rose-300">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-300">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden hover:border-slate-700/50 transition-colors"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Image thumbnail */}
                  {post.image_path && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                      <img
                        src={supabase.storage.from('post-images').getPublicUrl(post.image_path).data.publicUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white mb-1 truncate georgian-text">
                          {getTitle(post)}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        post.published
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {post.published ? t.published : t.draft}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => togglePublished(post)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          post.published
                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{post.published ? t.draft : t.published}</span>
                      </button>

                      <button
                        onClick={() => { setEditingPost(post); setShowForm(true); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>{t.edit}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingId === post.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                      >
                        {deletingId === post.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span>{t.delete}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
              <Newspaper className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">{t.noPosts}</p>
          </div>
        )}
      </div>

      {/* Post Form Modal */}
      {showForm && (
        <PostForm
          post={editingPost}
          onClose={() => { setShowForm(false); setEditingPost(null); }}
          onSave={() => { setShowForm(false); setEditingPost(null); fetchPosts(); }}
        />
      )}
    </div>
  );
}

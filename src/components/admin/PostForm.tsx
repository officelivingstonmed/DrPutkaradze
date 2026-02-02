import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Upload, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Post, PostFormData } from '../../types/posts';
import { useLanguage } from '../../contexts/LanguageContext';

interface PostFormProps {
  post: Post | null;
  onClose: () => void;
  onSave: () => void;
}

export function PostForm({ post, onClose, onSave }: PostFormProps) {
  const isEditing = !!post;
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<PostFormData>({
    title_en: post?.title_en || '',
    title_ka: post?.title_ka || '',
    title_ru: post?.title_ru || '',
    content_en: post?.content_en || '',
    content_ka: post?.content_ka || '',
    content_ru: post?.content_ru || '',
    image_path: post?.image_path || null,
    published: post?.published || false,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    post?.image_path
      ? supabase.storage.from('post-images').getPublicUrl(post.image_path).data.publicUrl
      : null
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Translations
  const t = {
    createPost: language === 'ka' ? 'პოსტის შექმნა' : language === 'ru' ? 'Создать пост' : 'Create Post',
    editPost: language === 'ka' ? 'პოსტის რედაქტირება' : language === 'ru' ? 'Редактировать пост' : 'Edit Post',
    title: language === 'ka' ? 'სათაური' : language === 'ru' ? 'Заголовок' : 'Title',
    content: language === 'ka' ? 'კონტენტი' : language === 'ru' ? 'Контент' : 'Content',
    image: language === 'ka' ? 'სურათი' : language === 'ru' ? 'Изображение' : 'Image',
    uploadImage: language === 'ka' ? 'სურათის ატვირთვა' : language === 'ru' ? 'Загрузить' : 'Upload Image',
    publish: language === 'ka' ? 'გამოქვეყნება' : language === 'ru' ? 'Опубликовать' : 'Publish',
    saveDraft: language === 'ka' ? 'მონახაზად შენახვა' : language === 'ru' ? 'Сохранить как черновик' : 'Save as Draft',
    cancel: language === 'ka' ? 'გაუქმება' : language === 'ru' ? 'Отмена' : 'Cancel',
    saving: language === 'ka' ? 'ინახება...' : language === 'ru' ? 'Сохранение...' : 'Saving...',
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Read file as ArrayBuffer and create properly typed blob
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Determine correct MIME type
      const mimeType = file.type || 'image/jpeg';

      // Upload to Supabase storage with explicit content type
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, uint8Array, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Delete old image if exists
      if (formData.image_path) {
        await supabase.storage.from('post-images').remove([formData.image_path]);
      }

      // Update form data
      setFormData({ ...formData, image_path: fileName });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (formData.image_path) {
      try {
        await supabase.storage.from('post-images').remove([formData.image_path]);
      } catch (err) {
        console.error('Error removing image:', err);
      }
    }
    setFormData({ ...formData, image_path: null });
    setImagePreview(null);
  };

  const handleSubmit = async (publish: boolean) => {
    // Validate - only require at least one language to be filled
    const hasTitle = formData.title_en || formData.title_ka || formData.title_ru;
    const hasContent = formData.content_en || formData.content_ka || formData.content_ru;

    if (!hasTitle) {
      setError('Please fill in a title');
      return;
    }
    if (!hasContent) {
      setError('Please fill in content');
      return;
    }

    // Auto-fill empty language fields with the first available content
    const title = formData.title_en || formData.title_ka || formData.title_ru;
    const content = formData.content_en || formData.content_ka || formData.content_ru;

    const finalData = {
      ...formData,
      title_en: formData.title_en || title,
      title_ka: formData.title_ka || title,
      title_ru: formData.title_ru || title,
      content_en: formData.content_en || content,
      content_ka: formData.content_ka || content,
      content_ru: formData.content_ru || content,
    };

    setSaving(true);
    setError(null);

    try {
      const postData = {
        ...finalData,
        published: publish,
      };

      if (isEditing && post) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', post.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([postData]);
        if (error) throw error;
      }

      onSave();
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl mx-4 bg-slate-900 rounded-2xl border border-slate-700/50 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? t.editPost : t.createPost}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto min-h-0">
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">{t.image}</label>

            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-20 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white hover:border-cyan-500/50 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-xs">{t.uploadImage}</span>
                  </>
                )}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t.title}
              </label>
              <input
                type="text"
                value={formData.title_ka || formData.title_en}
                onChange={(e) => setFormData({
                  ...formData,
                  title_en: e.target.value,
                  title_ka: e.target.value,
                  title_ru: e.target.value,
                })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors georgian-text"
                placeholder={language === 'ka' ? 'შეიყვანეთ სათაური...' : 'Enter title...'}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t.content}
              </label>
              <textarea
                value={formData.content_ka || formData.content_en}
                onChange={(e) => setFormData({
                  ...formData,
                  content_en: e.target.value,
                  content_ka: e.target.value,
                  content_ru: e.target.value,
                })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none georgian-text"
                placeholder={language === 'ka' ? 'დაწერეთ კონტენტი აქ...' : 'Write your content here...'}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 p-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-slate-400 hover:text-white transition-colors"
          >
            {t.cancel}
          </button>

          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {saving ? t.saving : t.saveDraft}
          </button>

          <button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white rounded-lg font-medium hover:from-cyan-400 hover:to-cyan-300 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {saving ? t.saving : t.publish}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

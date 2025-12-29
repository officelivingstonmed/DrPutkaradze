import React from 'react';
import { motion } from 'framer-motion';
import { Camera, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const galleryImages = [
  '/gallery/gallery-1.jpg',
  '/gallery/gallery-2.jpg',
  '/gallery/gallery-3.jpg',
  '/gallery/gallery-4.jpg',
  '/gallery/gallery-5.jpg',
  '/gallery/gallery-6.jpg',
  '/gallery/gallery-7.jpg',
];

export function Gallery() {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

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
            <Camera className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium tracking-wide">{t('nav.gallery')}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight georgian-text">
            {t('gallery.title')}
          </h1>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-500/50" />
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-cyan-500/50" />
          </div>

          <p className="text-lg text-slate-400 leading-relaxed georgian-text">
            {t('gallery.subtitle')}
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
              onClick={() => setSelectedImage(image)}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <img
                src={image}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Border glow on hover */}
              <div className="absolute inset-0 rounded-xl border-2 border-cyan-500/0 group-hover:border-cyan-500/50 transition-colors duration-300" />

              {/* Zoom icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image */}
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={selectedImage}
            alt="Gallery fullscreen"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </div>
  );
}

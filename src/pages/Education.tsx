import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Play, ArrowLeft, X, FileText, Download, ExternalLink, Folder, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import { Globe } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
}

interface Document {
  id: string;
  title: string;
  description: string;
  url: string;
}

interface DocumentFolder {
  id: string;
  title: string;
  description: string;
  documents: Document[];
}

interface GeorgianEducationalResource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'folder';
  url?: string;
  folder?: DocumentFolder;
}

const englishVideos: Video[] = [
  {
    id: '1',
    title: "Educational Resources Coming Soon",
    description: "Educational materials about traumatology and orthopedics will be available soon.",
    youtubeId: 'dQw4w9WgXcQ',
  },
];

const georgianEducationalResources: GeorgianEducationalResource[] = [
  {
    id: '1',
    title: 'საგანმანათლებლო რესურსები მალე დაემატება',
    description: 'ტრავმატოლოგიისა და ორთოპედიის შესახებ საგანმანათლებლო მასალები მალე იქნება ხელმისაწვდომი',
    type: 'document',
    url: '#',
  }
];

const russianVideos: Video[] = [
  {
    id: '1',
    title: 'Образовательные ресурсы скоро появятся',
    description: 'Образовательные материалы о травматологии и ортопедии скоро будут доступны.',
    youtubeId: 'dQw4w9WgXcQ',
  },
];

interface VideoModalProps {
  video: Video;
  onClose: () => void;
}

function VideoModal({ video, onClose }: VideoModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="youtube-modal"
    >
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="youtube-modal-content">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-dark-800/80 rounded-full hover:bg-dark-700/80 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div className="aspect-video">
            <LiteYouTubeEmbed
              id={video.youtubeId}
              title={video.title}
              poster="maxresdefault"
              noCookie={true}
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">{video.title}</h3>
            <p className="text-dark-100">{video.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function VideoCard({ video, onPlay }: { video: Video; onPlay: (video: Video) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/30 overflow-hidden hover:border-cyan-400/30 transition-all duration-300 group"
    >
      <div className="relative aspect-video">
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent opacity-60" />
        <button
          onClick={() => onPlay(video)}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 backdrop-blur-sm flex items-center justify-center border border-cyan-400/30 transform group-hover:scale-110 transition-transform duration-300">
            <Play className="w-8 h-8 text-white fill-current" />
          </div>
        </button>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
          {video.title}
        </h3>
        <p className="text-dark-100">{video.description}</p>
        <button
          onClick={() => onPlay(video)}
          className="inline-flex items-center mt-4 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Watch Video
          <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
        </button>
      </div>
    </motion.div>
  );
}

function EducationalResourceCard({ 
  resource, 
  onFolderClick 
}: { 
  resource: GeorgianEducationalResource; 
  onFolderClick?: (folder: DocumentFolder) => void; 
}) {
  if (resource.type === 'folder' && resource.folder) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/30 overflow-hidden hover:border-cyan-400/30 transition-all duration-300 group cursor-pointer"
        onClick={() => onFolderClick?.(resource.folder!)}
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Folder className="w-10 h-10 text-cyan-400 mr-3" />
            <h3 className="text-xl font-semibold text-white group-hover:text-cyan-300 transition-colors">
              {resource.title}
            </h3>
            <ChevronRight className="w-5 h-5 text-cyan-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-dark-100 mb-4">{resource.description}</p>
          <div className="flex items-center text-sm text-cyan-400">
            <FileText className="w-4 h-4 mr-1" />
            {resource.folder.documents.length} დოკუმენტი
          </div>
        </div>
      </motion.div>
    );
  }

  // Regular document
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/30 overflow-hidden hover:border-cyan-400/30 transition-all duration-300 group"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <FileText className="w-10 h-10 text-cyan-400 mr-3" />
          <h3 className="text-xl font-semibold text-white group-hover:text-cyan-300 transition-colors">
            {resource.title}
          </h3>
        </div>
        <p className="text-dark-100 mb-4">{resource.description}</p>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mt-2 text-cyan-400 hover:text-cyan-300 transition-colors px-4 py-2 border border-cyan-400/30 rounded-lg hover:bg-cyan-400/10"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          გახსნა / ჩამოტვირთვა
        </a>
      </div>
    </motion.div>
  );
}

function DocumentCard({ document }: { document: Document }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/30 overflow-hidden hover:border-cyan-400/30 transition-all duration-300 group"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <FileText className="w-10 h-10 text-cyan-400 mr-3" />
          <h3 className="text-xl font-semibold text-white group-hover:text-cyan-300 transition-colors">
            {document.title}
          </h3>
        </div>
        <p className="text-dark-100 mb-4">{document.description}</p>
        <a
          href={document.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mt-2 text-cyan-400 hover:text-cyan-300 transition-colors px-4 py-2 border border-cyan-400/30 rounded-lg hover:bg-cyan-400/10"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          გახსნა / ჩამოტვირთვა
        </a>
      </div>
    </motion.div>
  );
}

export function Education() {
  const { t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'russian' | 'georgian' | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | null>(null);

  const handleLanguageSelect = (language: 'english' | 'russian' | 'georgian') => {
    setSelectedLanguage(language);
    setSelectedFolder(null); // Reset folder selection when changing language
  };

  const handleFolderClick = (folder: DocumentFolder) => {
    setSelectedFolder(folder);
  };

  const handleBackToResources = () => {
    setSelectedFolder(null);
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-16 pb-8">
      {/* Neon Effect */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-cyan-400 shadow-[0_0_15px_5px_rgba(34,211,238,0.5)] z-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('education.title')}</h1>
          <p className="text-xl text-dark-100">{t('education.subtitle')}</p>
        </div>

        {!selectedLanguage ? (
          // Language Selection Screen
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Georgian Selection */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageSelect('georgian')}
                className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/30 p-8 hover:border-cyan-400/30 transition-all duration-300 text-left group"
              >
                <div className="flex items-center mb-4">
                  <Globe className="w-8 h-8 text-cyan-400 mr-3" />
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {t('education.georgian.title')}
                  </h3>
                </div>
                <p className="text-dark-100">
                  სასწავლო მასალები ქართულ ენაზე
                </p>
              </motion.button>

              {/* English Selection */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageSelect('english')}
                className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/30 p-8 hover:border-cyan-400/30 transition-all duration-300 text-left group"
              >
                <div className="flex items-center mb-4">
                  <Globe className="w-8 h-8 text-cyan-400 mr-3" />
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {t('education.english.title')}
                  </h3>
                </div>
                <p className="text-dark-100">
                  Access educational content in English
                </p>
              </motion.button>

              {/* Russian Selection */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageSelect('russian')}
                className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/30 p-8 hover:border-cyan-400/30 transition-all duration-300 text-left group"
              >
                <div className="flex items-center mb-4">
                  <Globe className="w-8 h-8 text-cyan-400 mr-3" />
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {t('education.russian.title')}
                  </h3>
                </div>
                <p className="text-dark-100">
                  Access educational content in Russian
                </p>
              </motion.button>
            </div>
          </div>
        ) : selectedFolder ? (
          // Folder Contents View
          <div>
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleBackToResources}
                className="flex items-center text-dark-100 hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                უკან დაბრუნება
              </button>
            </div>
            
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Folder className="w-12 h-12 text-cyan-400 mr-4" />
                <h2 className="text-3xl font-bold text-white">{selectedFolder.title}</h2>
              </div>
              <p className="text-xl text-dark-100">{selectedFolder.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {selectedFolder.documents.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          </div>
        ) : (
          // Content List Section
          <div>
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setSelectedLanguage(null)}
                className="flex items-center text-dark-100 hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to language selection
              </button>
            </div>
            
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {selectedLanguage === 'english' 
                    ? t('education.english.title')
                    : selectedLanguage === 'russian'
                    ? t('education.russian.title')
                    : t('education.georgian.title')
                  }
                </h2>
                <div className="h-[1px] flex-1 mx-6 bg-gradient-to-r from-transparent via-dark-700 to-transparent" />
              </div>

              {selectedLanguage === 'georgian' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {georgianEducationalResources.map((resource) => (
                    <EducationalResourceCard 
                      key={resource.id} 
                      resource={resource} 
                      onFolderClick={handleFolderClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(selectedLanguage === 'english' ? englishVideos : russianVideos).map((video) => (
                    <VideoCard key={video.id} video={video} onPlay={setSelectedVideo} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        <AnimatePresence>
          {selectedVideo && (
            <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
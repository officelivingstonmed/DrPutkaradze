import React, { useState } from 'react';
import { Loader2, Send, FileDown, X, User, Bot, Stethoscope, Clock, Mail, Phone, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { Question } from '../../types/admin';
import { generatePDF } from './PDFGenerator';
import { useLanguage } from '../../contexts/LanguageContext';

interface ResponseFormProps {
  question: Question;
  onClose: () => void;
  onSubmit: (response: string) => Promise<void>;
}

export function ResponseForm({ question, onClose, onSubmit }: ResponseFormProps) {
  const { t, language } = useLanguage();
  const [response, setResponse] = useState(question.ai_response || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Translations for new UI elements
  const labels = {
    patientInquiry: language === 'ka' ? 'პაციენტის მოთხოვნა' : language === 'ru' ? 'Запрос пациента' : 'Patient Inquiry',
    aiSuggestion: language === 'ka' ? 'AI რეკომენდაცია' : language === 'ru' ? 'Рекомендация ИИ' : 'AI Suggestion',
    yourResponse: language === 'ka' ? 'თქვენი პასუხი' : language === 'ru' ? 'Ваш ответ' : 'Your Response',
    editBeforeSending: language === 'ka' ? 'რედაქტირება გაგზავნამდე' : language === 'ru' ? 'Редактировать перед отправкой' : 'Review and edit before sending',
    characters: language === 'ka' ? 'სიმბოლო' : language === 'ru' ? 'символов' : 'characters',
    received: language === 'ka' ? 'მიღებული' : language === 'ru' ? 'Получено' : 'Received',
  };


  const handleGeneratePDF = async () => {
    await generatePDF({
      question: { ...question, response },
      onGenerateStart: () => setIsGeneratingPDF(true),
      onGenerateComplete: () => setIsGeneratingPDF(false),
      onError: (error) => {
        console.error('PDF generation error:', error);
        setIsGeneratingPDF(false);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(response);
      onClose();
    } catch (error) {
      console.error('Error sending response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'ka' ? 'ka-GE' : language === 'ru' ? 'ru-RU' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Centered Full-Width Panel */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-6xl h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] bg-slate-900 shadow-2xl flex flex-col overflow-hidden rounded-2xl border border-slate-800/50"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500" />

          {/* Header */}
          <div className="flex-shrink-0 px-8 py-6 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white font-['Space_Grotesk']">
                    {t('response.respondToPatient')}
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">{labels.editBeforeSending}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto response-panel-scroll">
            <form onSubmit={handleSubmit} className="h-full flex flex-col">

              {/* Patient Info Bar */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800/50 bg-slate-800/20">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-lg">{question.name}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          {question.email}
                        </span>
                        {question.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {question.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{labels.received}: {formatDate(question.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0">

                {/* Left Column - Patient Question & AI Response */}
                <div className="flex flex-col border-r border-slate-800/50 overflow-y-auto response-panel-scroll">

                  {/* Patient Question Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 border-b border-slate-800/50"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                        {labels.patientInquiry}
                      </h3>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-base whitespace-pre-wrap pl-12">
                      {question.question}
                    </p>
                  </motion.div>

                  {/* AI Response Section */}
                  {question.ai_response && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-6 flex-1 bg-slate-800/10"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-violet-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider">
                          {labels.aiSuggestion}
                        </h3>
                        <span className="text-xs text-slate-500 ml-auto">
                          {question.ai_response_at && formatDate(question.ai_response_at)}
                        </span>
                      </div>
                      <div className="pl-12">
                        <div
                          className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed markdown-content"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(marked(question.ai_response) as string)
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right Column - Doctor Response */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col p-6 bg-cyan-500/[0.02]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                      {labels.yourResponse}
                    </h3>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {response.length} {labels.characters}
                      </span>
                    </div>
                  </div>
                  <textarea
                    id="response"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="flex-1 w-full min-h-[200px] px-5 py-4 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all duration-300 resize-none text-base leading-relaxed"
                    placeholder={t('response.placeholder')}
                    required
                  />
                </motion.div>

              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 px-8 py-5 border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              {/* Left Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/80 hover:border-slate-600/50 transition-all disabled:opacity-50"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{t('response.downloadPdf')}</span>
                </button>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600/50 hover:bg-slate-800/50 transition-all text-sm font-medium"
                >
                  {t('response.cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !response.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-white font-medium hover:from-cyan-400 hover:to-cyan-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('response.send')}...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t('response.send')}</span>
                      <ChevronRight className="w-4 h-4 -mr-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
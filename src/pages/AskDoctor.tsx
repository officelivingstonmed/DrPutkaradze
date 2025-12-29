import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Send,
  ArrowLeft,
  Mail,
  User,
  Phone,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  File,
  Loader2,
  Shield,
  Clock,
  MessageSquare,
  CheckCircle2,
  Stethoscope,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
  processFileForUpload,
  validateMultipleFiles,
  cleanupAttachments
} from '../utils/fileUpload';
import { Attachment, DEFAULT_FILE_CONFIG } from '../types/chat';
import { fetchAIResponse } from '../lib/api/chat';

export function AskDoctor() {
  const { t } = useLanguage();
  const [question, setQuestion] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadingFileCount, setUploadingFileCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      cleanupAttachments(attachments);
    };
  }, []);

  const clearFormAndAttachments = () => {
    cleanupAttachments(attachments);
    setSubmitted(true);
    setQuestion('');
    setName('');
    setEmail('');
    setPhone('');
    setAttachments([]);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    const validation = validateMultipleFiles(files, attachments.length, DEFAULT_FILE_CONFIG);

    if (!validation.isValid) {
      setError(validation.error || 'File validation failed');
      return;
    }

    setError(null);
    setIsUploadingFiles(true);
    setUploadingFileCount(files.length);

    try {
      const initialAttachments = files.map(file => ({
        id: Math.random().toString(36).substring(2, 15),
        file,
        uploadType: file.type.startsWith('image/') ? 'image' as const :
                   file.type === 'application/pdf' ? 'pdf' as const : 'document' as const,
        status: 'processing' as const,
        base64Data: '',
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        progressInfo: {
          stage: 'analyzing' as const,
          stageDescription: 'Starting upload...',
          percentage: 0
        }
      }));

      setAttachments(prev => [...prev, ...initialAttachments]);

      await Promise.all(
        files.map(async (file, index) => {
          const initialAttachment = initialAttachments[index];

          const processedFile = await processFileForUpload(file, (progress) => {
            setAttachments(prev => prev.map(att =>
              att.id === initialAttachment.id
                ? { ...att, progressInfo: progress }
                : att
            ));
          });

          setAttachments(prev => prev.map(att =>
            att.id === initialAttachment.id
              ? { ...att, ...processedFile }
              : att
          ));

          return processedFile;
        })
      );
    } catch (err) {
      console.error('Error processing files:', err);
      setError('Failed to process some files. Please try again.');
    } finally {
      setIsUploadingFiles(false);
      setUploadingFileCount(0);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(att => att.id === id);
      if (attachment) {
        cleanupAttachments([attachment]);
      }
      return prev.filter(att => att.id !== id);
    });
  };

  const getFileIcon = (attachment: Attachment) => {
    if (attachment.uploadType === 'image' && attachment.preview) {
      return (
        <img
          src={attachment.preview}
          alt={attachment.file.name}
          className="w-full h-20 object-cover rounded-lg"
        />
      );
    }

    if (attachment.uploadType === 'pdf') {
      return <FileText className="w-8 h-8 text-red-400" />;
    }

    return <File className="w-8 h-8 text-dark-300" />;
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    let aiResponse = null;
    try {
      const sessionId = `askdoctor-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const response = await fetchAIResponse(question, sessionId, attachments);
      aiResponse = response.text;
    } catch (err) {
      console.error('Error getting AI response:', err);
    }

    let questionId: string | undefined;

    try {
      const { data: questionData, error: submitError } = await supabase
        .from('doctor_questions')
        .insert([
          {
            name,
            email,
            phone: phone || null,
            question,
            ai_response: aiResponse,
            ai_response_at: aiResponse ? new Date().toISOString() : null
          }
        ])
        .select('id')
        .single();

      if (submitError) throw submitError;
      questionId = questionData.id;

      if (attachments.length > 0) {
        for (const [index, attachment] of attachments.entries()) {
          const { file } = attachment;

          try {
            const timestamp = Date.now() + index;
            const originalExtension = file.name.split('.').pop() || 'pdf';
            let baseName = file.name
              .replace(/\.[^.]*$/, '')
              .normalize('NFKD')
              .replace(/[^\w\s-]/g, '')
              .trim()
              .replace(/\s+/g, '-')
              .substring(0, 50);

            if (!baseName || baseName.length < 3) {
              baseName = 'medical-document';
            }

            const finalFileName = `${baseName}-${timestamp}.${originalExtension}`;
            const filePath = `${questionId}/${finalFileName}`;

            const arrayBuffer = await file.arrayBuffer();
            const fileBuffer = new Uint8Array(arrayBuffer);

            let uploadSuccess = false;
            let lastUploadError = null;

            for (let retry = 0; retry < 3; retry++) {
              try {
                const { error: uploadError } = await supabase.storage
                  .from('question-attachments')
                  .upload(filePath, fileBuffer, {
                    contentType: file.type,
                    cacheControl: '3600',
                    upsert: retry > 0
                  });

                if (!uploadError) {
                  uploadSuccess = true;
                  break;
                }

                lastUploadError = uploadError;
                if (retry < 2) {
                  await new Promise(resolve => setTimeout(resolve, Math.pow(2, retry) * 1000));
                }
              } catch (networkError) {
                lastUploadError = networkError;
                if (retry < 2) {
                  await new Promise(resolve => setTimeout(resolve, Math.pow(2, retry) * 1000));
                }
              }
            }

            if (!uploadSuccess) {
              throw lastUploadError;
            }

            const { error: attachmentError } = await supabase
              .from('doctor_question_attachments')
              .insert({
                question_id: questionId,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                file_path: filePath,
                upload_status: 'success',
                ...(attachment.extractedText && { extracted_text: attachment.extractedText }),
                ...(attachment.pdfPageCount && { pdf_page_count: attachment.pdfPageCount }),
                ...(attachment.progressInfo?.method && { extraction_method: attachment.progressInfo.method })
              });

            if (attachmentError) {
              if (attachmentError.message?.includes('column') || attachmentError.code === '42703') {
                const { error: fallbackError } = await supabase
                  .from('doctor_question_attachments')
                  .insert({
                    question_id: questionId,
                    file_name: file.name,
                    file_type: file.type,
                    file_size: file.size,
                    file_path: filePath
                  });

                if (fallbackError) throw fallbackError;
              } else {
                throw attachmentError;
              }
            }
          } catch (err) {
            console.error(`Failed to upload ${file.name}:`, err);
            try {
              await supabase
                .from('doctor_question_attachments')
                .insert({
                  question_id: questionId,
                  file_name: file.name,
                  file_type: file.type,
                  file_size: file.size,
                  file_path: null,
                  upload_status: 'failed',
                  error_message: err instanceof Error ? err.message : 'Upload failed'
                });
            } catch (dbError) {
              console.warn('Could not record failed upload:', dbError);
            }
          }
        }
      }

      clearFormAndAttachments();
    } catch (err) {
      setError(t('aiChat.askDoctor.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Steps data
  const steps = t('aiChat.askDoctor.instructions.steps').split('\n');

  return (
    <div className="min-h-screen ask-doctor-bg pt-16" data-medical-component="ask-doctor-page">
      {/* Back button */}
      <div className="fixed top-20 left-4 z-50">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700/50 backdrop-blur-sm border border-dark-600/50 text-dark-100 hover:text-white hover:border-cyan-400/30 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">{t('aiChat.backToHome')}</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="ask-doctor-hero ask-doctor-animate">
        {/* Doctor Badge */}
        <div className="doctor-badge">
          <div className="doctor-badge-avatar">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="doctor-badge-info">
            <div className="doctor-badge-name">Dr. Giorgi Putkaradze</div>
            <div className="doctor-badge-specialty">Trauma-Orthopedic Specialist</div>
          </div>
        </div>

        <h1 className="ask-doctor-title">{t('aiChat.askDoctor.title')}</h1>
        <p className="ask-doctor-subtitle">{t('aiChat.askDoctor.description')}</p>
      </div>

      {/* Main Content Grid */}
      <div className="ask-doctor-grid">
        {/* Sidebar Info Card */}
        <motion.aside
          className="ask-doctor-info-card ask-doctor-animate ask-doctor-animate-delay-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* How It Works */}
          <div className="info-card-section">
            <h3 className="info-card-title">{t('aiChat.askDoctor.instructions.title')}</h3>
            <div className="step-list">
              {steps.map((step, index) => (
                <div key={index} className="step-item">
                  <div className="step-number">{index + 1}</div>
                  <span className="step-text">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="info-card-section">
            <h3 className="info-card-title">Why Ask Here</h3>
            <div className="trust-indicators">
              <div className="trust-item">
                <Shield />
                <span>Private & Secure Communication</span>
              </div>
              <div className="trust-item">
                <Clock />
                <span>Response within 24-48 hours</span>
              </div>
              <div className="trust-item">
                <MessageSquare />
                <span>Direct answer from Dr. Putkaradze</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 />
                <span>AI-assisted preliminary analysis</span>
              </div>
            </div>
          </div>

          {/* Accepted Documents */}
          <div className="info-card-section">
            <h3 className="info-card-title">Accepted Documents</h3>
            <div className="space-y-2">
              {t('aiChat.askDoctor.attachments.types').split('\n').map((type, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-dark-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
                  {type}
                </div>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* Main Form Card */}
        <motion.main
          className="ask-doctor-form-card ask-doctor-animate ask-doctor-animate-delay-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {!submitted ? (
            <form onSubmit={handleQuestionSubmit}>
              {/* Contact Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <User className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="premium-input-group">
                    <label className="premium-input-label">
                      {t('askDoctor.form.namePlaceholder')} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="input-icon" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="premium-input with-icon"
                        placeholder={t('askDoctor.form.namePlaceholder')}
                        required
                      />
                    </div>
                  </div>

                  <div className="premium-input-group">
                    <label className="premium-input-label">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="input-icon" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="premium-input with-icon"
                        placeholder={t('askDoctor.form.emailPlaceholder')}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="premium-input-group" style={{ maxWidth: '280px' }}>
                    <label className="premium-input-label">
                      {t('aiChat.askDoctor.phonePlaceholder')}
                    </label>
                    <div className="relative">
                      <Phone className="input-icon" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="premium-input with-icon"
                        placeholder="+995 XXX XX XX XX"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <MessageSquare className="w-4 h-4" />
                  Your Medical Question
                </h3>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="premium-textarea"
                  placeholder={t('aiChat.askDoctor.placeholder')}
                  required
                  rows={5}
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* File Upload Section */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <FileText className="w-4 h-4" />
                  {t('aiChat.askDoctor.attachments.title')}
                  <span className="text-dark-300 font-normal text-sm ml-2">(Optional)</span>
                </h3>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={DEFAULT_FILE_CONFIG.allowedTypes.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div
                  className={`file-upload-zone ${isDragging ? 'dragging' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isUploadingFiles ? (
                    <>
                      <Loader2 className="file-upload-icon animate-spin" />
                      <p className="file-upload-text">
                        Processing {uploadingFileCount} file{uploadingFileCount !== 1 ? 's' : ''}...
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="file-upload-icon" />
                      <p className="file-upload-text">
                        Drop files here or click to upload
                      </p>
                      <p className="file-upload-hint">
                        Max 15 files, 10MB each. PDF text will be extracted for analysis.
                      </p>
                    </>
                  )}
                </div>

                {/* File Previews */}
                {attachments.length > 0 && (
                  <div className="file-preview-grid">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="file-preview-item group">
                        <div className="file-preview-thumb">
                          {getFileIcon(attachment)}
                        </div>

                        {/* Processing Overlay */}
                        {attachment.progressInfo && attachment.progressInfo.stage !== 'complete' && (
                          <div className="file-processing-overlay">
                            <div className="file-processing-spinner" />
                            <span className="file-processing-text">
                              {attachment.progressInfo.stageDescription}
                            </span>
                            {attachment.progressInfo.percentage !== undefined && (
                              <div className="w-full mt-2 bg-dark-700 rounded-full h-1">
                                <div
                                  className="h-1 rounded-full bg-cyan-400 transition-all duration-300"
                                  style={{ width: `${attachment.progressInfo.percentage}%` }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Success Badge */}
                        {attachment.status === 'ready' && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        )}

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAttachment(attachment.id);
                          }}
                          className="file-preview-remove"
                        >
                          <X />
                        </button>

                        <p className="file-preview-name">{attachment.file.name}</p>
                        <p className="file-preview-size">
                          {(attachment.file.size / 1024 / 1024).toFixed(2)} MB
                          {attachment.extractedText && (
                            <span className="text-emerald-400 ml-1">
                              ({attachment.pdfPageCount} pages)
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting || !question.trim() || !name.trim() || !email.trim()}
                  className="submit-button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      <span>Sending your question...</span>
                    </>
                  ) : (
                    <>
                      <Send />
                      <span>{t('aiChat.askDoctor.submit')}</span>
                    </>
                  )}
                </button>
                <p className="text-center text-sm text-dark-300 mt-3">
                  {t('aiChat.askDoctor.emailNote')}
                </p>
              </div>
            </form>
          ) : (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="success-container"
            >
              <div className="success-icon-wrapper">
                <CheckCircle2 />
              </div>
              <h3 className="success-title">{t('aiChat.askDoctor.success.title')}</h3>
              <p className="success-message">{t('aiChat.askDoctor.success.message')}</p>
              <button
                onClick={() => setSubmitted(false)}
                className="success-button"
              >
                <RefreshCw className="w-4 h-4" />
                {t('aiChat.askDoctor.success.askAnother')}
              </button>
            </motion.div>
          )}
        </motion.main>
      </div>
    </div>
  );
}

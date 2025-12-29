import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, Mail, Phone, User, Check, X, Loader2, AlertCircle,
  MessageSquare, LogOut, ChevronDown, Clock, Filter, Trash2,
  FileText, Image as ImageIcon, File, Download, FileDown, History,
  Sparkles, Bot, Users, CheckCircle2, AlertTriangle, Search, RefreshCw,
  BookOpen
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBot } from '../components/ChatBot';
import { useLanguage } from '../contexts/LanguageContext';
import { ResponseForm } from '../components/admin/ResponseForm';
import { AudioPlayer } from '../components/admin/AudioPlayer';
import { generatePDF } from '../components/admin/PDFGenerator';
import { Question } from '../types/admin';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

const WEBHOOK_URL = "https://hook.eu2.make.com/oshr1mqp66b2cusj5nov19v4m9jx8t9n";

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
  color: 'cyan' | 'amber' | 'emerald' | 'rose'
}) => {
  const colors = {
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-br ${colors[color]} border rounded-xl p-4 backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors[color].split(' ').pop()}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

export function Admin() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Translations
  const t = {
    adminDashboard: language === 'ka' ? 'ადმინ პანელი' : language === 'ru' ? 'Админ панель' : 'Admin Dashboard',
    back: language === 'ka' ? 'უკან' : language === 'ru' ? 'Назад' : 'Back',
    chatHistory: language === 'ka' ? 'ჩატის ისტორია' : language === 'ru' ? 'История чата' : 'Chat History',
    logout: language === 'ka' ? 'გასვლა' : language === 'ru' ? 'Выход' : 'Logout',
    aiAssistant: language === 'ka' ? 'AI სამედიცინო ასისტენტი' : language === 'ru' ? 'ИИ Медицинский Ассистент' : 'AI Medical Assistant',
    aiDescription: language === 'ka' ? 'გამოიყენეთ AI ასისტენტი პაციენტის კითხვებზე პასუხის მოსამზადებლად' : language === 'ru' ? 'Используйте ИИ ассистента для подготовки ответов на вопросы пациентов' : 'Use the AI assistant to prepare answers to patient questions',
    totalQuestions: language === 'ka' ? 'სულ კითხვები' : language === 'ru' ? 'Всего вопросов' : 'Total Questions',
    pending: language === 'ka' ? 'მოლოდინში' : language === 'ru' ? 'В ожидании' : 'Pending',
    answered: language === 'ka' ? 'პასუხგაცემული' : language === 'ru' ? 'Отвечено' : 'Answered',
    today: language === 'ka' ? 'დღეს' : language === 'ru' ? 'Сегодня' : 'Today',
    patientQuestions: language === 'ka' ? 'პაციენტის კითხვები' : language === 'ru' ? 'Вопросы пациентов' : 'Patient Questions',
    manageQuestions: language === 'ka' ? 'მართეთ და უპასუხეთ პაციენტთა შეკითხვებს' : language === 'ru' ? 'Управляйте и отвечайте на вопросы пациентов' : 'Manage and respond to patient inquiries',
    search: language === 'ka' ? 'ძებნა...' : language === 'ru' ? 'Поиск...' : 'Search...',
    all: language === 'ka' ? 'ყველა' : language === 'ru' ? 'Все' : 'All',
    markAsAnswered: language === 'ka' ? 'მონიშნე პასუხგაცემულად' : language === 'ru' ? 'Отметить как отвеченный' : 'Mark as Answered',
    respond: language === 'ka' ? 'პასუხი' : language === 'ru' ? 'Ответить' : 'Respond',
    delete: language === 'ka' ? 'წაშლა' : language === 'ru' ? 'Удалить' : 'Delete',
    details: language === 'ka' ? 'დეტალები' : language === 'ru' ? 'Детали' : 'Details',
    patientQuestion: language === 'ka' ? 'პაციენტის კითხვა' : language === 'ru' ? 'Вопрос пациента' : 'Patient Question',
    aiResponse: language === 'ka' ? 'AI საწყისი პასუხი' : language === 'ru' ? 'Начальный ответ ИИ' : 'AI Initial Response',
    yourResponse: language === 'ka' ? 'თქვენი პასუხი' : language === 'ru' ? 'Ваш ответ' : 'Your Response',
    voiceMessage: language === 'ka' ? 'ხმოვანი შეტყობინება' : language === 'ru' ? 'Голосовое сообщение' : 'Voice Message',
    attachments: language === 'ka' ? 'დანართები' : language === 'ru' ? 'Вложения' : 'Attachments',
    noQuestions: language === 'ka' ? 'კითხვები არ მოიძებნა' : language === 'ru' ? 'Вопросы не найдены' : 'No questions found',
    adjustSearch: language === 'ka' ? 'სცადეთ ძებნის შეცვლა' : language === 'ru' ? 'Попробуйте изменить поиск' : 'Try adjusting your search',
    questionsAppear: language === 'ka' ? 'პაციენტის კითხვები აქ გამოჩნდება' : language === 'ru' ? 'Вопросы пациентов появятся здесь' : 'Patient questions will appear here',
    download: language === 'ka' ? 'ჩამოტვირთვა' : language === 'ru' ? 'Скачать' : 'Download',
    loading: language === 'ka' ? 'იტვირთება...' : language === 'ru' ? 'Загрузка...' : 'Loading admin dashboard...',
    error: language === 'ka' ? 'შეცდომა' : language === 'ru' ? 'Ошибка' : 'Error',
    // Guidelines translations
    guidelinesTitle: language === 'ka' ? 'როგორ ვუპასუხოთ' : language === 'ru' ? 'Как ответить' : 'How to Respond',
    guidelinesSubtitle: language === 'ka' ? 'მიჰყევით ამ ნაბიჯებს' : language === 'ru' ? 'Следуйте этим шагам' : 'Follow these steps',
    step1: language === 'ka' ? 'წაიკითხეთ კითხვა და დანართები' : language === 'ru' ? 'Прочитайте вопрос и вложения' : 'Read the question and attachments',
    step2: language === 'ka' ? 'გამოიყენეთ AI ასისტენტი საჭიროების შემთხვევაში' : language === 'ru' ? 'Используйте ИИ ассистента при необходимости' : 'Ask AI assistant for help if needed',
    step3: language === 'ka' ? 'დააჭირეთ "პასუხი" ღილაკს' : language === 'ru' ? 'Нажмите "Ответить" чтобы открыть форму' : 'Click "Respond" to open the response form',
    step4: language === 'ka' ? 'დაწერეთ ან შეცვალეთ პასუხი' : language === 'ru' ? 'Напишите или отредактируйте ответ' : 'Edit or write your response',
    step5: language === 'ka' ? 'დააჭირეთ "გაგზავნა" პაციენტისთვის გასაგზავნად' : language === 'ru' ? 'Нажмите "Отправить" для отправки пациенту' : 'Click "Send" to email the patient',
  };

  const toggleExpanded = (id: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredQuestions = questions.filter(q => {
    const matchesFilter = filter === 'all' ||
      (filter === 'pending' && !q.answered) ||
      (filter === 'answered' && q.answered);

    const matchesSearch = !searchQuery ||
      q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Stats calculations
  const totalQuestions = questions.length;
  const pendingCount = questions.filter(q => !q.answered).length;
  const answeredCount = questions.filter(q => q.answered).length;

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    navigate('/admin/login');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQuestions();
    setRefreshing(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          const adminSession = localStorage.getItem('admin_session');

          if (!adminSession) {
            navigate('/admin/login');
            return;
          }

          try {
            const session = JSON.parse(adminSession);
            if (!session || !session.isAdmin || !session.user?.email) {
              navigate('/admin/login');
              return;
            }

            const adminEmail = session.user.email.toLowerCase();
            if (adminEmail !== 'futkaradzegiorgi@gmail.com') {
              navigate('/admin/login');
              return;
            }
          } catch (err) {
            navigate('/admin/login');
            return;
          }
        }

        fetchQuestions();
      } catch (err) {
        navigate('/admin/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchQuestions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminSession = localStorage.getItem('admin_session');

      if (!session && !adminSession) {
        navigate('/admin/login');
        return;
      }

      const { data, error } = await supabase
        .from('doctor_questions')
        .select(`
          *,
          attachments:doctor_question_attachments(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch questions: ${error.message}`);
      }

      setQuestions(data || []);
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'Failed to fetch questions. Please try again.');
      if (err.message?.includes('auth') || err.message?.includes('401')) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswered = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('doctor_questions')
        .update({
          answered: !currentStatus,
          answered_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      setQuestions(questions.map(q =>
        q.id === id ? {
          ...q,
          answered: !currentStatus,
          answered_at: !currentStatus ? new Date().toISOString() : null
        } : q
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createEmailHTML = (emailData: {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    originalQuestion: string;
    editedResponse: string;
  }) => {
    const responseHTML = DOMPurify.sanitize(marked(emailData.editedResponse) as string);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Medical Response - Dr. Putkaradze</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
            .header { background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .patient-info { background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #0891b2; }
            .section h3 { color: #0891b2; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
            .response-box { background: #fefefe; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; font-size: 14px; color: #64748b; }
        </style>
    </head>
    <body>
        <div class="header"><h1>Dr. Putkaradze Medical Platform</h1><p>Professional Medical Consultation</p></div>
        <div class="content">
            <div class="patient-info">
                <h3>Patient Information</h3>
                <p><strong>Name:</strong> ${emailData.patientName || 'Not provided'}</p>
                <p><strong>Email:</strong> ${emailData.patientEmail || 'Not provided'}</p>
                ${emailData.patientPhone ? `<p><strong>Phone:</strong> ${emailData.patientPhone}</p>` : ''}
            </div>
            ${emailData.originalQuestion ? `<div class="section"><h3>Your Question</h3><p style="font-style:italic;">${emailData.originalQuestion}</p></div>` : ''}
            <div class="section"><h3>Medical Response</h3><div class="response-box">${responseHTML}</div></div>
        </div>
        <div class="footer"><strong>Dr. Putkaradze Medical Platform</strong><br><em>Generated on ${new Date().toLocaleDateString()}</em></div>
    </body>
    </html>
    `;
  };

  const handleSendResponse = async (questionId: string, response: string) => {
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) throw new Error('Question not found');

      const htmlContent = createEmailHTML({
        patientName: question.name,
        patientEmail: question.email,
        patientPhone: question.phone || '',
        originalQuestion: question.question,
        editedResponse: response
      });

      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: question.name,
          email: question.email,
          phone: question.phone,
          question: question.question,
          response: htmlContent,
          ai_response: question.ai_response,
          isHTML: true
        }),
      });

      const { error: updateError } = await supabase
        .from('doctor_questions')
        .update({
          response,
          answered: true,
          answered_at: new Date().toISOString(),
          response_sent: true,
          response_sent_at: new Date().toISOString()
        })
        .eq('id', questionId);

      if (updateError) throw updateError;

      setQuestions(questions.map(q =>
        q.id === questionId ? {
          ...q,
          response,
          answered: true,
          answered_at: new Date().toISOString(),
          response_sent: true,
          response_sent_at: new Date().toISOString()
        } : q
      ));

      alert('Response sent successfully!');
    } catch (err: any) {
      console.error('Error sending response:', err);
      setError('Failed to send response. Please try again.');
    }
  };

  const getFileIcon = (type: string) => {
    const Icon = type.startsWith('image/') ? ImageIcon :
                 type.includes('pdf') ? FileText : File;
    return <Icon className="w-10 h-10 text-slate-400" />;
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('question-attachments')
        .createSignedUrl(filePath, 60);

      if (error) throw error;
      if (!data?.signedUrl) throw new Error('Failed to generate download URL');

      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download file. Please try again.');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('doctor_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err: any) {
      setError('Failed to delete question. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const openImagePreview = (path: string) => {
    const url = supabase.storage.from('question-attachments').getPublicUrl(path).data.publicUrl;
    setPreviewImage(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Top Accent Line */}
      <div className="fixed top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent z-50">
        <div className="absolute inset-0 bg-cyan-400 blur-sm opacity-50" />
      </div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">{t.back}</span>
              </Link>
              <div className="h-6 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white">{t.adminDashboard}</span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <Link
                to="/admin/chat-history"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all text-sm"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">{t.chatHistory}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* AI Assistant Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            {/* Premium AI Assistant Header */}
            <div className="relative mb-6">
              {/* Subtle glow background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 rounded-2xl blur-xl" />

              <div className="relative flex items-center gap-4 p-4 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                {/* Icon with animated ring */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-xl blur opacity-30 animate-pulse" />
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-lg shadow-emerald-500/50" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{t.aiAssistant}</h2>
                    <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                      24/7
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{t.aiDescription}</p>
                </div>

                {/* Status indicator */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-emerald-400">Online</span>
                </div>
              </div>
            </div>

            {/* Chat Container with premium styling */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-violet-500/10 to-cyan-500/20 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                <ChatBot embedded={true} />
              </div>
            </div>
          </motion.section>

          {/* Stats Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <StatCard icon={Users} label={t.totalQuestions} value={totalQuestions} color="cyan" />
            <StatCard icon={AlertTriangle} label={t.pending} value={pendingCount} color="amber" />
            <StatCard icon={CheckCircle2} label={t.answered} value={answeredCount} color="emerald" />
            <StatCard
              icon={Clock}
              label={t.today}
              value={questions.filter(q => new Date(q.created_at).toDateString() === new Date().toDateString()).length}
              color="rose"
            />
          </motion.section>

          {/* Response Guidelines Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
              {/* Header - Always visible */}
              <button
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-base font-medium text-white">{t.guidelinesTitle}</h2>
                    <p className="text-xs text-slate-500">{t.guidelinesSubtitle}</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showGuidelines ? 'rotate-180' : ''}`} />
              </button>

              {/* Collapsible Content */}
              <AnimatePresence>
                {showGuidelines && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-cyan-400 font-medium">1</span>
                          <span className="text-sm text-slate-300">{t.step1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-cyan-400 font-medium">2</span>
                          <span className="text-sm text-slate-300">{t.step2}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-cyan-400 font-medium">3</span>
                          <span className="text-sm text-slate-300">{t.step3}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-cyan-400 font-medium">4</span>
                          <span className="text-sm text-slate-300">{t.step4}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-cyan-400 font-medium">5</span>
                          <span className="text-sm text-slate-300">{t.step5}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Questions Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{t.patientQuestions}</h2>
                <p className="text-sm text-slate-400">{t.manageQuestions}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 sm:w-48 pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
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
                    <option value="pending">{t.pending}</option>
                    <option value="answered">{t.answered}</option>
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
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-rose-300">{t.error}</p>
                    <p className="text-sm text-rose-200/70">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-300">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Questions List */}
            <div className="space-y-4">
              <AnimatePresence>
                {filteredQuestions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden hover:border-slate-700/50 transition-colors"
                  >
                    <div className="p-5">
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-cyan-400" />
                          </div>

                          {/* Info */}
                          <div>
                            <h3 className="font-semibold text-white mb-1">{question.name}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
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

                        {/* Status & Time */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            question.answered
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {question.answered ? t.answered : t.pending}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(question.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/50">
                        <button
                          onClick={() => toggleAnswered(question.id, question.answered)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            question.answered
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-slate-800/50 text-slate-400 hover:text-white'
                          }`}
                        >
                          {question.answered ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>{question.answered ? t.answered : t.markAsAnswered}</span>
                        </button>

                        <button
                          onClick={() => setSelectedQuestion(question)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{t.respond}</span>
                        </button>

                        <button
                          onClick={() => {
                            setGeneratingPDF(question.id);
                            generatePDF({
                              question,
                              onGenerateStart: () => setGeneratingPDF(question.id),
                              onGenerateComplete: () => setGeneratingPDF(null),
                              onError: (error) => {
                                setError(error);
                                setGeneratingPDF(null);
                              }
                            });
                          }}
                          disabled={generatingPDF === question.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-slate-800/50 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                          {generatingPDF === question.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileDown className="w-4 h-4" />
                          )}
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          disabled={deletingId === question.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                        >
                          {deletingId === question.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          <span>{t.delete}</span>
                        </button>

                        {/* Expand Toggle */}
                        <button
                          onClick={() => toggleExpanded(question.id)}
                          className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
                        >
                          <span>{t.details}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${expandedQuestions.has(question.id) ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedQuestions.has(question.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-4 overflow-hidden"
                          >
                            {/* Patient Question */}
                            <div className="bg-slate-800/30 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-cyan-400 mb-2">{t.patientQuestion}</h4>
                              <p className="text-slate-300">{question.question}</p>
                            </div>

                            {/* AI Response */}
                            {question.ai_response && (
                              <div className="bg-slate-800/30 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-medium text-cyan-400">{t.aiResponse}</h4>
                                  <span className="text-xs text-slate-500">
                                    {new Date(question.ai_response_at!).toLocaleString()}
                                  </span>
                                </div>
                                <div
                                  className="prose prose-invert prose-sm max-w-none text-slate-300"
                                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(question.ai_response) as string) }}
                                />
                              </div>
                            )}

                            {/* Doctor Response */}
                            {question.response && (
                              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-medium text-emerald-400">{t.yourResponse}</h4>
                                  <span className="text-xs text-slate-500">
                                    {new Date(question.response_sent_at!).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-slate-300">{question.response}</p>
                              </div>
                            )}

                            {/* Voice Recording */}
                            {question.voice_recording_path && (
                              <div className="bg-slate-800/30 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-medium text-cyan-400">{t.voiceMessage}</h4>
                                  {question.voice_recording_duration && (
                                    <span className="text-xs text-slate-500">
                                      {question.voice_recording_duration}s
                                    </span>
                                  )}
                                </div>
                                <AudioPlayer
                                  filePath={question.voice_recording_path}
                                  duration={question.voice_recording_duration}
                                  onError={setError}
                                />
                              </div>
                            )}

                            {/* Attachments */}
                            {question.attachments && question.attachments.length > 0 && (
                              <div className="bg-slate-800/30 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-cyan-400 mb-3">{t.attachments}</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                  {question.attachments.map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className="relative group bg-slate-800/50 rounded-lg p-3 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                                    >
                                      {attachment.file_type.startsWith('image/') ? (
                                        <div
                                          className="w-full h-20 overflow-hidden rounded cursor-pointer"
                                          onClick={() => openImagePreview(attachment.file_path)}
                                        >
                                          <img
                                            src={supabase.storage.from('question-attachments').getPublicUrl(attachment.file_path).data.publicUrl}
                                            alt={attachment.file_name}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-full h-20 flex items-center justify-center">
                                          {getFileIcon(attachment.file_type)}
                                        </div>
                                      )}
                                      <button
                                        onClick={() => handleDownload(attachment.file_path, attachment.file_name)}
                                        className="absolute -top-2 -right-2 w-7 h-7 bg-cyan-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                      <p className="mt-2 text-xs text-slate-400 truncate">{attachment.file_name}</p>
                                      <p className="text-xs text-slate-500">{(attachment.file_size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty State */}
              {filteredQuestions.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400">{t.noQuestions}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {searchQuery ? t.adjustSearch : t.questionsAppear}
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </main>

      {/* Response Modal */}
      {selectedQuestion && (
        <ResponseForm
          question={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          onSubmit={async (response) => {
            await handleSendResponse(selectedQuestion.id, response);
            setSelectedQuestion(null);
          }}
        />
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full"
            >
              <button
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                onClick={() => setPreviewImage(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={previewImage}
                alt="Attachment preview"
                className="max-w-full max-h-[80vh] object-contain rounded-lg mx-auto"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const a = document.createElement('a');
                    a.href = previewImage;
                    a.download = `attachment-${Date.now()}.jpg`;
                    a.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.download}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

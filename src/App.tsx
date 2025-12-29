import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Calendar, Phone, Mail, Clock, MapPin, Award, Heart, Users, Activity, Building2, Bone, Stethoscope, Pill, Syringe } from 'lucide-react';
import { motion } from 'framer-motion';
import { LampContainer } from './components/ui/lamp';
import { Header } from './components/Header';
import { useEffect } from 'react';
import { AskDoctor } from './pages/AskDoctor';
import { Admin } from './pages/Admin';
import { AdminLogin } from './pages/AdminLogin';
import { ChatHistory } from './pages/ChatHistory';
import { Education } from './pages/Education';
import { useLanguage } from './contexts/LanguageContext';
import { useLocation } from 'react-router-dom';
// 🎨 Stagewise Toolbar Integration - Visual vibe coding
import { initToolbar } from '@stagewise/toolbar';

// Premium Stats Section Component with Animated Counter
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = React.useState(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function PremiumStat({
  icon: Icon,
  number,
  text,
  delay = 0,
  accentColor = 'cyan'
}: {
  icon: React.ElementType;
  number: string;
  text: string;
  delay?: number;
  accentColor?: 'cyan' | 'teal' | 'blue' | 'emerald';
}) {
  // Parse the number for animation
  const numericValue = parseInt(number.replace(/[^0-9]/g, ''));
  const suffix = number.includes('+') ? '+' : '';

  const colorClasses = {
    cyan: {
      iconBg: 'from-cyan-500/20 to-cyan-400/5',
      iconBorder: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      glowColor: 'group-hover:shadow-cyan-500/20',
      ringColor: 'stroke-cyan-400',
      accentLine: 'from-cyan-500 to-cyan-400'
    },
    teal: {
      iconBg: 'from-teal-500/20 to-teal-400/5',
      iconBorder: 'border-teal-500/30',
      iconColor: 'text-teal-400',
      glowColor: 'group-hover:shadow-teal-500/20',
      ringColor: 'stroke-teal-400',
      accentLine: 'from-teal-500 to-teal-400'
    },
    blue: {
      iconBg: 'from-blue-500/20 to-blue-400/5',
      iconBorder: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      glowColor: 'group-hover:shadow-blue-500/20',
      ringColor: 'stroke-blue-400',
      accentLine: 'from-blue-500 to-blue-400'
    },
    emerald: {
      iconBg: 'from-emerald-500/20 to-emerald-400/5',
      iconBorder: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      glowColor: 'group-hover:shadow-emerald-500/20',
      ringColor: 'stroke-emerald-400',
      accentLine: 'from-emerald-500 to-emerald-400'
    }
  };

  const colors = colorClasses[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      viewport={{ once: true }}
      className="group relative h-full"
    >
      {/* Card Container */}
      <div className={`relative flex flex-col items-center p-8 rounded-2xl h-full
        bg-gradient-to-b from-slate-800/60 to-slate-900/80
        backdrop-blur-xl border border-slate-700/50
        transition-all duration-500 ease-out
        hover:border-slate-600/80 hover:shadow-2xl ${colors.glowColor}
        overflow-hidden`}
      >
        {/* Decorative corner accent */}
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${colors.iconBg} rounded-bl-full opacity-50`} />

        {/* Animated ring behind icon */}
        <div className="relative mb-5">
          {/* Outer rotating ring */}
          <svg className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              className={`${colors.ringColor} opacity-20`}
              strokeWidth="1"
              strokeDasharray="8 12"
            />
          </svg>

          {/* Icon container */}
          <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${colors.iconBg}
            border ${colors.iconBorder} flex items-center justify-center
            transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
          >
            <Icon className={`w-7 h-7 ${colors.iconColor}`} />
          </div>
        </div>

        {/* Number with animation */}
        <h3 className="font-display text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          <AnimatedCounter target={numericValue} suffix={suffix} />
        </h3>

        {/* Accent line */}
        <div className={`w-12 h-0.5 bg-gradient-to-r ${colors.accentLine} rounded-full mb-4
          transition-all duration-500 group-hover:w-20`}
        />

        {/* Description */}
        <p className="text-slate-300 text-center text-sm md:text-base leading-relaxed georgian-text max-w-[200px]">
          {text}
        </p>

        {/* Bottom glow effect on hover */}
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px
          bg-gradient-to-r from-transparent ${colors.accentLine.replace('from-', 'via-').replace('to-', 'to-')} to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />
      </div>
    </motion.div>
  );
}

function ContactInfo({ icon: Icon, text, link }: { icon: React.ElementType; text: string; link?: string }) {
  const content = (
    <>
      <Icon className="w-5 h-5 text-cyan-400 mr-2 group-hover:text-cyan-300 transition-colors" />
      <span className="text-dark-100">{text}</span>
    </>
  );

  return (
    <div className="flex items-center mb-4">
      {link ? (
        <a href={link} className="flex items-center hover:text-cyan-300 transition-colors group">
          {content}
        </a>
      ) : (
        <div className="group">
          {content}
        </div>
      )}
    </div>
  );
}

function Home() {
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a hash in the URL
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  return (
    <>
      {/* Hero Section */}
      <LampContainer>
        <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-8 md:gap-12 items-center w-full">
          <div className="space-y-6 pt-8 md:pt-12 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-brutalist uppercase"
            >
              {t('hero.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="font-mono text-xl md:text-2xl text-brand-100/90 leading-relaxed max-w-xl tracking-tight"
            >
              {t('hero.subtitle')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.7,
                duration: 0.8,
                ease: "easeInOut",
              }}
            >
              <a
                href="#contact"
                className="font-mono inline-flex items-center px-10 py-5 text-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 relative overflow-hidden group uppercase tracking-ultra"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/50 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                {t('hero.cta')}
                <div className="absolute inset-0 bg-gradient-radial from-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </a>
            </motion.div>
          </div>
          <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.5,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="relative flex justify-center md:justify-end h-[500px] md:h-[600px] w-full overflow-visible"
            >
              <img
                src="/doctor-putkaradze.jpg"
                alt={t('hero.title')}
                className="h-full w-auto max-w-none object-contain object-right scale-125 md:translate-x-12 -translate-y-16 md:-translate-y-24"
              />
            </motion.div>
        </div>
      </LampContainer>

      {/* Premium Stats Section */}
      <div id="about" className="relative -mt-12">
        {/* Multi-layer background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/90 to-slate-900"></div>
        <div className="absolute inset-0 bg-slate-900/80 translate-y-16"></div>

        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="relative py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-cyan-400 text-sm font-medium uppercase tracking-widest mb-3">
                {t('nav.about')}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {t('about.sectionTitle')}
              </h2>
              <div className="mt-4 mx-auto w-24 h-1 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full" />
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <PremiumStat
                icon={Users}
                number={t('stats.childbirths.number')}
                text={t('stats.childbirths.text')}
                delay={0}
                accentColor="cyan"
              />
              <PremiumStat
                icon={Activity}
                number={t('stats.complications.number')}
                text={t('stats.complications.text')}
                delay={0.1}
                accentColor="teal"
              />
              <PremiumStat
                icon={Award}
                number={t('stats.surgeries.number')}
                text={t('stats.surgeries.text')}
                delay={0.2}
                accentColor="blue"
              />
              <PremiumStat
                icon={Heart}
                number={t('stats.experience.number')}
                text={t('stats.experience.text')}
                delay={0.3}
                accentColor="emerald"
              />
            </div>

            {/* Trust indicators row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-16 flex flex-wrap justify-center items-center gap-8 text-slate-400 text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t('about.certifiedSpecialist')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>{t('about.aoMethodology')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span>{t('about.internationalStandards')}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expert Services Section - Premium Design */}
      <div id="services" className="py-24 md:py-32 bg-dark-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[80px]" />

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322d3ee' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Top border with glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium tracking-wide">{t('nav.services')}</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight georgian-text">
              {t('expertise.title')}
            </h2>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-500/50" />
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-cyan-500/50" />
            </div>

            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto georgian-text">
              {t('expertise.subtitle')}
            </p>
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: t('expertise.services.obstetrics.title'),
                description: t('expertise.services.obstetrics.description'),
                icon: Bone,
                gradient: 'from-cyan-500 to-cyan-400',
                glowColor: 'cyan',
              },
              {
                title: t('expertise.services.surgery.title'),
                description: t('expertise.services.surgery.description'),
                icon: Activity,
                gradient: 'from-teal-500 to-teal-400',
                glowColor: 'teal',
              },
              {
                title: t('expertise.services.health.title'),
                description: t('expertise.services.health.description'),
                icon: Syringe,
                gradient: 'from-cyan-400 to-teal-400',
                glowColor: 'cyan',
              },
              {
                title: t('expertise.services.additional.title'),
                description: t('expertise.services.additional.description'),
                icon: Pill,
                gradient: 'from-teal-400 to-cyan-400',
                glowColor: 'teal',
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative h-full bg-gradient-to-b from-slate-800/60 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-7 overflow-hidden transition-all duration-500 hover:border-cyan-500/30 hover:shadow-[0_0_40px_-12px_rgba(34,211,238,0.3)]">
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icon container */}
                  <div className="relative mb-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} p-[1px] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      <div className="w-full h-full rounded-xl bg-slate-900/90 flex items-center justify-center backdrop-blur-sm">
                        <service.icon className="w-6 h-6 text-cyan-400" />
                      </div>
                    </div>

                    {/* Icon glow */}
                    <div className={`absolute inset-0 w-14 h-14 rounded-xl bg-${service.glowColor}-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  </div>

                  {/* Content */}
                  <h3 className="relative text-xl font-semibold text-white mb-3 georgian-text group-hover:text-cyan-50 transition-colors">
                    {service.title}
                  </h3>
                  <p className="relative text-slate-400 leading-relaxed georgian-text group-hover:text-slate-300 transition-colors">
                    {service.description}
                  </p>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${service.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom trust indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 flex justify-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-800/50 border border-slate-700/50">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-slate-400 text-sm georgian-text">AO სერტიფიცირებული მეთოდოლოგია • საერთაშორისო სტანდარტები</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contact Section - Premium Design */}
      <div id="contact" className="py-24 md:py-32 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-slate-900/95 to-dark-900" />

        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px]" />

          {/* Floating dots */}
          <div className="absolute top-20 right-1/4 w-1 h-1 bg-cyan-400/60 rounded-full" />
          <div className="absolute top-40 left-1/3 w-1.5 h-1.5 bg-teal-400/40 rounded-full" />
          <div className="absolute bottom-32 right-1/3 w-1 h-1 bg-cyan-400/50 rounded-full" />
        </div>

        {/* Top border with glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Phone className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium tracking-wide">{t('nav.contact')}</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight georgian-text">
              {t('contact.title')}
            </h2>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-500/50" />
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-cyan-500/50" />
            </div>

            <p className="text-lg text-slate-400 leading-relaxed georgian-text">
              {t('contact.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Contact Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="relative h-full bg-gradient-to-b from-slate-800/60 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-7 overflow-hidden transition-all duration-500 hover:border-cyan-500/30">
                {/* Card top accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500" />

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <h3 className="relative text-lg font-semibold text-white mb-6 georgian-text flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent rounded-full" />
                  {t('contact.getInTouch')}
                </h3>

                <div className="relative space-y-4">
                  {/* Phone */}
                  <a
                    href={`tel:${t('contact.phone').replace(/\s/g, '')}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:border-cyan-500/40 hover:bg-slate-800/70 transition-all duration-300 group/item"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-400 p-[1px] transition-transform duration-300 group-hover/item:scale-110">
                      <div className="w-full h-full rounded-xl bg-slate-900/90 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-cyan-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 georgian-text">{t('contact.mobile')}</p>
                      <p className="text-white font-medium text-lg">{t('contact.phone')}</p>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:${t('contact.email')}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:border-cyan-500/40 hover:bg-slate-800/70 transition-all duration-300 group/item"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 p-[1px] transition-transform duration-300 group-hover/item:scale-110">
                      <div className="w-full h-full rounded-xl bg-slate-900/90 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-teal-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Email</p>
                      <p className="text-white font-medium">{t('contact.email')}</p>
                    </div>
                  </a>

                  {/* Working Hours */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 group/item">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-400 p-[1px]">
                      <div className="w-full h-full rounded-xl bg-slate-900/90 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-cyan-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1 georgian-text">{t('contact.hours')}</p>
                      <p className="text-white font-medium georgian-text">{t('contact.appointments')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Current Workplaces Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="relative h-full bg-gradient-to-b from-slate-800/60 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-7 overflow-hidden transition-all duration-500 hover:border-cyan-500/30">
                {/* Card top accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500" />

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <h3 className="relative text-lg font-semibold text-white mb-6 georgian-text flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-gradient-to-r from-teal-500 to-transparent rounded-full" />
                  {t('contact.currentWorkplaces')}
                </h3>

                <div className="relative space-y-4">
                  {/* Clinic 1 */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/70 to-slate-800/50 border border-slate-700/30 hover:border-cyan-500/30 transition-all duration-300 group/clinic">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover/clinic:scale-105">
                        <Building2 className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium mb-2 georgian-text">
                          {t('contact.clinics.openHeart')}
                        </h4>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <MapPin className="w-4 h-4 text-cyan-400/70" />
                          <span>ბათუმი, საქართველო</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clinic 2 */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/70 to-slate-800/50 border border-slate-700/30 hover:border-teal-500/30 transition-all duration-300 group/clinic">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/30 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover/clinic:scale-105">
                        <Building2 className="w-5 h-5 text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium mb-2 georgian-text">
                          {t('contact.clinics.barbara')}
                        </h4>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <MapPin className="w-4 h-4 text-teal-400/70" />
                          <span>ქუთაისი, საქართველო</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <a
                  href="#"
                  className="mt-6 flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-white font-semibold hover:from-cyan-400 hover:to-teal-300 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 group/btn georgian-text relative overflow-hidden"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  <Calendar className="w-5 h-5" />
                  <span>ვიზიტის დაჯავშნა</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Bottom decorative element */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 flex justify-center"
          >
            <div className="flex items-center gap-4 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="georgian-text">ხელმისაწვდომი კონსულტაციისთვის</span>
              </div>
              <span className="text-slate-700">•</span>
              <span className="georgian-text">პასუხი 24 საათში</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-dark-200">{t('footer.copyright')}</p>
        </div>
      </footer>
    </>
  );
}

function App() {
  // 🚀 Initialize stagewise toolbar for development
  useEffect(() => {
    // Only initialize in development mode and prevent double initialization
    if (process.env.NODE_ENV === 'development') {
      // Check if stagewise is already initialized to prevent double initialization in React StrictMode
      const existingAnchor = document.querySelector('[data-stagewise-anchor]');
      if (existingAnchor) {
        console.log('🎨 Stagewise toolbar already initialized, skipping...');
        return;
      }

      // Enhanced configuration for medical platform
      const stagewiseConfig = {
        plugins: [],
        projectName: 'Dr. Khoshtaria Medical Platform',
        theme: 'dark',
        componentDetection: {
          reactComponents: true,
          customSelectors: [
            '[data-medical-component]',
            '.medical-form',
            '.patient-info', 
            '.chat-interface',
            '.file-upload',
            '.admin-panel',
            '.education-content'
          ]
        },
        contextEnhancement: {
          includeMedicalContext: true,
          includeFormStates: true,
          includeA11yAttributes: true
        },
        screenshot: {
          quality: 0.9,
          format: 'png',
          scale: 2
        }
      };
      
      try {
        initToolbar(stagewiseConfig);
        console.log('🎨 Stagewise toolbar initialized - Visual vibe coding enabled!');
        console.log('📋 Medical platform features: Form states, A11y attributes, High-res screenshots');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('companion anchor already exists')) {
          console.log('🎨 Stagewise toolbar already exists, continuing...');
        } else {
          console.error('❌ Stagewise initialization error:', error);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-white pt-16">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/ask" element={<AskDoctor />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/chat-history" element={<ChatHistory />} />
        <Route path="/education" element={<Education />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
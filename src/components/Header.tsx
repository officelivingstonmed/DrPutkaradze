import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, Menu, X, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function Header() {
  const { language, setLanguage } = useLanguage();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const location = useLocation();

  // Track scroll for header styling
  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'ka', label: 'ქართული', short: 'KA' },
    { code: 'ru', label: 'Русский', short: 'RU' },
  ] as const;

  const navItems = [
    { href: '/#about', label: () => t('nav.about') },
    { href: '/gallery', label: () => t('nav.gallery') },
    { href: '/#services', label: () => t('nav.services') },
    { href: '/education', label: () => t('nav.education') },
    { href: '/ask', label: () => t('nav.askDoctor') },
    { href: '#contact', label: () => t('nav.contact') }
  ];

  const isActiveRoute = (href: string) => {
    if (href.startsWith('/#')) return location.pathname === '/' && location.hash === href.substring(1);
    if (href.startsWith('#')) return location.hash === href;
    return location.pathname === href;
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled
            ? 'bg-dark-900/95 backdrop-blur-xl shadow-2xl shadow-black/20'
            : 'bg-dark-900/80 backdrop-blur-md'
        }`}
      >
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 lg:h-20">

            {/* Logo Section */}
            <Link
              to="/"
              className="group flex items-center gap-3 shrink-0"
            >
              {/* Medical Cross Icon */}
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-[2px] bg-dark-900 rounded-[6px]" />
                <svg
                  className="relative w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
              </div>

              {/* Logo Text */}
              <div className="flex flex-col">
                <span className="text-xs text-cyan-400/80 font-medium tracking-[0.2em] uppercase leading-none">
                  {language === 'ka' ? 'ექიმი' : language === 'ru' ? 'доктор' : 'Dr.'}
                </span>
                <span className="text-xl font-semibold text-white tracking-wide group-hover:text-cyan-50 transition-colors duration-300 leading-tight">
                  {language === 'ka' ? 'ფუტკარაძე' : language === 'ru' ? 'Путкарадзе' : 'Putkaradze'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center h-full">
              <ul className="flex items-center gap-1 h-full">
                {navItems.map((item, index) => (
                  <li key={item.href} className="flex items-center h-full">
                    <Link
                      to={item.href}
                      className={`relative flex items-center px-3 xl:px-4 h-10 text-[15px] font-medium transition-all duration-300 rounded-lg group ${
                        isActiveRoute(item.href)
                          ? 'text-cyan-300'
                          : 'text-dark-100 hover:text-white'
                      }`}
                    >
                      {/* Hover background */}
                      <span className="absolute inset-0 bg-white/[0.03] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Text */}
                      <span className="relative whitespace-nowrap">{item.label()}</span>

                      {/* Active/Hover underline */}
                      <span
                        className={`absolute bottom-1.5 left-3 right-3 xl:left-4 xl:right-4 h-[2px] bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full transition-all duration-300 ${
                          isActiveRoute(item.href)
                            ? 'opacity-100 scale-x-100'
                            : 'opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-100'
                        }`}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right Section: Language + Admin */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Language Selector */}
              <div className="relative flex items-center">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className={`flex items-center gap-2 px-3 h-10 rounded-lg text-base font-medium transition-all duration-300 border ${
                    isLangMenuOpen
                      ? 'bg-dark-800 border-cyan-500/30 text-cyan-300'
                      : 'bg-dark-800/50 border-dark-700/50 text-dark-100 hover:border-dark-600 hover:text-white'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="hidden sm:inline">{languages.find(l => l.code === language)?.short}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Language Dropdown */}
                <div
                  className={`absolute top-full right-0 mt-2 w-44 rounded-xl overflow-hidden shadow-xl shadow-black/30 border border-dark-700/50 bg-dark-800/98 backdrop-blur-xl transform transition-all duration-300 origin-top-right z-[110] ${
                    isLangMenuOpen
                      ? 'opacity-100 visible scale-100 translate-y-0'
                      : 'opacity-0 invisible scale-95 -translate-y-2'
                  }`}
                >
                  <div className="py-1.5" role="menu">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-4 py-2.5 text-base transition-all duration-200 ${
                          language === lang.code
                            ? 'bg-cyan-500/10 text-cyan-300'
                            : 'text-dark-100 hover:bg-white/5 hover:text-white'
                        }`}
                        role="menuitem"
                      >
                        <span>{lang.label}</span>
                        {language === lang.code && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Backdrop */}
                {isLangMenuOpen && (
                  <div
                    className="fixed inset-0 z-[105]"
                    onClick={() => setIsLangMenuOpen(false)}
                  />
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-dark-100 hover:text-white hover:bg-white/5 transition-all duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <div className="relative w-6 h-6">
                  <Menu className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
                  <X className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
                </div>
              </button>

              {/* Admin Portal - Desktop */}
              <Link
                to="/admin/login"
                className="hidden sm:flex items-center gap-2 px-4 h-10 rounded-lg text-base font-medium text-dark-200 hover:text-white bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/50 hover:border-dark-600 transition-all duration-300"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom border gradient */}
        <div className={`absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-50'}`}>
          <div className="h-full bg-gradient-to-r from-transparent via-dark-700 to-transparent" />
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-[72px] left-0 right-0 z-[99] lg:hidden transition-all duration-500 ease-out ${
          isMenuOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-4'
        }`}
      >
        <div className="mx-4 mt-2 bg-dark-800/98 backdrop-blur-xl rounded-2xl border border-dark-700/50 shadow-2xl shadow-black/30 overflow-hidden">
          <nav className="p-2">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-300 ${
                  isActiveRoute(item.href)
                    ? 'bg-cyan-500/10 text-cyan-300'
                    : 'text-dark-100 hover:bg-white/5 hover:text-white'
                }`}
                style={{
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
                  transform: isMenuOpen ? 'translateX(0)' : 'translateX(-10px)',
                  opacity: isMenuOpen ? 1 : 0
                }}
              >
                {isActiveRoute(item.href) && (
                  <span className="w-1 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-500" />
                )}
                <span>{item.label()}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Admin Link */}
          <div className="p-2 pt-0 border-t border-dark-700/30 mt-1">
            <Link
              to="/admin/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-dark-200 hover:text-white bg-dark-900/50 hover:bg-dark-900 transition-all duration-300"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation, useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Globe, User, PlusCircle } from 'lucide-react';
import clsx from 'clsx';
import * as api from '../services/api';

const Navbar = () => {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({ name: 'Citizen Platform', nameTamil: 'குடிமக்கள் தளம்' });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.getConfig();
        setConfig(res);
      } catch (err) {
        console.error("Failed to load config", err);
      }
    };
    fetchConfig();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.dashboard'), path: '/dashboard' },
    { name: t('nav.myComplaints'), path: '/my-complaints' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={clsx(
      "sticky top-0 z-50 transition-all duration-300 border-b border-gray-100",
      scrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-2" : "bg-white py-3"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3">
              <div className="w-9 h-9 bg-civic-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
                C
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-gray-900 leading-tight">
                  {language === 'ta' 
                    ? (config.constituencyNameTamil || config.nameTamil || 'மாதிரி தொகுதி') 
                    : (config.constituencyName || config.name || 'Model Constituency')}
                </span>
                <span className="text-xs text-gray-500 font-medium">Citizen Portal</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  "px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200",
                  isActive(link.path) 
                    ? "text-civic-600 bg-civic-50/80" 
                    : "text-gray-600 hover:text-civic-700 hover:bg-gray-50"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-civic-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors"
            >
              <Globe size={16} />
              {language === 'en' ? 'தமிழ்' : 'EN'}
            </button>

            {user ? (
              <div className="flex items-center gap-4 pl-2">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                  <User size={16} className="text-civic-500" />
                  {user.name || user.full_name}
                </span>
                {isAdmin && (
                  <Link to="/admin" className="text-sm text-civic-600 hover:text-civic-800 font-bold transition-colors">
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-2">
                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-civic-600 transition-colors px-2">
                  {t('nav.login')}
                </Link>
              </div>
            )}
            
            <Link 
              to="/report" 
              className="ml-2 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-civic-600 hover:bg-civic-700 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <PlusCircle size={18} />
              {t('nav.reportIssue')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold text-gray-600"
            >
              {language === 'en' ? 'த' : 'EN'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={clsx(
        "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-gray-100 bg-white",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-transparent"
      )}>
        <div className="px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={clsx(
                "block px-4 py-3 rounded-lg text-base font-semibold transition-colors",
                isActive(link.path) 
                  ? "text-civic-700 bg-civic-50" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="h-px bg-gray-100 my-4"></div>
          
          {user ? (
            <div className="space-y-3">
              <div className="px-4 py-2 flex items-center gap-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-civic-100 rounded-full flex items-center justify-center text-civic-600">
                  <User size={16} />
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {user.name || user.full_name}
                </div>
              </div>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block px-4 py-3 rounded-lg text-base font-semibold text-civic-700 hover:bg-civic-50"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="block w-full text-left px-4 py-3 rounded-lg text-base font-semibold text-red-600 hover:bg-red-50"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center justify-center px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                {t('nav.login')}
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center justify-center px-4 py-2.5 border-2 border-civic-600 rounded-lg text-sm font-bold text-civic-600 hover:bg-civic-50"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
          
          <Link 
            to="/report" 
            onClick={() => setIsOpen(false)}
            className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-3.5 text-base font-bold text-white bg-civic-600 hover:bg-civic-700 rounded-lg shadow-sm"
          >
            <PlusCircle size={20} />
            {t('nav.reportIssue')}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

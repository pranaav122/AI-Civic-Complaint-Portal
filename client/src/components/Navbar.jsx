import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation, useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Globe, User } from 'lucide-react';
import clsx from 'clsx';
import * as api from '../services/api';

const Navbar = () => {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({ name: 'Citizen Platform', nameTamil: 'குடிமக்கள் தளம்' });

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
  }, []);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.reportIssue'), path: '/report' },
    { name: t('nav.myComplaints'), path: '/my-complaints' },
    { name: t('nav.schemeFinder'), path: '/schemes' },
    { name: t('nav.dashboard'), path: '/dashboard' },
    { name: t('nav.help'), path: '/help' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-civic-600 rounded-md flex items-center justify-center text-white font-bold text-xl">
                C
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">
                {language === 'ta' 
                  ? (config.constituencyNameTamil || config.nameTamil || 'மாதிரி தொகுதி') 
                  : (config.constituencyName || config.name || 'Model Constituency')}
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(link.path) 
                    ? "text-civic-600 bg-civic-50" 
                    : "text-gray-600 hover:text-civic-600 hover:bg-gray-50"
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
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-civic-600"
            >
              <Globe size={16} />
              {language === 'en' ? 'தமிழ்' : 'English'}
            </button>

            {user ? (
              <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User size={16} className="text-civic-500" />
                  {user.name || user.full_name}
                </span>
                {isAdmin && (
                  <Link to="/admin" className="text-sm text-civic-600 hover:underline font-medium">
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-civic-600">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-civic-600 hover:bg-civic-700 rounded-md transition-colors">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleLanguage}
              className="mr-4 text-sm font-medium text-gray-600"
            >
              {language === 'en' ? 'தமிழ்' : 'EN'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  isActive(link.path) 
                    ? "text-civic-600 bg-civic-50" 
                    : "text-gray-700 hover:text-civic-600 hover:bg-gray-50"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <div className="px-3 py-2 text-sm font-medium text-gray-500">
                  Signed in as {user.name}
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-civic-600 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 p-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center px-4 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white">
                  {t('nav.login')}
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="w-full text-center px-4 py-2 rounded-md text-base font-medium text-white bg-civic-600">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

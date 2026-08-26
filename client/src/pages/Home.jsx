import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import * as api from '../services/api';
import StatsCard from '../components/StatsCard';
import { 
  ArrowRight, FileText, Activity, CheckCircle, 
  Clock, Construction, Droplets, Trash2, 
  Zap, Truck, Building2, HelpCircle, Loader2, 
  TrendingUp, Sparkles, ShieldCheck, Search
} from 'lucide-react';

const CATEGORIES = [
  { id: 'roads', icon: Construction, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'water', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'drainage', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'sanitation', icon: Trash2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'streetlights', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { id: 'transport', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'infrastructure', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'other', icon: HelpCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
];

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getPublicAnalytics();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/report?category=${categoryId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 text-white py-16 lg:py-24 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-sm font-medium mb-6">
            <Sparkles size={16} className="text-yellow-300 shrink-0" />
            <span>AI-Assisted Citizen Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            {t('hero.tagline')}
          </h1>
          <p className="text-lg sm:text-xl text-blue-100/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link 
              to="/report" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-semibold text-base shadow-lg shadow-blue-950/20 hover:shadow-xl transition-all duration-200"
            >
              <FileText size={20} className="shrink-0 text-blue-600" />
              <span>{t('hero.reportBtn')}</span>
            </Link>
            <Link 
              to="/my-complaints" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-sm px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200"
            >
              <Search size={20} className="shrink-0 text-blue-200" />
              <span>{t('hero.trackBtn')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            {t('common.reportIssueCategory')}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Select a service area to immediately file a problem for automated routing.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map(({ id, icon: Icon, color, bg }) => (
            <button
              key={id}
              onClick={() => handleCategoryClick(id)}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer"
            >
              <div className={`w-16 h-16 ${bg} ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-sm shrink-0`}>
                <Icon size={28} className="shrink-0" />
              </div>
              <span className="font-semibold text-gray-800 group-hover:text-blue-600 text-sm sm:text-base transition-colors line-clamp-1">
                {t(`categories.${id}`)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100 w-full">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {t('help.howItWorks')}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
              Our 4-step streamlined process guarantees direct government department accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                step: '01', 
                icon: FileText, 
                title: 'Describe Your Issue', 
                desc: 'Submit text, voice notes, or photos in English, Tamil, or mixed language.',
                color: 'text-blue-600',
                bg: 'bg-blue-50'
              },
              { 
                step: '02', 
                icon: Sparkles, 
                title: 'AI Analyzes & Routes', 
                desc: 'Smart system assigns department, priority, and coordinates automatically.',
                color: 'text-indigo-600',
                bg: 'bg-indigo-50'
              },
              { 
                step: '03', 
                icon: Construction, 
                title: 'Department Action', 
                desc: 'Municipal staff receives the ticket and dispatches field resolution teams.',
                color: 'text-amber-600',
                bg: 'bg-amber-50'
              },
              { 
                step: '04', 
                icon: ShieldCheck, 
                title: 'Track & Verify', 
                desc: 'Receive progress notifications and confirm final resolution satisfaction.',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50'
              },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="relative bg-slate-50/70 p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center hover:bg-slate-50 transition-colors"
              >
                <div className="absolute top-4 right-4 text-xs font-extrabold text-gray-300">
                  {item.step}
                </div>
                <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-5 shadow-sm shrink-0`}>
                  <item.icon size={26} className="shrink-0" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="text-blue-600 shrink-0" size={28} />
              <span>{t('dashboard.title')}</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Real-time resolution metrics across all wards.</p>
          </div>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-sm hover:underline transition-all"
          >
            <span>{t('common.viewAll')}</span>
            <ArrowRight size={16} className="shrink-0" />
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-36 bg-white rounded-2xl border border-gray-100">
            <Loader2 className="animate-spin text-blue-600 shrink-0" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard 
              title={t('dashboard.totalComplaints')} 
              value={stats?.total || 0} 
              icon={FileText} 
              color="blue" 
            />
            <StatsCard 
              title={t('dashboard.resolved')} 
              value={stats?.resolved || 0} 
              icon={CheckCircle} 
              color="green" 
            />
            <StatsCard 
              title={t('dashboard.resolutionRate')} 
              value={`${stats?.resolutionRate || 0}%`} 
              icon={TrendingUp} 
              color="indigo" 
            />
            <StatsCard 
              title={t('dashboard.avgTime')} 
              value={`${stats?.avgResolutionDays || stats?.avgResolutionHours ? Math.round((stats.avgResolutionHours || 0)/24) : 0} ${t('common.days')}`} 
              icon={Clock} 
              color="purple" 
            />
          </div>
        )}
      </section>

    </div>
  );
}

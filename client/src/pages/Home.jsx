import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import * as api from '../services/api';
import StatsCard from '../components/StatsCard';
import { 
  ArrowRight, FileText, Activity, MapPin, 
  CheckCircle, Clock, Construction, Droplets, 
  TrashIcon, Zap, Truck, Building2, HelpCircle, Loader2, TrendingUp 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'roads', icon: Construction },
  { id: 'water', icon: Droplets },
  { id: 'drainage', icon: Droplets },
  { id: 'sanitation', icon: TrashIcon },
  { id: 'streetlights', icon: Zap },
  { id: 'transport', icon: Truck },
  { id: 'infrastructure', icon: Building2 },
  { id: 'other', icon: HelpCircle },
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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('hero.tagline')}</h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/report" 
              className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-full font-semibold text-lg flex items-center justify-center transition-colors"
            >
              <FileText className="mr-2" size={20} />
              {t('hero.reportBtn')}
            </Link>
            <Link 
              to="/complaints" 
              className="bg-blue-700/50 hover:bg-blue-700/70 text-white border border-blue-400 px-8 py-3 rounded-full font-semibold text-lg flex items-center justify-center transition-colors"
            >
              <Activity className="mr-2" size={20} />
              {t('hero.trackBtn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
            {t('common.reportIssueCategory')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CATEGORIES.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleCategoryClick(id)}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-center group"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Icon size={32} className="text-blue-600" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-blue-600">
                  {t(`categories.${id}`)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t('help.howItWorks')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: FileText, title: '1. Describe Your Issue', desc: 'Use voice, text or photos to explain the problem in English or Tamil.' },
              { icon: Activity, title: '2. AI Analyzes & Routes', desc: 'Our smart system identifies the correct department and sets priority automatically.' },
              { icon: Construction, title: '3. Department Takes Action', desc: 'The relevant authority receives the issue and begins working on a resolution.' },
              { icon: CheckCircle, title: '4. Track & Verify', desc: 'Track progress and verify if the work was completed satisfactorily.' },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 transform rotate-3">
                  <step.icon size={40} className="text-indigo-600 -rotate-3" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <Activity className="mr-3 text-blue-600" />
              {t('dashboard.title')}
            </h2>
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              {t('common.viewAll')} <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                value={`${stats?.avgResolutionDays || 0} ${t('common.days')}`} 
                icon={Clock} 
                color="purple" 
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

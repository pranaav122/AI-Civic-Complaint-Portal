import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, useLanguage } from '../i18n/LanguageContext';
import * as api from '../services/api';
import { 
  ArrowRight, FileText, Search, BookOpen, ShieldCheck, 
  MapPin, Loader2, Zap, Droplets, Trash2, Truck, 
  Building2, HelpCircle, Construction, CheckCircle, Activity
} from 'lucide-react';
import clsx from 'clsx';

import { ServiceGrid } from '../components/ui/service-grid';

const CATEGORIES = [
  { id: 'roads', imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=320&q=75&auto=format&fit=crop' },
  { id: 'water', imageUrl: 'https://images.unsplash.com/photo-1548222606-6c4f58ea1fdb?w=320&q=75&auto=format&fit=crop' },
  { id: 'sanitation', imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=320&q=75&auto=format&fit=crop' },
  { id: 'streetlights', imageUrl: 'https://images.unsplash.com/photo-1512403754473-27835f7b9984?w=320&q=75&auto=format&fit=crop' },
  { id: 'drainage', imageUrl: 'https://images.unsplash.com/photo-1515516089376-88db1e26e9c0?w=320&q=75&auto=format&fit=crop' },
  { id: 'transport', imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=320&q=75&auto=format&fit=crop' },
];

export default function Home() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, complaintsData] = await Promise.all([
          api.getPublicAnalytics(),
          api.getComplaints({ limit: 3 })
        ]);
        setStats(statsData);
        setRecentComplaints(complaintsData.data || []);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/report?category=${categoryId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfbf9] text-slate-800 font-sans selection:bg-civic-200 selection:text-civic-900">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-28 lg:pb-32 px-4 sm:px-6 overflow-hidden border-b border-gray-200">
        {/* Abstract map background pattern using SVG */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.15]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h80v80H10zM30 30h15v15H30zM60 30h10v40H60zM25 60h25v10H25z' fill='none' stroke='%23334155' stroke-width='1.5' stroke-dasharray='4 4'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px'
          }}
        />
        
        {/* Fading gradient to smooth out the pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#fcfbf9]/60 to-[#fcfbf9] z-0" />

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm mb-8 hover:shadow-md transition-shadow">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Civic services &middot; online
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 leading-[1.1]">
            Report civic issues.<br className="hidden sm:block"/> Track real progress.
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The unified platform for {language === 'en' ? 'residents' : 'குடிமக்கள்'} to fix neighborhood problems, access government schemes, and monitor real-time municipal responses.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 w-full max-w-2xl mx-auto mb-8">
            <Link 
              to="/report" 
              className="flex-1 inline-flex items-center justify-center gap-2 bg-civic-600 text-white hover:bg-civic-700 px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <FileText size={22} className="shrink-0" />
              <span>{t('hero.reportBtn')}</span>
            </Link>
            
            <Link 
              to="/my-complaints" 
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-slate-800 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-6 py-4 rounded-xl font-bold text-lg shadow-sm transition-all"
            >
              <Search size={22} className="shrink-0 text-slate-500" />
              <span>{t('hero.trackBtn')}</span>
            </Link>
            
            <Link 
              to="/schemes" 
              className="flex-1 inline-flex items-center justify-center gap-2 bg-yellow-100 text-yellow-900 border border-yellow-200 hover:bg-yellow-200 px-6 py-4 rounded-xl font-bold text-lg shadow-sm transition-all"
            >
              <BookOpen size={22} className="shrink-0 text-yellow-700" />
              <span>{t('hero.schemesBtn')}</span>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
            <ShieldCheck size={16} className="text-green-600" />
            Your report is handled securely. You stay in control of your information.
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="relative z-20 -mt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <ServiceGrid
            title="Quick actions"
            services={CATEGORIES.map(c => ({
              id: c.id,
              name: t(`category.${c.id}`),
              imageUrl: c.imageUrl
            }))}
            onServiceClick={handleCategoryClick}
            className="py-8 md:py-10"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A simple, transparent process to get neighborhood issues resolved efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-slate-200 z-0"></div>
          
          {[
            { title: "1. Report", desc: "Submit an issue with a photo and location. Our AI categorizes it instantly.", icon: FileText },
            { title: "2. Routed", desc: "The platform assigns it to the exact department and personnel responsible.", icon: Zap },
            { title: "3. Track resolution", desc: "Get live updates. You verify when the work is actually completed.", icon: CheckCircle }
          ].map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-[#fcfbf9] shadow-md flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-civic-50 flex items-center justify-center text-civic-600">
                  <step.icon size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Work you can follow */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity size={20} className="text-civic-600" />
                <h2 className="text-3xl font-extrabold text-slate-900">Work you can follow</h2>
              </div>
              <p className="text-slate-600">Real-time civic activity in the area.</p>
            </div>
            <Link to="/dashboard" className="inline-flex items-center gap-1 text-civic-600 font-semibold hover:text-civic-800 transition-colors">
              View full dashboard <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-wider">
              Demo Data
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-slate-300" size={40} />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {recentComplaints.length > 0 ? recentComplaints.map(complaint => (
                <Link key={complaint.id} to={`/track/${complaint.complaint_id}`} className="block group">
                  <div className="bg-[#fcfbf9] border border-slate-200 rounded-2xl p-6 h-full hover:border-civic-300 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-700 capitalize">
                        {complaint.category}
                      </span>
                      <span className={clsx(
                        "px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1",
                        complaint.status === 'resolved' ? "bg-green-100 text-green-700" :
                        complaint.status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                        "bg-slate-200 text-slate-700"
                      )}>
                        {complaint.status === 'resolved' && <CheckCircle size={12} />}
                        {t(`status.${complaint.status}`) || complaint.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-civic-600 transition-colors">
                      {complaint.description}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-auto pt-4">
                      <MapPin size={14} />
                      <span className="line-clamp-1">{complaint.ward || 'Unknown location'}</span>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-3 text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No public activity to display yet.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4 text-white">
              <div className="w-8 h-8 bg-civic-600 rounded-lg flex items-center justify-center font-bold text-lg">C</div>
              <span className="font-bold text-xl tracking-tight">Citizen Platform</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              A modern, AI-powered interface connecting residents with municipal services for faster, transparent resolution.
            </p>
            <div className="inline-flex px-3 py-1 bg-slate-800 rounded-md border border-slate-700 text-xs font-bold text-slate-400">
              Demo Civic Platform
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="hover:text-white transition-colors">Help & Support</Link></li>
              <li><Link to="/report" className="hover:text-white transition-colors">Report an Issue</Link></li>
              <li><Link to="/schemes" className="hover:text-white transition-colors">Find Schemes</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Public Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Legal & Options</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
              <li className="pt-2">
                <button 
                  onClick={() => window.location.reload()} 
                  className="flex items-center gap-2 text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors"
                >
                  Change Language ({language === 'en' ? 'தமிழ்' : 'English'})
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Model Citizen Platform. Open source civic tech.</p>
        </div>
      </footer>
    </div>
  );
}

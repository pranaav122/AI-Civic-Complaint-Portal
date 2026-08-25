import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import { Search, Filter, AlertCircle, Loader2, FileText, ArrowRight } from 'lucide-react';

export default function MyComplaints() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const statuses = ['All', 'submitted', 'ai_classified', 'assigned', 'in_progress', 'resolved', 'verified'];

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchComplaints = async () => {
      try {
        const data = await api.getComplaints();
        setComplaints(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComplaints();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view and track your reported issues.</p>
          <Link 
            to="/login" 
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {t('nav.login')} <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = !searchTerm || 
                          (c.id && c.id.toString().includes(searchTerm)) || 
                          (c.complaint_id && c.complaint_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('nav.myComplaints')}</h1>
          <p className="text-gray-600">Track and manage your reported issues.</p>
        </div>
        <Link 
          to="/report" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <FileText size={18} className="mr-2" />
          New Report
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex items-center text-gray-500 mr-2">
            <Filter size={18} className="mr-1" /> Filters:
          </div>
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status 
                  ? 'bg-blue-100 text-blue-700 border-blue-200 border' 
                  : 'bg-gray-100 text-gray-600 border-transparent border hover:bg-gray-200'
              }`}
            >
              {status === 'All' ? 'All' : t(`status.${status.replace('_', '')}`) || status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={40} className="animate-spin text-blue-600" />
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Complaints Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'All' 
              ? 'Try adjusting your filters or search terms.' 
              : 'You have not reported any issues yet.'}
          </p>
          {searchTerm || statusFilter !== 'All' ? (
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
              className="text-blue-600 font-medium hover:underline"
            >
              Clear Filters
            </button>
          ) : (
            <Link 
              to="/report" 
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Report Your First Issue
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map(complaint => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
}

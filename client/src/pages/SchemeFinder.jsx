import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import * as api from '../services/api';
import { 
  Search, Users, Briefcase, GraduationCap, DollarSign, 
  ChevronDown, CheckCircle, FileText, ArrowRight, Loader2, AlertCircle
} from 'lucide-react';

export default function SchemeFinder() {
  const { t } = useTranslation();
  
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    income: '',
    occupation: '',
    education: '',
    isStudent: false,
    hasDisability: false
  });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Basic validation
      if (!profile.age || !profile.gender || !profile.income) {
        throw new Error("Please fill out at least age, gender, and income.");
      }
      
      const data = await api.findSchemes(profile);
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to find schemes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('schemes.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">{t('schemes.subtitle')}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <AlertCircle size={24} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          {t('schemes.disclaimer')}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Profile Form */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
              <Users size={20} className="mr-2 text-indigo-600" />
              Your Profile
            </h2>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('schemes.age')}</label>
                <input 
                  type="number" 
                  name="age" 
                  value={profile.age} 
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 35"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('schemes.gender')}</label>
                <div className="relative">
                  <select 
                    name="gender" 
                    value={profile.gender} 
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('schemes.income')}</label>
                <div className="relative">
                  <select 
                    name="income" 
                    value={profile.income} 
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    required
                  >
                    <option value="">Select Range</option>
                    <option value="Below 1 lakh">Below 1 lakh</option>
                    <option value="1-2.5 lakh">1 - 2.5 lakh</option>
                    <option value="2.5-5 lakh">2.5 - 5 lakh</option>
                    <option value="5-10 lakh">5 - 10 lakh</option>
                    <option value="Above 10 lakh">Above 10 lakh</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('schemes.occupation')}</label>
                <div className="relative">
                  <select 
                    name="occupation" 
                    value={profile.occupation} 
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    <option value="">Select Occupation</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Salaried">Salaried</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Homemaker">Homemaker</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('schemes.education')}</label>
                <div className="relative">
                  <select 
                    name="education" 
                    value={profile.education} 
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    <option value="">Select Education</option>
                    <option value="No formal education">No formal education</option>
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Higher Secondary">Higher Secondary</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post-Graduate">Post-Graduate</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center mt-2">
                <input 
                  type="checkbox" 
                  id="isStudent" 
                  name="isStudent" 
                  checked={profile.isStudent} 
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isStudent" className="ml-2 text-sm text-gray-700">{t('schemes.student')}</label>
              </div>

              <div className="flex items-center mt-2">
                <input 
                  type="checkbox" 
                  id="hasDisability" 
                  name="hasDisability" 
                  checked={profile.hasDisability} 
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="hasDisability" className="ml-2 text-sm text-gray-700">{t('schemes.disability')}</label>
              </div>

              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                {loading ? <Loader2 size={20} className="animate-spin mr-2" /> : <Search size={20} className="mr-2" />}
                {t('schemes.findBtn')}
              </button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="w-full md:w-2/3">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
              <Loader2 size={40} className="animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-500">AI is analyzing eligibility across government databases...</p>
            </div>
          ) : !results ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-indigo-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Discover Benefits</h3>
              <p className="text-gray-500 max-w-md">Fill out your profile on the left to see which government schemes you may be eligible for.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
              <h3 className="text-xl font-medium text-gray-800 mb-2">{t('schemes.noResults')}</h3>
              <p className="text-gray-500">Try adjusting your profile details.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
                <span>{t('schemes.results')} ({results.length})</span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Demo Data</span>
              </h2>
              
              {results.map((scheme, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{scheme.name}</h3>
                      {scheme.deadline && (
                        <span className="text-xs font-medium px-2.5 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
                          Deadline: {scheme.deadline}
                        </span>
                      )}
                    </div>
                    {scheme.tamil_name && <p className="text-indigo-600 text-sm font-medium mb-3">{scheme.tamil_name}</p>}
                    
                    <p className="text-gray-600 mb-5">{scheme.description}</p>
                    
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-5">
                      <h4 className="text-sm font-semibold text-green-800 mb-1 flex items-center">
                        <CheckCircle size={16} className="mr-1.5" /> {t('schemes.whyEligible')}
                      </h4>
                      <p className="text-sm text-green-700">{scheme.ai_match_reason}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm mb-2">{t('schemes.eligibility')}</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {scheme.eligibility.map((req, i) => <li key={i}>{req}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm mb-2">{t('schemes.documents')}</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {scheme.documents.map((doc, i) => <li key={i}>{doc}</li>)}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Process:</span> {scheme.process}
                      </div>
                      <a 
                        href={scheme.application_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        {t('schemes.apply')} <ArrowRight size={16} className="ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

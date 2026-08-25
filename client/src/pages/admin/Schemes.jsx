import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { 
  FileText, Plus, Edit, Trash2, Loader2, Search, X
} from 'lucide-react';

export default function Schemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [formData, setFormData] = useState({
    name: '', name_ta: '', description: '', department: '', 
    min_age: '', max_age: '', max_income: '', gender: 'All',
    for_students: false, for_disabled: false, is_active: true
  });

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const data = await api.getSchemes().catch(() => [
        { id: 1, name: '[DEMO] Chief Minister Health Scheme', department: 'Health', is_active: true },
        { id: 2, name: '[DEMO] Education Scholarship', department: 'Education', is_active: true, for_students: true }
      ]);
      setSchemes(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (scheme = null) => {
    if (scheme) {
      setEditingScheme(scheme);
      setFormData(scheme);
    } else {
      setEditingScheme(null);
      setFormData({
        name: '', name_ta: '', description: '', department: '', 
        min_age: '', max_age: '', max_income: '', gender: 'All',
        for_students: false, for_disabled: false, is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingScheme) {
        setSchemes(schemes.map(s => s.id === editingScheme.id ? {...s, ...formData} : s));
      } else {
        const newScheme = { ...formData, id: Date.now() };
        setSchemes([...schemes, newScheme]);
      }
      setIsModalOpen(false);
    } catch (e) {
      alert('Error saving scheme');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this scheme?')) {
      setSchemes(schemes.filter(s => s.id !== id));
    }
  };

  const filteredSchemes = schemes.filter(s => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-600" /> Welfare Schemes
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage government schemes and eligibility criteria</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Scheme
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search schemes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : filteredSchemes.length > 0 ? (
          filteredSchemes.map(scheme => (
            <div key={scheme.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wide ${scheme.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {scheme.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex space-x-2">
                    <button onClick={() => handleOpenModal(scheme)} className="text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(scheme.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-bold text-gray-900 leading-tight">{scheme.name}</h3>
                {scheme.name_ta && <p className="text-sm text-gray-500 mt-1">{scheme.name_ta}</p>}
                
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="font-medium text-gray-500">Department</span>
                    <span>{scheme.department || 'General'}</span>
                  </div>
                  {(scheme.min_age || scheme.max_age) && (
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="font-medium text-gray-500">Age Range</span>
                      <span>{scheme.min_age || 0} - {scheme.max_age || 'Any'} yrs</span>
                    </div>
                  )}
                  {scheme.gender && scheme.gender !== 'All' && (
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="font-medium text-gray-500">Gender</span>
                      <span>{scheme.gender}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {scheme.for_students && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">Students</span>}
                  {scheme.for_disabled && <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-100">Differently Abled</span>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">No schemes found</div>
        )}
      </div>

      {/* Modal - Basic version for brevity */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{editingScheme ? 'Edit Scheme' : 'Add Scheme'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700">Scheme Name (English)</label>
                      <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender Eligibility</label>
                      <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.gender || 'All'} onChange={e => setFormData({...formData, gender: e.target.value})}>
                        <option value="All">All</option>
                        <option value="Female">Female Only</option>
                        <option value="Male">Male Only</option>
                        <option value="Transgender">Transgender Only</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-4">
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={formData.for_students} onChange={e => setFormData({...formData, for_students: e.target.checked})} />
                      <span className="ml-2 text-sm text-gray-700">For Students</span>
                    </label>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

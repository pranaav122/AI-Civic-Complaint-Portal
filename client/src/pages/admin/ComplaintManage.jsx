import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import { formatDate, getStatusColor, getPriorityColor, formatRelativeTime } from '../../utils/helpers';
import StatusTimeline from '../../components/StatusTimeline';
import { 
  ChevronLeft, MapPin, Calendar, User, Phone, Brain, 
  MessageSquare, Save, AlertTriangle, Loader2 
} from 'lucide-react';

export default function ComplaintManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [departments, setDepartments] = useState([]);
  
  // Action states
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [publicNote, setPublicNote] = useState('');
  const [resolutionDays, setResolutionDays] = useState('');
  
  const statuses = ['Submitted', 'AI Classified', 'Assigned', 'In Progress', 'Resolved', 'Verified'];
  const priorities = ['Critical', 'High', 'Medium', 'Low'];

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, deptRes] = await Promise.all([
        api.getComplaint(id).catch(() => null),
        api.getDepartments().catch(() => [])
      ]);
      
      if (compRes) {
        setComplaint(compRes);
        setStatus(compRes.status || '');
        setPriority(compRes.priority || '');
        setDepartmentId(compRes.department_id || '');
      }
      if (deptRes) {
        setDepartments(deptRes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field, value, message = '') => {
    setUpdating(true);
    try {
      // Mock API call to update complaint
      const updates = { [field]: value };
      if (message) updates.message = message;
      // await api.updateComplaint(id, updates);
      
      // Optimistic update
      setComplaint(prev => ({...prev, [field]: value}));
      alert(`${field} updated successfully`);
    } catch (e) {
      console.error(e);
      alert('Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddUpdate = async (isInternal, text) => {
    if (!text.trim()) return;
    setUpdating(true);
    try {
      // Mock API call to add update
      // await api.addComplaintUpdate(id, { message: text, is_internal: isInternal });
      alert(`${isInternal ? 'Internal note' : 'Public update'} added successfully`);
      if (isInternal) setInternalNote('');
      else setPublicNote('');
      fetchData(); // Refresh to get new timeline items
    } catch (e) {
      console.error(e);
      alert('Failed to add update');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Complaint not found</h2>
        <button onClick={() => navigate('/admin/complaints')} className="text-blue-600 hover:underline">Return to list</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/admin/complaints')} className="flex items-center text-gray-500 hover:text-gray-900 mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Complaints
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              Complaint {complaint.tracking_id || complaint.id}
            </h1>
            <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {formatDate(complaint.created_at)}</span>
              {complaint.citizen_name && <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {complaint.citizen_name}</span>}
              {complaint.citizen_phone && <span className="flex items-center"><Phone className="w-4 h-4 mr-1" /> {complaint.citizen_phone}</span>}
            </div>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
              {complaint.status}
            </span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
              {complaint.priority} Priority
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
            
            {complaint.address && (
              <div className="mt-4 flex items-start text-gray-600 bg-gray-50 p-3 rounded-md">
                <MapPin className="w-5 h-5 mr-2 text-gray-400 mt-0.5" />
                <span>{complaint.address}</span>
              </div>
            )}
          </div>

          {(complaint.ai_category || complaint.ai_analysis) && (
            <div className="bg-indigo-50 rounded-lg shadow-sm border border-indigo-100 p-6">
              <h2 className="text-lg font-semibold text-indigo-900 flex items-center mb-4">
                <Brain className="w-5 h-5 mr-2 text-indigo-600" /> AI Analysis
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="block text-xs font-medium text-indigo-500 uppercase tracking-wider">Suggested Category</span>
                  <span className="font-medium text-indigo-900">{complaint.ai_category} {complaint.ai_subcategory ? `> ${complaint.ai_subcategory}` : ''}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-indigo-500 uppercase tracking-wider">Severity</span>
                  <span className="font-medium text-indigo-900">{complaint.ai_severity || 'Unknown'} / 10</span>
                </div>
              </div>
              {complaint.ai_analysis && (
                <div>
                  <span className="block text-xs font-medium text-indigo-500 uppercase tracking-wider mb-1">Reasoning</span>
                  <p className="text-sm text-indigo-800">{complaint.ai_analysis}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <StatusTimeline updates={complaint.updates || []} currentStatus={complaint.status} />
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Admin Actions</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                <div className="flex space-x-2">
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button 
                    onClick={() => handleUpdate('status', status)}
                    disabled={updating || status === complaint.status}
                    className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Priority</label>
                <div className="flex space-x-2">
                  <select 
                    value={priority} 
                    onChange={e => setPriority(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button 
                    onClick={() => handleUpdate('priority', priority)}
                    disabled={updating || priority === complaint.priority}
                    className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Department</label>
                <div className="flex space-x-2">
                  <select 
                    value={departmentId || ''} 
                    onChange={e => setDepartmentId(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Unassigned</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <button 
                    onClick={() => handleUpdate('department_id', departmentId)}
                    disabled={updating || departmentId == complaint.department_id}
                    className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" /> Internal Notes
            </h2>
            <textarea
              rows="3"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm bg-white"
              placeholder="Add a note visible only to admins/departments..."
              value={internalNote}
              onChange={e => setInternalNote(e.target.value)}
            ></textarea>
            <button 
              onClick={() => handleAddUpdate(true, internalNote)}
              disabled={updating || !internalNote.trim()}
              className="mt-3 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-yellow-900 bg-yellow-200 hover:bg-yellow-300 focus:outline-none disabled:opacity-50"
            >
              Add Internal Note
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-gray-500" /> Message Citizen
            </h2>
            <textarea
              rows="3"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Send an update to the citizen..."
              value={publicNote}
              onChange={e => setPublicNote(e.target.value)}
            ></textarea>
            <button 
              onClick={() => handleAddUpdate(false, publicNote)}
              disabled={updating || !publicNote.trim()}
              className="mt-3 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              Send Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

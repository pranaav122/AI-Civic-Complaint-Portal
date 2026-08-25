import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { formatDate, getStatusColor, getPriorityColor, getCategoryIcon } from '../utils/helpers';
import StatusTimeline from '../components/StatusTimeline';
import { 
  ArrowLeft, MapPin, Calendar, Building2, Clock, 
  AlertTriangle, Shield, CheckCircle, XCircle, ThumbsUp, ThumbsDown, Loader2, Activity 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [similarComplaints, setSimilarComplaints] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await api.getComplaint(id);
        setComplaint(data);
        
        // Optionally fetch similar complaints
        try {
          const similar = await api.getSimilarComplaints(id);
          setSimilarComplaints(similar || []);
        } catch (e) {
          console.warn("Could not fetch similar complaints", e);
        }
      } catch (err) {
        console.error("Failed to load complaint details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleVerification = async (isSatisfied) => {
    setIsVerifying(true);
    try {
      await api.verifyResolution(id, { satisfied: isSatisfied, feedback: verificationFeedback });
      // Reload details
      const updated = await api.getComplaint(id);
      setComplaint(updated);
    } catch (err) {
      console.error(err);
      alert("Failed to submit verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Complaint Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const statusColor = getStatusColor(complaint.status);
  const priorityColor = getPriorityColor(complaint.ai_priority || 'medium');
  const CategoryIcon = getCategoryIcon(complaint.category);
  const isOwner = user && complaint.user_id === user.id;
  const needsVerification = isOwner && complaint.status === 'resolved';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-1" /> {t('common.back')}
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Main Content Column */}
        <div className="flex-1 space-y-6">
          
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">Issue #{complaint.id}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text}`}>
                    {t(`status.${complaint.status}`)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColor.bg} ${priorityColor.text} capitalize flex items-center`}>
                    <AlertTriangle size={14} className="mr-1" />
                    {t(`priority.${complaint.ai_priority}`) || complaint.ai_priority}
                  </span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar size={16} className="mr-1.5" />
                  {formatDate(complaint.created_at)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-100 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center">
                  <CategoryIcon size={14} className="mr-1.5" /> Category
                </p>
                <p className="font-medium text-gray-800 capitalize">{t(`categories.${complaint.category}`)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center">
                  <Building2 size={14} className="mr-1.5" /> Department
                </p>
                <p className="font-medium text-gray-800">{complaint.ai_department || 'Pending'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center">
                  <MapPin size={14} className="mr-1.5" /> Location
                </p>
                <p className="font-medium text-gray-800 truncate" title={complaint.address || 'Location provided'}>
                  {complaint.address || 'Map Location'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center">
                  <Clock size={14} className="mr-1.5" /> Expected Time
                </p>
                <p className="font-medium text-gray-800">
                  {complaint.ai_expected_days ? `${complaint.ai_expected_days} ${t('common.days')}` : 'TBD'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{t('complaint.details')}</h3>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
                {complaint.description}
              </p>
            </div>
          </div>

          {/* AI Analysis Card */}
          {complaint.ai_explanation && (
            <div className="bg-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-6">
              <h3 className="text-lg font-semibold mb-3 text-indigo-900 flex items-center">
                <Shield size={20} className="mr-2 text-indigo-600" /> 
                {t('complaint.aiAnalysis')}
              </h3>
              <p className="text-indigo-800 text-sm leading-relaxed">
                {complaint.ai_explanation}
              </p>
            </div>
          )}

          {/* Verification Card */}
          {needsVerification && (
            <div className="bg-white rounded-xl shadow-sm border-2 border-green-200 p-6">
              <h3 className="text-lg font-bold mb-2 text-gray-900 flex items-center">
                <CheckCircle size={20} className="mr-2 text-green-600" />
                {t('complaint.verifyResolution')}
              </h3>
              <p className="text-gray-600 mb-4">{t('complaint.verifyQuestion')}</p>
              
              <textarea
                value={verificationFeedback}
                onChange={(e) => setVerificationFeedback(e.target.value)}
                placeholder="Optional feedback..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 outline-none"
                rows="2"
              ></textarea>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleVerification(true)}
                  disabled={isVerifying}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center transition-colors"
                >
                  <ThumbsUp size={18} className="mr-2" /> {t('complaint.yesResolved')}
                </button>
                <button
                  onClick={() => handleVerification(false)}
                  disabled={isVerifying}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-medium flex items-center justify-center transition-colors"
                >
                  <ThumbsDown size={18} className="mr-2" /> {t('complaint.notResolved')}
                </button>
              </div>
            </div>
          )}

          {/* Map Location */}
          {(complaint.lat && complaint.lng) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <MapPin size={20} className="mr-2 text-gray-500" /> Location Map
              </h3>
              <div className="h-64 rounded-lg overflow-hidden border border-gray-300 z-0">
                <MapContainer 
                  center={[complaint.lat, complaint.lng]} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[complaint.lat, complaint.lng]}>
                    <Popup>{complaint.address || 'Issue Location'}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

        </div>
        
        {/* Sidebar Column */}
        <div className="w-full md:w-80 space-y-6">
          
          {/* Timeline Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('complaint.timeline')}</h3>
            <StatusTimeline currentStatus={complaint.status} timestamps={complaint.timeline} />
          </div>
          
          {/* Photos Card */}
          {complaint.photos && complaint.photos.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('complaint.media')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {complaint.photos.map((photo, i) => (
                  <a key={i} href={photo.url} target="_blank" rel="noopener noreferrer" className="block w-full h-24 rounded bg-gray-100 overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity">
                    <img src={photo.url} alt={`Evidence ${i+1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Similar Complaints (if any) */}
          {similarComplaints.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <Activity size={18} className="mr-2 text-gray-500" /> Similar Issues
              </h3>
              <div className="space-y-3">
                {similarComplaints.map(sc => (
                  <div key={sc.id} className="p-3 bg-gray-50 rounded border border-gray-100 text-sm cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => navigate(`/complaints/${sc.id}`)}>
                    <div className="font-medium text-gray-800">#{sc.id} - {t(`status.${sc.status}`)}</div>
                    <div className="text-gray-500 truncate">{sc.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

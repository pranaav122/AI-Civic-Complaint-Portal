import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Camera, Mic, Send, Construction, Droplets, TrashIcon, 
  Zap, Truck, Building2, HelpCircle, Loader2, X, AlertCircle, CheckCircle
} from 'lucide-react';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Issue Location</Popup>
    </Marker>
  );
}

export default function ReportIssue() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    latitude: null,
    longitude: null,
    address: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]);
  const [aiPreview, setAiPreview] = useState(null);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  useEffect(() => {
    // Check for pre-selected category from URL
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat && CATEGORIES.some(c => c.id === cat)) {
      setFormData(prev => ({ ...prev, category: cat }));
    }
    
    // Fetch map config
    api.getConfig().then(data => {
      if (data && data.map_center) {
        setMapCenter([data.map_center.lat, data.map_center.lng]);
        if (!formData.latitude) {
          setFormData(prev => ({ 
            ...prev, 
            latitude: data.map_center.lat, 
            longitude: data.map_center.lng 
          }));
        }
      }
    }).catch(err => console.error("Could not load config", err));
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (id) => {
    setFormData(prev => ({ ...prev, category: id }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - files.length);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (err) => {
          console.error(err);
          alert("Could not get your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input is not supported in your browser.");
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US'; // Would ideally use LanguageContext to determine ta-IN vs en-US
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({
        ...prev,
        description: prev.description ? `${prev.description} ${transcript}` : transcript
      }));
    };
    
    recognition.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.description) {
      setError("Description is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          submitData.append(key, value);
        }
      });
      
      files.forEach(file => {
        submitData.append('photos', file);
      });
      
      const response = await api.submitComplaint(submitData);
      setAiPreview(response);
    } catch (err) {
      console.error(err);
      setError("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (aiPreview) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden">
          <div className="bg-green-50 px-6 py-8 text-center border-b border-green-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Issue Reported Successfully</h2>
            <p className="text-gray-600">Your complaint has been processed by our AI system.</p>
            <div className="mt-4 inline-block bg-white px-4 py-2 rounded-lg font-mono font-medium text-gray-700 shadow-sm border border-gray-200">
              ID: {aiPreview.id || 'NEW'}
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">AI Analysis & Routing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Assigned Department</div>
                <div className="font-medium text-gray-800">{aiPreview.aiAnalysis?.department || 'Pending Routing'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Category & Priority</div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-800 capitalize">{aiPreview.aiAnalysis?.category || 'General'}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 capitalize">
                    {aiPreview.aiAnalysis?.priority || 'Medium'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-8">
              <div className="text-xs text-blue-500 uppercase font-semibold mb-2">AI Summary</div>
              <p className="text-gray-700 text-sm">{aiPreview.aiAnalysis?.explanation || 'Awaiting full analysis.'}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate(`/complaints/${aiPreview.id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Track Status
              </button>
              <button 
                onClick={() => {
                  setAiPreview(null);
                  setFormData({ ...formData, description: '', category: '' });
                  setFiles([]);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Report Another Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('nav.report')}</h1>
        <p className="text-gray-600">{t('form.descriptionPlaceholder')}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
        
        {/* Step 1: Category */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
            {t('form.category')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleCategorySelect(id)}
                className={`p-4 rounded-lg border text-center transition-all flex flex-col items-center ${
                  formData.category === id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Icon size={24} className="mb-2" />
                <span className="text-sm font-medium">{t(`categories.${id}`)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: Description */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
            {t('form.description')}
          </h2>
          <div className="relative">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Describe the issue in detail (English or Tamil)..."
            ></textarea>
            <button
              type="button"
              onClick={startVoiceInput}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
              }`}
              title="Voice Input"
            >
              <Mic size={20} />
            </button>
          </div>
          <div className="text-right mt-1 text-sm text-gray-500">
            {formData.description.length} chars
          </div>
        </section>

        {/* Step 3: Location */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
            {t('form.location')}
          </h2>
          
          <div className="mb-4">
            <button
              type="button"
              onClick={getUserLocation}
              className="mb-3 flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <MapPin size={16} className="mr-2" />
              Use My Current Location
            </button>
            
            <div className="h-64 rounded-lg overflow-hidden border border-gray-300 z-0">
              <MapContainer 
                center={mapCenter} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker 
                  position={formData.latitude ? [formData.latitude, formData.longitude] : null} 
                  setPosition={(pos) => setFormData(prev => ({...prev, latitude: pos.lat, longitude: pos.lng}))} 
                />
              </MapContainer>
            </div>
            <p className="text-sm text-gray-500 mt-2">Click on the map to set exact location</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Landmark / Address Area</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="E.g., Near Main Market Junction"
            />
          </div>
        </section>

        {/* Step 4: Photos */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
            {t('form.uploadPhoto')}
          </h2>
          
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="space-y-1 text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 justify-center">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none px-2 py-1 shadow-sm border border-gray-200">
                  <span>Upload a file</span>
                  <input type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} />
                </label>
                <p className="pl-1 pt-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 5MB (Max 5 photos)</p>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Step 5: Contact Info */}
        {!user && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">5</span>
              {t('form.contactInfo')} (Optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('form.name')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('form.email')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t('form.phone')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </section>
        )}

        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                {t('form.submitting')}
              </>
            ) : (
              <>
                <Send size={20} className="mr-2" />
                {t('form.submit')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

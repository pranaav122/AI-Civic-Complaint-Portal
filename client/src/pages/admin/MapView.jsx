import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as api from '../../services/api';
import { getPriorityColor, getStatusColor } from '../../utils/helpers';
import { Loader2, Filter, Layers, MapPin } from 'lucide-react';

// Fix leafet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function MapView() {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [config, setConfig] = useState(null);
  
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All'
  });
  
  const [heatmapMode, setHeatmapMode] = useState(false);

  useEffect(() => {
    fetchMapData();
  }, [heatmapMode]);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const conf = await api.getConfig().catch(() => ({ centerLat: 13.0827, centerLng: 80.2707, zoom: 12 }));
      setConfig(conf);
      
      // In real app, might pass bounds or fetch all
      const res = await api.getComplaints({ limit: 500 }).catch(() => ({ complaints: [] }));
      setComplaints((res.complaints || []).filter(c => c.latitude && c.longitude));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityHex = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return '#ef4444'; // red-500
      case 'high': return '#f97316'; // orange-500
      case 'medium': return '#3b82f6'; // blue-500
      default: return '#9ca3af'; // gray-400
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filters.status !== 'All' && c.status !== filters.status) return false;
    if (filters.priority !== 'All' && c.priority !== filters.priority) return false;
    return true;
  });

  if (loading && !config) {
    return <div className="flex h-[calc(100vh-100px)] justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] relative">
      {/* Sidebar Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-md w-72 max-h-[calc(100vh-100px)] overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold flex items-center"><MapPin className="w-5 h-5 mr-2 text-blue-600" /> Map View</h2>
        </div>
        
        <div className="p-4 flex-1">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center"><Layers className="w-4 h-4 mr-1" /> Layers</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input type="radio" checked={!heatmapMode} onChange={() => setHeatmapMode(false)} className="text-blue-600 focus:ring-blue-500" />
                <span>Standard Markers</span>
              </label>
              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input type="radio" checked={heatmapMode} onChange={() => setHeatmapMode(true)} className="text-blue-600 focus:ring-blue-500" />
                <span>Sanitation Heatmap</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center"><Filter className="w-4 h-4 mr-1" /> Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Priority</label>
                <select 
                  className="w-full text-sm border-gray-300 rounded-md"
                  value={filters.priority}
                  onChange={e => setFilters({...filters, priority: e.target.value})}
                  disabled={heatmapMode}
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select 
                  className="w-full text-sm border-gray-300 rounded-md"
                  value={filters.status}
                  onChange={e => setFilters({...filters, status: e.target.value})}
                  disabled={heatmapMode}
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> Critical</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span> High</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> Medium</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span> Low/Unassigned</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          Showing {filteredComplaints.length} locations
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 w-full h-full z-0">
        {config && (
          <MapContainer 
            center={[config.centerLat || 13.0827, config.centerLng || 80.2707]} 
            zoom={config.zoom || 12} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {filteredComplaints.map(complaint => (
              <CircleMarker
                key={complaint.id}
                center={[complaint.latitude, complaint.longitude]}
                radius={heatmapMode ? (complaint.ai_severity || 5) * 2 : 8}
                pathOptions={{ 
                  fillColor: heatmapMode ? '#ef4444' : getPriorityHex(complaint.priority),
                  fillOpacity: heatmapMode ? 0.4 : 0.7,
                  color: 'white',
                  weight: 1
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    <div className="font-bold text-sm mb-1">{complaint.tracking_id || complaint.id}</div>
                    <div className="text-xs mb-2 text-gray-600 truncate">{complaint.category || 'Uncategorized'}</div>
                    <p className="text-xs mb-2 line-clamp-2">{complaint.description}</p>
                    <div className="flex space-x-1 mb-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${getStatusColor(complaint.status)}`}>{complaint.status}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</span>
                    </div>
                    <a href={`/admin/complaints/${complaint.id}`} className="text-xs text-blue-600 hover:underline block text-center border-t border-gray-100 mt-2 pt-2">
                      View Full Details
                    </a>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}

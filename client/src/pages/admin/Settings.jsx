import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Settings as SettingsIcon, Database, Shield, Globe, 
  Brain, MessageSquare, Mail, Smartphone
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  
  const [config, setConfig] = useState({
    constituencyName: import.meta.env.VITE_CONSTITUENCY_NAME || 'Demo Constituency',
    centerLat: import.meta.env.VITE_CONSTITUENCY_CENTER_LAT || '13.0827',
    centerLng: import.meta.env.VITE_CONSTITUENCY_CENTER_LNG || '80.2707',
  });

  const [passwords, setPasswords] = useState({
    current: '', new: '', confirm: ''
  });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match");
      return;
    }
    // Simulate password change
    alert("Password updated successfully");
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleClearData = () => {
    if (window.confirm("WARNING: This will delete all demo/seeded data. Proceed?")) {
      alert("In a real app, this would clear the DB.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="w-6 h-6 mr-2 text-blue-600" /> Platform Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center bg-gray-50">
            <Globe className="w-5 h-5 mr-2 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Platform Configuration</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 mb-4">
              Note: Core configuration is set via environment variables and is read-only here.
            </div>
            <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-4">
              <div className="col-span-1 text-sm font-medium text-gray-500">Constituency</div>
              <div className="col-span-2 text-sm text-gray-900">{config.constituencyName}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-4">
              <div className="col-span-1 text-sm font-medium text-gray-500">Map Center (Lat, Lng)</div>
              <div className="col-span-2 text-sm text-gray-900">{config.centerLat}, {config.centerLng}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 text-sm font-medium text-gray-500">Platform Version</div>
              <div className="col-span-2 text-sm text-gray-900">v1.0.0 (Beta)</div>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center bg-gray-50">
            <SettingsIcon className="w-5 h-5 mr-2 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Integrations</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-md">
              <div className="flex items-center"><Brain className="w-5 h-5 mr-3 text-purple-600" /> Google Gemini AI</div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-md opacity-75">
              <div className="flex items-center"><MessageSquare className="w-5 h-5 mr-3 text-green-600" /> WhatsApp API</div>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">Not Configured</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-md opacity-75">
              <div className="flex items-center"><Smartphone className="w-5 h-5 mr-3 text-blue-500" /> SMS Gateway</div>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">Not Configured</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-md opacity-75">
              <div className="flex items-center"><Mail className="w-5 h-5 mr-3 text-red-500" /> Email SMTP</div>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">Not Configured</span>
            </div>
          </div>
        </div>

        {/* Admin Account */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center bg-gray-50">
            <Shield className="w-5 h-5 mr-2 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Account Security</h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Logged in as</div>
              <div className="text-base text-gray-900">{user?.email || 'admin@demo.com'}</div>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Change Password</h3>
              <div>
                <input type="password" placeholder="Current Password" required
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                  value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
              </div>
              <div>
                <input type="password" placeholder="New Password" required
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                  value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
              </div>
              <div>
                <input type="password" placeholder="Confirm New Password" required
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                  value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
              </div>
              <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-900 font-medium">
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center bg-gray-50">
            <Database className="w-5 h-5 mr-2 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Data Management</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Database Backup</h3>
              <p className="text-sm text-gray-500 mb-3">Download a complete backup of the SQLite database.</p>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Download Backup
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-500 mb-3">Clear all seeded demo data. This action cannot be undone.</p>
              <button onClick={handleClearData} className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-md text-sm font-medium hover:bg-red-200">
                Clear Demo Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

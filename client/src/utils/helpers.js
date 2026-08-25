import { AlertCircle, AlertTriangle, CheckCircle, Clock, Info, MapPin, Truck, Droplets, Zap, ShieldAlert, FileWarning, Trash2 } from 'lucide-react';

export const formatDate = (dateString, language = 'en') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(language === 'ta' ? 'ta-IN' : 'en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diffMs = new Date() - new Date(dateString);
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);

  if (diffSec < 60) return rtf.format(-diffSec, 'second');
  if (diffMin < 60) return rtf.format(-diffMin, 'minute');
  if (diffHr < 24) return rtf.format(-diffHr, 'hour');
  return rtf.format(-diffDays, 'day');
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'submitted': return 'bg-gray-100 text-gray-800';
    case 'classified': return 'bg-purple-100 text-purple-800';
    case 'assigned': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'verified': return 'bg-emerald-100 text-emerald-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-800 border border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border border-green-200';
    default: return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

export const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'roads': return MapPin;
    case 'water': return Droplets;
    case 'drainage': return FileWarning;
    case 'garbage/sanitation': return Trash2;
    case 'streetlights': return Zap;
    case 'transport': return Truck;
    case 'infrastructure': return ShieldAlert;
    default: return Info;
  }
};

export const generateComplaintId = () => {
  return `CMP-${Math.floor(100000 + Math.random() * 900000)}`;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getStatusStep = (status) => {
  const steps = ['submitted', 'classified', 'assigned', 'in_progress', 'resolved', 'verified'];
  const index = steps.indexOf(status?.toLowerCase());
  return index >= 0 ? index : 0;
};

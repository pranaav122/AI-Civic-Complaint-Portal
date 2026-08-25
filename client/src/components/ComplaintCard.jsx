import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { getCategoryIcon, getStatusColor, getPriorityColor, formatDate, truncateText } from '../utils/helpers';
import { MapPin, Clock } from 'lucide-react';

const ComplaintCard = ({ complaint }) => {
  const { t } = useTranslation();
  const Icon = getCategoryIcon(complaint.category);

  return (
    <Link 
      to={`/complaints/${complaint.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <span>{complaint.complaint_id}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDate(complaint.created_at).split(',')[0]}
            </span>
          </div>
          <span className={`badge ${getStatusColor(complaint.status)}`}>
            {t(`status.${complaint.status.toLowerCase()}`)}
          </span>
        </div>

        <div className="flex gap-3 mb-3">
          <div className="mt-1 p-2 bg-civic-50 rounded-lg text-civic-600 flex-shrink-0">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-civic-600 transition-colors line-clamp-1">
              {t(`category.${complaint.category.toLowerCase()}`)}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {complaint.description}
            </p>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 max-w-[60%]">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="truncate">{complaint.location?.address || 'Location provided'}</span>
          </div>
          {complaint.priority && (
            <span className={`badge ${getPriorityColor(complaint.priority)}`}>
              {t(`priority.${complaint.priority.toLowerCase()}`)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ComplaintCard;

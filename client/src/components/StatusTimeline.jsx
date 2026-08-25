import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { getStatusStep, formatDate } from '../utils/helpers';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const StatusTimeline = ({ currentStatus, updates = [] }) => {
  const { t } = useTranslation();
  const steps = ['submitted', 'classified', 'assigned', 'in_progress', 'resolved', 'verified'];
  const currentStepIndex = getStatusStep(currentStatus);

  return (
    <div className="py-4">
      {/* Desktop/Tablet Horizontal Timeline */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between relative">
          {/* Connecting line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-civic-500 rounded-full z-0 transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const stepUpdate = updates.find(u => u.status.toLowerCase() === step);
            
            return (
              <div key={step} className="relative z-10 flex flex-col items-center group">
                <div className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                  isCompleted ? "bg-civic-500 border-civic-500 text-white" : "bg-white border-gray-300 text-gray-300"
                )}>
                  {isCompleted ? <CheckCircle size={16} /> : <Clock size={16} />}
                </div>
                <div className="mt-2 text-center">
                  <p className={clsx(
                    "text-xs font-medium uppercase",
                    isCompleted ? "text-civic-700" : "text-gray-400"
                  )}>
                    {t(`status.${step}`)}
                  </p>
                  {stepUpdate && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      {formatDate(stepUpdate.created_at)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="sm:hidden space-y-6">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const stepUpdate = updates.find(u => u.status.toLowerCase() === step);

          return (
            <div key={step} className="relative flex gap-4">
              {/* Vertical line connecting steps */}
              {index < steps.length - 1 && (
                <div className={clsx(
                  "absolute left-4 top-8 bottom-[-24px] w-0.5",
                  index < currentStepIndex ? "bg-civic-500" : "bg-gray-200"
                )}></div>
              )}
              
              <div className={clsx(
                "relative z-10 w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center border-2",
                isCompleted ? "bg-civic-500 border-civic-500 text-white" : "bg-white border-gray-300 text-gray-300"
              )}>
                {isCompleted ? <CheckCircle size={16} /> : <Clock size={16} />}
              </div>
              
              <div className="flex-1 pb-2">
                <p className={clsx(
                  "text-sm font-medium",
                  isCompleted ? "text-gray-900" : "text-gray-400"
                )}>
                  {t(`status.${step}`)}
                </p>
                {stepUpdate && (
                  <div className="mt-1">
                    <p className="text-xs text-gray-500">{formatDate(stepUpdate.created_at)}</p>
                    {stepUpdate.comment && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100 flex items-start gap-2">
                        <AlertCircle size={14} className="mt-0.5 text-civic-400 flex-shrink-0" />
                        <span>{stepUpdate.comment}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';

export interface GuardTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMute: (duration: number) => void;
  errorCount: number;
  errorType: string;
  className?: string;
}

export const GuardTripModal: React.FC<GuardTripModalProps> = ({
  isOpen,
  onClose,
  onMute,
  errorCount,
  errorType,
  className
}) => {
  const { t } = useTranslation();
  const [muteDuration, setMuteDuration] = useState(15);

  const handleMute = () => {
    onMute(muteDuration * 60 * 1000); // Convert to milliseconds
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('errors.guardTrip')}
      size="lg"
      className={className}
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Badge variant="error" size="lg">
            {errorCount}
          </Badge>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('errors.guardTripTitle')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('errors.guardTripDescription', { count: errorCount, type: errorType })}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {t('errors.guardTripWarning')}
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{t('errors.guardTripRecommendation')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('errors.muteDuration')}
            </label>
            <select
              value={muteDuration}
              onChange={(e) => setMuteDuration(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="primary"
              onClick={handleMute}
              className="flex-1"
            >
              {t('errors.muteFor', { duration: muteDuration })}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}; 
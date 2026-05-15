import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  initialTime: number;
  onTimeUp?: () => void;
  onTimeWarning?: (timeLeft: number) => void;
  warningThreshold?: number;
  className?: string;
  showProgress?: boolean;
  format?: 'mm:ss' | 'hh:mm:ss';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialTime,
  onTimeUp,
  onTimeWarning,
  warningThreshold = 300,
  className = '',
  showProgress = true,
  format = 'mm:ss'
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= warningThreshold && !isWarning) {
          setIsWarning(true);
          onTimeWarning?.(newTime);
        }
        if (newTime <= 60 && !isCritical) {
          setIsCritical(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, onTimeWarning, warningThreshold, isWarning, isCritical]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (format === 'hh:mm:ss' || hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return ((initialTime - timeLeft) / initialTime) * 100;
  };

  return (
    <div className={`bg-white rounded-lg border-2 ${isCritical ? 'text-red-600 bg-red-50 border-red-200' : isWarning ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-blue-600 bg-blue-50 border-blue-200'} p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-sm">Thời gian còn lại</span>
        </div>
        
        {isCritical && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium">CẢNH BÁO</span>
          </div>
        )}
      </div>

      <div className="text-center">
        <div className={`text-3xl font-mono font-bold ${isCritical ? 'animate-pulse' : ''}`}>
          {formatTime(timeLeft)}
        </div>
        
        {timeLeft <= 60 && (
          <div className="mt-2 text-sm font-medium">
            Thời gian sắp hết!
          </div>
        )}
      </div>

      {showProgress && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-blue-500'}`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0:00</span>
            <span>{formatTime(initialTime)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

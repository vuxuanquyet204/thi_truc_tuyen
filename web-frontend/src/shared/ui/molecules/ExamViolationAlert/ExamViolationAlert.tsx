import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, X, Clock, Shield, Eye, Users, Volume2, MousePointer, Activity, Smartphone } from 'lucide-react';
import { CheatingDetection } from '@/features/proctoring/hooks';

interface ExamViolationAlertProps {
  violation: CheatingDetection | null;
  onDismiss: () => void;
  onStopExam: () => void;
  isVisible: boolean;
}

interface AlertState {
  violation: CheatingDetection | null;
  timeRemaining: number;
  isDismissed: boolean;
  isStopping: boolean;
}

export const ExamViolationAlert: React.FC<ExamViolationAlertProps> = ({
  violation,
  onDismiss,
  onStopExam,
  isVisible
}) => {
  const [alertState, setAlertState] = useState<AlertState>({
    violation: null,
    timeRemaining: 15,
    isDismissed: false,
    isStopping: false
  });

  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);

  // Handle new violation
  useEffect(() => {
    if (violation && isVisible) {
      setAlertState({
        violation,
        timeRemaining: 15,
        isDismissed: false,
        isStopping: false
      });

      // Clear any existing interval
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }

      // Start countdown
      const interval = setInterval(() => {
        setAlertState(prev => {
          if (prev.timeRemaining <= 1) {
            // Auto-stop exam after 15 seconds
            setAlertState(prev => ({ ...prev, isStopping: true }));
            setTimeout(() => {
              onStopExam();
            }, 1000);
            return prev;
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1
          };
        });
      }, 1000);

      setCountdownInterval(interval);
    }
  }, [violation, isVisible, onStopExam]);

  // Cleanup interval on unmount or when alert is dismissed
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);

  const handleDismiss = useCallback(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setAlertState(prev => ({ ...prev, isDismissed: true }));
    setTimeout(() => {
      onDismiss();
    }, 300);
  }, [countdownInterval, onDismiss]);

  const handleStopExam = useCallback(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setAlertState(prev => ({ ...prev, isStopping: true }));
    setTimeout(() => {
      onStopExam();
    }, 1000);
  }, [countdownInterval, onStopExam]);

  const getSeverityColor = (severity: CheatingDetection['severity']) => {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity: CheatingDetection['severity']) => {
    switch (severity) {
      case 'low': return <Activity className="w-5 h-5" />;
      case 'medium': return <AlertTriangle className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getDetectionIcon = (type: CheatingDetection['type']) => {
    switch (type) {
      case 'FACE_NOT_DETECTED': return <Eye className="w-4 h-4" />;
      case 'MULTIPLE_FACES': return <Users className="w-4 h-4" />;
      case 'MOBILE_PHONE_DETECTED': return <Smartphone className="w-4 h-4" />;
      case 'CAMERA_TAMPERED': return <AlertTriangle className="w-4 h-4" />;
      case 'LOOKING_AWAY': return <Eye className="w-4 h-4" />;
      case 'tab_switch': return <MousePointer className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getDetectionTitle = (type: CheatingDetection['type']) => {
    switch (type) {
      case 'FACE_NOT_DETECTED': return 'Không phát hiện khuôn mặt';
      case 'MULTIPLE_FACES': return 'Nhiều người';
      case 'MOBILE_PHONE_DETECTED': return 'Phát hiện điện thoại';
      case 'CAMERA_TAMPERED': return 'Camera bị can thiệp';
      case 'LOOKING_AWAY': return 'Nhìn ra ngoài';
      case 'tab_switch': return 'Chuyển tab';
      default: return 'Hành vi bất thường';
    }
  };

  const getSeverityMessage = (severity: CheatingDetection['severity']) => {
    switch (severity) {
      case 'low': return 'Cảnh báo nhẹ';
      case 'medium': return 'Cảnh báo trung bình';
      case 'high': return 'Cảnh báo cao';
      case 'critical': return 'Cảnh báo nghiêm trọng';
      default: return 'Cảnh báo';
    }
  };

  if (!isVisible || !alertState.violation || alertState.isDismissed) {
    return null;
  }

  const severityColor = getSeverityColor(alertState.violation.severity);
  const isCritical = alertState.violation.severity === 'critical' || alertState.violation.severity === 'high';

  return (
    <div className={`examViolationAlertOverlay ${alertState.isStopping ? 'stopping' : ''}`}>
      <div 
        className={`examViolationAlertContainer ${alertState.violation.severity}`}
        style={{ borderLeftColor: severityColor }}
      >
        {/* Header */}
        <div className="examViolationAlertHeader">
          <div className="examViolationAlertTitle">
            <div className="examViolationSeverityIcon" style={{ color: severityColor }}>
              {getSeverityIcon(alertState.violation.severity)}
            </div>
            <div className="examViolationTitleContent">
              <h3 className="examViolationTitle">
                {alertState.violation.description || getDetectionTitle(alertState.violation.type)}
              </h3>
              <p className="examViolationSubtitle">
                {getSeverityMessage(alertState.violation.severity)}
              </p>
            </div>
          </div>
          
          <div className="examViolationAlertActions">
            <div className="examViolationCountdown">
              <Clock className="w-4 h-4" />
              <span className="examViolationCountdownText">
                {alertState.timeRemaining}s
              </span>
            </div>
            
            <button
              onClick={handleDismiss}
              className="examViolationDismissButton"
              title="Đóng cảnh báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="examViolationAlertContent">
          <div className="examViolationInfo">
            <div className="examViolationDetectionIcon">
              {getDetectionIcon(alertState.violation.type)}
            </div>
            <div className="examViolationDetails">
              <p className="examViolationDescription">
                {alertState.violation.description}
              </p>
              <div className="examViolationConfidence">
                Độ tin cậy: {alertState.violation.confidence.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="examViolationWarningMessage">
            <Shield className="w-5 h-5" />
            <div className="examViolationWarningText">
              {isCritical ? (
                <>
                  <strong>Cảnh báo nghiêm trọng!</strong>
                  <br />
                  Hành vi này có thể dẫn đến việc dừng bài thi.
                  <br />
                  Vui lòng tuân thủ quy định thi để tiếp tục.
                </>
              ) : (
                <>
                  <strong>Lưu ý:</strong>
                  <br />
                  Hành vi này đã được ghi nhận. Nếu tiếp tục,
                  <br />
                  bài thi có thể bị dừng.
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="examViolationAlertFooter">
          <div className="examViolationActionButtons">
            <button
              onClick={handleDismiss}
              className="examViolationAcknowledgeButton"
            >
              Tôi hiểu
            </button>
            
            {isCritical && (
              <button
                onClick={handleStopExam}
                className="examViolationStopExamButton"
              >
                Dừng bài thi
              </button>
            )}
          </div>
          
          <div className="examViolationAutoStopWarning">
            {alertState.timeRemaining <= 5 ? (
              <span className="examViolationCriticalWarning">
                Bài thi sẽ tự động dừng sau {alertState.timeRemaining} giây!
              </span>
            ) : (
              <span className="examViolationNormalWarning">
                Bài thi sẽ tự động dừng nếu không phản hồi sau {alertState.timeRemaining} giây
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="examViolationProgressContainer">
          <div 
            className="examViolationProgressBar"
            style={{ 
              width: `${(alertState.timeRemaining / 15) * 100}%`,
              backgroundColor: severityColor
            }}
          />
        </div>
      </div>
    </div>
  );
};

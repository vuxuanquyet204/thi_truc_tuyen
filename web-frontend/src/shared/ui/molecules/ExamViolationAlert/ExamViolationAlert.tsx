import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, X, Clock, Shield, Eye, Users, MousePointer, Activity, Smartphone } from 'lucide-react';
import { CheatingDetection } from '@/features/proctoring/hooks';

interface ExamViolationAlertProps {
  violation: CheatingDetection | null;
  onDismiss: () => void;
  onStopExam: () => void;
  isVisible: boolean;
}

const getSeverityColor = (severity: CheatingDetection['severity']) => {
  switch (severity) {
    case 'low': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'high': return '#ef4444';
    case 'critical': return '#dc2626';
    default: return '#6b7280';
  }
};

const getSeverityRGB = (severity: CheatingDetection['severity']) => {
  switch (severity) {
    case 'low': return '16, 185, 129';
    case 'medium': return '245, 158, 11';
    case 'high': return '239, 68, 68';
    case 'critical': return '220, 38, 38';
    default: return '107, 114, 128';
  }
};

const getSeverityLabel = (severity: CheatingDetection['severity']) => {
  switch (severity) {
    case 'low': return 'Cảnh báo nhẹ';
    case 'medium': return 'Cảnh báo trung bình';
    case 'high': return 'Cảnh báo cao';
    case 'critical': return 'Cảnh báo nghiêm trọng';
    default: return 'Cảnh báo';
  }
};

const getSeverityIcon = (severity: CheatingDetection['severity']) => {
  const props = { width: 22, height: 22 };
  switch (severity) {
    case 'low': return <Activity {...props} />;
    case 'medium': return <AlertTriangle {...props} />;
    case 'high': return <AlertTriangle {...props} />;
    case 'critical': return <AlertTriangle {...props} />;
    default: return <Activity {...props} />;
  }
};

const getDetectionIcon = (type: CheatingDetection['type']) => {
  const props = { width: 20, height: 20 };
  switch (type) {
    case 'FACE_NOT_DETECTED': return <Eye {...props} />;
    case 'MULTIPLE_FACES': return <Users {...props} />;
    case 'MOBILE_PHONE_DETECTED': return <Smartphone {...props} />;
    case 'CAMERA_TAMPERED': return <AlertTriangle {...props} />;
    case 'LOOKING_AWAY': return <Eye {...props} />;
    case 'tab_switch': return <MousePointer {...props} />;
    default: return <Activity {...props} />;
  }
};

const getDetectionTitle = (type: CheatingDetection['type']) => {
  switch (type) {
    case 'FACE_NOT_DETECTED': return 'Không phát hiện khuôn mặt';
    case 'MULTIPLE_FACES': return 'Nhiều người trong khung hình';
    case 'MOBILE_PHONE_DETECTED': return 'Phát hiện điện thoại';
    case 'CAMERA_TAMPERED': return 'Camera bị can thiệp';
    case 'LOOKING_AWAY': return 'Nhìn ra ngoài';
    case 'tab_switch': return 'Chuyển tab hoặc cửa sổ';
    default: return 'Hành vi bất thường';
  }
};

export const ExamViolationAlert: React.FC<ExamViolationAlertProps> = ({
  violation,
  onDismiss,
  onStopExam,
  isVisible,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [isStopping, setIsStopping] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible && violation && !isDismissed) {
      setTimeRemaining(15);
      setIsStopping(false);
      setIsDismissed(false);

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsStopping(true);
            setTimeout(() => onStopExam(), 800);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isVisible, violation, isDismissed, onStopExam]);

  const handleDismiss = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsDismissed(true);
    setTimeout(() => onDismiss(), 200);
  }, [onDismiss]);

  const handleStopExam = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsStopping(true);
    setTimeout(() => onStopExam(), 800);
  }, [onStopExam]);

  // Luôn render khi visible, dùng display:none khi không
  if (!violation || isDismissed) return null;

  const severityColor = getSeverityColor(violation.severity);
  const severityRGB = getSeverityRGB(violation.severity);
  const isCritical = violation.severity === 'critical' || violation.severity === 'high';
  const progressPercent = (timeRemaining / 15) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isStopping
          ? `rgba(${severityRGB}, 0.9)`
          : 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        animation: 'violationFadeIn 0.25s ease-out',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Modal Card */}
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          borderLeft: `6px solid ${severityColor}`,
          boxShadow: `0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.05)`,
          overflow: 'hidden',
          animation: 'violationSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid #f3f4f6',
            background: `linear-gradient(135deg, rgba(${severityRGB}, 0.04) 0%, #fff 100%)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${severityColor}22 0%, ${severityColor}11 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: severityColor,
              }}
            >
              {getSeverityIcon(violation.severity)}
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#111827',
                  lineHeight: 1.3,
                }}
              >
                {violation.description || getDetectionTitle(violation.type)}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 700,
                  color: severityColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginTop: '2px',
                }}
              >
                {getSeverityLabel(violation.severity)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Countdown Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 14px',
                borderRadius: '10px',
                background: timeRemaining <= 5
                  ? '#fee2e2'
                  : '#f3f4f6',
                color: timeRemaining <= 5
                  ? '#dc2626'
                  : '#374151',
                fontWeight: 700,
                fontSize: '15px',
                animation: timeRemaining <= 5
                  ? 'violationPulse 0.8s ease-in-out infinite'
                  : 'none',
              }}
            >
              <Clock width={16} height={16} />
              <span>{timeRemaining}s</span>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                color: '#9ca3af',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#9ca3af';
              }}
              title="Đóng cảnh báo"
            >
              <X width={18} height={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Detection Info Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${severityColor}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: severityColor,
                flexShrink: 0,
              }}
            >
              {getDetectionIcon(violation.type)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#374151',
                lineHeight: 1.5,
              }}>
                {violation.description}
              </p>
              <p style={{
                margin: '4px 0 0',
                fontSize: '12px',
                color: '#9ca3af',
                fontWeight: 500,
              }}>
                Độ tin cậy: {violation.confidence.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Warning Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '14px 16px',
              background: isCritical ? '#fef2f2' : '#fffbeb',
              border: `1px solid ${isCritical ? '#fca5a5' : '#fcd34d'}`,
              borderRadius: '10px',
            }}
          >
            <Shield
              width={20}
              height={20}
              style={{
                color: severityColor,
                flexShrink: 0,
                marginTop: '1px',
              }}
            />
            <div style={{ fontSize: '13px', lineHeight: 1.6, color: isCritical ? '#991b1b' : '#92400e' }}>
              {isCritical ? (
                <>
                  <strong style={{ fontWeight: 700 }}>Cảnh báo nghiêm trọng!</strong>
                  <br />
                  Hành vi này có thể dẫn đến việc dừng bài thi.
                  <br />
                  Vui lòng tuân thủ quy định thi để tiếp tục.
                </>
              ) : (
                <>
                  <strong style={{ fontWeight: 700 }}>Lưu ý:</strong>
                  <br />
                  Hành vi này đã được ghi nhận. Nếu tiếp tục,
                  <br />
                  bài thi có thể bị dừng.
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderTop: '1px solid #f3f4f6',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleDismiss}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #4b5563 0%, #374151 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #374151 0%, #1f2937 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
              }}
            >
              Tôi hiểu
            </button>

            {isCritical && (
              <button
                onClick={handleStopExam}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Dừng bài thi
              </button>
            )}
          </div>

          <p
            style={{
              textAlign: 'center',
              fontSize: '12px',
              color: timeRemaining <= 5 ? '#dc2626' : '#6b7280',
              fontWeight: timeRemaining <= 5 ? 700 : 500,
              margin: 0,
              animation: timeRemaining <= 5 ? 'violationPulse 0.8s ease-in-out infinite' : 'none',
            }}
          >
            {timeRemaining <= 5
              ? `⚠ Bài thi sẽ tự động dừng sau ${timeRemaining} giây!`
              : `Bài thi sẽ tự động dừng nếu không phản hồi sau ${timeRemaining} giây`}
          </p>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: '4px',
            background: '#f3f4f6',
            width: '100%',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: severityColor,
              transition: 'width 1s linear, background-color 0.3s',
            }}
          />
        </div>
      </div>

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes violationFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes violationSlideIn {
          from { transform: scale(0.9) translateY(-20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes violationPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

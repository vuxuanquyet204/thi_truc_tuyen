import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, AlertTriangle, Eye, Users, Volume2, MousePointer, Activity, Settings, Play, Square, Zap, Smartphone } from 'lucide-react';
import { useAICameraMonitor, CheatingDetection } from '@/features/proctoring/hooks';
import Button from '@/shared/ui/atoms/Button/Button';
import styles from './AICameraMonitor.module.css';

interface AICameraMonitorProps {
  examId: string;
  studentId: string;
  sessionId?: string;
  onViolationDetected?: (detection: CheatingDetection) => void;
  onMetricsUpdate?: (metrics: any) => void;
  onAdminWarning?: (data: { message: string; sentBy?: string | null; timestamp: string }) => void;
  onExamTerminated?: (data: { reason?: string; terminatedBy?: string | null }) => void;
  onConnectionLost?: () => void;   // Gọi khi WebSocket mất kết nối
  onConnectionRestored?: () => void; // Gọi khi WebSocket reconnect thành công
  className?: string;
  shouldStop?: boolean; // Prop để báo cho component biết cần dừng camera
  hideHeader?: boolean; // Ẩn header khi dùng chung với ProctoringView
}

export const AICameraMonitor = React.memo(({
  examId,
  studentId,
  sessionId,
  onViolationDetected,
  onMetricsUpdate,
  onAdminWarning,
  onExamTerminated,
  onConnectionLost,
  onConnectionRestored,
  className = '',
  shouldStop = false,
  hideHeader = false,
}: AICameraMonitorProps) => {
  // Declare refs BEFORE use in callbacks
  const hasAutoStartedRef = useRef(false);
  const isSocketReadyRef = useRef(false);

  const {
    isActive,
    isAnalyzing,
    error,
    connectionLost,
    detections,
    metrics,
    startMonitoring,
    stopMonitoring,
    captureScreenshot,
    setDetectionSensitivity,
    enableDetectionType,
    frameStorage
  } = useAICameraMonitor({
    examId,
    studentId,
    sessionId,
    onAdminWarning,
    onExamTerminated,
    onSocketConnected: () => {
      isSocketReadyRef.current = true;
      tryStartCamera();
      onConnectionRestoredRef.current?.();
    }
  });

  // Track connectionLost transitions and notify parent
  const prevConnectionLostRef = useRef(false);
  useEffect(() => {
    if (prevConnectionLostRef.current === false && connectionLost === true) {
      onConnectionLostRef.current?.();
    }
    prevConnectionLostRef.current = connectionLost;
  }, [connectionLost]);

  const [showSettings, setShowSettings] = useState(false);
  const [detectionTypes, setDetectionTypes] = useState({
    FACE_NOT_DETECTED: true,
    MULTIPLE_FACES: true,
    MOBILE_PHONE_DETECTED: true,
    CAMERA_TAMPERED: true,
    LOOKING_AWAY: true,
    tab_switch: true
  });

  const [sensitivity, setSensitivity] = useState<'low' | 'medium' | 'high'>('medium');

  const onViolationDetectedRef = useRef(onViolationDetected);
  onViolationDetectedRef.current = onViolationDetected;

  const onConnectionLostRef = useRef(onConnectionLost);
  onConnectionLostRef.current = onConnectionLost;

  const onConnectionRestoredRef = useRef(onConnectionRestored);
  onConnectionRestoredRef.current = onConnectionRestored;

  const tryStartCamera = () => {
    if (hasAutoStartedRef.current || isActive || isAnalyzing || error) {
      return;
    }
    if (!sessionId) {
      console.log('[AICameraMonitor] autoStart: chờ sessionId...');
      return;
    }
    console.log('[AICameraMonitor] autoStart: bắt đầu camera...');
    hasAutoStartedRef.current = true;
    startMonitoring().catch((err: Error) => {
      console.error('Failed to auto-start camera:', err);
      hasAutoStartedRef.current = false;
    });
  };

  useEffect(() => {
    // Reset state when sessionId changes - this is intentional
    // Socket auto-starts via onSocketConnected callback in useAICameraMonitor
  }, [sessionId]);

  // Notify parent components of violations
  useEffect(() => {
    if (detections.length > 0) {
      const latestDetection = detections[detections.length - 1];
      onViolationDetectedRef.current?.(latestDetection);
    }
  }, [detections]);

  // Notify parent components of metrics updates
  useEffect(() => {
    if (metrics) {
      onMetricsUpdate?.(metrics);
    }
  }, [metrics, onMetricsUpdate]);

  // Auto-stop camera when shouldStop prop becomes true (e.g., when exam is submitted)
  useEffect(() => {
    if (shouldStop && isActive) {
      console.log('[AICameraMonitor] Exam submitted, stopping camera monitoring...');
      stopMonitoring();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldStop, isActive]); // Không cần stopMonitoring trong deps - stable reference

  const handleStartMonitoring = async () => {
    try {
      await startMonitoring();
    } catch (err) {
      console.error('Failed to start monitoring:', err);
    }
  };

  const handleStopMonitoring = () => {
    stopMonitoring();
  };

  const handleSensitivityChange = (newSensitivity: 'low' | 'medium' | 'high') => {
    setSensitivity(newSensitivity);
    setDetectionSensitivity(newSensitivity);
  };

  const handleDetectionTypeToggle = (type: keyof typeof detectionTypes) => {
    const newTypes = { ...detectionTypes, [type]: !detectionTypes[type] };
    setDetectionTypes(newTypes);
    enableDetectionType(type, newTypes[type]);
  };

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

  const getSeverityIcon = (severity: CheatingDetection['severity']) => {
    switch (severity) {
      case 'low': return <Activity className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getDetectionTypeIcon = (type: CheatingDetection['type']) => {
    switch (type) {
      case 'FACE_NOT_DETECTED': return <Camera className="w-4 h-4" />;
      case 'MULTIPLE_FACES': return <Users className="w-4 h-4" />;
      case 'MOBILE_PHONE_DETECTED': return <Smartphone className="w-4 h-4" />;
      case 'CAMERA_TAMPERED': return <AlertTriangle className="w-4 h-4" />;
      case 'LOOKING_AWAY': return <Eye className="w-4 h-4" />;
      case 'tab_switch': return <MousePointer className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getDetectionTypeName = (type: CheatingDetection['type']) => {
    switch (type) {
      case 'FACE_NOT_DETECTED': return 'Không phát hiện khuôn mặt';
      case 'MULTIPLE_FACES': return 'Nhiều người';
      case 'MOBILE_PHONE_DETECTED': return 'Phát hiện điện thoại';
      case 'CAMERA_TAMPERED': return 'Camera bị can thiệp';
      case 'LOOKING_AWAY': return 'Nhìn ra ngoài';
      case 'tab_switch': return 'Chuyển tab';
      default: return 'Không xác định';
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Header — ẩn khi dùng chung với ProctoringView để tránh duplicate */}
      {!hideHeader && (
        <div className={styles.header}>
          <div className={styles.title}>
            <Camera className="w-5 h-5" />
            <span>AI Camera Monitor</span>
            {isActive && (
              <div className={styles.statusIndicator}>
                <div className={styles.activeDot} />
                <span>Đang hoạt động</span>
              </div>
            )}
          </div>

          <div className={styles.controls}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={styles.settingsButton}
            >
              <Settings className="w-4 h-4" />
            </Button>

            {!isActive ? (
              <Button
                onClick={handleStartMonitoring}
                disabled={isAnalyzing}
                className={styles.startButton}
              >
                {isAnalyzing ? (
                  <>
                    <div className={styles.spinner} />
                    Đang khởi động...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Bắt đầu
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleStopMonitoring}
                variant="outline"
                className={`${styles.stopButton} ${styles.destructiveButton}`}
              >
                <Square className="w-4 h-4" />
                Dừng
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={styles.error}>
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className={styles.settingsPanel}>
          <h4 className={styles.settingsTitle}>Cài đặt phát hiện</h4>
          
          {/* Sensitivity */}
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Độ nhạy:</label>
            <div className={styles.sensitivityButtons}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <Button
                  key={level}
                  variant={sensitivity === level ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleSensitivityChange(level)}
                >
                  {level === 'low' && 'Thấp'}
                  {level === 'medium' && 'Trung bình'}
                  {level === 'high' && 'Cao'}
                </Button>
              ))}
            </div>
          </div>

          {/* Detection Types */}
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Loại phát hiện:</label>
            <div className={styles.detectionTypes}>
              {Object.entries(detectionTypes).map(([type, enabled]) => (
                <label key={type} className={styles.detectionTypeItem}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => handleDetectionTypeToggle(type as keyof typeof detectionTypes)}
                  />
                  <span className={styles.detectionTypeIcon}>
                    {getDetectionTypeIcon(type as CheatingDetection['type'])}
                  </span>
                  <span>{getDetectionTypeName(type as CheatingDetection['type'])}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Display */}
      {metrics && (
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>FPS:</span>
            <span className={styles.metricValue}>{metrics.fps.toFixed(1)}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Độ phân giải:</span>
            <span className={styles.metricValue}>{metrics.resolution}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Độ sáng:</span>
            <span className={styles.metricValue}>{metrics.brightness.toFixed(0)}%</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Trạng thái:</span>
            <span className={`${styles.metricValue} ${metrics.isStable ? styles.stable : styles.unstable}`}>
              {metrics.isStable ? 'Ổn định' : 'Không ổn định'}
            </span>
          </div>
        </div>
      )}

      {/* Detections List */}
      {detections.length > 0 && (
        <div className={styles.detections}>
          <h4 className={styles.detectionsTitle}>
            Phát hiện gian lận ({detections.length})
          </h4>
          <div className={styles.detectionsList}>
            {detections.slice(-5).reverse().map((detection, index) => (
              <div
                key={`${detection.timestamp}-${index}`}
                className={styles.detectionItem}
                style={{
                  borderLeftColor: getSeverityColor(detection.severity),
                  borderLeftWidth: '3px',
                  background: `linear-gradient(135deg, rgba(${getSeverityRGB(detection.severity)}, 0.06) 0%, transparent 60%)`,
                  borderTop: '1px solid var(--border)',
                  borderRight: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div className={styles.detectionHeader}>
                  <div className={styles.detectionType}>
                    {getDetectionTypeIcon(detection.type)}
                    <span>{getDetectionTypeName(detection.type)}</span>
                  </div>
                  <div className={styles.detectionSeverity}>
                    {getSeverityIcon(detection.severity)}
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: getSeverityColor(detection.severity),
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }}
                    >
                      {detection.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className={styles.detectionDescription}>
                  {detection.description}
                </div>
                <div className={styles.detectionMeta}>
                  <span className={styles.confidence}>
                    Độ tin cậy: {detection.confidence.toFixed(0)}%
                  </span>
                  <span className={styles.timestamp}>
                    {new Date(detection.timestamp).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
                {detection.screenshot && (
                  <div className={styles.screenshot}>
                    <img
                      src={detection.screenshot}
                      alt="Screenshot vi phạm"
                      className={styles.screenshotImage}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isActive && !error && (
        <div className={styles.emptyState}>
          <Camera className="w-12 h-12" />
          <h3>AI Camera Monitor</h3>
          <p>Nhấn "Bắt đầu" để khởi động giám sát camera với AI</p>
        </div>
      )}
    </div>
  );
});

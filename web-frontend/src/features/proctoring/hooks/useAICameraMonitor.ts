import { useState, useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { proctoringService } from '@/features/proctoring/api/proctoringService';
import { cameraManager } from '@/features/proctoring/api/cameraManager';
import { useFrameStorage } from './useFrameStorage';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
];

const isBrowser = typeof window !== 'undefined';

// Use API Gateway WebSocket endpoint for proctoring (Socket.IO path)
const DEFAULT_PROCTORING_WS_URL =
  (isBrowser && (window as any)?.__PROCTORING_WS_URL) ??
  ((import.meta as any)?.env?.VITE_PROCTORING_WS_URL as string | undefined) ??
  (import.meta.env.VITE_API_BASE_URL || '');

export interface CheatingDetection {
  type: 'FACE_NOT_DETECTED' | 'MULTIPLE_FACES' | 'MOBILE_PHONE_DETECTED' | 'CAMERA_TAMPERED' | 'LOOKING_AWAY' | 'tab_switch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  timestamp: number;
  description: string;
  screenshot?: string;
  metadata?: any;
}

export interface CameraMetrics {
  fps: number;
  resolution: string;
  brightness: number;
  contrast: number;
  isStable: boolean;
}

export interface AICameraMonitorReturn {
  // Camera state
  isActive: boolean;
  isAnalyzing: boolean;
  error: string | null;
  connectionLost: boolean; // true khi WebSocket mất kết nối

  // Detection results
  detections: CheatingDetection[];
  metrics: CameraMetrics | null;
  
  // Actions
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
  captureScreenshot: () => string | null;
  
  // Configuration
  setDetectionSensitivity: (level: 'low' | 'medium' | 'high') => void;
  enableDetectionType: (type: CheatingDetection['type'], enabled: boolean) => void;
  
  // Frame Storage
  frameStorage: {
    totalFramesCaptured: number;
    totalDetections: number;
    storageSize: number;
    getStatistics: () => any;
    exportData: () => void;
    clearAll: () => void;
  };
}

interface UseAICameraMonitorProps {
  examId?: string;
  studentId?: string;
  sessionId?: string;
  onViolationDetected?: (detection: CheatingDetection) => void;
  onAdminWarning?: (data: { message: string; sentBy?: string | null; timestamp: string }) => void;
  onExamTerminated?: (data: { reason?: string; terminatedBy?: string | null }) => void;
  onSocketConnected?: () => void; // Callback khi WebSocket connect thành công
}

interface CameraState {
  isActive: boolean;
  isAnalyzing: boolean;
  error: string | null;
  detections: CheatingDetection[];
  metrics: CameraMetrics | null;
  detectionSensitivity: 'low' | 'medium' | 'high';
  enabledDetections: Set<CheatingDetection['type']>;
  connectionLost: boolean; // true khi WebSocket mất kết nối và chưa reconnect lại
}

const initialState: CameraState = {
  isActive: false,
  isAnalyzing: false,
  error: null,
  detections: [],
  metrics: null,
  detectionSensitivity: 'medium',
  enabledDetections: new Set(['FACE_NOT_DETECTED', 'MULTIPLE_FACES', 'MOBILE_PHONE_DETECTED', 'CAMERA_TAMPERED', 'LOOKING_AWAY', 'tab_switch']),
  connectionLost: false
};

export const useAICameraMonitor = (props?: UseAICameraMonitorProps): AICameraMonitorReturn => {
  const { examId = 'default', studentId = '1', sessionId, onAdminWarning, onExamTerminated, onViolationDetected, onSocketConnected } = props || {};
  const [state, setState] = useState<CameraState>(initialState);

  // Frame Storage Hook
  const frameStorage = useFrameStorage({
    maxFrames: 100,
    maxResponses: 200,
    autoCleanup: true,
    cleanupInterval: 60000 // 1 minute
  });
  
  // Refs for tracking state
  const isActiveRef = useRef(false);
  const detectionCooldownRef = useRef(0); // Cooldown between detections

  // Helper functions to update state
  const updateState = useCallback((updates: Partial<CameraState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const pendingFrameIdRef = useRef<string | null>(null);
  const frameProcessedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cameraUsageRef = useRef(false);
  const visibilityListenerRef = useRef<(() => void) | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const socketIdRef = useRef<string | null>(null); // Track current socket ID
  const isStoppingRef = useRef(false); // Guard để ngăn stopMonitoring gọi liên tục
  const isSocketConnectedRef = useRef(false); // Track WebSocket connection state
  const hasAutoStartedRef = useRef(false); // Ngăn autoStart chạy nhiều lần
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null); // Heartbeat interval

  // ============================================================
  // Ngăn crash khi effect cleanup chạy sau khi component unmount
  // ============================================================
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const sessionIdRef = useRef<string | undefined>(props?.sessionId);

  // Keep sessionIdRef in sync with props
  useEffect(() => {
    sessionIdRef.current = props?.sessionId;
  }, [props?.sessionId]);

  // Stable ref cho enabledDetections - tránh closure issues trong startMonitoring
  const enabledDetectionsRef = useRef<Set<CheatingDetection['type']>>(new Set(['FACE_NOT_DETECTED', 'MULTIPLE_FACES', 'MOBILE_PHONE_DETECTED', 'CAMERA_TAMPERED', 'LOOKING_AWAY', 'tab_switch']));

  // Sync enabledDetectionsRef với state
  useEffect(() => {
    enabledDetectionsRef.current = state.enabledDetections;
  }, [state.enabledDetections]);

  const teardownPeerConnection = useCallback((proctorSocketId: string) => {
    const peer = peerConnectionsRef.current.get(proctorSocketId);
    if (!peer) {
      return;
    }

    try {
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onconnectionstatechange = null;
      peer.close();
    } catch (error) {
      console.warn('[AICameraMonitor] Không thể đóng peer connection', error);
    }

    peerConnectionsRef.current.delete(proctorSocketId);
  }, []);

  const teardownAllPeers = useCallback(() => {
    peerConnectionsRef.current.forEach((_peer, proctorSocketId) => {
      teardownPeerConnection(proctorSocketId);
    });
    peerConnectionsRef.current.clear();
  }, [teardownPeerConnection]);

  // ============================================================
  // Heartbeat & Reconnect — defined OUTSIDE useEffect so stopMonitoring can call them.
  // ============================================================
  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const startHeartbeat = () => {
    stopHeartbeat();
    // Gửi heartbeat mỗi 20s — nhỏ hơn server pingInterval 25s
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('client_ping');
      }
    }, 20000);
  };

  // ============================================================
  // WebRTC: Phản hồi offer request từ giám thị.
  // Dùng socketRef và peerConnectionsRef (stable references).
  // ============================================================
  const respondToProctorOfferRequest = useCallback(
    async (proctorSocketId: string) => {
      if (!isBrowser) {
        return;
      }

      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        console.warn('[AICameraMonitor] Socket chưa sẵn sàng để gửi stream');
        return;
      }

      const existingPeer = peerConnectionsRef.current.get(proctorSocketId);
      if (existingPeer) {
        teardownPeerConnection(proctorSocketId);
      }

      let stream = cameraManager.currentStream;
      if (!stream) {
        try {
          stream = await cameraManager.start();
        } catch (error) {
          console.error('[AICameraMonitor] Không thể khởi tạo camera để stream cho giám thị', error);
          return;
        }
      }

      if (!stream) {
        console.warn('[AICameraMonitor] Không có camera stream để gửi cho giám thị');
        return;
      }

      const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peerConnectionsRef.current.set(proctorSocketId, peerConnection);

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream!);
      });

      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          socket.emit('webrtc_ice_candidate', {
            candidate: event.candidate,
            targetSocketId: proctorSocketId,
          });
        }
      };

      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        if (state === 'failed' || state === 'disconnected' || state === 'closed') {
          teardownPeerConnection(proctorSocketId);
        }
      };

      try {
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: false,
          offerToReceiveVideo: false,
        });
        await peerConnection.setLocalDescription(offer);

        socket.emit('webrtc_offer', {
          offer,
          targetSocketId: proctorSocketId,
        });
      } catch (error) {
        console.error('[AICameraMonitor] Lỗi khi tạo WebRTC offer cho giám thị', error);
        teardownPeerConnection(proctorSocketId);
      }
    },
    // Chỉ phụ thuộc vào stable refs, KHÔNG có sessionId
    [teardownPeerConnection],
  );

  // ============================================================
  // CRITICAL: Socket được tạo 1 LẦN DUY NHẤT khi examId+studentId cố định.
  // KHÔNG đưa sessionId vào dependency → tránh reconnect liên tục.
  // sessionId chỉ là metadata, dùng sessionIdRef trong analyzeFrame.
  // ============================================================
  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    if (!examId || !studentId) {
      return;
    }

    // Bước camera-check (examId="camera-check"): KHÔNG kết nối WebSocket
    // Chỉ test camera local, không cần gửi frame lên server
    if (examId === 'camera-check') {
      return;
    }

    const serverUrl = DEFAULT_PROCTORING_WS_URL;
    const normalizedExamId = String(examId);
    const normalizedStudentId = String(studentId);

    // Nếu socket đã tồn tại cho examId này → KHÔNG tạo lại
    // (đảm bảo 1 student chỉ có 1 kết nối WebSocket trong suốt phiên thi)
    if (socketRef.current?.connected) {
      console.log('[AICameraMonitor] Socket đã tồn tại, bỏ qua tạo mới:', normalizedExamId);
      return;
    }

    console.log('[AICameraMonitor] Tạo WebSocket mới cho examId:', normalizedExamId);

    const socket = io(serverUrl, {
      path: '/socket.io',
      query: {
        examId: normalizedExamId,
        userId: normalizedStudentId,
        userType: 'student',
      },
      // === TRANSPORT ===
      // Polling ổn định qua Vite proxy → gateway → service chain
      transports: ['polling'],
      // === RECONNECT ===
      // TẮT auto-reconnect. Quản lý reconnect THỦ CÔNG trong disconnect handler
      // để kiểm soát hoàn toàn hành vi và tránh vòng lặp.
      reconnection: false,
      timeout: 30000,
    });

    socketRef.current = socket;
    socketIdRef.current = null;

    const handleOfferRequest = (payload: { proctorSocketId?: string; studentIdToView?: string }) => {
      const { proctorSocketId, studentIdToView } = payload || {};
      if (!proctorSocketId) {
        return;
      }
      if (studentIdToView && String(studentIdToView) !== normalizedStudentId) {
        return;
      }
      respondToProctorOfferRequest(proctorSocketId);
    };

    const handleAnswerReceived = async (payload: { answer: RTCSessionDescriptionInit; senderSocketId: string }) => {
      const { answer, senderSocketId } = payload;
      const peer = peerConnectionsRef.current.get(senderSocketId);
      if (!peer || !answer) {
        return;
      }

      try {
        if (!peer.remoteDescription || peer.remoteDescription.type !== answer.type) {
          await peer.setRemoteDescription(answer);
        }
      } catch (error) {
        console.error('[AICameraMonitor] Không thể thiết lập remote description', error);
        teardownPeerConnection(senderSocketId);
      }
    };

    const handleIceCandidateReceived = async (payload: { candidate: RTCIceCandidateInit | null; senderSocketId: string }) => {
      const { candidate, senderSocketId } = payload;
      const peer = peerConnectionsRef.current.get(senderSocketId);
      if (!peer) {
        return;
      }

      try {
        if (candidate) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
        // Note: addIceCandidate(null) is deprecated, just skip if no candidate
      } catch (error) {
        console.error('[AICameraMonitor] Không thể thêm ICE candidate', error);
      }
    };

    const handleSocketDisconnect = () => {
      const currentSocketId = socketIdRef.current;
      const isIntentional = isStoppingRef.current;
      console.log(`[AICameraMonitor] ⚠️ WebSocket disconnected (socketId: ${currentSocketId}, intentional: ${isIntentional})`);
      socketIdRef.current = null;
      isSocketConnectedRef.current = false;
      stopHeartbeat();
      teardownAllPeers();

      // Chỉ đánh dấu mất kết nối khi intentional=false
      // Socket.IO sẽ tự động reconnect nếu reconnection=true
      if (!isIntentional) {
        updateState({ connectionLost: true });
        // KHÔNG gọi scheduleReconnect() — Socket.IO tự handle với exponential backoff
      }
    };

    const handleAdminWarning = (data: { sessionId?: string; userId?: string; examId?: string; message?: string; sentBy?: string | null; timestamp?: string }) => {
      console.log('[AICameraMonitor] Nhận admin_warning event:', {
        data,
        currentSessionId: sessionIdRef.current,
        currentStudentId: normalizedStudentId,
        currentExamId: normalizedExamId
      });
      
      // Kiểm tra xem có match không: sessionId khớp HOẶC (userId khớp VÀ examId khớp)
      let shouldProcess = false;
      let matchReason = '';
      
      // Nếu sessionId khớp
      if (sessionIdRef.current && data.sessionId && data.sessionId === sessionIdRef.current) {
        shouldProcess = true;
        matchReason = 'sessionId khớp';
      }
      // HOẶC nếu userId khớp (và examId khớp nếu có)
      else if (data.userId && String(data.userId) === normalizedStudentId) {
        // Nếu có examId, kiểm tra examId cũng phải khớp
        if (data.examId) {
          if (String(data.examId) === normalizedExamId) {
            shouldProcess = true;
            matchReason = 'userId và examId khớp';
          } else {
            console.log('[AICameraMonitor] Bỏ qua warning: userId khớp nhưng examId không khớp', {
              receivedExamId: String(data.examId),
              expectedExamId: normalizedExamId,
              userId: String(data.userId)
            });
            return;
          }
        } else {
          // Nếu không có examId, chỉ cần userId khớp
          shouldProcess = true;
          matchReason = 'userId khớp';
        }
      }
      
      if (!shouldProcess) {
        console.log('[AICameraMonitor] Bỏ qua warning: không có điều kiện nào khớp', {
          sessionIdMatch: sessionIdRef.current && data.sessionId ? data.sessionId === sessionIdRef.current : 'N/A',
          userIdMatch: data.userId ? String(data.userId) === normalizedStudentId : 'N/A',
          examIdMatch: data.examId ? String(data.examId) === normalizedExamId : 'N/A'
        });
        return;
      }
      
      console.log('[AICameraMonitor] ✅ Xử lý cảnh báo từ admin:', { data, matchReason });
      if (onAdminWarning) {
        onAdminWarning({
          message: data.message || 'Bạn đã nhận được cảnh báo từ giám thị',
          sentBy: data.sentBy ?? null,
          timestamp: data.timestamp || new Date().toISOString()
        });
      }
    };

    const handleExamTerminated = (data: { sessionId?: string; examId?: string; userId?: string; reason?: string; terminatedBy?: string | null }) => {
      console.log('[AICameraMonitor] Nhận proctoring_session_terminated event:', {
        data,
        currentSessionId: sessionIdRef.current,
        currentStudentId: normalizedStudentId,
        currentExamId: normalizedExamId
      });
      
      // Kiểm tra xem có match không: sessionId khớp HOẶC (userId khớp VÀ examId khớp)
      let shouldProcess = false;
      let matchReason = '';
      
      // Nếu sessionId khớp
      if (sessionIdRef.current && data.sessionId && data.sessionId === sessionIdRef.current) {
        shouldProcess = true;
        matchReason = 'sessionId khớp';
      }
      // HOẶC nếu userId khớp (và examId khớp nếu có)
      else if (data.userId && String(data.userId) === normalizedStudentId) {
        // Nếu có examId, kiểm tra examId cũng phải khớp
        if (data.examId) {
          if (String(data.examId) === normalizedExamId) {
            shouldProcess = true;
            matchReason = 'userId và examId khớp';
          } else {
            console.log('[AICameraMonitor] Bỏ qua terminate: userId khớp nhưng examId không khớp', {
              receivedExamId: String(data.examId),
              expectedExamId: normalizedExamId,
              userId: String(data.userId)
            });
            return;
          }
        } else {
          // Nếu không có examId, chỉ cần userId khớp
          shouldProcess = true;
          matchReason = 'userId khớp';
        }
      }
      
      if (!shouldProcess) {
        console.log('[AICameraMonitor] Bỏ qua terminate: không có điều kiện nào khớp', {
          sessionIdMatch: sessionIdRef.current && data.sessionId ? data.sessionId === sessionIdRef.current : 'N/A',
          userIdMatch: data.userId ? String(data.userId) === normalizedStudentId : 'N/A',
          examIdMatch: data.examId ? String(data.examId) === normalizedExamId : 'N/A'
        });
        return;
      }
      
      console.log('[AICameraMonitor] ✅ Xử lý sự kiện dừng phiên thi:', { data, matchReason });
      if (onExamTerminated) {
        onExamTerminated({
          reason: data.reason || 'Phiên thi đã bị dừng bởi giám thị',
          terminatedBy: data.terminatedBy ?? null
        });
      }
    };

    // --- Handle proctoring_alert from backend WebSocket (real-time violations) ---
    let lastWsViolationTime = 0;
    const WS_VIOLATION_COOLDOWN_MS = 3000;

    const handleProctoringAlert = (data: any) => {
      const now = Date.now();
      if (now - lastWsViolationTime < WS_VIOLATION_COOLDOWN_MS) {
        console.log('[AICameraMonitor] ⏳ WS alert bị skip do cooldown:', data.eventType);
        return;
      }
      lastWsViolationTime = now;

      console.log('[AICameraMonitor] 🚨 Nhận proctoring_alert từ WebSocket:', data);

      // Map backend event to CheatingDetection format
      const severity = data.eventData
        ? (typeof data.eventData === 'string'
            ? JSON.parse(data.eventData).severity
            : data.eventData.severity) || 'medium'
        : 'medium';

      const detection: CheatingDetection = {
        type: data.eventType || 'UNKNOWN',
        severity: severity.toLowerCase(),
        confidence: 95,
        timestamp: data.createdAt || now,
        description: getViolationDescription(data.eventType),
      };

      setState(prev => ({
        ...prev,
        detections: [...prev.detections, detection].slice(-50),
      }));
      if (onViolationDetected) {
        onViolationDetected(detection);
      }
    };

    // --- Handle AI result directly from proctoring-service (fast path) ---
    const handleAIResult = (data: { events: any[]; stats?: any; sessionId?: string; error?: string }) => {
      if (!data.sessionId || data.sessionId !== sessionIdRef.current) return;
      if (data.error) {
        console.error('[AICameraMonitor] AI result error:', data.error);
        return;
      }
      if (!data.events || data.events.length === 0) return;

      const newDetections = data.events.map(e => ({
        type: e.event_type || e.type || 'UNKNOWN',
        severity: (e.severity || 'medium').toLowerCase(),
        confidence: 95,
        timestamp: Date.now(),
        description: getViolationDescription(e.event_type || e.type),
      }));

      const now = Date.now();
      const last = state.detections[state.detections.length - 1];
      const skipCooldown = last &&
        (now - lastDetectionTimeRef.current < 3000) &&
        last.type === newDetections[0].type;

      if (!skipCooldown) {
        setState(prev => ({
          ...prev,
          detections: [...prev.detections, ...newDetections].slice(-50),
        }));
        lastDetectionTimeRef.current = now;
        newDetections.forEach(d => onViolationDetected?.(d));
      }
    };

    const getViolationDescription = (eventType?: string): string => {
      switch (eventType) {
        case 'FACE_NOT_DETECTED': return 'Không phát hiện khuôn mặt';
        case 'MULTIPLE_FACES': return 'Nhiều người trong khung hình';
        case 'MOBILE_PHONE_DETECTED': return 'Phát hiện điện thoại';
        case 'CAMERA_TAMPERED': return 'Camera bị can thiệp che';
        case 'LOOKING_AWAY': return 'Học sinh nhìn ra ngoài';
        case 'TALKING': return 'Phát hiện nói chuyện';
        case 'tab_switch': return 'Chuyển tab hoặc cửa sổ';
        default: return 'Phát hiện vi phạm giám sát';
      }
    };

    const handleFrameProcessed = (data: { sessionId?: string; success?: boolean; timestamp?: number }) => {
      if (data.sessionId !== sessionIdRef.current) return;
      const processingTime = data.timestamp ? Date.now() - data.timestamp : 0;
      console.log(`[AICameraMonitor] Frame processed: ${processingTime}ms`);
      updateState({ isAnalyzing: false });
    };

    const handleFrameError = (data: { sessionId?: string; error?: string }) => {
      if (data.sessionId !== sessionIdRef.current) return;
      console.error('[AICameraMonitor] Frame error:', data.error);
      updateState({ isAnalyzing: false, error: `AI processing error: ${data.error}` });
    };

    const handleConnect = () => {
      // Track socket ID để detect stale sockets (bị disconnect nhưng effect cleanup chưa chạy)
      socketIdRef.current = socket.id ?? null;
      isSocketConnectedRef.current = true;
      console.log('[AICameraMonitor] ✅ WebSocket connected:', {
        socketId: socket.id,
        examId: normalizedExamId,
        studentId: normalizedStudentId
      });
      updateState({ error: null, connectionLost: false });

      // Bắt đầu heartbeat để giữ kết nối sống qua gateway/proxy
      startHeartbeat();

      // Gọi callback để thông báo cho parent component
      if (onSocketConnected) {
        onSocketConnected();
      }
    };

    const handleConnected = (data: { socketId?: string; examId?: string; userId?: string; userType?: string; timestamp?: number }) => {
      console.log('[AICameraMonitor] ✅ Server confirmed connection:', data);
      updateState({ error: null });
    };

    const handleConnectError = (error: Error) => {
      console.error('[AICameraMonitor] ❌ WebSocket connection error:', error.message);
      updateState({ error: `Lỗi kết nối: ${error.message}` });
    };

    socket.on('connect', handleConnect);
    socket.on('connected', handleConnected);
    socket.on('connect_error', handleConnectError);
    // Nhận proctoring session ID từ backend — dùng ID này thay vì submissionId
    socket.on('session_info', (data: { sessionId?: string; examId?: string; userId?: string; status?: string }) => {
      console.log('[AICameraMonitor] ✅ Nhận session_info từ server:', data);
      if (data?.sessionId) {
        sessionIdRef.current = data.sessionId;
        console.log('[AICameraMonitor] Đã cập nhật sessionIdRef =', data.sessionId);
      }
    });
    // KHÔNG lắng nghe reconnect events vì reconnection=false
    socket.on('webrtc_offer_request', handleOfferRequest);
    socket.on('webrtc_answer_received', handleAnswerReceived);
    socket.on('webrtc_ice_candidate_received', handleIceCandidateReceived);
    socket.on('admin_warning', handleAdminWarning);
    socket.on('proctoring_session_terminated', handleExamTerminated);
    socket.on('proctoring_alert', handleProctoringAlert);
    socket.on('frame_processed', handleFrameProcessed);
    socket.on('frame_error', handleFrameError);
    socket.on('disconnect', handleSocketDisconnect);
    socket.on('disconnecting', (reason) => {
      console.log(`[AICameraMonitor] ⚠️ Socket disconnecting (reason: ${reason}), socketId: ${socket.id}`);
    });

    return () => {
      const currentSocketId = socket.id;
      const stack = new Error().stack;
      console.log(`[AICameraMonitor] Effect cleanup - Socket ID: ${currentSocketId}, Stack trace:`, stack);

      socket.off('frame_error', handleFrameError);
      socket.off('frame_processed', handleFrameProcessed);
      socket.off('proctoring_alert', handleProctoringAlert);
      socket.off('proctoring_session_terminated', handleExamTerminated);
      socket.off('admin_warning', handleAdminWarning);
      socket.off('webrtc_ice_candidate_received', handleIceCandidateReceived);
      socket.off('webrtc_answer_received', handleAnswerReceived);
      socket.off('webrtc_offer_request', handleOfferRequest);
      socket.off('connect_error', handleConnectError);
      socket.off('session_info');
      socket.off('connected', handleConnected);
      socket.off('connect', handleConnect);
      socket.off('disconnecting');
      socket.off('disconnect', handleSocketDisconnect);

      // Tắt reconnect TRƯỚC khi disconnect — ngăn Socket.IO tự reconnect khi exam kết thúc
      socket.io.opts.reconnection = false;
      socket.io.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [examId, studentId, onAdminWarning, onExamTerminated, onViolationDetected, respondToProctorOfferRequest, teardownAllPeers, teardownPeerConnection]);

  // Tab switch detection (vẫn giữ vì dùng Browser API, không cần backend)
  const detectTabSwitch = useCallback((): CheatingDetection | null => {
    if (document.hidden) {
      return {
        type: 'tab_switch',
        severity: 'medium',
        confidence: 100,
        timestamp: Date.now(),
        description: 'Phát hiện chuyển tab hoặc cửa sổ khác'
      };
    }
    return null;
  }, []);

  const captureScreenshot = useCallback((): string | null => {
    const dataUrl = cameraManager.captureFrame();

    if (!dataUrl) {
      console.warn('[captureScreenshot] NULL - cameraManager.captureFrame() tra null');
      console.warn('[captureScreenshot] currentStream:', !!cameraManager.currentStream, 'active:', cameraManager.currentStream?.active);
      return null;
    }

    console.log('[captureScreenshot] Da capture, size:', dataUrl.length, 'bytes, type:', dataUrl.substring(0, 30));

    const minSize = 5000; // Accept if > 5KB (relaxed from calculated minimum)
    if (dataUrl.length < minSize) {
      console.warn('captureScreenshot: Captured image too small:', dataUrl.length, 'bytes, expected >', minSize);
      return null;
    }

    return dataUrl;
  }, []);

  const updateCameraMetrics = useCallback(() => {
    const dimensions = cameraManager.getVideoDimensions();
    const fps = cameraManager.getFrameRate();

    const newMetrics: CameraMetrics = {
      fps: fps ?? 25 + Math.random() * 5,
      resolution: dimensions ? `${dimensions.width}x${dimensions.height}` : 'Không xác định',
      brightness: 50 + Math.random() * 30,
      contrast: 60 + Math.random() * 20,
      isStable: !!cameraManager.currentStream?.active,
    };

    updateState({ metrics: newMetrics });
  }, [updateState]);

  // ============================================================
  // analyzeFrame: Dùng stable refs trực tiếp, không phụ thuộc vào closures bên ngoài.
  // Điều này đảm bảo analyzeFrame stable và không bị tạo lại khi dependencies thay đổi.
  // ============================================================
  const analyzeFrame = useCallback(async () => {
    if (!isActiveRef.current) {
      return;
    }

    try {
      // Dùng cameraManager trực tiếp (module-level singleton, stable)
      const dataUrl = cameraManager.captureFrame();
      if (!dataUrl) {
        console.warn('[AICameraMonitor] captureScreenshot returned null - camera may not be ready');
        return;
      }

      const minSize = 5000;
      if (dataUrl.length < minSize) {
        console.warn('captureScreenshot: Captured image too small:', dataUrl.length, 'bytes');
        return;
      }

      const screenshot = dataUrl;
      const currentSessionId = sessionIdRef.current;

      console.log(`[AICameraMonitor >>> WS] Sending frame to server, session=${currentSessionId}, size=${(screenshot.length / 1024).toFixed(1)}KB`);

      updateState({ isAnalyzing: true });

      const frameId = frameStorage.addFrame(screenshot, examId, studentId);

      // Dùng socketRef.current - stable reference, không cần socket trong deps
      if (!socketRef.current?.connected) {
        console.error('[AICameraMonitor] Socket not connected! Cannot emit frame.');
        return;
      }
      // Đợi backend emit session_info về trước khi gửi frame
      if (!currentSessionId) {
        console.warn('[AICameraMonitor] Chưa có proctoring session ID (chờ backend emit session_info), bỏ qua frame này');
        updateState({ isAnalyzing: false });
        return;
      }
      socketRef.current?.emit('stream_frame_for_ai', {
        image: screenshot,
        sessionId: currentSessionId,
        studentId,
        examId,
        timestamp: Date.now(),
      });

      console.log(`[AICameraMonitor >>> WS] Frame emitted, frameId=${frameId}`);

      pendingFrameIdRef.current = frameId;
      if (frameProcessedTimeoutRef.current) {
        clearTimeout(frameProcessedTimeoutRef.current);
      }
      frameProcessedTimeoutRef.current = setTimeout(() => {
        if (pendingFrameIdRef.current === frameId) {
          pendingFrameIdRef.current = null;
          updateState({ isAnalyzing: false });
        }
      }, 2000);

    } catch (error) {
      console.error('[AICameraMonitor] analyzeFrame error:', error);
      updateState({ isAnalyzing: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, studentId]); // Chỉ phụ thuộc examId/studentId - stable identity

  const startMonitoring = useCallback(async () => {
    if (isActiveRef.current) {
      return;
    }

    try {
      updateState({ error: null, isAnalyzing: true });

      console.log('[AICameraMonitor] Bat dau khoi dong camera...');

      if (!cameraUsageRef.current) {
        cameraManager.incrementUsage();
        cameraUsageRef.current = true;
      }

      console.log('[AICameraMonitor] Goi cameraManager.start()...');
      const stream = await cameraManager.start();
      console.log('[AICameraMonitor] cameraManager.start() thanh cong, stream:', !!stream, 'active:', stream?.active);

      updateState({ isActive: true, isAnalyzing: false });
      isActiveRef.current = true;

      if (!analysisIntervalRef.current) {
        // analyzeFrame giờ stable (deps: [examId, studentId]), an toàn dùng trong interval
        analysisIntervalRef.current = setInterval(analyzeFrame, 3000);
        console.log('[AICameraMonitor] Da set interval gui frame (3s)');
      }

      console.log('[AICameraMonitor] Goi analyzeFrame() dau tien...');
      analyzeFrame();

      // Tab switch detection: dùng ref để tránh tạo closure mới
      // enabledDetectionsRef được cập nhật khi state thay đổi
      const handleVisibilityChange = () => {
        if (enabledDetectionsRef.current.has('tab_switch')) {
          analyzeFrame();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      visibilityListenerRef.current = handleVisibilityChange;
    } catch (err) {
      console.error('Error starting camera monitoring:', err);
      let errorMessage = 'Không thể khởi động camera AI';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Bạn đã từ chối quyền truy cập camera. Vui lòng cho phép camera để tiếp tục.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'Không tìm thấy camera. Vui lòng kiểm tra camera của bạn.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera đang được sử dụng bởi ứng dụng khác.';
        } else {
          errorMessage = err.message || errorMessage;
        }
      }

      if (cameraUsageRef.current) {
        cameraManager.decrementUsage();
        cameraUsageRef.current = false;
      }
      
      updateState({ error: errorMessage, isAnalyzing: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyzeFrame]); // Chỉ phụ thuộc analyzeFrame (stable), KHÔNG phụ thuộc state

  const stopMonitoring = useCallback(() => {
    // Guard để ngăn gọi liên tục
    if (isStoppingRef.current) {
      return;
    }
    isStoppingRef.current = true;

    // Set isActiveRef to false FIRST to prevent any new frames from being sent
    isActiveRef.current = false;

    // Clear the analysis interval to stop sending frames
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }

    if (frameProcessedTimeoutRef.current) {
      clearTimeout(frameProcessedTimeoutRef.current);
      frameProcessedTimeoutRef.current = null;
    }
    pendingFrameIdRef.current = null;

    // Remove visibility change listener
    if (visibilityListenerRef.current) {
      document.removeEventListener('visibilitychange', visibilityListenerRef.current);
      visibilityListenerRef.current = null;
    }

    // Stop camera usage
    if (cameraUsageRef.current) {
      cameraManager.decrementUsage();
      cameraUsageRef.current = false;
    }

    // Stop heartbeat khi stop monitoring
    stopHeartbeat();

    // Teardown all peer connections (WebRTC streams)
    teardownAllPeers();

    // Update state
    updateState({ 
      isActive: false, 
      isAnalyzing: false, 
      detections: [], 
      metrics: null,
    });

    console.log('[useAICameraMonitor] Camera monitoring stopped. Camera and frame sending disabled.');

    // Reset guard sau khi cleanup xong
    setTimeout(() => {
      isStoppingRef.current = false;
    }, 1000);
  }, [teardownAllPeers, updateState]);

  const handleSetDetectionSensitivity = useCallback((level: 'low' | 'medium' | 'high') => {
    updateState({ detectionSensitivity: level });
    // Adjust detection thresholds based on sensitivity
    // This would be implemented with real AI models
  }, [updateState]);

  const handleEnableDetectionType = useCallback((type: CheatingDetection['type'], enabled: boolean) => {
    setState(prev => {
      const newEnabledDetections = new Set(prev.enabledDetections);
      if (enabled) {
        newEnabledDetections.add(type);
      } else {
        newEnabledDetections.delete(type);
      }
      return { ...prev, enabledDetections: newEnabledDetections };
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    isActive: state.isActive,
    isAnalyzing: state.isAnalyzing,
    error: state.error,
    connectionLost: state.connectionLost,
    detections: state.detections,
    metrics: state.metrics,
    startMonitoring,
    stopMonitoring,
    captureScreenshot,
    setDetectionSensitivity: handleSetDetectionSensitivity,
    enableDetectionType: handleEnableDetectionType,
    frameStorage: {
      totalFramesCaptured: frameStorage.totalFramesCaptured,
      totalDetections: frameStorage.totalDetections,
      storageSize: frameStorage.storageSize,
      getStatistics: frameStorage.getStatistics,
      exportData: frameStorage.exportData,
      clearAll: frameStorage.clearAll
    }
  };
};

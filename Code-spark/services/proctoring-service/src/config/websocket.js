// src/config/websocket.js
const { Server } = require('socket.io');
const config = require('./index');
const proctoringService = require('../services/proctoring.service');
const { compressImage, getAdaptiveCompressionSettings } = require('../utils/imageCompression');

let io;

// Helper function to get optimal video constraints
function getOptimalVideoConstraints(networkInfo = {}, preferredQuality = 'auto') {
  const { effectiveType = '4g', downlink = 10, saveData = false } = networkInfo;
  
  let constraints = {
    video: {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 60 }
    }
  };

  // Adjust based on network conditions or user preference
  if (preferredQuality === 'low' || saveData || effectiveType === 'slow-2g' || downlink < 0.5) {
    constraints.video = {
      width: { ideal: 320, max: 480 },
      height: { ideal: 240, max: 360 },
      frameRate: { ideal: 15, max: 20 }
    };
  } else if (preferredQuality === 'medium' || effectiveType === '2g' || downlink < 1.5) {
    constraints.video = {
      width: { ideal: 480, max: 640 },
      height: { ideal: 360, max: 480 },
      frameRate: { ideal: 20, max: 25 }
    };
  } else if (preferredQuality === 'high' || effectiveType === '3g' || downlink < 5) {
    constraints.video = {
      width: { ideal: 640, max: 1280 },
      height: { ideal: 480, max: 720 },
      frameRate: { ideal: 25, max: 30 }
    };
  }
  
  return constraints;
}

function initializeWebSocket(httpServer) {
  io = new Server(httpServer, {
    path: config.websocket.path,
    // Khi chạy qua Spring Gateway: Gateway thêm CORS headers.
    // Nếu service cũng thêm → duplicate header → browser reject.
    // => Bỏ cors option để service KHÔNG tự thêm headers.
    // Chỉ bật cors khi kết nối trực tiếp (dev không qua gateway).
    cors: false,
    // === TRANSPORT ===
    // Buộc chỉ dùng HTTP polling. WebSocket upgrade không hoạt động qua
    // Vite proxy → Spring Gateway → Node service chain.
    // Frontend cũng dùng polling first nên không vấn đề.
    transports: ['polling'],
    // === PING/PONG KEEPALIVE ===
    // Phát hiện mất kết nối nhanh hơn (30s thay vì 60s)
    pingInterval: 10000,     // Server ping client mỗi 10s
    pingTimeout: 30000,       // Chờ pong trong 30s (phải > pingInterval)
    allowUpgrades: false,    // Tắt upgrade lên WebSocket — chỉ dùng polling
  });

  // Lắng nghe kết nối
  io.on('connection', (socket) => {
    // === BƯỚC 1: XÁC THỰC VÀ THAM GIA PHÒNG THI ===
    // Client (cả Student và Proctor) phải gửi thông tin này khi kết nối
    const { examId, userId, userType } = socket.handshake.query;

    if (!examId || !userId || !userType) {
      console.error('[WebSocket] Kết nối bị từ chối: Thiếu examId, userId, hoặc userType.');
      socket.disconnect();
      return;
    }

    // Lưu trữ thông tin trên socket
    socket.data.userId = userId;
    socket.data.userType = userType;
    socket.data.examId = examId;

    // Cho socket tham gia vào "room" của kỳ thi
    // Tất cả sinh viên và giám thị của kỳ thi này sẽ ở chung 1 room
    socket.join(examId);
    console.log(`[WebSocket] User ${userId} (loại: ${userType}) đã tham gia phòng thi ${examId}. Socket ID: ${socket.id}`);

    // Track last activity time - cập nhật khi có frame gửi đến
    socket.data.lastActivityTime = Date.now();

    // Gửi thông báo cho những người khác trong phòng
    socket.to(examId).emit('user_joined', { userId, userType });

    // Tìm hoặc tạo proctoring session và gửi session ID về cho frontend
    // Frontend cần proctoring session ID (khác với submission ID từ exam service)
    (async () => {
      try {
        const studentSession = await proctoringService.createSession({ user_id: userId, exam_id: examId });
        // Gửi proctoring session ID về cho chính student — frontend sẽ dùng ID này khi gửi frame
        socket.emit('session_info', {
          sessionId: studentSession.id,
          examId: String(examId),
          userId: String(userId),
          status: 'active'
        });
        console.log(`[WebSocket] Đã gửi session_info: proctoringId=${studentSession.id}, submission sẽ dùng proctoringId này`);

        // Thông báo cho admin dashboard
        io.to(examId).emit('session_status_update', {
          sessionId: studentSession.id,
          examId: String(examId),
          connectionStatus: 'connected',
          timestamp: Date.now()
        });
      } catch (err) {
        console.warn('[WebSocket] Error creating/finding session:', err.message);
      }
    })();

    // === BƯỚC 2: NHẬN FRAME ẢNH TỪ SINH VIÊN (CHO AI) ===
    // image: base64 Data URL (frontend captureFrame tra ve)
    // === BƯỚC 3: XỬ LÝ LIVE STREAMING (WEBRTC SIGNALING) - OPTIMIZED ===

    socket.on('stream_frame_for_ai', async (frameData) => {
      console.log(`[WS >>>] stream_frame_for_ai nhan tu ${socket.data.userId}:`, !!frameData, frameData ? Object.keys(frameData) : '');
      console.log(`[WS >>>] Socket state: id=${socket.id}, connected=${socket.connected}, rooms=${Array.from(socket.rooms)}`);
      try {
        // Chap nhan ca 'image' (base64 string) va 'frameBuffer' (backward compat)
        const frameBuffer = frameData.image || frameData.frameBuffer;
        const { sessionId, timestamp, networkInfo } = frameData;

        if (!sessionId) {
          console.error("[WS] Thieu sessionId khi nhan stream_frame_for_ai");
          return;
        }

        if (frameBuffer) {
          const frameSizeKB = (Buffer.byteLength(frameBuffer, 'base64') / 1024).toFixed(1);
          console.log(`[WS >>> AI] Nhan frame tu ${socket.data.userId}, session=${sessionId}, size=${frameSizeKB}KB`);
        } else {
          console.warn(`[WS >>> AI] Nhan frame NULL tu ${socket.data.userId}, session=${sessionId}`);
          return;
        }

        // Cap nhat lastActivityTime de socket khong bi timeout
        proctoringService.recordSessionActivity({
          sessionId,
          examId: socket.data.examId,
          studentId: socket.data.userId
        });
        socket.data.lastActivityTime = Date.now(); // Update heartbeat timestamp

        console.log(`[WS >>>] Calling handleProctoringData for session=${sessionId}...`);
        // Forward to AI processing
        await proctoringService.handleProctoringData(sessionId, socket.data.userId, frameBuffer);
        console.log(`[WS >>>] handleProctoringData completed for session=${sessionId}`);

        // Emit frame_processed de frontend biet (cho UI feedback)
        socket.emit('frame_processed', {
          sessionId,
          timestamp: timestamp || Date.now(),
          success: true
        });

      } catch (error) {
        console.error('[WebSocket] Error stream_frame_for_ai:', error);
        socket.emit('frame_error', {
          sessionId: frameData?.sessionId,
          error: error.message
        });
      }
    });

    // Backward compat - giu 'student_frame_for_ai' cho code cu
    socket.on('student_frame_for_ai', async (frameData) => {
      try {
        // Tu dong chuyen doi field name
        const adaptedData = {
          ...frameData,
          image: frameData.image || frameData.frameBuffer
        };
        const { image, sessionId, timestamp, networkInfo } = adaptedData;

        if (!sessionId) return;

        // Cap nhat heartbeat
        proctoringService.recordSessionActivity({
          sessionId,
          examId: socket.data.examId,
          studentId: socket.data.userId
        });

        await proctoringService.handleProctoringData(sessionId, socket.data.userId, image);

        socket.emit('frame_processed', {
          sessionId,
          timestamp: timestamp || Date.now(),
          success: true
        });
      } catch (error) {
        console.error('[WebSocket] Error student_frame_for_ai:', error);
      }
    });


    // === BƯỚC 3: XỬ LÝ LIVE STREAMING (WEBRTC SIGNALING) - OPTIMIZED ===
    
    // 3a. Giám thị yêu cầu xem stream của một sinh viên
    socket.on('proctor_request_stream', (data) => {
      const { studentIdToView, networkInfo, preferredQuality } = data;
      console.log(`[WebSocket] Giám thị ${socket.data.userId} yêu cầu xem SV ${studentIdToView}`);
      
      // Get optimal constraints based on network conditions
      const constraints = getOptimalVideoConstraints(networkInfo, preferredQuality);
      
      // Gửi yêu cầu với optimization settings
      socket.to(examId).emit('webrtc_offer_request', {
        proctorSocketId: socket.id,
        studentIdToView: studentIdToView,
        constraints: constraints,
        fallbackEnabled: true,
        timestamp: Date.now()
      });
    });

    // 3b. Sinh viên gửi "offer" (lời mời P2P) đến cho giám thị
    socket.on('webrtc_offer', (data) => {
      const { offer, targetSocketId } = data;
      console.log(`[WebSocket] SV ${socket.data.userId} gửi offer đến ${targetSocketId}`);
      io.to(targetSocketId).emit('webrtc_offer_received', {
        offer: offer,
        senderSocketId: socket.id,
        studentId: socket.data.userId // Gửi kèm ID sinh viên
      });
    });

    // 3c. Giám thị gửi "answer" (phản hồi) lại cho sinh viên
    socket.on('webrtc_answer', (data) => {
      const { answer, targetSocketId } = data;
      console.log(`[WebSocket] Giám thị ${socket.data.userId} gửi answer đến ${targetSocketId}`);
      io.to(targetSocketId).emit('webrtc_answer_received', {
        answer: answer,
        senderSocketId: socket.id
      });
    });
    
    // 3d. Cả hai bên trao đổi ICE candidates
    socket.on('webrtc_ice_candidate', (data) => {
      const { candidate, targetSocketId } = data;
      io.to(targetSocketId).emit('webrtc_ice_candidate_received', {
        candidate: candidate,
        senderSocketId: socket.id
      });
    });

    // 3e. WebRTC connection failed - activate fallback
    socket.on('webrtc_connection_failed', (data) => {
      const { targetSocketId, error, studentId } = data;
      console.log(`[WebSocket] WebRTC failed for ${studentId}, activating fallback`);
      
      // Notify both parties about fallback activation
      io.to(targetSocketId).emit('webrtc_fallback_activated', {
        reason: error,
        fallbackMode: 'websocket_streaming',
        senderSocketId: socket.id
      });
      
      socket.emit('webrtc_fallback_activated', {
        reason: error,
        fallbackMode: 'websocket_streaming',
        targetSocketId: targetSocketId
      });
    });

    // 3f. WebSocket video streaming fallback
    socket.on('video_frame', async (frameData) => {
      try {
        const { frameBuffer, timestamp, targetSocketId, width, height, format } = frameData;
        
        if (!targetSocketId) {
          console.error('[WebSocket] Missing targetSocketId for video frame');
          return;
        }

        // Compress frame for transmission
        let compressedFrame = frameBuffer;
        if (frameBuffer && frameBuffer.length > 50000) { // Compress if > 50KB
          try {
            compressedFrame = await compressImage(frameBuffer, 0.6, {
              maxWidth: Math.min(width || 640, 640),
              maxHeight: Math.min(height || 480, 480),
              format: format || 'jpeg'
            });
          } catch (compressionError) {
            console.warn('[WebSocket] Video frame compression failed:', compressionError.message);
          }
        }

        // Forward compressed frame to target
        io.to(targetSocketId).emit('video_frame_received', {
          frameBuffer: compressedFrame,
          timestamp,
          senderSocketId: socket.id,
          originalSize: frameBuffer?.length || 0,
          compressedSize: compressedFrame?.length || 0,
          width: width || 640,
          height: height || 480,
          format: format || 'jpeg'
        });

      } catch (error) {
        console.error('[WebSocket] Error processing video frame:', error);
      }
    });

    // 3g. Connection quality monitoring
    socket.on('connection_quality_update', (data) => {
      const { quality, stats, targetSocketId } = data;
      
      // Forward quality info to peer for adaptive streaming
      if (targetSocketId) {
        io.to(targetSocketId).emit('peer_quality_update', {
          quality,
          stats,
          senderSocketId: socket.id
        });
      }
    });


    // === BƯỚC 4: XỬ LÝ NGẮT KẾT NỐI ===
    // Cập nhật trạng thái session: DISCONNECTED (chờ reconnect) thay vì TERMINATED
    socket.on('disconnect', async (reason) => {
      const userId = socket.data.userId;
      const examIdConnected = socket.data.examId;
      console.log(`[WebSocket] User ${userId} đã ngắt kết nối khỏi phòng ${examIdConnected}. Reason: ${reason}`);
      console.log(`[WebSocket] Disconnect details - Socket ID: ${socket.id}, Connected: ${socket.connected}, Rooms: ${Array.from(socket.rooms)}`);

      // Thông báo cho những người còn lại
      socket.to(examIdConnected).emit('user_left', { userId: socket.data.userId });

      // Cập nhật trạng thái session thành DISCONNECTED (chờ reconnect)
      // KHÔNG terminate vội — frontend có reconnect logic 5s sau
      try {
        const session = await proctoringService.getActiveSessions();
        const studentSession = session.find(s =>
          String(s.userId) === String(userId) && String(s.examId) === String(examIdConnected)
        );
        if (studentSession) {
          // Chỉ cập nhật connectionStatus, KHÔNG thay đổi status -> TERMINATED
          await proctoringService.recordSessionActivity({
            sessionId: studentSession.id,
            examId: examIdConnected,
            studentId: userId
          });
          // Emit trạng thái mất kết nối cho admin dashboard
          io.to(examIdConnected).emit('session_status_update', {
            sessionId: studentSession.id,
            examId: examIdConnected,
            connectionStatus: 'disconnected',
            timestamp: Date.now()
          });
          console.log(`[WebSocket] Session ${studentSession.id} marked as disconnected, waiting for reconnect...`);
        }
      } catch (err) {
        console.warn('[WebSocket] Error updating session on disconnect:', err.message);
      }
    });

    // Log disconnect reasons khác nhau
    socket.on('disconnecting', (reason) => {
      console.log(`[WebSocket] User ${socket.data.userId} đang ngắt kết nối. Reason: ${reason}`);
    });

    // === BƯỚC 5: CLIENT PING (tuỳ chọn - client có thể gửi ping để giữ kết nối) ===
    // Socket.IO internal ping/pong đã đủ để giữ kết nối
    // Handler này chỉ để log/track activity nếu client muốn
    socket.on('client_ping', () => {
      socket.data.lastActivityTime = Date.now();
      socket.emit('client_pong', { timestamp: Date.now() });
    });
  });

  console.log('[Socket.IO] Server đã khởi tạo và sẵn sàng nhận kết nối.');
}

module.exports = {
  initializeWebSocket,
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
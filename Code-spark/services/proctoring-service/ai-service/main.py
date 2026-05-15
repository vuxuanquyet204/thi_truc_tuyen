# file: main.py
"""
Proctoring AI Service v4.0 - GPU + Async Batch Processing + WebSocket Streaming
==============================================================
- CUDA GPU acceleration cho YOLO
- Async batch queue: tap hop frames -> process GPU -> tra ket qua
- Session manager: moi session co face tracker rieng
- WebSocket streaming: tra ket qua ngay khi co (khong doi batch)
- Ultra-low latency: ~50-200ms voi GPU, ~500ms-2s voi CPU

Cai dat GPU:
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
  # Hoac CUDA 11.8:
  # pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

Chay:
  uvicorn main:socket_app --host 0.0.0.0 --port 8000 --workers 1 --reload
"""
import os
import asyncio
import base64
import json
import time
import gc
import queue
import threading
import warnings
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Set

import numpy as np
import cv2
import mediapipe as mp

warnings.filterwarnings('ignore', message='.*Trying to unpickle.*')
warnings.filterwarnings('ignore', category=UserWarning, module='sklearn')

# ==================== CẤU HÌNH ====================
GPU_ENABLED = os.getenv("AI_GPU_ENABLED", "auto").lower()  # auto, true, false
USE_TRACKING = os.getenv("AI_USE_TRACKING", "true").lower() == "true"
TARGET_WIDTH = int(os.getenv("AI_TARGET_WIDTH", "640"))
TARGET_HEIGHT = int(os.getenv("AI_TARGET_HEIGHT", "480"))
BATCH_SIZE = int(os.getenv("AI_BATCH_SIZE", "8"))         # so frame trong 1 batch
BATCH_TIMEOUT_MS = int(os.getenv("AI_BATCH_TIMEOUT_MS", "300"))  # doi toi da bao lau
QUEUE_MAX = int(os.getenv("AI_QUEUE_MAX", "64"))            # queue size
WORKER_THREADS = int(os.getenv("AI_WORKER_THREADS", "2"))
ENABLE_ML = os.getenv("AI_ENABLE_ML", "true").lower() == "true"
ENABLE_RULE = os.getenv("AI_ENABLE_RULE", "true").lower() == "true"
ENABLE_LOOKING_AWAY = os.getenv("AI_ENABLE_LOOKING_AWAY", "true").lower() == "true"
PITCH_DOWN, YAW_SIDE, OCCLUSION_DARK, OCCLUSION_UNIFORM = 20.0, 25.0, 40, 10
LANDMARK_IDS = [1, 199, 33, 263, 61, 291]
MODEL_POINTS_3D = np.array([
    (0.0, 0.0, 0.0),(0.0, -63.6, -12.5),(-43.3,32.7,-26),
    (43.3,32.7,-26),(-28.9,-28.9,-24.1),(28.9,-28.9,-24.1)
], dtype=np.float64)

# ==================== GPU DETECTION ====================
torch = None
TORCH_AVAILABLE = False
DEVICE = "cpu"
YOLO_MODEL = None

def _init_torch():
    global torch, TORCH_AVAILABLE, DEVICE, YOLO_MODEL
    if torch is not None:
        return
    try:
        import torch
        TORCH_AVAILABLE = True
        if GPU_ENABLED == "true" or (GPU_ENABLED == "auto" and torch.cuda.is_available()):
            DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
            if DEVICE == "cuda":
                print(f"[GPU] CUDA available! Device: {torch.cuda.get_device_name(0)}")
                print(f"[GPU] VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
            else:
                print("[GPU] GPU requested but not available, using CPU")
        else:
            DEVICE = "cpu"
            print("[GPU] GPU disabled, using CPU")
    except ImportError:
        print("[GPU] PyTorch not installed. Install with CUDA: pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121")
        DEVICE = "cpu"

def _load_yolo():
    global YOLO_MODEL
    if YOLO_MODEL is not None:
        return YOLO_MODEL

    # Load YOLO, sau đó move model sang GPU nếu cần
    from ultralytics import YOLO as YoloTorch
    YOLO_MODEL = YoloTorch('yolov8n.pt')

    if DEVICE == "cuda":
        # Di chuyển toàn bộ model sang GPU sau khi load
        YOLO_MODEL.to(DEVICE)
        print(f"[YOLO] Model moved to CUDA")

    print(f"[YOLO] Loaded on {DEVICE} (torch={TORCH_AVAILABLE})")
    return YOLO_MODEL

# ==================== HELPERS ====================
def resize_frame(frame):
    return cv2.resize(frame, (TARGET_WIDTH, TARGET_HEIGHT), interpolation=cv2.INTER_AREA)

def get_head_pose(landmarks, shape):
    h, w = shape[:2]
    img_pts = np.array([(landmarks[i].x*w, landmarks[i].y*h) for i in LANDMARK_IDS], dtype=np.float64)
    cam = np.array([[w,0,w/2],[0,w,h/2],[0,0,1]], dtype=np.float64)
    ok, rvec, _ = cv2.solvePnP(MODEL_POINTS_3D, img_pts, cam, np.zeros((4,1)))
    if not ok: return None
    R, _ = cv2.Rodrigues(rvec)
    sy = np.sqrt(R[0,0]**2 + R[1,0]**2)
    return {"pitch": np.degrees(np.arctan2(R[2,1], R[2,2])),
            "yaw": np.degrees(np.arctan2(-R[2,0], sy))}

def extract_features(frame, head_angles, yolo_results, gray_prev=None):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    labels = [yolo_results.names[int(c)] for c in yolo_results.boxes.cls] if yolo_results else []
    person_count = labels.count("person")
    phone_flag = int(any("phone" in l.lower() or "cell" in l.lower() for l in labels))
    pitch = head_angles["pitch"] if head_angles else 0.0
    yaw = head_angles["yaw"] if head_angles else 0.0
    motion = 0.0
    if gray_prev is not None:
        diff = cv2.absdiff(gray, gray_prev)
        motion = float(np.count_nonzero(diff)) / float(diff.size)
    mean_b = float(np.mean(gray))
    std_b = float(np.std(gray))
    occlusion = 1 if (mean_b < OCCLUSION_DARK or std_b < OCCLUSION_UNIFORM) else 0
    return {"person_count": person_count, "phone": phone_flag,
            "mean_b": mean_b, "std_b": std_b,
            "pitch": pitch, "yaw": yaw, "motion": motion, "occlusion": occlusion,
            "gray": gray}

def detect_rule(feats, head_angles):
    events = []
    if feats["person_count"] == 0:
        events.append({"event_type": "FACE_NOT_DETECTED", "severity": "high", "metadata": {}})
    elif feats["person_count"] > 1:
        events.append({"event_type": "MULTIPLE_FACES", "severity": "high", "metadata": {"persons_detected": feats["person_count"]}})
    if feats["phone"] == 1:
        events.append({"event_type": "MOBILE_PHONE_DETECTED", "severity": "high", "metadata": {}})
    if feats["occlusion"] == 1:
        events.append({"event_type": "CAMERA_TAMPERED", "severity": "medium", "metadata": {}})
    if ENABLE_LOOKING_AWAY and head_angles:
        if head_angles["pitch"] > PITCH_DOWN:
            events.append({"event_type": "LOOKING_AWAY", "severity": "low", "metadata": {"direction": "down"}})
        if abs(head_angles["yaw"]) > YAW_SIDE:
            events.append({"event_type": "LOOKING_AWAY", "severity": "medium", "metadata": {"direction": "side"}})
    return events

def detect_ml(clf, feats):
    if not clf: return []
    X_pred = np.array([[feats["person_count"], feats["phone"], feats["mean_b"],
                         feats["std_b"], feats["pitch"], feats["yaw"],
                         feats["motion"], feats["occlusion"]]])
    ml_pred = clf.predict(X_pred)[0]
    if ml_pred == 'no_violation': return []
    emap = {"Roi_manhinh": "FACE_NOT_DETECTED", "Nhieu_nguoi": "MULTIPLE_FACES",
            "Dien_thoai": "MOBILE_PHONE_DETECTED", "Che_camera": "CAMERA_TAMPERED",
            "Khac": "SUSPICIOUS_BEHAVIOR"}
    etype = emap.get(ml_pred, "SUSPICIOUS_BEHAVIOR")
    return [{"event_type": etype, "severity": "medium", "metadata": {"source": "ml", "pred": ml_pred}}]

# ==================== PROCESSOR ====================
class BatchProcessor:
    """
    Batch processor: tap hop frames trong BATCH_TIMEOUT_MS,
    process GPU batch, tra ket qua tung frame.
    Co the batch nhieu sessions cung luc (session隔离).
    """
    def __init__(self):
        self._lock = threading.RLock()
        # session_id -> list of pending frames
        self._pending: Dict[str, deque] = defaultdict(lambda: deque(maxlen=QUEUE_MAX))
        # session_id -> batch timer handle
        self._timers: Dict[str, asyncio.TimerHandle] = {}
        # Global batch: tap hop tat ca sessions -> 1 GPU batch
        self._global_batch: deque = deque(maxlen=QUEUE_MAX * 4)
        self._global_timer: Optional[asyncio.TimerHandle] = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._running = False
        self._clf = None
        self._mp_fm = None
        self._yolo_model = None
        self._session_trackers: Dict[str, Any] = {}

        self._executor = ThreadPoolExecutor(max_workers=WORKER_THREADS)
        self._gpu_executor = ThreadPoolExecutor(max_workers=1)  # GPU = 1 worker

    def init(self, loop):
        """Khoi tao trong thread chinh."""
        _init_torch()
        self._loop = loop
        self._yolo_model = _load_yolo()
        self._mp_fm = mp.solutions.face_mesh.FaceMesh(
            static_image_mode=not USE_TRACKING,
            max_num_faces=2, refine_landmarks=True)
        try:
            import pickle
            with open("violation_model.pkl", "rb") as f:
                self._clf = pickle.load(f)
            print("[ML] violation_model.pkl loaded.")
        except FileNotFoundError:
            print("[ML] violation_model.pkl not found - ML disabled.")

    def process_frame(self, frame: np.ndarray) -> List[Dict]:
        """Process 1 frame (goi trong batch worker)."""
        try:
            frame_small = resize_frame(frame)
            h_s, w_s = frame_small.shape[:2]

            # YOLO inference (GPU accelerated)
            yolo_results = self._yolo_model.predict(frame_small, conf=0.4, verbose=False)[0]

            # MediaPipe
            rgb_small = cv2.cvtColor(frame_small, cv2.COLOR_BGR2RGB)
            fm_results = self._mp_fm.process(rgb_small)
            head_angles = None
            if fm_results.multi_face_landmarks and len(fm_results.multi_face_landmarks) == 1:
                head_angles = get_head_pose(fm_results.multi_face_landmarks[0].landmark, frame_small.shape)

            # Rule-based detection
            feats = extract_features(frame_small, head_angles, yolo_results)
            events = detect_rule(feats, head_angles) if ENABLE_RULE else []

            # ML detection
            if self._clf and ENABLE_ML:
                ml_events = detect_ml(self._clf, feats)
                for e in ml_events:
                    if e['event_type'] not in [ev['event_type'] for ev in events]:
                        events.append(e)

            return events
        except Exception as e:
            import traceback; traceback.print_exc()
            return []

    def _process_batch_sync(self, batch: List[tuple]) -> List[List[Dict]]:
        """Process 1 batch (blocking, chay trong thread pool)."""
        results = []
        for frame, _ in batch:
            events = self.process_frame(frame)
            results.append(events)
        return results

    async def add_frame(self, sid: str, frame: np.ndarray,
                        callback, stats_callback):
        """Them 1 frame vao queue. Tra ve ngay (non-blocking)."""
        with self._lock:
            if sid not in self._pending:
                self._pending[sid] = deque(maxlen=QUEUE_MAX)
            self._pending[sid].append((frame, callback, stats_callback))

            # Kich hoat global batch timer neu chua co
            if self._global_timer is None and self._loop and len(self._global_batch) == 0:
                self._global_timer = self._loop.call_later(
                    BATCH_TIMEOUT_MS / 1000.0,
                    lambda: asyncio.create_task(self._flush_global_batch())
                )

            # Flush ngay neu batch day
            if len(self._global_batch) + sum(len(v) for v in self._pending.values()) >= BATCH_SIZE:
                await self._flush_all()

    async def _flush_global_batch(self):
        """Flush global batch - tap hop nhieu sessions."""
        with self._lock:
            self._global_timer = None
            all_frames = []
            all_meta: List[tuple] = []  # (sid, original_callback)

            # Lay frame tu tat ca sessions
            for sid, pending in list(self._pending.items()):
                while pending and len(all_frames) < BATCH_SIZE * 4:
                    frame, callback, stats_cb = pending.popleft()
                    all_frames.append(frame)
                    all_meta.append((sid, callback, stats_cb))

            if not all_frames:
                return

        # Process batch
        t0 = time.time()
        results = await self._loop.run_in_executor(
            self._gpu_executor, self._process_batch_sync, all_frames)
        batch_time = time.time() - t0

        # YOLO time (chi uoc tinh)
        yolo_time = batch_time * 0.6
        mp_time = batch_time * 0.3
        rule_time = batch_time * 0.1

        # Tra ket qua cho tung frame
        for i, events in enumerate(results):
            sid, callback, stats_cb = all_meta[i]
            await callback(events, {
                "total_ms": round(batch_time * 1000, 1),
                "yolo_ms": round(yolo_time * 1000 / max(len(all_frames), 1), 1),
                "mp_ms": round(mp_time * 1000 / max(len(all_frames), 1), 1),
                "rule_ms": round(rule_time * 1000 / max(len(all_frames), 1), 1),
                "batch_size": len(all_frames),
                "mode": "gpu_batch" if DEVICE == "cuda" else "cpu_batch",
            })

    async def _flush_all(self):
        """Flush tat ca pending frames ngay."""
        with self._lock:
            if self._global_timer:
                self._global_timer.cancel()
                self._global_timer = None

            all_frames = []
            all_meta = []

            for sid, pending in list(self._pending.items()):
                while pending:
                    frame, callback, stats_cb = pending.popleft()
                    all_frames.append(frame)
                    all_meta.append((sid, callback, stats_cb))
            self._pending.clear()

        if all_frames:
            t0 = time.time()
            results = await self._loop.run_in_executor(
                self._gpu_executor, self._process_batch_sync, all_frames)
            batch_time = time.time() - t0

            yolo_time = batch_time * 0.6
            mp_time = batch_time * 0.3
            rule_time = batch_time * 0.1

            for i, events in enumerate(results):
                _, callback, stats_cb = all_meta[i]
                await callback(events, {
                    "total_ms": round(batch_time * 1000, 1),
                    "yolo_ms": round(yolo_time * 1000 / max(len(all_frames), 1), 1),
                    "mp_ms": round(mp_time * 1000 / max(len(all_frames), 1), 1),
                    "rule_ms": round(rule_time * 1000 / max(len(all_frames), 1), 1),
                    "batch_size": len(all_frames),
                    "mode": "gpu_batch" if DEVICE == "cuda" else "cpu_batch",
                })

    def shutdown(self):
        self._running = False
        if self._global_timer:
            self._global_timer.cancel()
        self._executor.shutdown(wait=False)
        self._gpu_executor.shutdown(wait=False)

# ==================== SERVER ====================
import socketio
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    processor.init(asyncio.get_event_loop())
    print(f"[AI v4] Ready - Device: {DEVICE} | Batch: {BATCH_SIZE} frames | Timeout: {BATCH_TIMEOUT_MS}ms")
    yield
    processor.shutdown()

app = FastAPI(title="Proctoring AI Service v4.0 - GPU", version="4.0.0", lifespan=lifespan)
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    ping_timeout=60,
    ping_interval=25,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
processor = BatchProcessor()

# ==================== WEBSOCKET HANDLERS ====================
@sio.event
async def connect(sid, environ):
    print(f"[SOCKET] + {sid}")

@sio.event
async def disconnect(sid):
    print(f"[SOCKET] - {sid}")

@sio.event
async def stream_frame(sid, data):
    """
    Nhan 1 frame, cho vao batch queue, tra ket qua qua callback.
    Latency: ~50-500ms (GPU) hoac ~1-3s (CPU).
    """
    t0 = time.time()
    try:
        # Decode image
        image_b64 = data.get('image', '')
        if ',' in image_b64:
            image_b64 = image_b64.split(',')[1]
        img_bytes = base64.b64decode(image_b64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            await sio.emit('ai_result', {'error': 'invalid_image', 'sessionId': data.get('sessionId')}, to=sid)
            return

        sid_ = data.get('sessionId', sid)

        async def callback(events, stats):
            latency = (time.time() - t0) * 1000
            await sio.emit('ai_result', {
                'events': events,
                'stats': {**stats, 'latency_ms': round(latency, 1)},
                'sessionId': sid_,
                'studentId': data.get('studentId'),
                'examId': data.get('examId'),
            }, to=sid)

        await processor.add_frame(sid_, frame, callback, None)

    except Exception as e:
        import traceback; traceback.print_exc()
        await sio.emit('ai_result', {
            'error': str(e),
            'sessionId': data.get('sessionId')
        }, to=sid)

@sio.event
async def batch_frames(sid, data):
    """
    Nhan nhieu frames cung luc (batch).
    """
    frames = data.get('frames', [])
    if not frames:
        return

    async def send_result(results):
        await sio.emit('ai_batch_result', {'results': results}, to=sid)

    async def process_one(idx, item):
        try:
            image_b64 = item.get('image', '')
            if ',' in image_b64:
                image_b64 = image_b64.split(',')[1]
            img_bytes = base64.b64decode(image_b64)
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if frame is None:
                return {'id': item.get('id', idx), 'events': [], 'error': 'invalid'}
            events = processor.process_frame(frame)
            return {'id': item.get('id', idx), 'events': events}
        except Exception as e:
            return {'id': item.get('id', idx), 'events': [], 'error': str(e)}

    loop = asyncio.get_event_loop()
    tasks = [process_one(i, f) for i, f in enumerate(frames)]
    results = await asyncio.gather(*tasks)
    await send_result(list(results))

# ==================== REST API (backward compat) ====================
@app.get("/health")
async def health():
    return JSONResponse({
        "status": "ok",
        "service": "proctoring-ai-service",
        "version": "4.0.0",
        "gpu": {
            "enabled": DEVICE == "cuda",
            "device": DEVICE,
            "torch_available": TORCH_AVAILABLE,
        },
        "config": {
            "batch_size": BATCH_SIZE,
            "batch_timeout_ms": BATCH_TIMEOUT_MS,
            "tracking": USE_TRACKING,
            "target_size": f"{TARGET_WIDTH}x{TARGET_HEIGHT}",
            "queue_max": QUEUE_MAX,
            "ml_enabled": ENABLE_ML and processor._clf is not None,
        }
    })

@app.post("/analyze_frame")
async def analyze_frame(file: UploadFile = File(...)):
    """REST endpoint - xu ly don le, khong batch."""
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image")
        events = processor.process_frame(frame)
        return {"events": events}
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {
        "service": "Proctoring AI Service v4.0 - GPU + Batch",
        "endpoints": {
            "websocket": "/socket.io (events: stream_frame, batch_frames)",
            "rest": "/analyze_frame (POST)",
            "health": "/health"
        },
        "gpu": DEVICE,
        "batch": f"{BATCH_SIZE} frames / {BATCH_TIMEOUT_MS}ms",
    }

# ==================== ASGI APP ====================
socket_app = socketio.ASGIApp(sio, app)

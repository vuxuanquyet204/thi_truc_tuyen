import { useState, useEffect, useRef, useCallback } from 'react';
import { cameraManager } from '@/features/proctoring/api/cameraManager';

interface UseCameraReturn {
  stream: MediaStream | null;
  error: string | null;
  isCameraOn: boolean;
  isPermissionGranted: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFrame: () => string | null;
}

export const useCamera = (): UseCameraReturn => {
  const [stream, setStream] = useState<MediaStream | null>(cameraManager.currentStream);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(!!cameraManager.currentStream);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(!!cameraManager.currentStream);
  const isStartingRef = useRef(false);
  const hasClientRef = useRef(false);

  const startCamera = useCallback(async () => {
    if (isStartingRef.current) {
      return;
    }

    isStartingRef.current = true;

    if (!hasClientRef.current) {
      cameraManager.incrementUsage();
      hasClientRef.current = true;
    }

    try {
      setError(null);
      const mediaStream = await cameraManager.start();
      setStream(mediaStream);
      setIsCameraOn(true);
      setIsPermissionGranted(true);
    } catch (err) {
      if (hasClientRef.current) {
        cameraManager.decrementUsage();
        hasClientRef.current = false;
      }

      let errorMessage = 'Không thể truy cập camera';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Bạn đã từ chối quyền truy cập camera. Vui lòng cho phép camera để tiếp tục.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'Không tìm thấy camera. Vui lòng kiểm tra camera của bạn.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng khác.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Camera không hỗ trợ cài đặt yêu cầu.';
        } else {
          errorMessage = err.message || 'Lỗi không xác định khi truy cập camera';
        }
      }

      setError(errorMessage);
      setStream(cameraManager.currentStream);
      setIsCameraOn(false);
      setIsPermissionGranted(false);
    } finally {
      isStartingRef.current = false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (hasClientRef.current) {
      cameraManager.decrementUsage();
      hasClientRef.current = false;
    }

    const currentStream = cameraManager.currentStream;
    setStream(null);
    setIsCameraOn(false);
    if (!currentStream) {
      setIsPermissionGranted(false);
    }
  }, []);

  const captureFrame = useCallback((): string | null => {
    return cameraManager.captureFrame();
  }, []);

  useEffect(() => {
    return () => {
      if (hasClientRef.current) {
        cameraManager.decrementUsage();
        hasClientRef.current = false;
      }
    };
  }, []);

  return {
    stream,
    error,
    isCameraOn,
    isPermissionGranted,
    startCamera,
    stopCamera,
    captureFrame,
  };
};

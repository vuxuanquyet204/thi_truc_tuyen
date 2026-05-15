// file: src/hooks/useFrameStorage.ts
import { useState, useCallback, useRef } from 'react';

interface FrameData {
  id: string;
  timestamp: number;
  frameDataUrl: string;
  examId: string;
  studentId: string;
}

interface AIDetectionResponse {
  id: string;
  timestamp: number;
  frameId: string;
  detections: Array<{
    event_type: string;
    severity: string;
    metadata: any;
  }>;
  processingTime: number;
}

interface FrameStorageState {
  frames: FrameData[];
  responses: AIDetectionResponse[];
  totalFramesCaptured: number;
  totalDetections: number;
  storageSize: number; // in bytes
}

interface UseFrameStorageOptions {
  maxFrames?: number; // Maximum frames to keep in memory
  maxResponses?: number; // Maximum responses to keep
  autoCleanup?: boolean; // Auto cleanup old data
  cleanupInterval?: number; // Cleanup interval in ms
}

export const useFrameStorage = (options: UseFrameStorageOptions = {}) => {
  const {
    maxFrames = 100,
    maxResponses = 200,
    autoCleanup = true,
    cleanupInterval = 60000, // 1 minute
  } = options;

  const [state, setState] = useState<FrameStorageState>({
    frames: [],
    responses: [],
    totalFramesCaptured: 0,
    totalDetections: 0,
    storageSize: 0,
  });

  const cleanupTimerRef = useRef<NodeJS.Timeout>();

  // Calculate storage size
  const calculateStorageSize = useCallback((frames: FrameData[], responses: AIDetectionResponse[]) => {
    const framesSize = frames.reduce((acc, frame) => acc + frame.frameDataUrl.length, 0);
    const responsesSize = responses.reduce((acc, res) => acc + JSON.stringify(res).length, 0);
    return framesSize + responsesSize;
  }, []);

  // Add frame to storage
  const addFrame = useCallback((frameDataUrl: string, examId: string, studentId: string): string => {
    const frameId = `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newFrame: FrameData = {
      id: frameId,
      timestamp: Date.now(),
      frameDataUrl,
      examId,
      studentId,
    };

    setState(prev => {
      const updatedFrames = [...prev.frames, newFrame];
      // Keep only last N frames
      const trimmedFrames = updatedFrames.slice(-maxFrames);
      
      return {
        ...prev,
        frames: trimmedFrames,
        totalFramesCaptured: prev.totalFramesCaptured + 1,
        storageSize: calculateStorageSize(trimmedFrames, prev.responses),
      };
    });

    return frameId;
  }, [maxFrames, calculateStorageSize]);

  // Add AI detection response
  const addResponse = useCallback((
    frameId: string,
    detections: AIDetectionResponse['detections'],
    processingTime: number
  ) => {
    const responseId = `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newResponse: AIDetectionResponse = {
      id: responseId,
      timestamp: Date.now(),
      frameId,
      detections,
      processingTime,
    };

    setState(prev => {
      const updatedResponses = [...prev.responses, newResponse];
      // Keep only last N responses
      const trimmedResponses = updatedResponses.slice(-maxResponses);
      
      return {
        ...prev,
        responses: trimmedResponses,
        totalDetections: prev.totalDetections + detections.length,
        storageSize: calculateStorageSize(prev.frames, trimmedResponses),
      };
    });

    return responseId;
  }, [maxResponses, calculateStorageSize]);

  // Get frame by ID
  const getFrame = useCallback((frameId: string): FrameData | undefined => {
    return state.frames.find(f => f.id === frameId);
  }, [state.frames]);

  // Get response by ID
  const getResponse = useCallback((responseId: string): AIDetectionResponse | undefined => {
    return state.responses.find(r => r.id === responseId);
  }, [state.responses]);

  // Get responses for a specific frame
  const getResponsesForFrame = useCallback((frameId: string): AIDetectionResponse[] => {
    return state.responses.filter(r => r.frameId === frameId);
  }, [state.responses]);

  // Get recent frames
  const getRecentFrames = useCallback((count: number = 10): FrameData[] => {
    return state.frames.slice(-count);
  }, [state.frames]);

  // Get recent responses
  const getRecentResponses = useCallback((count: number = 10): AIDetectionResponse[] => {
    return state.responses.slice(-count);
  }, [state.responses]);

  // Get frames with violations
  const getFramesWithViolations = useCallback((): Array<FrameData & { detections: AIDetectionResponse['detections'] }> => {
    const result: Array<FrameData & { detections: AIDetectionResponse['detections'] }> = [];
    
    state.frames.forEach(frame => {
      const responses = state.responses.filter(r => r.frameId === frame.id);
      const allDetections = responses.flatMap(r => r.detections);
      
      if (allDetections.length > 0) {
        result.push({
          ...frame,
          detections: allDetections,
        });
      }
    });
    
    return result;
  }, [state.frames, state.responses]);

  // Get statistics
  const getStatistics = useCallback(() => {
    const violationTypes = new Map<string, number>();
    const severityCounts = new Map<string, number>();
    
    state.responses.forEach(response => {
      response.detections.forEach(detection => {
        violationTypes.set(
          detection.event_type,
          (violationTypes.get(detection.event_type) || 0) + 1
        );
        severityCounts.set(
          detection.severity,
          (severityCounts.get(detection.severity) || 0) + 1
        );
      });
    });

    const avgProcessingTime = state.responses.length > 0
      ? state.responses.reduce((acc, r) => acc + r.processingTime, 0) / state.responses.length
      : 0;

    return {
      totalFrames: state.frames.length,
      totalResponses: state.responses.length,
      totalFramesCaptured: state.totalFramesCaptured,
      totalDetections: state.totalDetections,
      violationTypes: Object.fromEntries(violationTypes),
      severityCounts: Object.fromEntries(severityCounts),
      avgProcessingTime: Math.round(avgProcessingTime),
      storageSize: state.storageSize,
      storageSizeMB: (state.storageSize / (1024 * 1024)).toFixed(2),
    };
  }, [state]);

  // Clear all data
  const clearAll = useCallback(() => {
    setState({
      frames: [],
      responses: [],
      totalFramesCaptured: 0,
      totalDetections: 0,
      storageSize: 0,
    });
  }, []);

  // Clear old data (keep only recent N items)
  const cleanup = useCallback(() => {
    setState(prev => {
      const trimmedFrames = prev.frames.slice(-maxFrames);
      const trimmedResponses = prev.responses.slice(-maxResponses);
      
      return {
        ...prev,
        frames: trimmedFrames,
        responses: trimmedResponses,
        storageSize: calculateStorageSize(trimmedFrames, trimmedResponses),
      };
    });
  }, [maxFrames, maxResponses, calculateStorageSize]);

  // Export data as JSON
  const exportData = useCallback(() => {
    const data = {
      exportDate: new Date().toISOString(),
      statistics: getStatistics(),
      frames: state.frames.map(f => ({
        ...f,
        // Truncate frame data for export (too large)
        frameDataUrl: `${f.frameDataUrl.substring(0, 50)}... (truncated)`,
      })),
      responses: state.responses,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proctoring-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [state, getStatistics]);

  // Auto cleanup setup
  React.useEffect(() => {
    if (autoCleanup) {
      cleanupTimerRef.current = setInterval(cleanup, cleanupInterval);
      return () => {
        if (cleanupTimerRef.current) {
          clearInterval(cleanupTimerRef.current);
        }
      };
    }
  }, [autoCleanup, cleanupInterval, cleanup]);

  return {
    // State
    frames: state.frames,
    responses: state.responses,
    totalFramesCaptured: state.totalFramesCaptured,
    totalDetections: state.totalDetections,
    storageSize: state.storageSize,

    // Actions
    addFrame,
    addResponse,
    getFrame,
    getResponse,
    getResponsesForFrame,
    getRecentFrames,
    getRecentResponses,
    getFramesWithViolations,
    getStatistics,
    clearAll,
    cleanup,
    exportData,
  };
};

// Import React for useEffect
import * as React from 'react';


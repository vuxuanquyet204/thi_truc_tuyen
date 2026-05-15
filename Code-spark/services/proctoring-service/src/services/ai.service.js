// file: src/services/ai.service.js
// AI Service client - HTTP-based
// Giao tiep voi AI Python service qua HTTP (khong dung Socket.IO vi Python uvicorn khong ho tro Socket.IO protocol)

const config = require('../config');
const axios = require('axios');

// Module-level state
let httpAgent = null;

/**
 * Lay axios instance voi agent reuse
 */
function getHttpClient() {
  if (!httpAgent) {
    const http = require('http');
    const https = require('https');
    httpAgent = new http.Agent({ keepAlive: true, maxSockets: 10 });
  }
  return axios.create({
    httpAgent,
    timeout: 30000,
  });
}

/**
 * Phan tich 1 frame bang AI service qua HTTP.
 * Su dung endpoint: POST /analyze_frame
 */
async function analyzeFrame(imageBuffer, sessionId, studentId, examId) {
  if (!imageBuffer || imageBuffer.length === 0) {
    return { events: [], error: 'empty_buffer' };
  }

  const aiUrl = config.ai?.url || 'http://127.0.0.1:8000';
  // Parse URL to get base (without path) to avoid duplicate path like /analyze_frame/analyze_frame
  let aiBaseUrl = aiUrl;
  try {
    const parsed = new URL(aiUrl);
    aiBaseUrl = `${parsed.protocol}//${parsed.host}`;
  } catch {
    // If URL parse fails, strip any trailing path manually
    const slashIdx = aiUrl.indexOf('/', aiUrl.indexOf('://') + 3);
    if (slashIdx !== -1) {
      aiBaseUrl = aiUrl.substring(0, slashIdx);
    }
  }

  // Trich xuat base64 payload
  let base64String = imageBuffer;
  if (imageBuffer.includes(',')) {
    base64String = imageBuffer.split(',')[1];
  }

  if (!base64String || base64String.length === 0) {
    return { events: [], error: 'invalid_base64' };
  }

  // Tao buffer tu base64
  let buffer;
  try {
    buffer = Buffer.from(base64String, 'base64');
  } catch {
    return { events: [], error: 'base64_decode_failed' };
  }

  if (!buffer || buffer.length === 0) {
    return { events: [], error: 'empty_buffer_after_decode' };
  }

  const frameId = sessionId || `frame_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const frameSizeKB = (buffer.length / 1024).toFixed(1);

  console.log(`[AI HTTP] Sending frame ${frameId} (${frameSizeKB}KB) to ${aiBaseUrl}/analyze_frame...`);

  try {
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: `frame_${Date.now()}.jpg`,
      contentType: 'image/jpeg'
    });
    formData.append('sessionId', frameId);
    if (studentId) formData.append('studentId', String(studentId));
    if (examId) formData.append('examId', String(examId));

    const startTime = Date.now();
    const http = getHttpClient();
    const response = await http.post(`${aiBaseUrl}/analyze_frame`, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    const elapsedMs = Date.now() - startTime;
    const data = response.data;

    console.log(`[AI HTTP] Response received in ${elapsedMs}ms:`, JSON.stringify(data).slice(0, 200));

    // Parse response - AI service tra ve: { events: [...], ... }
    const events = Array.isArray(data) ? data : (data.events || []);
    const stats = {
      ...(data.stats || {}),
      total_ms: elapsedMs,
      mode: 'http'
    };

    return { events, stats };
  } catch (error) {
    const errorMessage = error.response
      ? `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`
      : error.message;
    console.error(`[AI HTTP] Error analyzing frame ${frameId}:`, errorMessage);
    return { events: [], error: errorMessage };
  }
}

/**
 * Phan tich nhieu frames cung luc (batch) qua HTTP.
 * Su dung endpoint: POST /analyze_frame (gui tung frame mot, nhan ket qua tuong ung)
 */
async function analyzeBatchFrames(frames) {
  if (!Array.isArray(frames) || frames.length === 0) {
    return [];
  }

  console.log(`[AI HTTP] Processing batch of ${frames.length} frames...`);
  const aiUrl = config.ai?.url || 'http://127.0.0.1:8000';

  const results = await Promise.allSettled(
    frames.map(async (frame, index) => {
      const frameId = frame.id || `batch_${index}_${Date.now()}`;
      try {
        const result = await analyzeFrame(
          frame.image || frame.buffer || frame.frameBuffer,
          frameId,
          frame.studentId,
          frame.examId
        );
        return { ...result, frameId, index };
      } catch (err) {
        return { events: [], error: err.message, frameId, index };
      }
    })
  );

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return { events: [], error: r.reason?.message || 'unknown_error', index: i };
  });
}

/**
 * Check AI service health qua HTTP
 */
async function checkHealth() {
  const aiUrl = config.ai?.url || 'http://127.0.0.1:8000';
  let aiBaseUrl = aiUrl;
  try {
    const parsed = new URL(aiUrl);
    aiBaseUrl = `${parsed.protocol}//${parsed.host}`;
  } catch {
    const slashIdx = aiUrl.indexOf('/', aiUrl.indexOf('://') + 3);
    if (slashIdx !== -1) {
      aiBaseUrl = aiUrl.substring(0, slashIdx);
    }
  }
  try {
    const http = getHttpClient();
    const response = await http.get(`${aiBaseUrl}/health`, { timeout: 5000 });
    console.log('[AI Health] OK:', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('[AI Health] Failed:', error.message);
    return null;
  }
}

/**
 * Dong ket noi - khong can thiet voi HTTP, nhung giu interface
 */
function closeConnection() {
  if (httpAgent) {
    httpAgent.destroy();
    httpAgent = null;
  }
  console.log('[AI HTTP] Connection closed');
}

/**
 * Khoi tao - khong can thiet voi HTTP, nhung giu interface
 */
function initAISocket() {
  // HTTP khong can khoi tao persistent connection
  return true;
}

module.exports = {
  analyzeFrame,
  analyzeBatchFrames,
  closeConnection,
  initAISocket,
  checkHealth,
};

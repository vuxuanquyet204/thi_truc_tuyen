let sharedStream: MediaStream | null = null;
let startPromise: Promise<MediaStream> | null = null;
let usageCount = 0;
let captureVideo: HTMLVideoElement | null = null;
let captureCanvas: HTMLCanvasElement | null = null;
let metadataReadyPromise: Promise<void> | null = null;

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  },
  audio: true,
};

function ensureCaptureElements(): HTMLVideoElement {
  if (!captureVideo) {
    captureVideo = document.createElement('video');
    captureVideo.autoplay = true;
    captureVideo.muted = true;
    captureVideo.playsInline = true;
    captureVideo.style.position = 'fixed';
    captureVideo.style.opacity = '0';
    captureVideo.style.pointerEvents = 'none';
    captureVideo.style.width = '1px';
    captureVideo.style.height = '1px';
    captureVideo.style.left = '-9999px';
    captureVideo.style.top = '-9999px';
    document.body.appendChild(captureVideo);
  }

  if (!captureCanvas) {
    captureCanvas = document.createElement('canvas');
    captureCanvas.style.display = 'none';
    document.body.appendChild(captureCanvas);
  }

  if (captureVideo.srcObject !== sharedStream) {
    captureVideo.srcObject = sharedStream;
  }

  return captureVideo;
}

async function waitForVideoReady(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
    try {
      await video.play();
    } catch (err) {
      console.warn('cameraManager: failed to play hidden video element', err);
    }
    return;
  }

  if (!metadataReadyPromise) {
    metadataReadyPromise = new Promise((resolve) => {
      const handleLoaded = () => {
        metadataReadyPromise = null;
        resolve();
      };

      video.addEventListener('loadeddata', handleLoaded, { once: true });
    });
  }

  try {
    await video.play();
  } catch (err) {
    console.warn('cameraManager: play() threw during metadata wait', err);
  }

  await metadataReadyPromise;
}

export const cameraManager = {
  get currentStream(): MediaStream | null {
    return sharedStream;
  },

  async start(): Promise<MediaStream> {
    if (sharedStream) {
      const video = ensureCaptureElements();
      await waitForVideoReady(video);
      return sharedStream;
    }

    if (!startPromise) {
      startPromise = navigator.mediaDevices
        .getUserMedia(CAMERA_CONSTRAINTS)
        .then(async (stream) => {
          sharedStream = stream;
          const video = ensureCaptureElements();
          await waitForVideoReady(video);
          return stream;
        })
        .catch((error) => {
          sharedStream = null;
          throw error;
        })
        .finally(() => {
          startPromise = null;
        });
    }

    return startPromise;
  },

  incrementUsage(): void {
    usageCount += 1;
  },

  decrementUsage(): void {
    usageCount = Math.max(0, usageCount - 1);
    if (usageCount === 0) {
      this.stop();
    }
  },

  attachToElement(videoElement: HTMLVideoElement | null): void {
    if (!videoElement || !sharedStream) {
      return;
    }

    if (videoElement.srcObject !== sharedStream) {
      videoElement.srcObject = sharedStream;
    }

    if (videoElement.readyState >= 2) {
      videoElement
        .play()
        .catch((err) => console.warn('cameraManager: failed to play video element', err));
    } else {
      videoElement.onloadedmetadata = () => {
        videoElement
          .play()
          .catch((err) => console.warn('cameraManager: failed to play video element after metadata', err));
      };
    }
  },

  captureFrame(): string | null {
    if (!sharedStream) {
      console.warn('[cameraManager] captureFrame: sharedStream is null');
      return null;
    }
    if (!captureVideo) {
      console.warn('[cameraManager] captureFrame: captureVideo is null');
      return null;
    }
    if (!captureCanvas) {
      console.warn('[cameraManager] captureFrame: captureCanvas is null');
      return null;
    }

    if (captureVideo.videoWidth === 0 || captureVideo.videoHeight === 0) {
      console.warn(`[cameraManager] captureFrame: video dims=0 (readyState=${captureVideo.readyState}, w=${captureVideo.videoWidth}, h=${captureVideo.videoHeight})`);
      return null;
    }

    captureCanvas.width = captureVideo.videoWidth;
    captureCanvas.height = captureVideo.videoHeight;

    const context = captureCanvas.getContext('2d');
    if (!context) {
      console.warn('[cameraManager] captureFrame: getContext2d is null');
      return null;
    }

    context.drawImage(captureVideo, 0, 0, captureCanvas.width, captureCanvas.height);

    try {
      const result = captureCanvas.toDataURL('image/jpeg', 0.95);
      if (!result || result.length < 100) {
        console.warn('[cameraManager] captureFrame: toDataURL returned invalid:', result?.length);
        return null;
      }
      return result;
    } catch (err) {
      console.error('[cameraManager] captureFrame: toDataURL failed:', err);
      return null;
    }
  },

  getVideoDimensions(): { width: number; height: number } | null {
    if (captureVideo && captureVideo.videoWidth > 0 && captureVideo.videoHeight > 0) {
      return { width: captureVideo.videoWidth, height: captureVideo.videoHeight };
    }

    const track = sharedStream?.getVideoTracks()[0];
    const settings = track?.getSettings();
    if (settings?.width && settings?.height) {
      return { width: settings.width, height: settings.height };
    }

    return null;
  },

  getFrameRate(): number | null {
    const track = sharedStream?.getVideoTracks()[0];
    const settings = track?.getSettings();
    if (typeof settings?.frameRate === 'number') {
      return settings.frameRate;
    }
    return null;
  },

  stop(): void {
    if (sharedStream) {
      sharedStream.getTracks().forEach((track) => track.stop());
      sharedStream = null;
    }

    if (captureVideo) {
      captureVideo.pause();
      captureVideo.srcObject = null;
      if (captureVideo.parentNode) {
        captureVideo.parentNode.removeChild(captureVideo);
      }
      captureVideo = null;
    }

    if (captureCanvas && captureCanvas.parentNode) {
      captureCanvas.parentNode.removeChild(captureCanvas);
    }
    captureCanvas = null;
  },
};



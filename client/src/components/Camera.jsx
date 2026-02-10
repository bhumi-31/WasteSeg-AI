import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, SwitchCamera, X, Loader2, Upload, ImageIcon } from 'lucide-react';

export function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' = back camera
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [mode, setMode] = useState('camera'); // 'camera' or 'upload'

  // Start camera stream
  const startCamera = useCallback(async (facing = facingMode) => {
    setIsLoading(true);
    setError(null);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      // Check for multiple cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);

      const constraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Camera error:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is being used by another application.');
      } else {
        setError('Failed to access camera. Please try again.');
      }
      
      setIsLoading(false);
    }
  }, [facingMode]);

  // Initialize camera on mount
  useEffect(() => {
    startCamera();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Switch between front and back camera
  const switchCamera = useCallback(() => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);
    startCamera(newFacing);
  }, [facingMode, startCamera]);

  // Capture image from video stream
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Send captured image to parent
    onCapture(imageData);
  }, [onCapture]);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Maximum size is 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result;
      if (typeof imageData === 'string') {
        // Stop camera if running
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        onCapture(imageData);
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }, [onCapture]);

  // Handle close
  const handleClose = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onClose();
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera preview */}
      <div className="relative h-full w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-3 text-white">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Starting camera...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black px-6">
            <div className="max-w-sm rounded-2xl bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Camera className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">Camera Error</h3>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <button
                onClick={handleClose}
                className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${isLoading || error ? 'hidden' : ''}`}
        />

        {/* Overlay UI */}
        {!isLoading && !error && (
          <>
            {/* Top bar */}
            <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-4 pt-[calc(1rem+env(safe-area-inset-top))] z-20">
              <button
                onClick={handleClose}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm active:bg-black/70 active:scale-95 transition-all touch-manipulation"
                style={{ minHeight: '48px', minWidth: '48px' }}
              >
                <X className="h-6 w-6" />
              </button>
              
              {hasMultipleCameras && (
                <button
                  onClick={switchCamera}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm active:bg-black/70 active:scale-95 transition-all touch-manipulation"
                  style={{ minHeight: '48px', minWidth: '48px' }}
                >
                  <SwitchCamera className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Center guide */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="h-48 w-48 rounded-2xl border-2 border-white/50" />
                <p className="mt-4 rounded-full bg-black/30 px-4 py-2 text-sm text-white backdrop-blur-sm">
                  Point at waste item
                </p>
              </div>
            </div>

            {/* Bottom bar - Capture and Upload buttons */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-8 pt-12 safe-area-bottom">
              <div className="flex items-center justify-center gap-8">
                {/* Upload from gallery */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform active:scale-95">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-white/80">Gallery</span>
                </button>

                {/* Capture button */}
                <button
                  onClick={captureImage}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform active:scale-95">
                    <div className="h-16 w-16 rounded-full border-4 border-black/10 bg-white" />
                  </div>
                  <span className="text-xs text-white/80">Capture</span>
                </button>

                {/* Placeholder for symmetry */}
                <div className="w-14" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

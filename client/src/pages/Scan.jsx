import { useCallback, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ImagePlus, Loader2, Upload, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { CameraCapture } from '@/components/Camera';
import { analyzeWaste, checkHealth } from '@/lib/api';

export default function Scan() {
  const [imageUrl, setImageUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(null); // null = checking, true = online, false = offline
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Check server health on mount
  useEffect(() => {
    checkHealth().then(setServerStatus);
  }, []);

  const handleFile = useCallback((file) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target.result);
    };
    reader.onerror = () => {
      setError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      } else {
        setError('Please drop a valid image file.');
      }
    },
    [handleFile]
  );

  const handleCameraCapture = useCallback((capturedImage) => {
    setShowCamera(false);
    setImageUrl(capturedImage);
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageUrl) return;
    
    setAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeWaste(imageUrl);
      
      navigate('/result', {
        state: {
          ...result,
          imageUrl,
        },
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
      setAnalyzing(false);
    }
  }, [imageUrl, navigate]);

  // Show camera view
  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 pt-24 sm:py-16 sm:pt-28">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Scan Waste Item
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Capture or upload a photo for instant AI-powered classification.
        </p>
      </div>

      {/* Server Status Indicator */}
      <div className="mt-4 flex justify-center">
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
          serverStatus === true 
            ? 'bg-[hsl(var(--organic-light))] text-[hsl(var(--organic))]' 
            : serverStatus === false 
            ? 'bg-[hsl(var(--hazardous-light))] text-[hsl(var(--hazardous))]'
            : 'bg-primary/10 text-primary'
        }`}>
          {serverStatus === true ? (
            <>
              <Wifi className="h-3 w-3" />
              AI Service Online
            </>
          ) : serverStatus === false ? (
            <>
              <WifiOff className="h-3 w-3" />
              AI Service Offline
            </>
          ) : (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Checking...
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="mt-1 text-sm text-destructive/80">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
          imageUrl
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-white/20 bg-white/5 hover:border-emerald-500/30 hover:bg-white/10'
        } p-8 sm:p-12`}
      >
        {imageUrl ? (
          <div className="w-full animate-scale-in">
            <div className="overflow-hidden rounded-xl">
              <img 
                src={imageUrl} 
                alt="Selected waste item" 
                className="mx-auto max-h-64 w-full object-contain" 
              />
            </div>
            <button
              onClick={() => {
                setImageUrl(null);
                setError(null);
              }}
              className="mx-auto mt-4 block text-sm text-white/60 underline underline-offset-2 hover:text-white"
            >
              Remove & choose another
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20">
              <ImagePlus className="h-7 w-7 text-emerald-400" />
            </div>
            <p className="font-heading text-sm font-semibold text-white">
              Drop your image here
            </p>
            <p className="mt-1 text-xs text-white/50">or use the buttons below</p>
          </>
        )}
      </div>

      {/* Action Buttons */}
      {!imageUrl && (
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </button>
          <button
            onClick={() => setShowCamera(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-medium text-black transition-opacity hover:bg-emerald-400"
          >
            <Camera className="h-4 w-4" />
            Use Camera
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = ''; // Reset input
        }}
      />

      {/* Analyze Button */}
      {imageUrl && (
        <button
          onClick={handleAnalyze}
          disabled={analyzing || serverStatus === false}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 text-sm font-semibold text-black transition-opacity hover:bg-emerald-400 disabled:opacity-70"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing with AI...
            </>
          ) : serverStatus === false ? (
            <>
              <WifiOff className="h-4 w-4" />
              Server Offline
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              Analyze Waste
            </>
          )}
        </button>
      )}

      {/* Tips */}
      <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold text-white">📸 Tips for better results:</p>
        <ul className="mt-2 space-y-1 text-xs text-white/60">
          <li>• Ensure good lighting</li>
          <li>• Focus on a single item</li>
          <li>• Avoid blurry images</li>
          <li>• Include the full item in frame</li>
        </ul>
      </div>
    </div>
  );
}

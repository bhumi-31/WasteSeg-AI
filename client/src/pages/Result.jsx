import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { saveScanResult } from '@/lib/storage';
import { MapPin, RotateCcw, Save, AlertTriangle, CheckCircle, Lightbulb, Clock, Recycle, Leaf, Trash2 } from 'lucide-react';

// Confetti effect hook
function useConfetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#60a5fa', '#f472b6'];
    const particles = [];

    // Create particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }

    let animationId;
    let startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - elapsed / 3000);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (elapsed < 3000) {
        animationId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return canvasRef;
}

const categoryConfig = {
  recyclable: {
    label: 'Recyclable',
    Icon: Recycle,
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  organic: {
    label: 'Organic / Compostable',
    Icon: Leaf,
    gradient: 'bg-gradient-to-br from-green-500 to-emerald-500',
    bgLight: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  hazardous: {
    label: 'Hazardous',
    Icon: AlertTriangle,
    gradient: 'bg-gradient-to-br from-red-500 to-orange-500',
    bgLight: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const state = location.state;
  const confettiCanvasRef = useConfetti();

  useEffect(() => {
    if (!state) navigate('/scan', { replace: true });
  }, [state, navigate]);

  if (!state) return null;

  const config = categoryConfig[state.category] || categoryConfig.recyclable;

  const handleSave = async () => {
    await saveScanResult({
      id: crypto.randomUUID(),
      category: state.category,
      imageUrl: state.imageUrl,
      timestamp: Date.now(),
      itemName: state.itemName,
      explanation: state.disposalSteps?.join(' ') || '',
      tip: state.environmentalTip || '',
      disposalMethod: state.disposalSteps?.join(' ') || '',
      tips: state.disposalSteps || []
    });
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 pt-24 sm:py-16 sm:pt-28 relative">
      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: '100vw', height: '100vh' }}
      />
      <div className="mb-6 text-center">
        <h1 className="font-heading text-2xl font-bold text-white">Analysis Complete</h1>
        <p className="mt-1 text-sm text-white/60">
          Here's what we found about your waste item.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg">
        <div className={`${config.gradient} px-6 py-8 text-center text-white`}>
          <config.Icon className="h-14 w-14 mx-auto" />
          <h2 className="mt-3 font-heading text-2xl font-bold">{config.label}</h2>
          {state.itemName && (
            <p className="mt-2 text-lg opacity-90">"{state.itemName}"</p>
          )}
          {state.confidence && (
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm">
              <CheckCircle className="h-4 w-4" />
              {state.confidence}% Confidence
            </div>
          )}
        </div>

        <div className="border-b border-white/10 px-6 py-4">
          <div className="overflow-hidden rounded-xl">
            <img
              src={state.imageUrl}
              alt="Scanned waste item"
              className="h-48 w-full object-cover"
            />
          </div>
        </div>

        <div className={`mx-4 my-4 rounded-xl ${config.bgLight} ${config.borderColor} border p-4`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.gradient}`}>
              <Trash2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Dispose in</p>
              <p className={`font-heading text-lg font-bold ${config.textColor}`}>
                {state.binColor} Bin - {state.binType}
              </p>
            </div>
          </div>
        </div>

        {state.disposalSteps && state.disposalSteps.length > 0 && (
          <div className="border-t border-white/10 px-6 py-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Before Disposing
            </div>
            <ul className="mt-3 space-y-2">
              {state.disposalSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-medium text-emerald-400">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {state.warnings && state.warnings.length > 0 && (
          <div className="mx-4 mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Safety Warning
            </div>
            <ul className="mt-2 space-y-1">
              {state.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-red-600">• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {state.environmentalTip && (
          <div className="mx-4 mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <Lightbulb className="h-4 w-4" />
              Did You Know?
            </div>
            <p className="mt-2 text-sm text-amber-700">{state.environmentalTip}</p>
          </div>
        )}

        {state.processingTime && (
          <div className="flex items-center justify-center gap-2 border-t border-white/10 px-6 py-3 text-xs text-white/50">
            <Clock className="h-3 w-3" />
            Analysis completed in {(state.processingTime / 1000).toFixed(1)}s
          </div>
        )}

        <div className="flex gap-3 border-t border-white/10 bg-white/5 px-6 py-5">
          <button
            onClick={() => navigate('/scan')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Scan Another
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              saved
                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                : 'bg-emerald-500 text-black hover:bg-emerald-400'
            }`}
          >
            <Save className="h-4 w-4" />
            {saved ? 'Saved ✓' : 'Save to History'}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-white">Find Nearby Disposal</p>
            <p className="mt-1 text-xs text-white/60">
              {state.category === 'hazardous' 
                ? 'Search for hazardous waste collection centers in your area.'
                : 'Check your local recycling guidelines for specific instructions.'}
            </p>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(
                state.category === 'hazardous' 
                  ? 'hazardous waste disposal near me'
                  : 'recycling center near me'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-400 hover:underline"
            >
              <MapPin className="h-3 w-3" />
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

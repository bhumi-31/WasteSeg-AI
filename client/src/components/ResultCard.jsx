import { MapPin, RotateCcw, Save, Recycle, Leaf, AlertTriangle, Lightbulb } from 'lucide-react';

const categoryConfig = {
  recyclable: {
    label: 'Recyclable',
    Icon: Recycle,
    gradient: 'bg-gradient-recyclable',
    bgLight: 'bg-recyclable-light',
  },
  organic: {
    label: 'Organic',
    Icon: Leaf,
    gradient: 'bg-gradient-organic',
    bgLight: 'bg-organic-light',
  },
  hazardous: {
    label: 'Hazardous',
    Icon: AlertTriangle,
    gradient: 'bg-gradient-hazardous',
    bgLight: 'bg-hazardous-light',
  },
};

export function ResultCard({ category, explanation, tip, imageUrl, onScanAnother, onSave, saved }) {
  const config = categoryConfig[category];

  return (
    <div className="mx-auto w-full max-w-lg animate-scale-in">
      {/* Category Badge */}
      <div className={`${config.gradient} rounded-t-2xl px-6 py-8 text-center`}>
        <config.Icon className="h-12 w-12 mx-auto text-white" />
        <h2 className="mt-3 font-heading text-2xl font-bold text-accent-foreground">{config.label}</h2>
      </div>

      {/* Image preview */}
      <div className="border-x border-border bg-card px-6 pt-6">
        <div className="overflow-hidden rounded-xl">
          <img
            src={imageUrl}
            alt="Scanned waste item"
            className="h-48 w-full object-cover"
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="border-x border-border bg-card px-6 py-5">
        <p className="text-sm leading-relaxed text-foreground">{explanation}</p>
      </div>

      {/* Tip */}
      <div className={`mx-6 rounded-xl ${config.bgLight} px-4 py-3`}>
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Did you know?</p>
        <p className="mt-1 text-sm text-foreground">{tip}</p>
      </div>

      {/* Nearby Disposal */}
      <div className="border-x border-border bg-card px-6 py-4">
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div>
            <p className="text-xs font-semibold text-foreground">Nearby Disposal Help</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Nearest recycling center: 1.5 km away</p>
            <p className="text-xs text-muted-foreground">Municipal collection point: 3.2 km away</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 rounded-b-2xl border border-t-0 border-border bg-card px-6 py-5">
        <button
          onClick={onScanAnother}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" />
          Scan Another
        </button>
        <button
          onClick={onSave}
          disabled={saved}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
            saved
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-gradient-hero text-accent-foreground hover:opacity-90 shadow-glow-primary'
          }`}
        >
          <Save className="h-4 w-4" />
          {saved ? 'Saved ✓' : 'Save to History'}
        </button>
      </div>
    </div>
  );
}

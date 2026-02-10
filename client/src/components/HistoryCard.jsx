import { format } from 'date-fns';
import { Recycle, Leaf, AlertTriangle } from 'lucide-react';

const categoryStyles = {
  recyclable: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Recyclable', Icon: Recycle },
  organic: { bg: 'bg-green-100', text: 'text-green-700', label: 'Organic', Icon: Leaf },
  hazardous: { bg: 'bg-red-100', text: 'text-red-700', label: 'Hazardous', Icon: AlertTriangle },
};

export function HistoryCard({ result }) {
  const style = categoryStyles[result.category] || categoryStyles.recyclable;

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-elevated">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
        <img src={result.imageUrl} alt="Scanned item" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full ${style.bg} px-2.5 py-0.5 text-xs font-semibold ${style.text}`}>
            <style.Icon className="h-3 w-3" /> {style.label}
          </span>
        </div>
        <p className="mt-1.5 truncate text-sm font-medium text-foreground">
          {result.itemName || 'Unknown Item'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {format(new Date(result.timestamp), 'MMM d, yyyy · h:mm a')}
        </p>
      </div>
    </div>
  );
}

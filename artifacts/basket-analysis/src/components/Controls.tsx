import { SlidersHorizontal } from "lucide-react";

interface ControlsProps {
  minSupport: number;
  setMinSupport: (val: number) => void;
  minConfidence: number;
  setMinConfidence: (val: number) => void;
}

export function Controls({ minSupport, setMinSupport, minConfidence, setMinConfidence }: ControlsProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-8 items-center justify-between">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">Analysis Parameters</h3>
          <p className="text-xs text-muted-foreground">Adjust thresholds to discover new insights</p>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col sm:flex-row gap-8 md:justify-end">
        {/* Support Slider */}
        <div className="flex flex-col gap-2 w-full sm:max-w-xs">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Minimum Support</span>
            <span className="text-foreground font-display font-bold">{(minSupport * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={minSupport}
            onChange={(e) => setMinSupport(parseFloat(e.target.value))}
            className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) ${(minSupport - 0.01) / 0.49 * 100}%, hsl(var(--background)) ${(minSupport - 0.01) / 0.49 * 100}%)`
            }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/50">
            <span>1%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Confidence Slider */}
        <div className="flex flex-col gap-2 w-full sm:max-w-xs">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Minimum Confidence</span>
            <span className="text-foreground font-display font-bold">{(minConfidence * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
            className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-accent"
            style={{
              background: `linear-gradient(to right, hsl(var(--accent)) ${(minConfidence - 0.1) / 0.9 * 100}%, hsl(var(--background)) ${(minConfidence - 0.1) / 0.9 * 100}%)`
            }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/50">
            <span>10%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

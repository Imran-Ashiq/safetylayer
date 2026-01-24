'use client';

/**
 * ScrubIntensityToggle Component
 * 
 * Toggle between Standard and Aggressive scrubbing modes:
 * - Standard: Only validated patterns (Luhn-checked cards, valid emails)
 * - Aggressive: All matches including partial/unvalidated patterns
 */

import { Shield, ShieldAlert } from 'lucide-react';
import { useScrubberStore } from '@/store/useSecretStore';
import { cn } from '@/lib/utils';

export function ScrubIntensityToggle() {
  const { intensity, setIntensity } = useScrubberStore();

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <button
        onClick={() => setIntensity('standard')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
          intensity === 'standard'
            ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-sm'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        )}
      >
        <Shield className="h-4 w-4" />
        <span className="hidden sm:inline">Standard</span>
      </button>
      <button
        onClick={() => setIntensity('aggressive')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
          intensity === 'aggressive'
            ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        )}
      >
        <ShieldAlert className="h-4 w-4" />
        <span className="hidden sm:inline">Aggressive</span>
      </button>
    </div>
  );
}

/**
 * Compact version for ControlBar integration
 */
export function ScrubIntensityBadge() {
  const { intensity, setIntensity } = useScrubberStore();

  const toggle = () => {
    setIntensity(intensity === 'standard' ? 'aggressive' : 'standard');
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all touch-target',
        intensity === 'standard'
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
      )}
      title={intensity === 'standard' 
        ? 'Standard mode: Only validated patterns' 
        : 'Aggressive mode: All potential matches'
      }
    >
      {intensity === 'standard' ? (
        <>
          <Shield className="h-3.5 w-3.5" />
          <span className="hidden sm:inline uppercase tracking-wide">Standard</span>
        </>
      ) : (
        <>
          <ShieldAlert className="h-3.5 w-3.5" />
          <span className="hidden sm:inline uppercase tracking-wide">Aggressive</span>
        </>
      )}
    </button>
  );
}

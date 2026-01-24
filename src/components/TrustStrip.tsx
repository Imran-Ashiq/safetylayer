'use client';

/**
 * TrustStrip Component
 * 
 * A persistent, minimal trust indicator that reassures users
 * their data never leaves the device. Always visible at the top.
 * Follows Material 3 design language for enterprise feel.
 */

import { Shield, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function TrustStrip() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 dark:from-emerald-500/20 dark:via-green-500/20 dark:to-emerald-500/20 border-b border-emerald-500/20 dark:border-emerald-500/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 py-2">
          {/* Pulsing green indicator */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          
          {/* Main message */}
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 tracking-wide">
            <Shield className="inline h-3 w-3 mr-1 -mt-0.5" />
            DEVICE-ONLY MODE
          </span>
          
          {/* Separator */}
          <span className="text-emerald-500/50 dark:text-emerald-400/50">•</span>
          
          {/* Status message */}
          <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
            {isOnline ? (
              <>
                <WifiOff className="inline h-3 w-3 mr-1 -mt-0.5" />
                No data sent to servers
              </>
            ) : (
              <>
                <Wifi className="inline h-3 w-3 mr-1 -mt-0.5" />
                Working offline
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

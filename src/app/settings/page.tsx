'use client';

/**
 * Settings Page
 * 
 * Power user settings for SafetyLayer:
 * - Pattern toggles (Email, CC, Phone, SSN)
 * - Scrub intensity (Standard/Aggressive)
 * - Keyboard shortcuts reference
 * - Data management (clear secrets)
 */

import Link from 'next/link';
import { 
  ArrowLeft, 
  Shield, 
  ShieldAlert, 
  Keyboard, 
  Trash2, 
  Mail, 
  CreditCard, 
  Phone, 
  Hash,
  Info,
  Check,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useScrubberStore } from '@/store/useSecretStore';
import { useToast } from '@/hooks/use-toast';
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { DEFAULT_OPTIONS } from '@/lib/scrubber';
import { TrustStrip } from '@/components/TrustStrip';

export default function SettingsPage() {
  const { options, setOptions, intensity, setIntensity, clearAll, secrets } = useScrubberStore();
  const { toast } = useToast();

  const handleClearSecrets = () => {
    clearAll();
    toast({
      title: 'Data cleared',
      description: 'All secrets and text have been cleared from memory.',
    });
  };

  const handleClearCache = async () => {
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Unregister service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
      
      toast({
        title: 'Cache cleared',
        description: 'Reloading with fresh content...',
      });
      
      // Force reload from server
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear cache. Try clearing browser data manually.',
        variant: 'destructive',
      });
    }
  };

  const handleResetDefaults = () => {
    setOptions(DEFAULT_OPTIONS);
    setIntensity('standard');
    toast({
      title: 'Settings reset',
      description: 'All settings have been restored to defaults.',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TrustStrip />
      
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl space-y-6">
        
        {/* Scrub Intensity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Scrub Intensity
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={() => setIntensity('standard')}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                intensity === 'standard'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${intensity === 'standard' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <Shield className={`h-5 w-5 ${intensity === 'standard' ? 'text-blue-600' : 'text-slate-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Standard</span>
                    {intensity === 'standard' && <Check className="h-4 w-4 text-blue-600" />}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Only validated patterns. Credit cards are Luhn-checked, emails must be properly formatted.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setIntensity('aggressive')}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                intensity === 'aggressive'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${intensity === 'aggressive' ? 'bg-orange-100 dark:bg-orange-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <ShieldAlert className={`h-5 w-5 ${intensity === 'aggressive' ? 'text-orange-600' : 'text-slate-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Aggressive</span>
                    {intensity === 'aggressive' && <Check className="h-4 w-4 text-orange-600" />}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Match all potential patterns. May have false positives but catches more edge cases.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </Card>

        {/* Pattern Toggles */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Pattern Detection</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <Mail className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-medium">Email Addresses</p>
                  <p className="text-sm text-slate-500">user@example.com</p>
                </div>
              </div>
              <Switch
                checked={options.email}
                onCheckedChange={(checked) => setOptions({ email: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium">Credit Cards</p>
                  <p className="text-sm text-slate-500">4111-1111-1111-1111</p>
                </div>
              </div>
              <Switch
                checked={options.creditCard}
                onCheckedChange={(checked) => setOptions({ creditCard: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Phone Numbers</p>
                  <p className="text-sm text-slate-500">+1 (555) 123-4567</p>
                </div>
              </div>
              <Switch
                checked={options.phone}
                onCheckedChange={(checked) => setOptions({ phone: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">SSN / ID Numbers</p>
                  <p className="text-sm text-slate-500">123-45-6789</p>
                </div>
              </div>
              <Switch
                checked={options.ssn}
                onCheckedChange={(checked) => setOptions({ ssn: checked })}
              />
            </div>
          </div>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-blue-600" />
            Keyboard Shortcuts
          </h2>
          
          <div className="space-y-3">
            {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{shortcut.action}</p>
                  <p className="text-sm text-slate-500">{shortcut.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, i) => (
                    <span key={i}>
                      <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                        {key}
                      </kbd>
                      {i < shortcut.keys.length - 1 && <span className="mx-0.5 text-slate-400">+</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-slate-600" />
            Data Management
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div>
                <p className="font-medium">Stored Secrets</p>
                <p className="text-sm text-slate-500">
                  {secrets.length} token{secrets.length !== 1 ? 's' : ''} in memory
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearSecrets}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </div>

            <Button 
              variant="outline" 
              onClick={handleResetDefaults}
              className="w-full gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All Settings to Defaults
            </Button>

            <Button 
              variant="outline" 
              onClick={handleClearCache}
              className="w-full gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
            >
              <Trash2 className="h-4 w-4" />
              Clear App Cache & Reload
            </Button>
          </div>
        </Card>

        {/* Version Info */}
        <div className="text-center text-sm text-slate-500 py-4">
          <p>SafetyLayer v1.0.0 • SW: 20260128-v7-nuclear</p>
          <p className="mt-1">
            <Link href="https://github.com/Imran-Ashiq/safetylayer" className="underline hover:text-slate-700">
              Open Source
            </Link>
            {' • '}
            <Link href="/blog" className="underline hover:text-slate-700">
              Documentation
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

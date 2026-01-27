'use client';

/**
 * ControlBar Component
 *
 * Main control bar with scrub, restore, copy, clear, and settings actions
 */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Shield, RefreshCw, Copy, Trash2, Settings, Check, Keyboard } from 'lucide-react';
import { useScrubberStore } from '@/store/useSecretStore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { DEFAULT_OPTIONS } from '@/lib/scrubber';
import { ScrubIntensityBadge } from '@/components/ScrubIntensityToggle';
import { haptic } from '@/lib/haptics';
import Link from 'next/link';
import { buildSmartCopyText, notifySelectRawInput } from '@/lib/smartCopy';

export function ControlBar() {
  const { scrubText, restoreText, clearAll, sanitizedOutput, options, setOptions, rawInput, secrets } =
    useScrubberStore();
  const { toast } = useToast();
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Check if restore is available
  const hasSecrets = secrets && secrets.length > 0;
  const rawInputHasTokens = rawInput && /\[(EMAIL|CC|PHONE|ID)_\d+\]/.test(rawInput);
  const canRestore = hasSecrets && (sanitizedOutput || rawInputHasTokens);

  const handleScrub = () => {
    if (!rawInput.trim()) {
      toast({
        title: 'No input to scrub',
        description: 'Please enter some text in the Raw Input panel.',
        variant: 'destructive',
      });
      haptic('warning');
      return;
    }

    setIsScrubbing(true);
    haptic('medium');
    // Simulate processing for better UX
    setTimeout(() => {
      scrubText();
      setIsScrubbing(false);
      haptic('success');
      toast({
        title: 'Text scrubbed successfully',
        description: 'PII has been masked and replaced with tokens.',
      });
    }, 300);
  };

  const handleRestore = () => {
    if (!hasSecrets) {
      toast({
        title: 'No secrets to restore',
        description: 'Please scrub some text first, or the secrets may have been cleared.',
        variant: 'destructive',
      });
      haptic('warning');
      return;
    }

    if (!sanitizedOutput && !rawInputHasTokens) {
      toast({
        title: 'No text to restore',
        description: 'Please scrub some text first, or paste text containing tokens into the Input panel.',
        variant: 'destructive',
      });
      haptic('warning');
      return;
    }

    setIsRestoring(true);
    haptic('medium');
    setTimeout(() => {
      restoreText();
      setIsRestoring(false);
      haptic('success');
      
      const message = rawInputHasTokens 
        ? 'Tokens in Raw Input have been replaced with original values.'
        : 'Original PII values from Safe Output have been restored.';
      
      toast({
        title: 'Text restored successfully',
        description: message,
      });
    }, 300);
  };

  const handleCopy = async () => {
    if (!sanitizedOutput) {
      toast({
        title: 'Nothing to copy',
        description: 'Please scrub some text first.',
        variant: 'destructive',
      });
      haptic('warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(buildSmartCopyText(sanitizedOutput, { includeInstruction: true }));
      notifySelectRawInput();
      haptic('success');
      toast({
        title: 'Copied with AI Safety Instructions',
        description: 'System instruction added to preserve tokens.',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy text to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleClear = () => {
    clearAll();
    toast({
      title: 'Cleared all data',
      description: 'All text and secret maps have been cleared.',
    });
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Intensity Badge */}
      <div className="hidden sm:block">
        <ScrubIntensityBadge />
      </div>
      
      {/* Primary Actions - Full width on mobile */}
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          onClick={handleScrub}
          disabled={isScrubbing || !rawInput.trim()}
          className="flex-1 sm:flex-none gap-2 h-11 sm:h-10 sm:min-w-[140px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 touch-target"
        >
          {isScrubbing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Scrubbing...</span>
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Scrub PII
            </>
          )}
        </Button>

        <Button
          onClick={handleRestore}
          disabled={isRestoring || !canRestore}
          variant="outline"
          className="flex-1 sm:flex-none gap-2 h-11 sm:h-10 sm:min-w-[140px] hover:bg-blue-500/10 hover:border-blue-500 transition-all hover:scale-105 touch-target"
        >
          {isRestoring ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Restoring...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Restore
            </>
          )}
        </Button>
      </div>

      {/* Secondary Actions - Row on mobile */}
      <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
        <Button 
          onClick={handleCopy} 
          disabled={!sanitizedOutput} 
          variant="outline" 
          className="flex-1 sm:flex-none gap-2 h-11 sm:h-10 hover:bg-purple-500/10 hover:border-purple-500 transition-all hover:scale-105 touch-target"
        >
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">Copy</span>
        </Button>

        <Button 
          onClick={handleClear} 
          variant="outline" 
          className="flex-1 sm:flex-none gap-2 h-11 sm:h-10 hover:bg-red-500/10 hover:border-red-500 transition-all hover:scale-105 touch-target"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Clear</span>
        </Button>

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 w-11 sm:h-10 sm:w-10 p-0 touch-target">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs uppercase tracking-wide text-slate-500">Pattern Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={options.email}
              onCheckedChange={(checked) => setOptions({ email: checked as boolean })}
              className="h-10"
            >
              Emails
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={options.creditCard}
              onCheckedChange={(checked) => setOptions({ creditCard: checked as boolean })}
              className="h-10"
            >
              Credit Cards
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={options.phone}
              onCheckedChange={(checked) => setOptions({ phone: checked as boolean })}
              className="h-10"
            >
              Phone Numbers
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={options.ssn}
              onCheckedChange={(checked) => setOptions({ ssn: checked as boolean })}
              className="h-10"
            >
              SSN / IDs
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setOptions(DEFAULT_OPTIONS)} className="h-10">
              Reset to Defaults
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="h-10">
              <Link href="/settings" className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                All Settings & Shortcuts
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

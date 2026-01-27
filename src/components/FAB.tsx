'use client';

/**
 * Floating Action Button (FAB) Component
 * 
 * Material Design 3 style FAB for primary actions.
 * Transforms based on app state:
 * - Default: "Scrub" action
 * - After scrubbing: "Copy" action
 * - After copying: Shows checkmark briefly
 * 
 * Only visible on mobile devices.
 */

import { useState, useEffect } from 'react';
import { Wand2, Copy, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrubberStore } from '@/store/useSecretStore';
import { useToast } from '@/hooks/use-toast';
import { buildSmartCopyText, notifySelectRawInput } from '@/lib/smartCopy';

type FABState = 'scrub' | 'copy' | 'copied' | 'restore' | 'copyRestored';

export function FAB() {
  const { scrubText, restoreText, rawInput, sanitizedOutput, restoredOutput, secrets } = useScrubberStore();
  const { toast } = useToast();
  const [fabState, setFabState] = useState<FABState>('scrub');
  const [isPressed, setIsPressed] = useState(false);

  // Determine FAB state based on app state
  useEffect(() => {
    const hasSecrets = secrets && secrets.length > 0;
    const rawHasTokens = rawInput && /\[(EMAIL|CC|PHONE|ID)_\d+\]/.test(rawInput);

    // Restore flow: if user pasted LLM output containing tokens, promote Restore.
    if (rawHasTokens && hasSecrets) {
      setFabState(restoredOutput ? 'copyRestored' : 'restore');
      return;
    }

    // If we have restored output, primary action becomes copying it.
    if (restoredOutput) {
      setFabState('copyRestored');
      return;
    }

    if (sanitizedOutput) {
      setFabState('copy');
      return;
    }

    setFabState('scrub');
  }, [sanitizedOutput, restoredOutput, rawInput, secrets]);

  const handleClick = async () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    switch (fabState) {
      case 'scrub':
        if (rawInput.trim()) {
          scrubText();
          toast({
            title: 'Text scrubbed',
            description: 'PII has been sanitized',
          });
          // Haptic feedback on supported devices
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        } else {
          toast({
            title: 'No input',
            description: 'Enter text to scrub first',
          });
        }
        break;

      case 'copy':
        try {
          await navigator.clipboard.writeText(buildSmartCopyText(sanitizedOutput, { includeInstruction: true }));
          notifySelectRawInput();
          setFabState('copied');
          toast({
            title: 'Copied with AI Safety Instructions',
            description: 'System instruction added to preserve tokens.',
          });
          if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
          }
          // Reset to copy state after 2 seconds
          setTimeout(() => setFabState('copy'), 2000);
        } catch {
          toast({
            title: 'Copy failed',
            description: 'Please copy manually',
          });
        }
        break;

      case 'copyRestored':
        try {
          if (!restoredOutput) return;
          await navigator.clipboard.writeText(restoredOutput);
          notifySelectRawInput();
          setFabState('copied');
          toast({
            title: 'Copied!',
            description: 'Restored text copied to clipboard',
          });
          if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
          }
          setTimeout(() => setFabState('copyRestored'), 2000);
        } catch {
          toast({
            title: 'Copy failed',
            description: 'Please copy manually',
          });
        }
        break;

      case 'copied':
        // Already copied, do nothing or show message
        break;

      case 'restore':
        restoreText();
        toast({
          title: 'Text restored',
          description: 'Original data recovered',
        });
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        // After restoring, bring output into view and make next tap copy.
        setTimeout(() => {
          document.getElementById('safetylayer-output-panel')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 50);
        break;
    }
  };

  // FAB configurations for each state
  const fabConfig = {
    scrub: {
      icon: <Wand2 className="h-6 w-6" />,
      label: 'Scrub',
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/40',
    },
    copy: {
      icon: <Copy className="h-6 w-6" />,
      label: 'Copy',
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-purple-500/40',
    },
    copied: {
      icon: <Check className="h-6 w-6" />,
      label: 'Copied',
      gradient: 'from-green-500 to-emerald-500',
      shadow: 'shadow-green-500/40',
    },
    restore: {
      icon: <RotateCcw className="h-6 w-6" />,
      label: 'Restore',
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/40',
    },
    copyRestored: {
      icon: <Copy className="h-6 w-6" />,
      label: 'Copy',
      gradient: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/40',
    },
  };

  const config = fabConfig[fabState];

  return (
    <button
      onClick={handleClick}
      className={cn(
        'fixed bottom-24 right-4 z-50 md:hidden',
        'flex items-center gap-2 px-5 py-4',
        'rounded-2xl text-white font-semibold',
        'shadow-2xl transition-all duration-300',
        `bg-gradient-to-r ${config.gradient} ${config.shadow}`,
        isPressed ? 'scale-95' : 'scale-100 hover:scale-105',
        'active:scale-95'
      )}
      aria-label={config.label}
    >
      <span className={cn(
        'transition-transform duration-300',
        isPressed && 'rotate-12'
      )}>
        {config.icon}
      </span>
      <span className="text-sm uppercase tracking-wide">{config.label}</span>
    </button>
  );
}

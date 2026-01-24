'use client';

/**
 * useKeyboardShortcuts Hook
 * 
 * Provides power-user keyboard shortcuts for the PII Scrubber:
 * - Ctrl/Cmd + Enter: Scrub text
 * - Ctrl/Cmd + Shift + C: Copy sanitized output
 * - Ctrl/Cmd + Shift + R: Restore original text
 * - Ctrl/Cmd + /: Show shortcuts help
 * - Escape: Close any open dialogs
 */

import { useEffect, useCallback } from 'react';
import { useScrubberStore } from '@/store/useSecretStore';
import { useToast } from '@/hooks/use-toast';

interface ShortcutActions {
  onScrub?: () => void;
  onCopy?: () => void;
  onRestore?: () => void;
  onClear?: () => void;
  onShowHelp?: () => void;
}

export function useKeyboardShortcuts(customActions?: ShortcutActions) {
  const { 
    scrubText, 
    restoreText, 
    clearAll,
    rawInput, 
    sanitizedOutput, 
    secrets 
  } = useScrubberStore();
  const { toast } = useToast();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMod = e.ctrlKey || e.metaKey;
    
    // Ignore shortcuts when typing in inputs (except if Shift is pressed for power shortcuts)
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    
    // Ctrl/Cmd + Enter: Scrub (works even in textarea)
    if (isMod && e.key === 'Enter') {
      e.preventDefault();
      if (customActions?.onScrub) {
        customActions.onScrub();
      } else if (rawInput.trim()) {
        scrubText();
        toast({
          title: '⚡ Text scrubbed',
          description: 'Ctrl+Enter',
        });
      }
      return;
    }

    // Skip other shortcuts if in input without Shift
    if (isInput && !e.shiftKey) return;

    // Ctrl/Cmd + Shift + C: Copy sanitized output
    if (isMod && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      if (customActions?.onCopy) {
        customActions.onCopy();
      } else if (sanitizedOutput) {
        navigator.clipboard.writeText(sanitizedOutput);
        toast({
          title: '📋 Copied to clipboard',
          description: 'Ctrl+Shift+C',
        });
      }
      return;
    }

    // Ctrl/Cmd + Shift + R: Restore original
    if (isMod && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      if (customActions?.onRestore) {
        customActions.onRestore();
      } else if (secrets.length > 0) {
        restoreText();
        toast({
          title: '🔄 Text restored',
          description: 'Ctrl+Shift+R',
        });
      }
      return;
    }

    // Ctrl/Cmd + Shift + X: Clear all
    if (isMod && e.shiftKey && e.key === 'X') {
      e.preventDefault();
      if (customActions?.onClear) {
        customActions.onClear();
      } else {
        clearAll();
        toast({
          title: '🗑️ Cleared all',
          description: 'Ctrl+Shift+X',
        });
      }
      return;
    }

    // Ctrl/Cmd + /: Show shortcuts help
    if (isMod && e.key === '/') {
      e.preventDefault();
      if (customActions?.onShowHelp) {
        customActions.onShowHelp();
      } else {
        toast({
          title: '⌨️ Keyboard Shortcuts',
          description: 'Ctrl+Enter: Scrub • Ctrl+Shift+C: Copy • Ctrl+Shift+R: Restore',
        });
      }
      return;
    }
  }, [rawInput, sanitizedOutput, secrets, scrubText, restoreText, clearAll, toast, customActions]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Keyboard shortcuts reference for UI display
 */
export const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl', 'Enter'], action: 'Scrub PII', description: 'Scrub the current input text' },
  { keys: ['Ctrl', 'Shift', 'C'], action: 'Copy Output', description: 'Copy sanitized text to clipboard' },
  { keys: ['Ctrl', 'Shift', 'R'], action: 'Restore', description: 'Restore original text from tokens' },
  { keys: ['Ctrl', 'Shift', 'X'], action: 'Clear All', description: 'Clear all text and secrets' },
  { keys: ['Ctrl', '/'], action: 'Show Help', description: 'Show keyboard shortcuts' },
];

'use client';

/**
 * InputPanel Component
 *
 * Provides a textarea for users to input raw text containing sensitive PII
 * Also supports restore mode when user pastes text containing tokens
 * Mobile-optimized with Material 3 surface colors and monospace fonts
 */

import { Textarea } from '@/components/ui/textarea';
import { Lock, FileText, Unlock } from 'lucide-react';
import { useScrubberStore } from '@/store/useSecretStore';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

const MAX_CHARACTERS = 100000;

export function InputPanel() {
  const { rawInput, setRawInput, secrets } = useScrubberStore();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const handler = () => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.select();
    };

    window.addEventListener('safetylayer:select-raw-input', handler as EventListener);
    return () => window.removeEventListener('safetylayer:select-raw-input', handler as EventListener);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    if (newValue.length > MAX_CHARACTERS) {
      toast({
        variant: "destructive",
        title: "Input too large",
        description: "Please limit to 100k characters to prevent browser freezing.",
      });
      return;
    }
    
    setRawInput(newValue);
  };

  const characterCount = rawInput?.length || 0;
  const isNearLimit = characterCount > MAX_CHARACTERS * 0.9;

  // Check if there are persisted secrets available for restore
  const hasPersistedSecrets = secrets && secrets.length > 0;
  const inputHasTokens = rawInput && /\[(EMAIL|CC|PHONE|ID)_\d+\]/.test(rawInput);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 surface-container-high border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-orange-500" />
          <span className="label-technical">Raw Input</span>
        </div>
        <span className={`text-[10px] font-mono ${isNearLimit ? 'text-orange-500' : 'text-slate-400'}`}>
          {characterCount.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
        </span>
      </div>

      {/* Textarea */}
      <div className="flex-1 p-3 md:p-4">
        <Textarea
          ref={textareaRef}
          placeholder={hasPersistedSecrets
            ? "Paste text containing tokens (e.g., [EMAIL_1]) here to reveal original data...\n\nOr paste new sensitive data to scrub."
            : "Paste your sensitive data here...\n\nExample:\nContact John at john.doe@example.com\nPhone: (123) 456-7890\nSSN: 123-45-6789\nCard: 4111-1111-1111-1111"
          }
          value={rawInput}
          onChange={handleInputChange}
          className="h-full min-h-[200px] md:min-h-[300px] font-mono text-sm resize-none 
                     bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Status Messages */}
      <div className="px-3 pb-3 md:px-4 md:pb-4 space-y-2">
        {hasPersistedSecrets && inputHasTokens && (
          <div className="flex items-start gap-2 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
            <Unlock className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-green-700 dark:text-green-400">
              Restore mode: Tokens will be replaced with original values
            </span>
          </div>
        )}
        {hasPersistedSecrets && !inputHasTokens && rawInput && (
          <div className="flex items-start gap-2 text-xs bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
            <Unlock className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
            <span className="text-blue-700 dark:text-blue-400">
              Click "Restore" to reveal original values in Safe Output
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
          <FileText className="h-3 w-3" />
          <span>Your data stays in your browser</span>
        </div>
      </div>
    </div>
  );
}

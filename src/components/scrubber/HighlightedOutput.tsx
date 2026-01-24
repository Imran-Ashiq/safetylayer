'use client';

/**
 * HighlightedOutput Component
 * 
 * Renders text with syntax highlighting for PII tokens
 * Tokens are color-coded and clickable for easy copying
 */

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HighlightedOutputProps {
  text: string;
  isRestored?: boolean;
}

export function HighlightedOutput({ text, isRestored = false }: HighlightedOutputProps) {
  const { toast } = useToast();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Token color mapping - Enterprise styling with CSS variables
  const tokenColors: Record<string, string> = {
    EMAIL: 'token-email',
    CC: 'token-cc',
    PHONE: 'token-phone',
    ID: 'token-id',
    NAME: 'token-name',
    ADDRESS: 'token-address',
  };

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
      toast({
        title: 'Token copied',
        description: `${token} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy token',
        variant: 'destructive',
      });
    }
  };

  // Parse and highlight tokens in the text
  const renderHighlightedText = () => {
    if (isRestored || !text) {
      return <span className="whitespace-pre-wrap">{text}</span>;
    }

    // Regex to match tokens like [EMAIL_1], [CC_1], [NAME_1], [ADDRESS_1], etc.
    const tokenRegex = /\[(EMAIL|CC|PHONE|ID|NAME|ADDRESS)_\d+\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      const token = match[0];
      const tokenType = match[1];
      const tokenClass = tokenColors[tokenType] || 'token-id';

      // Add text before the token
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add the highlighted token with enterprise styling
      parts.push(
        <span
          key={`token-${match.index}`}
          className={`${tokenClass} inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono font-medium text-xs cursor-pointer hover:scale-[1.02] hover:shadow-sm active:scale-100 transition-all duration-150 group select-none`}
          onClick={() => handleCopyToken(token)}
          title={`Click to copy ${token}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCopyToken(token)}
        >
          <span className="tracking-tight">{token}</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {copiedToken === token ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </span>
        </span>
      );

      lastIndex = match.index + token.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{text}</span>;
  };

  return (
    <div className="font-data text-sm leading-relaxed tracking-wide">
      {renderHighlightedText()}
    </div>
  );
}

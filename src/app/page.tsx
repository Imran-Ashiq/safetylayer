'use client';

/**
 * SafetyLayer - Utility-First Landing Page
 * 
 * The PII Scrubber is the hero - users see the tool immediately.
 * Marketing content moved below the fold.
 * Enterprise Android-style design with Material 3 aesthetics.
 */

import Link from 'next/link';
import { InputPanel } from '@/components/scrubber/InputPanel';
import { OutputPanel } from '@/components/scrubber/OutputPanel';
import { ControlBar } from '@/components/scrubber/ControlBar';
import { ExampleTemplates } from '@/components/scrubber/ExampleTemplates';
import { StatsDashboard } from '@/components/scrubber/StatsDashboard';
import { TrustStrip } from '@/components/TrustStrip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Github, 
  Sun, 
  Moon, 
  Keyboard,
  Shield, 
  Lock, 
  Zap, 
  AlertTriangle,
  Sparkles,
  Server,
  Eye,
  Code2,
  ShieldAlert,
  Wand2,
  RefreshCw,
  ChevronDown,
  Mail,
  CreditCard,
  Phone,
  Hash
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useScrubberStore } from '@/store/useSecretStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { secrets } = useScrubberStore();

  // Power user keyboard shortcuts
  useKeyboardShortcuts();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Count detected PII by type
  const piiCounts = secrets.reduce((acc, secret) => {
    const type = secret.type.toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div suppressHydrationWarning className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Trust Strip - Always visible */}
      <TrustStrip />

      {/* Header - Compact for utility-first */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">SafetyLayer</span>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Settings/Keyboard shortcuts link */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                title="Settings & Keyboard shortcuts"
                asChild
              >
                <Link href="/settings">
                  <Keyboard className="h-4 w-4" />
                </Link>
              </Button>

              {/* Theme Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              )}

              {/* GitHub Link */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                asChild
              >
                <a
                  href="https://github.com/Imran-Ashiq/safetylayer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="relative" role="main">
        {/* Hero Section - THE SCRUBBER */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8" aria-label="PII Scrubber Tool">
          <div className="max-w-7xl mx-auto">
            {/* Compact Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
                Sanitize PII Before Sending to AI
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Paste sensitive data → Scrub → Copy sanitized text → Use with ChatGPT, Claude, or any LLM
              </p>
              {/* Keyboard shortcut hint */}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">Ctrl</kbd>
                <span className="mx-0.5">+</span>
                <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">Enter</kbd>
                <span className="ml-1">to scrub</span>
              </p>
            </div>

            {/* Detection Badges */}
            {Object.keys(piiCounts).length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Detected:</span>
                {piiCounts.email && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Mail className="h-3 w-3" />
                    {piiCounts.email} Email{piiCounts.email > 1 ? 's' : ''}
                  </span>
                )}
                {piiCounts.credit_card && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <CreditCard className="h-3 w-3" />
                    {piiCounts.credit_card} Card{piiCounts.credit_card > 1 ? 's' : ''}
                  </span>
                )}
                {piiCounts.phone && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Phone className="h-3 w-3" />
                    {piiCounts.phone} Phone{piiCounts.phone > 1 ? 's' : ''}
                  </span>
                )}
                {piiCounts.ssn && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                    <Hash className="h-3 w-3" />
                    {piiCounts.ssn} SSN{piiCounts.ssn > 1 ? 's' : ''}
                  </span>
                )}
                {piiCounts.ip && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                    <Server className="h-3 w-3" />
                    {piiCounts.ip} IP{piiCounts.ip > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}

            {/* Scrubber Tool - THE HERO */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
              {/* Tool Header */}
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-2">
                      PII Scrubber
                    </span>
                  </div>
                  <ExampleTemplates />
                </div>
              </div>

              {/* Tool Content */}
              <div className="p-4 md:p-6">
                {/* Statistics */}
                <div className="mb-4">
                  <StatsDashboard />
                </div>

                {/* Control Bar */}
                <div className="mb-4">
                  <ControlBar />
                </div>

                {/* Input/Output Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <InputPanel />
                  <OutputPanel />
                </div>

                {/* Security Notice */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Eye className="h-3 w-3" />
                  <span>All processing happens locally. Your data never leaves this browser.</span>
                </div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="mt-8 text-center">
              <button
                onClick={scrollToFeatures}
                className="inline-flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <span className="text-xs">Learn more</span>
                <ChevronDown className="h-4 w-4 animate-bounce" />
              </button>
            </div>
          </div>
        </section>

        {/* Features Section - Below the Fold */}
        <section id="features" className="bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-6xl mx-auto">
              {/* Trust Icons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <Lock className="h-8 w-8 text-blue-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">100% Client-Side</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">No server uploads</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <Code2 className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Open Source</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">AGPL-3.0 Licensed</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <Server className="h-8 w-8 text-purple-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Zero Database</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Nothing stored</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <Zap className="h-8 w-8 text-cyan-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Offline Capable</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Works without internet</span>
                </div>
              </div>

              {/* Why SafetyLayer */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">Why SafetyLayer?</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Stop the data leak before it happens
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-16">
                {/* Card 1 */}
                <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6 hover:border-red-500/50 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Don't Get Fired</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Uploading client data to public LLMs is a GDPR nightmare. We stop the leak at the source.
                  </p>
                </Card>

                {/* Card 2 */}
                <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6 hover:border-cyan-500/50 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Reversible Context</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Paste sanitized text into AI → Get answer → Restore original details instantly.
                  </p>
                </Card>

                {/* Card 3 */}
                <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6 hover:border-blue-500/50 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Bank-Grade Validation</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    We use Luhn Algorithms, not just Regex, to ensure we catch every valid credit card.
                  </p>
                </Card>
              </div>

              {/* How It Works */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                  The Privacy Workflow
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Three simple steps to work with AI without leaking sensitive data
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <Card className="relative bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6 text-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                    1
                  </div>
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <ShieldAlert className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Input</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Paste sensitive data (Emails, CCs, SSNs) into the input panel.
                  </p>
                </Card>

                {/* Step 2 */}
                <Card className="relative bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6 text-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                    2
                  </div>
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Wand2 className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Scrub</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    We replace PII with reversible tokens locally in your browser.
                  </p>
                </Card>

                {/* Step 3 */}
                <Card className="relative bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6 text-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                    3
                  </div>
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <RefreshCw className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Restore</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Paste the AI response back to reveal original data instantly.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Minimal with mobile padding for bottom nav */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-slate-900 dark:text-white">SafetyLayer</span>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Open Source PII Firewall
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/blog"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Blog
              </Link>
              <a
                href="https://github.com/Imran-Ashiq/safetylayer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                GitHub
              </a>
              <span className="text-slate-400 dark:text-slate-500">
                © {new Date().getFullYear()} AGPL-3.0
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

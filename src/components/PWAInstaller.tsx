'use client';

/**
 * PWA Installer Component
 * 
 * Registers the service worker and handles PWA installation
 * Shows both automatic banner and persistent install button
 * Provides iOS-specific instructions since iOS doesn't support beforeinstallprompt
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Share } from 'lucide-react';

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
    
    // Check if running in standalone mode (already installed)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsInStandaloneMode(standalone);
    
    // Check if already installed
    if (standalone) {
      console.log('✅ SafetyLayer: Already installed as PWA');
      setIsInstalled(true);
      return;
    }

    // For iOS devices, show install banner after delay
    if (isIOSDevice && !standalone) {
      console.log('📱 SafetyLayer: iOS device detected - will show install instructions');
      setTimeout(() => {
        if (!sessionStorage.getItem('pwa-banner-dismissed')) {
          setShowBanner(true);
          setShowFloatingButton(true);
        }
      }, 5000);
    }

    // Register service worker with detailed logging and update handling
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/worker.js')
          .then((registration) => {
            console.log('✅ SafetyLayer: Service Worker registered successfully (worker.js)');
            console.log('   Scope:', registration.scope);
            console.log('   Active:', registration.active);
            
            // Check for updates every 60 seconds
            setInterval(() => {
              registration.update();
            }, 60 * 1000);
            
            // Handle waiting service worker (new version available)
            if (registration.waiting) {
              console.log('🔄 SafetyLayer: New version waiting, activating...');
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            
            // Listen for new service worker installing
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              console.log('🔄 SafetyLayer: New version found, installing...');
              
              newWorker?.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 SafetyLayer: New version installed, will activate on refresh');
                  // Automatically activate new SW
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            });
          })
          .catch((error) => {
            console.error('❌ SafetyLayer: Service Worker registration failed:', error);
          });
      });
      
      // Listen for SW update messages to refresh page
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && (event.data.type === 'SW_UPDATED' || event.data.type === 'SW_ACTIVATED')) {
          console.log('🔄 SafetyLayer: SW activated with cache: ' + (event.data.cache || event.data.version));
          // Reload to get fresh content
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      });
      
      // Refresh page when new SW takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 SafetyLayer: New service worker took control, reloading...');
        window.location.reload();
      });
    } else {
      console.warn('⚠️ SafetyLayer: Service Workers not supported');
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 SafetyLayer: beforeinstallprompt event fired!');
      
      // Prevent the default mini-infobar
      e.preventDefault();
      
      // Save the event for later
      setDeferredPrompt(e);
      
      // Show floating button immediately
      setShowFloatingButton(true);
      
      // Show banner after a delay (if not dismissed)
      setTimeout(() => {
        if (!sessionStorage.getItem('pwa-banner-dismissed')) {
          setShowBanner(true);
        }
      }, 5000); // Increased to 5 seconds for better UX
    };

    // Check for app installed event
    const handleAppInstalled = () => {
      console.log('✅ SafetyLayer: App installed successfully!');
      setIsInstalled(true);
      setShowBanner(false);
      setShowFloatingButton(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Debug: Log if event doesn't fire after 10 seconds
    setTimeout(() => {
      if (!deferredPrompt) {
        console.log('ℹ️ SafetyLayer: Install prompt not available. Possible reasons:');
        console.log('   1. App is already installed');
        console.log('   2. Not meeting PWA criteria (check manifest.json and HTTPS)');
        console.log('   3. User previously dismissed install prompt');
        console.log('   4. Browser doesn\'t support installation');
      }
    }, 10000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    // iOS devices need manual installation
    if (isIOS) {
      console.log('📱 SafetyLayer: iOS device - showing manual install instructions');
      alert(
        '📱 Install SafetyLayer on iPhone/iPad:\n\n' +
        '1. Tap the Share button (□↑) at the bottom of Safari\n' +
        '2. Scroll down and tap "Add to Home Screen"\n' +
        '3. Tap "Add" in the top right corner\n\n' +
        '✨ The app will appear on your home screen!'
      );
      return;
    }

    if (!deferredPrompt) {
      console.warn('⚠️ SafetyLayer: No install prompt available');
      // Show fallback instructions
      alert('To install SafetyLayer:\n\n1. Tap the menu (⋮) in your browser\n2. Select "Add to Home screen" or "Install app"\n3. Tap "Add" or "Install"');
      return;
    }

    console.log('📲 SafetyLayer: Showing install prompt...');

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ User accepted the install prompt');
    } else {
      console.log('❌ User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Don't show anything if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Floating Install Button - Shows for both iOS and Android */}
      {showFloatingButton && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-20 right-4 md:bottom-4 md:right-4 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 animate-bounce"
          title="Install SafetyLayer App"
        >
          {isIOS ? <Share className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
        </button>
      )}

      {/* Install Banner - Different content for iOS vs Android/Desktop */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-500">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl p-4 border border-white/20">
            <button
              onClick={handleDismissBanner}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                {isIOS ? <Share className="h-6 w-6 text-blue-600" /> : <Download className="h-6 w-6 text-blue-600" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  {isIOS ? 'Add to Home Screen' : 'Install SafetyLayer'}
                </h3>
                <p className="text-sm text-white/90">
                  {isIOS 
                    ? 'Tap Share (□↑) → "Add to Home Screen" for easy access'
                    : 'Add to your home screen for instant access. Works offline for maximum privacy!'
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                className="flex-1 bg-white text-blue-600 hover:bg-white/90 font-semibold"
              >
                {isIOS ? 'Show Instructions' : 'Install Now'}
              </Button>
              <Button
                onClick={handleDismissBanner}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                Later
              </Button>
            </div>

            <p className="text-xs text-white/70 mt-2 text-center">
              ✨ No download • 100% Privacy • Works offline
            </p>
          </div>
        </div>
      )}
    </>
  );
}

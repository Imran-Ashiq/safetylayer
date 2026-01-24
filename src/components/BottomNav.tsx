'use client';

/**
 * Bottom Navigation Component
 * 
 * Android Enterprise-style bottom navigation for mobile devices.
 * Hidden on desktop, visible on mobile.
 * Provides quick access to main sections.
 */

import { Shield, FileText, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export function BottomNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: '/',
      label: 'Scrubber',
      icon: <Shield className="h-5 w-5" />,
      isActive: pathname === '/',
    },
    {
      href: '/blog',
      label: 'Docs',
      icon: <FileText className="h-5 w-5" />,
      isActive: pathname.startsWith('/blog'),
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      isActive: pathname === '/settings',
    },
  ];

  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Blur backdrop */}
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800" />
        
        {/* Navigation Items */}
        <div className="relative flex items-center justify-around h-16 px-4 max-w-md mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                item.isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-all duration-200',
                item.isActive && 'bg-blue-100 dark:bg-blue-900/30'
              )}>
                {item.icon}
              </div>
              <span className={cn(
                'text-[10px] font-medium uppercase tracking-wide',
                item.isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Safe area padding for notched devices */}
        <div className="h-safe-area-inset-bottom bg-white/80 dark:bg-slate-900/80" />
      </nav>

      {/* Spacer to prevent content from being hidden behind bottom nav on mobile */}
      <div className="h-20 md:hidden" />
    </>
  );
}

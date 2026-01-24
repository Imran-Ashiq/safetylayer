'use client';

/**
 * Scrubber Panel Skeleton Loaders
 * 
 * Provides loading states for the scrubber panels during initial render.
 * Uses pulse animations for a polished loading experience.
 */

import { Skeleton } from '@/components/ui/skeleton';

export function InputPanelSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 py-3 surface-container-high border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Textarea Skeleton */}
      <div className="flex-1 p-3 md:p-4">
        <Skeleton className="h-full min-h-[200px] md:min-h-[300px] w-full rounded-lg" />
      </div>

      {/* Footer Skeleton */}
      <div className="px-3 pb-3 md:px-4 md:pb-4">
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

export function OutputPanelSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 py-3 surface-container-high border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 p-3 md:p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Stats Skeleton */}
      <div className="px-3 pb-3 md:px-4 md:pb-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function ControlBarSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in duration-300">
      <div className="flex gap-2 w-full sm:w-auto">
        <Skeleton className="flex-1 sm:flex-none h-11 sm:h-10 sm:w-[140px] rounded-lg" />
        <Skeleton className="flex-1 sm:flex-none h-11 sm:h-10 sm:w-[100px] rounded-lg" />
      </div>
      <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
        <Skeleton className="flex-1 sm:flex-none h-11 sm:h-10 sm:w-20 rounded-lg" />
        <Skeleton className="flex-1 sm:flex-none h-11 sm:h-10 sm:w-20 rounded-lg" />
        <Skeleton className="h-11 w-11 sm:h-10 sm:w-10 rounded-lg" />
      </div>
    </div>
  );
}

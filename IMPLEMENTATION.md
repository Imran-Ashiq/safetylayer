# SafetyLayer UI Implementation Plan

## Vision
Transform SafetyLayer from a standard landing page into an **Enterprise Android-style Power Tool** with utility-first UX.

---

## Phase 1: Utility-First Layout ✅
> Move the PII Scrubber above the fold - tool first, marketing second

### Tasks:
- [x] 1.1 Restructure `page.tsx` - Scrubber becomes the hero
- [x] 1.2 Add persistent "Trust Strip" header (🟢 Device-Only Mode)
- [x] 1.3 Move marketing content (Why/How) below the tool
- [x] 1.4 Implement detection badges (📧 2 Emails, 💳 1 Card, etc.)
- [x] 1.5 Create Snackbar component (ready for use)

### Files Modified:
- `src/app/page.tsx` - Complete rewrite with utility-first layout
- Created: `src/components/ui/snackbar.tsx`
- Created: `src/components/TrustStrip.tsx`

---

## Phase 2: Bottom Navigation (Mobile) ✅
> Android Enterprise-style bottom navigation with FAB

### Tasks:
- [x] 2.1 Create `BottomNav.tsx` component
- [x] 2.2 Implement FAB (Floating Action Button) for "Scrub" action
- [x] 2.3 Add navigation items: [ Scrubber | Docs | Settings ]
- [x] 2.4 Hide bottom nav on desktop, show on mobile
- [x] 2.5 FAB transforms: Scrub → Copy → Copied → Restore

### Files Created:
- `src/components/BottomNav.tsx` - Mobile bottom navigation
- `src/components/FAB.tsx` - Floating action button with state
- Modified: `src/app/layout.tsx` - Added BottomNav and FAB
- Modified: `src/app/page.tsx` - Added mobile footer padding

---

## Phase 3: Mobile-First Scrubber ✅
> Optimize the scrubber experience for touch devices

### Tasks:
- [x] 3.1 Vertical stack layout for Input/Output on mobile
- [x] 3.2 Touch-target optimization (min 44px tap areas)
- [x] 3.3 Thumb-friendly button placement (stacked on mobile)
- [x] 3.4 Monospace font for data display (enterprise feel)
- [x] 3.5 Surface-Container colors (Material 3 gray shades)

### Files Modified:
- `src/components/scrubber/InputPanel.tsx` - Removed Card wrapper, added surface-container header
- `src/components/scrubber/OutputPanel.tsx` - Removed Card wrapper, added conditional colored headers
- `src/components/scrubber/ControlBar.tsx` - Responsive stacked layout, touch-target buttons
- `src/app/globals.css` - Material 3 surface colors, .touch-target utility, .font-data class

---

## Phase 4: Enterprise Visual Language ✅
> Material Design 3 styling for professional trust

### Tasks:
- [x] 4.1 Typography update - Inter font added for enterprise feel
- [x] 4.2 Color palette refinement (Surface-Container hierarchy)
- [x] 4.3 Enterprise token colors (EMAIL, CC, PHONE, ID, NAME, ADDRESS)
- [x] 4.4 Highlighted tokens with soft pastel backgrounds
- [x] 4.5 Clean iconography (Lucide icons consistency)

### Files Modified:
- `src/app/layout.tsx` - Added Inter font, updated body classes
- `src/app/globals.css` - Token CSS variables, .label-enterprise class, token styling
- `src/components/scrubber/HighlightedOutput.tsx` - Enterprise token styling, accessibility improvements

---

## Phase 5: Power User Features ✅
> Features that differentiate from hobby tools

### Tasks:
- [x] 5.1 Keyboard shortcuts hook (Ctrl+Enter, Ctrl+Shift+C, Ctrl+Shift+R, Ctrl+Shift+X)
- [x] 5.2 "Scrub Intensity" toggle (Standard / Aggressive modes)
- [x] 5.3 Settings page with full customization
- [x] 5.4 Pattern toggles (Email, CC, Phone, SSN)
- [x] 5.5 Keyboard shortcuts reference in settings

### Files Created:
- `src/hooks/useKeyboardShortcuts.ts` - Power user keyboard shortcuts
- `src/components/ScrubIntensityToggle.tsx` - Intensity badge component
- `src/app/settings/page.tsx` - Full settings page with all options

### Files Modified:
- `src/store/useSecretStore.ts` - Added intensity state
- `src/components/scrubber/ControlBar.tsx` - Added intensity badge, settings link
- `src/app/page.tsx` - Integrated keyboard shortcuts hook

---

## Phase 6: Performance & Polish ✅
> Final optimizations for production

### Tasks:
- [x] 6.1 Skeleton loaders for panels (InputPanelSkeleton, OutputPanelSkeleton, ControlBarSkeleton)
- [x] 6.2 Haptic feedback on mobile (vibration API with patterns: light, medium, heavy, success, error, warning)
- [x] 6.3 Micro-animations (fade-in-up, pop-in, slide-in-right, bounce-subtle, btn-press)
- [x] 6.4 Accessibility (skip-link, focus-ring, sr-only, ARIA labels, prefers-reduced-motion, prefers-contrast)
- [x] 6.5 High contrast mode support

### Files Created:
- `src/lib/haptics.ts` - Haptic feedback utility with patterns
- `src/components/scrubber/Skeletons.tsx` - Panel skeleton loaders

### Files Modified:
- `src/app/globals.css` - Micro-animations, focus-ring, skip-link, reduced motion, high contrast
- `src/components/scrubber/ControlBar.tsx` - Haptic feedback on actions
- `src/app/layout.tsx` - Skip to content link
- `src/app/page.tsx` - Main content landmark, ARIA labels

---

## 🎉 IMPLEMENTATION COMPLETE 🎉

All 6 phases have been successfully implemented:
- ✅ Phase 1: Utility-First Layout
- ✅ Phase 2: Bottom Navigation
- ✅ Phase 3: Mobile-First Scrubber
- ✅ Phase 4: Enterprise Visual Language
- ✅ Phase 5: Power User Features
- ✅ Phase 6: Performance & Polish

---

## Design Tokens

### Colors (Material 3 Inspired)
```css
--surface: #ffffff;
--surface-container: #f3f4f6;
--surface-container-high: #e5e7eb;
--primary: #3b82f6;
--primary-container: #dbeafe;
--on-primary: #ffffff;
--trust-green: #22c55e;
--token-highlight: #ede9fe;
```

### Typography
```css
--font-system: 'Inter', 'Roboto', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--label-size: 0.625rem; /* 10px - small uppercase labels */
```

### Spacing (8pt Grid)
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

---

## Mobile Layout Reference

```
┌─────────────────────────────────┐
│ 🟢 Device-Only • No data sent   │  ← Trust Strip (sticky)
├─────────────────────────────────┤
│ RAW INPUT                       │  ← Label (10px, uppercase)
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │  Your text with emails      │ │  ← Monospace textarea
│ │  and credit cards...        │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ [📧 2] [💳 1] [📱 3]           │  ← Detection badges
│                                 │
├─────────────────────────────────┤
│ SAFE OUTPUT                     │  ← Label
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │  Your text with [EMAIL-1]   │ │  ← Highlighted tokens
│ │  and [CARD-1]...            │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│   [Scrubber]  [Docs]  [⚙️]     │  ← Bottom Nav
└─────────────────────────────────┘
                        [SCRUB]    ← FAB (bottom-right)
```

---

## Progress Tracker

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Utility-First Layout | ✅ Complete | 100% |
| Phase 2: Bottom Navigation | ✅ Complete | 100% |
| Phase 3: Mobile-First Scrubber | ⬜ Not Started | 0% |
| Phase 4: Enterprise Visual Language | ⬜ Not Started | 0% |
| Phase 5: Power User Features | ⬜ Not Started | 0% |
| Phase 6: Performance & Polish | ⬜ Not Started | 0% |

---

## Notes

- **Test on real devices** after each phase
- **Commit after each task** for easy rollback
- **Mobile-first approach** - design for mobile, enhance for desktop
- **No breaking changes** - keep current functionality working

---

*Last Updated: January 25, 2026*

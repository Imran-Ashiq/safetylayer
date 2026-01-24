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

## Phase 2: Bottom Navigation (Mobile) ⬜
> Android Enterprise-style bottom navigation with FAB

### Tasks:
- [ ] 2.1 Create `BottomNav.tsx` component
- [ ] 2.2 Implement FAB (Floating Action Button) for "Scrub" action
- [ ] 2.3 Add navigation items: [ Scrubber | Docs | Settings ]
- [ ] 2.4 Hide bottom nav on desktop, show on mobile
- [ ] 2.5 FAB transforms to "Copy" after scrubbing

### Files to Modify:
- `src/app/layout.tsx`
- Create: `src/components/BottomNav.tsx`
- Create: `src/components/FAB.tsx`

---

## Phase 3: Mobile-First Scrubber ⬜
> Optimize the scrubber experience for touch devices

### Tasks:
- [ ] 3.1 Vertical stack layout for Input/Output on mobile
- [ ] 3.2 Swipeable tabs (INPUT ↔ OUTPUT) - optional enhancement
- [ ] 3.3 Thumb-friendly button placement
- [ ] 3.4 Monospace font for data display (enterprise feel)
- [ ] 3.5 Surface-Container colors (Material 3 gray shades)

### Files to Modify:
- `src/components/scrubber/InputPanel.tsx`
- `src/components/scrubber/OutputPanel.tsx`
- `src/app/globals.css`

---

## Phase 4: Enterprise Visual Language ⬜
> Material Design 3 styling for professional trust

### Tasks:
- [ ] 4.1 Typography update - Inter/Roboto, small uppercase labels
- [ ] 4.2 Color palette refinement (Surface-Container hierarchy)
- [ ] 4.3 Labels: "RAW INPUT", "SAFE OUTPUT" (technical feel)
- [ ] 4.4 Highlighted tokens with soft blue/purple background
- [ ] 4.5 Clean iconography (Lucide icons consistency)

### Files to Modify:
- `tailwind.config.ts`
- `src/app/globals.css`
- `src/components/scrubber/HighlightedOutput.tsx`

---

## Phase 5: Power User Features ⬜
> Features that differentiate from hobby tools

### Tasks:
- [ ] 5.1 Keyboard shortcuts (Ctrl+Enter, Ctrl+Shift+C, Ctrl+Z)
- [ ] 5.2 "Scrub Intensity" toggle (Standard / Aggressive)
- [ ] 5.3 Settings page with customization options
- [ ] 5.4 Custom pattern builder (advanced users)
- [ ] 5.5 Export/Import settings

### Files to Create:
- `src/app/settings/page.tsx`
- `src/components/ScrubIntensityToggle.tsx`
- `src/hooks/useKeyboardShortcuts.ts`

---

## Phase 6: Performance & Polish ⬜
> Final optimizations for production

### Tasks:
- [ ] 6.1 Skeleton loaders (no splash screen)
- [ ] 6.2 Haptic feedback on mobile (vibration API)
- [ ] 6.3 Micro-animations (FAB transform, badge appear)
- [ ] 6.4 Accessibility audit (ARIA labels, focus states)
- [ ] 6.5 Performance audit (Lighthouse 90+ score)

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
| Phase 2: Bottom Navigation | ⬜ Not Started | 0% |
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

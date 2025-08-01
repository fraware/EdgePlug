# EdgePlug Design System

## D01 — Design System Foundations

### Overview

The EdgePlug design system provides a consistent, accessible, and performant foundation for the industrial automation UI. Built for grid operators, system integrators, and OEMs who need reliability and clarity in high-stakes environments.

## Design Tokens

### Color Palette

#### Primary Colors
```css
/* Industrial Blue - Primary Brand */
--ep-primary-50: #eff6ff;
--ep-primary-100: #dbeafe;
--ep-primary-200: #bfdbfe;
--ep-primary-300: #93c5fd;
--ep-primary-400: #60a5fa;
--ep-primary-500: #3b82f6;
--ep-primary-600: #2563eb;
--ep-primary-700: #1d4ed8;
--ep-primary-800: #1e40af; /* Primary */
--ep-primary-900: #1e3a8a;
--ep-primary-950: #172554;
```

#### Secondary Colors
```css
/* Safety Orange - Secondary Brand */
--ep-secondary-50: #fff7ed;
--ep-secondary-100: #ffedd5;
--ep-secondary-200: #fed7aa;
--ep-secondary-300: #fdba74;
--ep-secondary-400: #fb923c;
--ep-secondary-500: #f97316; /* Secondary */
--ep-secondary-600: #ea580c;
--ep-secondary-700: #c2410c;
--ep-secondary-800: #9a3412;
--ep-secondary-900: #7c2d12;
--ep-secondary-950: #431407;
```

#### Semantic Colors
```css
/* Success - Green */
--ep-success-50: #ecfdf5;
--ep-success-100: #d1fae5;
--ep-success-500: #10b981; /* Success */
--ep-success-600: #059669;
--ep-success-700: #047857;

/* Warning - Yellow */
--ep-warning-50: #fffbeb;
--ep-warning-100: #fef3c7;
--ep-warning-500: #f59e0b; /* Warning */
--ep-warning-600: #d97706;
--ep-warning-700: #b45309;

/* Error - Red */
--ep-error-50: #fef2f2;
--ep-error-100: #fee2e2;
--ep-error-500: #ef4444; /* Error */
--ep-error-600: #dc2626;
--ep-error-700: #b91c1c;

/* Neutral - Gray */
--ep-neutral-50: #f9fafb;
--ep-neutral-100: #f3f4f6;
--ep-neutral-200: #e5e7eb;
--ep-neutral-300: #d1d5db;
--ep-neutral-400: #9ca3af;
--ep-neutral-500: #6b7280; /* Neutral */
--ep-neutral-600: #4b5563;
--ep-neutral-700: #374151;
--ep-neutral-800: #1f2937;
--ep-neutral-900: #111827;
--ep-neutral-950: #030712;
```

### Typography

#### Font Stack
```css
/* Headings */
--ep-font-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Body */
--ep-font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Code */
--ep-font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
```

#### Font Sizes
```css
--ep-text-xs: 0.75rem;    /* 12px */
--ep-text-sm: 0.875rem;   /* 14px */
--ep-text-base: 1rem;     /* 16px */
--ep-text-lg: 1.125rem;   /* 18px */
--ep-text-xl: 1.25rem;    /* 20px */
--ep-text-2xl: 1.5rem;    /* 24px */
--ep-text-3xl: 1.875rem;  /* 30px */
--ep-text-4xl: 2.25rem;   /* 36px */
--ep-text-5xl: 3rem;      /* 48px */
--ep-text-6xl: 3.75rem;   /* 60px */
```

#### Font Weights
```css
--ep-font-light: 300;
--ep-font-normal: 400;
--ep-font-medium: 500;
--ep-font-semibold: 600;
--ep-font-bold: 700;
--ep-font-extrabold: 800;
```

### Spacing (8pt Grid)

```css
--ep-space-0: 0;
--ep-space-1: 0.25rem;   /* 4px */
--ep-space-2: 0.5rem;    /* 8px */
--ep-space-3: 0.75rem;   /* 12px */
--ep-space-4: 1rem;      /* 16px */
--ep-space-5: 1.25rem;   /* 20px */
--ep-space-6: 1.5rem;    /* 24px */
--ep-space-8: 2rem;      /* 32px */
--ep-space-10: 2.5rem;   /* 40px */
--ep-space-12: 3rem;     /* 48px */
--ep-space-16: 4rem;     /* 64px */
--ep-space-20: 5rem;     /* 80px */
--ep-space-24: 6rem;     /* 96px */
--ep-space-32: 8rem;     /* 128px */
```

### Elevation

```css
--ep-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--ep-shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--ep-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--ep-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--ep-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--ep-shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### Border Radius

```css
--ep-radius-none: 0;
--ep-radius-sm: 0.125rem;  /* 2px */
--ep-radius-base: 0.25rem;  /* 4px */
--ep-radius-md: 0.375rem;   /* 6px */
--ep-radius-lg: 0.5rem;     /* 8px */
--ep-radius-xl: 0.75rem;    /* 12px */
--ep-radius-2xl: 1rem;      /* 16px */
--ep-radius-full: 9999px;
```

### Motion

```css
/* Duration */
--ep-duration-75: 75ms;
--ep-duration-100: 100ms;
--ep-duration-150: 150ms;
--ep-duration-200: 200ms;
--ep-duration-300: 300ms;
--ep-duration-500: 500ms;
--ep-duration-700: 700ms;
--ep-duration-1000: 1000ms;

/* Easing */
--ep-ease-linear: linear;
--ep-ease-in: cubic-bezier(0.4, 0, 1, 1);
--ep-ease-out: cubic-bezier(0, 0, 0.2, 1);
--ep-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

## Base Components

### Button

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### Badge

```typescript
interface BadgeProps {
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

### Tooltip

```typescript
interface TooltipProps {
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}
```

### Toast

```typescript
interface ToastProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}
```

### Modal

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}
```

### Drawer

```typescript
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position: 'left' | 'right' | 'top' | 'bottom';
  size: 'sm' | 'md' | 'lg' | 'xl';
}
```

## Accessibility

### WCAG 2.1 AA Compliance

#### Color Contrast Ratios
- **Normal text**: 4.5:1 minimum
- **Large text**: 3:1 minimum
- **UI components**: 3:1 minimum

#### Focus Indicators
- **Primary focus**: 2px solid `--ep-primary-600`
- **Secondary focus**: 2px solid `--ep-neutral-600`
- **Error focus**: 2px solid `--ep-error-600`

#### Keyboard Navigation
- **Tab order**: Logical document flow
- **Skip links**: Available for main content
- **Escape key**: Closes modals and drawers
- **Arrow keys**: Navigate within components

#### Screen Reader Support
- **ARIA labels**: All interactive elements
- **Live regions**: For dynamic content updates
- **Landmarks**: Proper HTML5 semantic structure
- **Descriptions**: Contextual help text

## Quality Gates - D01

### ✅ Completed
- [x] Color palette defined with contrast ratios
- [x] Typography system established
- [x] Spacing system (8pt grid) implemented
- [x] Elevation system defined
- [x] Motion specifications created
- [x] Base component interfaces defined
- [x] Accessibility requirements documented

### ⚠️ In Progress
- [ ] Contrast checker validation
- [ ] Component implementation
- [ ] Storybook setup

### ❌ Not Started
- [ ] Zeplin/Style-Dictionary export
- [ ] Component testing
- [ ] Accessibility testing

## Next Steps for D02

1. **Low-Fidelity Wireframes**
   - Create Figma wireframes for all screens
   - Define interaction flows
   - Validate user journeys

2. **Component Implementation**
   - Build React components with TypeScript
   - Implement accessibility features
   - Add unit tests

3. **Design Token Export**
   - Set up Style Dictionary
   - Generate CSS/SCSS tokens
   - Create design token documentation 
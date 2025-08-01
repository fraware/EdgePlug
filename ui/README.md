# EdgePlug UI Framework

This directory contains the EdgePlug UI framework implementation, including the design system, component library, and wireframes for the industrial automation platform.

## Architecture

### Design System
The EdgePlug design system is built on a foundation of:
- **Color Palette**: Industrial blue primary, safety orange secondary
- **Typography**: Inter for UI, JetBrains Mono for code
- **Spacing**: 8pt grid system for consistent layouts
- **Components**: Atomic design with reusable components

### Component Library
- **Base Components**: Button, Badge, Tooltip, Toast, Modal, Drawer
- **Wireframes**: Complete low-fidelity wireframes for all screens
- **High-Fidelity Prototypes**: Pixel-perfect, tokenized mock-ups with micro-animations
- **Design Tokens**: CSS custom properties for consistent theming

### Technology Stack
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with strict mode
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Framer Motion**: Advanced animations and interactions
- **Lottie**: Micro-animations and loading states
- **ESLint + Prettier**: Code quality and formatting

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
cd ui
npm install
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm run test

# Start high-fidelity demo
npm run demo:hifi
```

## 📱 High-Fidelity Prototype Demo

The high-fidelity prototype showcases pixel-perfect implementations with:

### Features
- **Interactive Canvas Workspace**: Drag & drop equipment, configure signals
- **Agent Marketplace**: Browse, search, and install ML agents
- **Micro-animations**: Smooth transitions and feedback
- **Design Token Compliance**: Zero hard-coded values
- **Performance Optimized**: 60fps animations, <2s load times

### Running the Demo
```bash
# Start the high-fidelity demo
npm run demo:hifi
```

### Available Screens
1. **Canvas Workspace**: Digital twin configuration with drag & drop
2. **Marketplace**: Agent browsing with search and filtering
3. **Interactive Elements**: Hover effects, button states, loading animations

### Key Interactions
- **Drag & Drop**: Equipment from toolbox to canvas
- **Node Selection**: Click nodes to view details and configure signals
- **Search & Filter**: Browse agents by category and certification
- **Install Flow**: View agent details and requirements

## Components

### Base Components
All components are built with TypeScript and follow consistent patterns:

```typescript
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

### High-Fidelity Components
The high-fidelity prototypes include advanced interactions:

```typescript
// Canvas Workspace with drag & drop
<CanvasHifi isActive={true} onNavigate={handleNavigate} />

// Marketplace with search and filtering
<MarketplaceHifi isActive={true} onNavigate={handleNavigate} />
```

## Performance

### Core Web Vitals Targets
- **LCP**: <2.0s (Largest Contentful Paint)
- **FID**: <100ms (First Input Delay)
- **CLS**: <0.05 (Cumulative Layout Shift)

### Bundle Size
- **Initial JS**: <250KB
- **CSS**: <50KB
- **Images**: Optimized and lazy-loaded

### Rendering Performance
- **High-Fidelity Load**: <2s per screen
- **Navigation**: <50ms transitions
- **Interactions**: <16ms response time
- **Animations**: 60fps target

## Accessibility

### WCAG 2.1 AA Compliance
- **Color Contrast**: All text meets AA standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and roles
- **Focus Management**: Proper focus indicators

### Features
- **High Contrast Mode**: Automatic detection and adaptation
- **Reduced Motion**: Respects user preferences
- **Dark Mode**: Automatic theme switching
- **RTL Support**: Right-to-left language support

## Development

### Project Structure
```
ui/
├── components/              # React components
│   ├── Button.tsx          # Base components
│   ├── Wireframes.tsx      # Wireframe implementations
│   ├── HighFidelityPrototype.tsx  # Hi-fi prototypes
│   └── index.ts            # Component exports
├── demo/                   # Demo applications
│   ├── WireframeDemo.tsx   # Wireframe demo
│   ├── HighFidelityDemo.tsx # Hi-fi demo
│   ├── index.html          # Demo entry point
│   └── main.tsx            # Demo main
├── design-system/          # Design system documentation
│   ├── animations.json     # Micro-animation specs
│   └── tokens.css          # Design tokens
├── styles/                 # Global styles
│   └── globals.css         # Tailwind and design tokens
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

### Scripts
```json
{
  "dev": "tsc --watch",
  "build": "tsc",
  "lint": "eslint src --ext .ts,.tsx",
  "test": "jest",
  "demo": "vite demo/index.html",
  "demo:hifi": "vite demo/HighFidelityDemo.tsx",
  "storybook": "storybook dev -p 6006"
}
```

### Code Quality
- **TypeScript**: Strict mode with no `any` types
- **ESLint**: Zero critical findings
- **Prettier**: Consistent code formatting
- **Component Testing**: Unit tests for all components
- **Design Token Audit**: Automated token compliance checking

## Testing

### Unit Tests
```bash
npm run test
```

### Accessibility Tests
```bash
npm run test:a11y
```

### Visual Regression Tests
```bash
npm run test:visual
```

### Design Token Audit
```bash
npm run token-audit
```

## Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and tests
4. Submit pull request
5. Code review and approval
6. Merge to main

### Code Standards
- Follow TypeScript strict mode
- Use consistent component patterns
- Maintain accessibility standards
- Write unit tests for new components
- Update documentation
- Ensure design token compliance

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

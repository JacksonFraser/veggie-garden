# Veggie Garden Design System

This document describes the design system architecture and components available in the Veggie Garden application.

## Overview

The design system is built on **Tailwind CSS v4** with custom garden-themed tokens and reusable React components.

## Design Tokens

Design tokens are centralized in `src/lib/design-tokens.ts` and include:

- **Colors**: `garden`, `earth`, `soil` palettes with 11 shades each (50-950)
- **Semantic Colors**: `primary`, `secondary`, `accent`, `success`, `warning`, `error`, `info`
- **Spacing**: `xs` to `4xl` (4px to 64px)
- **Border Radius**: `sm` to `2xl` plus `full`
- **Shadows**: Custom garden-themed shadows (`garden`, `gardenHover`, `canvas`, `lift`)
- **Z-Index**: Consistent layering system (`dropdown`, `modal`, `tooltip`, etc.)
- **Typography**: Font families, sizes, and weights
- **Plant Colors**: Pre-defined colors for different plant types

### Usage Example

```typescript
import { colors, semanticColors, spacing } from '@/lib/design-tokens';

const styles = {
  backgroundColor: colors.garden[500],
  padding: spacing.lg,
};
```

## Components

### GardenButton

A versatile button component with multiple variants and sizes.

**Import:**
```typescript
import { GardenButton } from '@/components/ui';
```

**Props:**
- `variant?: 'primary' | 'secondary' | 'danger' | 'amber' | 'outline'` (default: `'primary'`)
- `size?: 'sm' | 'md' | 'lg'` (default: `'md'`)
- `icon?: ReactNode` - Optional icon to display
- `fullWidth?: boolean` - Make button full width
- All standard `HTMLButtonElement` props

**Examples:**

```tsx
// Primary button
<GardenButton variant="primary">Create Garden</GardenButton>

// Secondary button with icon
<GardenButton variant="secondary" icon={<PlusIcon />}>
  Add Plant
</GardenButton>

// Large danger button
<GardenButton variant="danger" size="lg">
  Delete Garden
</GardenButton>

// Outline button (full width)
<GardenButton variant="outline" fullWidth>
  Cancel
</GardenButton>
```

### GardenCard

A card component for content containers with different visual styles.

**Import:**
```typescript
import { GardenCard } from '@/components/ui';
```

**Props:**
- `variant?: 'default' | 'panel' | 'hover' | 'glass'` (default: `'default'`)
- `hover?: boolean` - Enable hover lift effect
- All standard `HTMLDivElement` props

**Examples:**

```tsx
// Default card
<GardenCard>
  <h2>Garden Information</h2>
  <p>Your garden details here...</p>
</GardenCard>

// Panel variant with hover effect
<GardenCard variant="panel" hover>
  <h3>Featured Garden</h3>
</GardenCard>

// Glass morphism card
<GardenCard variant="glass">
  <p>Translucent background with blur</p>
</GardenCard>
```

## Global CSS Classes

The following utility classes are available globally via `src/app/globals.css`:

### Buttons
- `.btn-garden` - Base button styles (flex, rounded, transitions)
- `.btn-garden-primary` - Green gradient primary button
- `.btn-garden-secondary` - White/translucent secondary button
- `.btn-garden-danger` - Red gradient danger button
- `.btn-garden-amber` - Amber gradient button

### Cards
- `.card-garden` - White card with shadow and hover effects
- `.card-garden-panel` - Elevated panel card with stronger shadow

### Info Panels
- `.info-panel-plant` - Blue accent panel
- `.info-panel-bed` - Orange accent panel
- `.info-panel-settings` - Amber accent panel
- `.info-panel-selection` - Green accent panel

### Inputs
- `.input-garden` - Standard input field styling
- `.input-garden-lg` - Large input field variant

### Badges
- `.badge-garden` - Green gradient badge
- `.badge-earth` - Earth tone badge
- `.badge-sky` - Sky blue badge

### Utilities
- `.hover-lift` - Scale + translate on hover
- `.text-gradient-garden` - Gradient text effect
- `.border-3` - 3px border width
- `.garden-canvas` - Canvas background with gradient
- `.garden-scrollbar` - Custom webkit scrollbar

## Dark Mode

Dark mode is enabled via Tailwind's `class` strategy. Add the `dark` class to the root element to enable dark mode.

```tsx
<html className="dark">
  {/* Dark mode styles will apply */}
</html>
```

Use Tailwind's `dark:` prefix for dark mode variants:

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

## Prettier Configuration

The project uses Prettier with the Tailwind CSS plugin for automatic class sorting.

**Format all files:**
```bash
npm run format
```

**Check formatting:**
```bash
npm run format:check
```

## Best Practices

### 1. Use Design Tokens
Prefer design tokens over hardcoded values:

```tsx
// ❌ Don't
<div style={{ color: '#22c55e' }} />

// ✅ Do
import { colors } from '@/lib/design-tokens';
<div style={{ color: colors.garden[500] }} />
```

### 2. Use Components Over Classes
Prefer reusable components over repeating class strings:

```tsx
// ❌ Don't
<button className="px-6 py-3 rounded-xl font-bold shadow-lg transition-all border-2 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 text-white border-green-600 hover:shadow-xl bg-gradient-to-r from-green-600 to-green-700">
  Click Me
</button>

// ✅ Do
<GardenButton variant="primary">Click Me</GardenButton>
```

### 3. Consistent Class Ordering
The Prettier plugin automatically sorts Tailwind classes in a consistent order. Run `npm run format` regularly.

### 4. Semantic Naming
Use semantic color names from design tokens:

```tsx
// ❌ Less semantic
import { colors } from '@/lib/design-tokens';
const color = colors.garden[600];

// ✅ More semantic
import { semanticColors } from '@/lib/design-tokens';
const color = semanticColors.primary;
```

### 5. Component Composition
Build complex UIs by composing simple components:

```tsx
<GardenCard variant="panel" hover>
  <h2 className="text-2xl font-bold mb-4">My Garden</h2>
  <p className="text-gray-600 mb-6">Description here...</p>
  <div className="flex gap-4">
    <GardenButton variant="primary">Edit</GardenButton>
    <GardenButton variant="outline">View</GardenButton>
  </div>
</GardenCard>
```

## Migration Guide

To migrate existing code to use the new design system:

### Step 1: Replace Button Patterns
Find long button className strings and replace with `<GardenButton>`:

```tsx
// Before
<button className="px-6 py-3 rounded-xl font-bold shadow-lg transition-all border-2 flex items-center gap-2 hover:-translate-y-0.5 text-white bg-gradient-to-r from-green-600 to-green-700">
  Save
</button>

// After
<GardenButton variant="primary">Save</GardenButton>
```

### Step 2: Replace Card Patterns
Wrap card-like divs with `<GardenCard>`:

```tsx
// Before
<div className="card-garden p-6">
  Content
</div>

// After
<GardenCard className="p-6">
  Content
</GardenCard>
```

### Step 3: Update Hardcoded Colors
Replace hex/rgb colors with design tokens:

```tsx
// Before
const color = "#10b981";

// After
import { plantColors } from '@/lib/design-tokens';
const color = plantColors.default;
```

### Step 4: Run Prettier
Format all files to ensure consistent class ordering:

```bash
npm run format
```

## Contributing

When adding new components or tokens:

1. Add design tokens to `src/lib/design-tokens.ts`
2. Create reusable components in `src/components/ui/`
3. Export from `src/components/ui/index.ts`
4. Document usage in this file
5. Run `npm run format` before committing

## File Structure

```
src/
├── lib/
│   ├── design-tokens.ts    # Design system tokens
│   └── utils.ts            # cn() utility for class merging
├── components/
│   └── ui/
│       ├── GardenButton.tsx
│       ├── GardenCard.tsx
│       └── index.ts        # Component exports
└── app/
    └── globals.css         # Global Tailwind styles
```

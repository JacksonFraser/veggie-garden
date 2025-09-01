# 🌱 Veggie Garden Designer

A modern web application for designing and planning your perfect vegetable garden. Plan your garden layout, manage plants, and visualize your garden in both 2D and 3D views.

## Features

- **Garden Management**: Create and manage multiple garden spaces with custom dimensions
- **2D Garden Designer**: Interactive canvas-based design tool with drag-and-drop functionality
- **3D Garden Visualization**: Immersive 3D view of your garden using React Three Fiber
- **Plant Library**: Comprehensive database of vegetables with growing information and companion planting rules
- **Raised Bed Support**: Design and place raised beds within your garden
- **Plant Lifecycle Tracking**: Track plants from planning through harvest
- **Real-time Sync**: All changes are automatically synchronized across devices

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: [Convex](https://convex.dev) for real-time database and API
- **3D Graphics**: React Three Fiber and Three.js
- **State Management**: TanStack Query with Convex React Query integration

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Convex:
   ```bash
   npx convex dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code linting
- `npx convex dev` - Start Convex backend development
- `npx convex docs` - Open Convex documentation

## Project Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # React components
│   ├── GardenDesigner.tsx  # 2D garden design interface
│   └── Garden3D.tsx        # 3D garden visualization
├── hooks/         # Custom React hooks
│   ├── useGardenInteraction.ts
│   ├── usePlantDragging.ts
│   ├── useCanvasDrawing.ts
│   └── ...
└── lib/           # Utilities and Convex client setup

convex/
├── schema.ts      # Database schema definitions
├── gardens.ts     # Garden CRUD operations
├── plants.ts      # Plant management functions
├── plantTypes.ts  # Plant variety data
└── raisedBeds.ts  # Raised bed operations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Submit a pull request

## License

This project is licensed under the MIT License.

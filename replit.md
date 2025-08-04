# Overview

This is a toddler-friendly drag-and-drop educational game designed for iPad users aged 2-3. The game presents children with colorful images that they must drag to matching shadow silhouettes. Built as a full-stack web application, it features a React frontend with touch-optimized interactions, Express backend server, and PostgreSQL database integration through Drizzle ORM.

The game follows a simple learning progression: show one draggable image, display multiple shadow targets (one correct match plus decoys), provide audio feedback for correct/incorrect attempts, and celebrate completion with visual effects before advancing to the next level.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Component-based UI using functional components and hooks
- **Vite Build System**: Modern bundler with hot reload for development
- **State Management**: Zustand stores for game state, audio controls, and user interactions
- **Styling**: Tailwind CSS with Radix UI components for consistent design system
- **Touch Interactions**: Custom drag-and-drop implementation optimized for tablet touch inputs
- **3D Graphics**: Three.js integration via React Three Fiber for potential enhanced visual effects

## Backend Architecture
- **Express.js Server**: RESTful API server with middleware for logging and error handling
- **ESM Modules**: Modern JavaScript module system throughout the codebase
- **Session Management**: Connect-pg-simple for PostgreSQL-backed session storage
- **Development Setup**: Vite middleware integration for seamless full-stack development

## Component Structure
- **GameBoard**: Main game container managing level progression and drop logic
- **DraggableImage**: Touch-enabled draggable items with position tracking
- **ShadowTarget**: Drop zones with hover/focus states for accessibility
- **VisualEffects**: Particle systems and animations for success/failure feedback
- **CelebrationScreen**: Level completion interface with restart options

## Data Management
- **Game Data**: Static configuration for animals, images, and shadow assets
- **State Stores**: Separate Zustand stores for game progression, audio settings, and UI state
- **Asset Organization**: Structured folder system for images, sounds, and shadow files by topic

## Database Schema
- **User Management**: Basic user table with username/password authentication
- **PostgreSQL Integration**: Drizzle ORM with type-safe schema definitions
- **Migration System**: Drizzle Kit for database schema versioning

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting via @neondatabase/serverless
- **Drizzle ORM**: Type-safe database operations with automatic migrations

## UI Framework
- **Radix UI**: Comprehensive component library for accessibility and design consistency
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Lucide React**: Icon library for interface elements

## Audio & Media
- **Web Audio API**: Browser-native audio playback for sound effects
- **Custom Audio Management**: Zustand store for mute/unmute controls and sound triggering

## Development Tools
- **TanStack React Query**: Server state management and caching
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds

## Touch & Interaction
- **Custom Touch Handlers**: Native touch event handling for drag-and-drop
- **Responsive Design**: iPad-optimized layout with 4:3 aspect ratio support
- **Performance Optimization**: Asset preloading and touch action prevention for smooth interactions
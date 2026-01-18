# Replit.md - Speed Reading Platform

## Overview

A high-performance, minimalistic web-based speed-reading platform that allows users to upload text content (PDF, EPUB, TXT, DOCX) and visually stream it using RSVP (Rapid Serial Visual Presentation) at user-defined reading speeds. The application is designed as a research-grade productivity tool with a focus on cognitive efficiency, zero distraction, and precision controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)
- **Animations**: Framer Motion for smooth RSVP text transitions
- **File Handling**: react-dropzone for drag-and-drop uploads

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Style**: RESTful endpoints defined in shared/routes.ts
- **File Processing**: Multer for multipart uploads, pdf-parse and mammoth for document parsing
- **Build**: esbuild for production bundling with selective dependency bundling

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: shared/schema.ts
- **Migrations**: drizzle-kit with migrations in /migrations directory
- **Tables**:
  - `documents`: Stores uploaded documents with extracted text, word count, and reading progress
  - `settings`: User preferences for WPM, font size, ORP highlight, pause on punctuation, etc.

### Shared Code Pattern
The `/shared` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod validation schemas
- `routes.ts`: API contract with typed request/response schemas

### Key Design Decisions

1. **RSVP Display Engine**: Custom component with speed ramping, ORP (Optimal Recognition Point) highlighting, and punctuation-aware pausing for improved reading comprehension.

2. **Dark Theme**: Scientific/productivity aesthetic with near-black background (#0E0F12) and high contrast text, inspired by research tools and Linear.app.

3. **Optimistic Updates**: Settings changes are applied immediately via React Query's optimistic update pattern, with rollback on error.

4. **Progress Persistence**: Reading position is auto-saved every 2 seconds during playback and on pause/unmount.

5. **Responsive Design**: Uses react-resizable-panels for desktop and Sheet components for mobile navigation.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store (connection via DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: Session storage (available but sessions not currently implemented)

### Document Processing
- **pdf-parse**: Extract text from PDF files
- **mammoth**: Convert DOCX files to text

### UI Components
- **shadcn/ui**: Pre-built accessible components (Radix UI primitives)
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel component (available in dependencies)

### Build & Development
- **Vite**: Frontend dev server with HMR
- **esbuild**: Production server bundling
- **@replit/vite-plugin-***: Replit-specific dev tooling (error overlay, cartographer, dev banner)
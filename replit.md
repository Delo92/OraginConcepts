# The Neitzke Way - Massage Therapy Booking Website

## Overview

This is a full-stack booking website for "The Neitzke Way," a professional massage therapy business. The application allows clients to browse services, view availability, and book appointments online. It includes a comprehensive admin dashboard for managing services, bookings, availability schedules, and site settings.

The project follows a monorepo structure with a React frontend, Express backend, and PostgreSQL database. It uses Replit Auth for owner authentication to protect admin functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite with custom development plugins for Replit environment
- **Design System**: Custom spa/wellness theme with Cormorant Garamond (serif) and Inter (sans-serif) fonts

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON API mounted at `/api/*`
- **Authentication**: Replit Auth via OpenID Connect with Passport.js
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple

### Database Layer
- **Database**: PostgreSQL (provisioned via Replit)
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command

### Key Data Models
- **Services**: Massage service offerings with name, description, duration, price, and image
- **Bookings**: Client appointments with date, time, service, and client contact info
- **Availability**: Weekly schedule defining available time slots per day
- **BlockedDates**: Specific dates marked as unavailable
- **SiteSettings**: Business configuration (name, tagline, contact info)
- **Users/Sessions**: Authentication tables for Replit Auth

### Project Structure
```
client/           # React frontend
  src/
    components/   # Reusable UI components
    pages/        # Route pages (home, services, booking, admin/*)
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Express backend
  routes.ts       # API route handlers
  storage.ts      # Database operations interface
  db.ts           # Database connection
  replit_integrations/auth/  # Replit Auth integration
shared/           # Shared code between client and server
  schema.ts       # Drizzle database schema
  models/         # Shared type definitions
```

### Build and Development
- **Development**: `npm run dev` runs Vite dev server with HMR proxied through Express
- **Production**: `npm run build` bundles client with Vite and server with esbuild
- **Database Sync**: `npm run db:push` pushes schema changes to PostgreSQL

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable

### Authentication
- **Replit Auth**: OpenID Connect provider for admin authentication
- Required environment variables: `REPL_ID`, `ISSUER_URL`, `SESSION_SECRET`

### Third-Party Libraries
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM
- **passport**: Authentication middleware with OpenID Connect strategy
- **shadcn/ui**: Pre-built accessible React components (Radix UI based)
- **react-hook-form + zod**: Form handling with schema validation
- **date-fns**: Date manipulation utilities

### Fonts
- Google Fonts: Cormorant Garamond and Inter loaded via CDN
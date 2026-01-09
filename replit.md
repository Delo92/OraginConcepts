# Oraginal Concepts - Creative Media Development Portfolio

## Overview

This is a full-stack portfolio and service booking website for "Oraginal Concepts," a creative media development business. The application allows clients to browse creative services (website creation, video editing, visual mockups, music production), view availability, and book projects online. It includes a comprehensive admin dashboard for managing services, bookings, availability schedules, and site settings.

**Mission Statement**: "Give Me Your Concept, Let's Make It Real."

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
- **Design System**: Custom creative/professional theme with Cormorant Garamond (serif) and Inter (sans-serif) fonts

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
- **Services**: Creative service offerings with name, description, duration, price, and image
- **Bookings**: Client project requests with date, time, service, and client contact info
- **Availability**: Weekly schedule defining available time slots per day
- **BlockedDates**: Specific dates marked as unavailable
- **SiteSettings**: Business configuration (name, tagline, contact info)
- **PaymentMethods**: Dynamic payment provider configuration with encrypted API credentials
- **GalleryItems**: Portfolio items (images/videos) showcasing completed work
- **DisplayModeSettings**: Per-mode appearance settings for Yin/Yang theming (hero, fonts, colors)
- **Users/Sessions**: Authentication tables for Replit Auth

### Dynamic Payment Methods System
The site supports multiple payment providers that can be configured per-deployment:
- **Link-based providers**: Cash App, Venmo, Chime, Apple Pay (store payment URLs)
- **API-based providers**: Stripe, PayPal, Authorize.net, Shopify (store encrypted API credentials)

Payment credentials are encrypted using AES-256-GCM via Node.js crypto library. Each deployment requires a unique `ENCRYPTION_KEY` secret.

**For client deployments**: See `CLIENT_SETUP.md` for complete setup instructions.

### Yin/Yang Theming System
The site features a dual-mode theming system accessible via toggle in the navigation:
- **Yin (☀️)**: Light, professional theme - clean aesthetics for business clients
- **Yang (🌙)**: Dark, edgy theme - bold aesthetics for creative/alternative audiences

Each mode can have independent:
- Hero image selection from portfolio
- Typography (heading and body fonts from curated Google Fonts list)
- Color scheme (background, surface, accent, text colors)
- Mode-specific tagline

Settings are managed in Admin > Settings > Yin/Yang Appearance section.
User's mode preference persists in localStorage across sessions.

### Project Structure
```
client/           # React frontend
  src/
    components/   # Reusable UI components
    pages/        # Route pages (home, services, booking, gallery, admin/*)
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Express backend
  routes.ts       # API route handlers
  storage.ts      # Database operations interface
  db.ts           # Database connection
  replit_integrations/auth/  # Replit Auth integration
  replit_integrations/object_storage/  # File upload handling
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

### Object Storage
- **Replit Object Storage**: For storing uploaded portfolio images and videos

### Third-Party Libraries
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM
- **passport**: Authentication middleware with OpenID Connect strategy
- **shadcn/ui**: Pre-built accessible React components (Radix UI based)
- **react-hook-form + zod**: Form handling with schema validation
- **date-fns**: Date manipulation utilities

### Fonts
- Google Fonts: Cormorant Garamond and Inter loaded via CDN

## Services Offered
- Website Creation
- Video Editing
- Visual Mockups
- Music/Song Production
- Any creative work to bring ideas to life visually and audibly

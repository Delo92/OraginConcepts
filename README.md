# Oraginal Concepts

**Give Me Your Concept, Let's Make It Real.**

A full-stack portfolio and service booking website for creative media development. Clients can browse services, view availability, and book projects online. Includes a comprehensive admin dashboard for managing everything.

## Features

- **Service Showcase** - Display creative services with descriptions, pricing, and durations
- **Online Booking** - Clients can book appointments based on your availability
- **Portfolio Gallery** - Showcase completed work with images and videos
- **Yin/Yang Theming** - Dual-mode design with light (professional) and dark (creative) themes
- **Admin Dashboard** - Manage services, bookings, availability, gallery, and site settings
- **Dynamic Payment Methods** - Support for Stripe, PayPal, Cash App, Venmo, and more
- **Secure Credentials** - API keys encrypted with AES-256-GCM

## Services

- Website Creation
- Video Editing
- Visual Mockups
- Music/Song Production
- Custom Creative Work

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Password-protected admin panel

## Deployment

See [RENDER_SETUP.md](./RENDER_SETUP.md) for deployment instructions.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ENCRYPTION_KEY` | 64-char hex key for encrypting credentials |
| `ADMIN_PASSWORD` | Password for admin panel |
| `SESSION_SECRET` | Random string for session security |

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## License

MIT

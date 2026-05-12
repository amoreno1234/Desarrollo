# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Spa & Beauty** — a full-stack spa booking web application built with Next.js 14 (App Router), PostgreSQL, Prisma 7, and NextAuth.js. Clients can browse services, book appointments, and leave NPS feedback. Admins manage the service catalog, view bookings, and see feedback analytics.

## Commands

```bash
npm run dev          # Start development server on :3000
npm run build        # Production build
npm run lint         # ESLint

npx prisma migrate dev --name <name>   # Create and apply a migration
npx prisma studio                       # Open Prisma Studio (DB browser)
npx prisma generate                     # Regenerate Prisma client after schema changes
```

**Initial setup:**
```bash
# 1. Start PostgreSQL
pg_ctlcluster 16 main start

# 2. Create DB and user (already done, just for reference)
sudo -u postgres createdb spa_booking
sudo -u postgres psql -c "CREATE USER spa_user WITH PASSWORD 'spa_password' CREATEDB;"
sudo -u postgres psql spa_booking -c "GRANT ALL ON SCHEMA public TO spa_user;"

# 3. Apply migrations
npx prisma migrate dev

# 4. Seed admin + sample services (one-time, idempotent)
curl -X POST http://localhost:3000/api/admin/seed
# → admin@spa.com / admin123
```

## Architecture

### Stack
- **Next.js 16** (App Router, full-stack) + TypeScript
- **Prisma 7** + `@prisma/adapter-pg` (required adapter — Prisma 7 no longer accepts `url` in `schema.prisma`; connection string lives in `prisma.config.ts`)
- **NextAuth.js v5 (beta)** — JWT sessions, credentials provider; role stored in JWT token
- **PostgreSQL 16** as database
- **Resend** for email, **Twilio** for WhatsApp/SMS, **Web Push API** for PWA push notifications

### Directory structure
```
src/
├── app/
│   ├── page.tsx               ← Landing page (server component, fetches services)
│   ├── servicios/             ← Public service catalog, grouped by duration
│   ├── reservar/              ← Multi-step booking flow (client component)
│   ├── login/ registro/       ← Auth pages
│   ├── cuenta/                ← Client dashboard: upcoming + past appointments
│   ├── feedback/[appointmentId]/ ← NPS survey (0–10 scale)
│   ├── admin/
│   │   ├── page.tsx           ← Admin dashboard with stats
│   │   ├── servicios/         ← Service catalog CRUD
│   │   ├── reservas/          ← All bookings table
│   │   ├── clientes/          ← Client directory
│   │   └── feedback/          ← NPS results with promoter/passive/detractor breakdown
│   └── api/
│       ├── auth/[...nextauth]/ ← NextAuth handler
│       ├── auth/register/      ← Client registration
│       ├── services/           ← GET (public) / POST (admin); [id] PATCH/DELETE
│       ├── appointments/       ← GET (own) / POST (book); [id] PATCH (cancel/complete)
│       ├── availability/       ← GET ?date=YYYY-MM-DD&duration=ONE_HOUR → {slots:[]}
│       ├── feedback/           ← POST (client) / GET (admin)
│       ├── settings/           ← GET (public) / PATCH (admin) — SPA settings + Google Review URL
│       ├── push/subscribe/     ← Store Web Push subscription
│       └── admin/seed/         ← One-time seed endpoint
├── lib/
│   ├── db.ts                  ← Prisma singleton (with PrismaPg adapter)
│   ├── auth.ts                ← NextAuth config + callbacks (role injected into JWT/session)
│   ├── availability.ts        ← Slot generation logic (see booking rules below)
│   ├── notifications.ts       ← Email (Resend), WhatsApp (Twilio), Push (web-push)
│   └── utils.ts               ← cn(), DURATION_LABELS, formatCurrency, formatDate
├── components/
│   └── layout/
│       ├── Navbar.tsx         ← Top nav (adapts for CLIENT / ADMIN / guest)
│       └── PushNotificationSetup.tsx ← Auto-registers service worker on login
public/
├── sw.js                      ← Service worker (push + notificationclick)
└── manifest.json              ← PWA manifest
prisma/
└── schema.prisma              ← DB schema (no url= in datasource; moved to prisma.config.ts)
prisma.config.ts               ← Prisma 7 config — datasource URL goes here
```

### Key models (schema.prisma)
| Model | Purpose |
|---|---|
| `User` | Clients and admins (`role: ADMIN \| CLIENT`) |
| `Service` | Bookable treatments (`duration: THIRTY_MIN \| ONE_HOUR \| TWO_HOURS`) |
| `Appointment` | Booked sessions (`startTime`/`endTime` stored as `"HH:MM"` strings) |
| `Feedback` | NPS score per appointment (0–10) |
| `FeedbackDetail` | Extra contact form data — only for detractors (score ≤ 6) |
| `PushSubscription` | Web Push endpoint per user |
| `SpaSettings` | Singleton row: Google Review URL, spa contact info |

### Booking availability rules (`src/lib/availability.ts`)
- **TWO_HOURS**: max **1 per day** (if any 2h session exists on that date, no more 2h slots are returned).
- **ONE_HOUR / THIRTY_MIN**: slots from 10:00 to 19:00, every 30-minute increment, skipping any slot that would overlap an existing confirmed appointment.
- Slots that end after 19:00 are excluded.
- "CANCELLED" appointments do not block slots.

### NPS feedback routing (`src/app/feedback/[appointmentId]/page.tsx`)
- Score **0–6** (detractor) → show detail form (name, email, phone, comment); submit both Feedback + FeedbackDetail.
- Score **7–8** (passive) → submit score only, show thank-you.
- Score **9–10** (promoter) → submit score then redirect to `settings.googleReviewUrl`.

### Auth & roles
- Session strategy: **JWT**. Role is added in the `jwt` callback and forwarded to `session` callback.
- Access `role` from session: `(session.user as { role?: string }).role`
- Admin routes check `role !== "ADMIN"` and redirect to `/login`.
- `NEXTAUTH_SECRET` must be set in `.env` (use `openssl rand -base64 32` in production).

### Prisma 7 notes
- `prisma.config.ts` holds the datasource URL (`datasource: { url: process.env.DATABASE_URL }`).
- `schema.prisma` datasource block has **no `url =`** field — this is intentional for Prisma 7.
- `PrismaClient` must be instantiated with a `PrismaPg` adapter (see `src/lib/db.ts`).

## Environment variables (.env)
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing |
| `NEXTAUTH_URL` | Yes | App URL (e.g., `http://localhost:3000`) |
| `RESEND_API_KEY` | Optional | Resend API key for email notifications |
| `EMAIL_FROM` | Optional | From address for emails |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio credentials for WhatsApp/SMS |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio auth token |
| `TWILIO_WHATSAPP_NUMBER` | Optional | `whatsapp:+1...` sender number |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Optional | VAPID public key (generate with `npx web-push generate-vapid-keys`) |
| `VAPID_PRIVATE_KEY` | Optional | VAPID private key |
| `VAPID_EMAIL` | Optional | Contact email for VAPID |
| `GOOGLE_REVIEW_URL` | Optional | Also configurable via `/admin` settings panel |

Notification providers (Resend, Twilio, Web Push) are optional — missing keys are checked at runtime and the send is skipped silently.

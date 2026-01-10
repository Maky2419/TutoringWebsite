# Tutoring Service 
Stack:
- Next.js 14 (App Router) + React
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Docker + Docker Compose

## Quick start (Docker)
1) Install Docker Desktop
2) From the project root:
```bash
docker compose up --build
```

Then open:
- App: http://localhost:3000

## Set up Prisma
Inside Docker the app runs migrations automatically on start (dev mode).
If you run locally:
```bash
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Pages included
- `/` Home
- `/services`
- `/pricing`
- `/tutors`
- `/tutors/[id]`
- `/book` (request booking)
- `/contact`
- `/faq`
- `/about`
- `/terms`
- `/privacy`

## API routes included (Next.js route handlers)
- `GET /api/health`
- `GET /api/tutors`
- `GET /api/tutors/[id]`
- `POST /api/bookings`
- `GET /api/bookings` (admin/dev convenience)
- `POST /api/auth/register` (placeholder)
- `POST /api/auth/login` (placeholder)

## Notes
- Auth routes are placeholders (no sessions yet). Add NextAuth or your own JWT flow later.
- Booking flow: collects basic details and creates a `Booking` record in Postgres.

## Fix note
Server Components should **not** fetch relative URLs like `/api/...` from Node (it can throw ERR_INVALID_URL). This template reads from Prisma directly in server pages (recommended).

# K-Cubed Tutoring Website

## What this project does
- Student selects a tutor and submits a booking request
- Backend saves the booking in Postgres (Prisma)
- Tutor receives an email with Accept / Decline links
- When tutor clicks a link, the student gets emailed the result
- Students and tutors can subscribe to a live Apple/Google calendar feed
- Login supports email/password plus Google, Apple, and Microsoft when configured

## Prerequisites
- Node.js 18+
- Docker Desktop (for Postgres)
- A Gmail account + a Gmail **App Password** (recommended)

## Setup (copy/paste)

### 1) Start the database
From the project folder:

```bash
docker compose up -d
```

### 2) Install dependencies
```bash
npm install
```

### 3) Create your .env
Copy the example env:

```bash
cp .env.example .env
```

Now edit `.env` and set:

- SMTP_USER = your Gmail address
- SMTP_PASS = your Gmail **App Password**

**Gmail App Password:** Google Account → Security → 2-Step Verification → App passwords.
(You must have 2FA enabled to create an app password.)

### 4) Apply the database schema + seed tutors
```bash
npx prisma db push
npx prisma generate
node prisma/seed.js
```

### 5) Run the app
```bash
npm run dev
```

Open:
- http://localhost:3000
- http://localhost:3000/book

## How to test the full email flow
1) Go to /book and submit a request.
2) Check the tutor email inbox for the Accept/Decline email.
3) Click Accept or Decline.
4) Check the student email inbox for the decision email.

## Notes
- In `prisma/seed.js`, tutors use placeholder emails like `kashif@example.com`. Replace those with real tutor emails.
- `APP_BASE_URL` is used to generate links in emails. Keep it as `http://localhost:3000` for local dev.

## Social login setup

Create OAuth applications with Google, Apple, and/or Microsoft, then add the
matching values from `.env.example` to `.env`. Configure these callback URLs:

- Google: `https://YOUR-DOMAIN/api/auth/callback/google`
- Apple: `https://YOUR-DOMAIN/api/auth/callback/apple`
- Microsoft: `https://YOUR-DOMAIN/api/auth/callback/azure-ad`

For local testing, replace `https://YOUR-DOMAIN` with `http://localhost:3000`
where the provider permits local callbacks. Restart the application after
changing environment variables. Providers without credentials remain hidden.

## Calendar sync

Run `npx prisma db push` after upgrading so each user can receive a private,
random calendar-feed token. The Apple and Google buttons subscribe to that feed;
the calendar provider periodically checks it for new, changed, or cancelled
sessions. The `.ics` button downloads a one-time snapshot instead.

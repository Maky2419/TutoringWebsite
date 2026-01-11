# Tutoring Website (Gmail Email + Tutor Accept/Decline)

## What this project does
- Student selects a tutor and submits a booking request
- Backend saves the booking in Postgres (Prisma)
- Tutor receives an email with Accept / Decline links
- When tutor clicks a link, the student gets emailed the result

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

### 4) Create tables + seed tutors
```bash
npx prisma migrate dev --name init
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

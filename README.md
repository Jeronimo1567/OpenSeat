# OpenSeat 📚

NFC-powered study spot reservation system for Oakland University.

Try it out - > https://open-seat-chi.vercel.app/dashboard

Students tap an NFC tag on a study table → land on a mobile-first web app → reserve the seat in seconds.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS (OU brand colors: navy `#1a2744`, gold `#FFB81C`)
- **Database**: Supabase (Postgres)
- **Deployment**: Vercel

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the **SQL Editor** and run the contents of [`schema.sql`](./schema.sql)
3. Copy your project credentials from **Settings → API**

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run locally

```bash
npm run dev
```

Visit http://localhost:3000 — the home page has a **Simulate NFC Tap** button for demo purposes.

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with demo button |
| `/reserve?spot=table-1&scanned_at=<ts>` | Reservation form |
| `/status?reservation_id=<uuid>` | Live countdown + end session |
| `/api/reserve` | POST — create reservation |
| `/api/end-session` | POST — end reservation early |
| `/api/nfc-redirect?spot=table-1` | GET — injects timestamp, redirects to `/reserve` |

---

## NFC Tag Setup

Write your NFC tags to point to:

```
https://yourdomain.com/api/nfc-redirect?spot=table-1
```

The `/api/nfc-redirect` endpoint auto-injects the current timestamp as `scanned_at` and redirects the student to the reservation form. The scan window is **10 minutes** — if the student tries to use the URL after 10 minutes, the form will reject it and ask them to tap again.

---

## Database Schema

See `schema.sql`. Run it in the Supabase SQL Editor.

### `spots`
| column | type | notes |
|---|---|---|
| id | text PK | e.g. `table-1` |
| name | text | e.g. `Study Table 1` |
| location | text | e.g. `Oakland Center, 1st Floor` |

### `reservations`
| column | type | notes |
|---|---|---|
| id | uuid PK | auto-generated |
| spot_id | text | FK → spots |
| name | text | student's name |
| email | text | @oakland.edu only |
| started_at | timestamptz | when reservation was confirmed |
| ends_at | timestamptz | started_at + chosen duration |
| scanned_at | timestamptz | when NFC was tapped |
| active | boolean | true while ongoing |

---

## Deploy to Vercel

```bash
npx vercel
```

Set the environment variables in the Vercel dashboard under **Settings → Environment Variables**.

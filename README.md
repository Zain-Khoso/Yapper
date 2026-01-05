# Yapper

Yapper is a full-stack, real-time chat application focused on privacy, reliability, and a minimal client footprint. It combines server-rendered views (Pug) with modern frontend tooling (Vite) and a Node/Express backend to provide a fast developer experience and scalable runtime.

## Features

- **Real-time messaging** with Socket.io and user presence tracking.
- **Authentication** using JWT (access + refresh tokens) and email OTP flows.
- **File uploads** stored in S3-compatible storage (Cloudflare R2) using presigned URLs.
- **Payments** integration (Stripe) and webhook handling for premium features.
- **Server-side views** rendered with Pug and lightweight vanilla JS for interactivity.

## Tech stack

- **Runtime:** Node.js + Express
- **Frontend:** Pug templates, Vite, vanilla JS, CSS
- **Database:** MariaDB via Sequelize ORM
- **Realtime:** Socket.io, WebRTC
- **Storage:** Cloudflare R2 (S3-compatible)
- **Build tools:** Vite, esbuild, custom build scripts

## Repository layout (key paths)

- **`app.js`**: Server entrypoint and global middleware.
- **`src/client`**: Frontend JS, CSS, and pages.
- **`src/controllers`**: Express controllers for routes and business logic.
- **`src/models`**: Sequelize models and associations.
- **`src/routes`**: Route definitions mounting controllers.
- **`src/views`**: Pug templates and partials.
- **`src/utils`**: Database setup, auth helpers, storage helpers, and cron jobs.

## Prerequisites

- Node.js (16+ recommended)
- pnpm (preferred) or npm
- A running database (configured via environment variables)
- Cloudflare R2 credentials (if using uploads)
- Stripe keys (if using payments)

## Quick start (local)

1. Install dependencies:

```bash
pnpm install
# or: npm install
```

2. Create and populate a `.env` file (see sample keys below).

3. Start the app (development):

```bash
pnpm dev
```

4. Open your browser at http://localhost:8000 (or the `PORT` you set).

Note: The repo includes `vite.config.js`—frontend assets are served/bundled with Vite. If you use the provided scripts, they will orchestrate Vite and server builds.

## Environment variables

Just copy from the `.env.example` file

## Development notes

- Views are implemented with Pug templates under `src/views` and lightweight client behavior lives in `src/client/js`.
- Server controllers and route wiring live in `src/controllers` and `src/routes` respectively.
- Database models and associations are defined in `src/models` and `src/utils/associations.js`.

---

Developed with Problem Solving by [Zain Khoso](https://github.com/Zain-Khoso).

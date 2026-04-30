# Boksoon Kim Organization Monorepo

This workspace contains the full Boksoon Kim Organization platform:

- `front-end-next/` - a Next.js 14 frontend that serves the public site and the admin UI.
- `laravel-api/` - a Laravel 12 JSON API that powers public content, authentication, and admin CRUD.

The project is a staged migration of the Boksoon Kim Organization web presence into a split frontend/backend architecture.

## What the platform does

The application supports:

- Public pages for the homepage, about page, blogs, blog details, books, donations, donation details, ministries, testimonials, contact, and email/comment verification flows.
- Public submission flows for contact forms, newsletter signups, comments, donations, and transaction intake.
- Admin tools for login, dashboard reporting, profile management, users, roles, ministries, donations, donors, transactions, blogs, books, testimonials, comments, contacts, newsletters, and trash/restoration workflows.
- JWT-based authentication with refresh-token handling between the Next.js app and the Laravel API.

## Stack

- Frontend: Next.js 14, React 18, TypeScript
- Backend: Laravel 12, PHP 8.2+
- Database: MySQL by default, or another Laravel-supported database
- Styling and UI: legacy theme assets plus custom app components in the Next.js frontend

## Repository Layout

- `front-end-next/app/` - public site pages, admin pages, and frontend API proxy routes
- `front-end-next/components/` - shared public and admin UI components
- `front-end-next/lib/` - routing helpers, formatting, shared types, and server-side Laravel fetch helpers
- `front-end-next/public/` - static assets, including legacy admin assets
- `laravel-api/app/Http/Controllers/` - public and admin API controllers
- `laravel-api/routes/api.php` - API route map for `/api/v1`
- `laravel-api/database/` - migrations, seeders, and factories

## Frontend Behavior

The Next.js app renders the public site and proxies authenticated and unauthenticated API requests through its own `/api` routes.

Key frontend environment variables:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `LARAVEL_API_BASE_URL`
- `AUTH_ACCESS_COOKIE_MAX_AGE`
- `AUTH_REFRESH_COOKIE_MAX_AGE`

Default local values are defined in `front-end-next/.env.example`.

## Backend Behavior

The Laravel API exposes a versioned JSON API under `/api/v1`.

Notable route groups include:

- Public content: health, donations, ministries, blogs, books, comments, contacts, newsletters, transactions, testimonials
- Auth: login, refresh, logout, profile, password, email verification
- Admin: users, roles, ministries, donors, transactions, donations, contacts, newsletters, testimonials, comments, books, and blogs

The backend README in `laravel-api/README.md` documents the API envelope, auth settings, role names, legacy migration tools, and endpoint details.

## Local Setup

### Frontend

1. Install dependencies:

```bash
cd front-end-next
npm install
```

2. Create a local environment file from the example and set the API base URL for your Laravel instance.

3. Start the frontend:

```bash
npm run dev
```

Useful frontend scripts:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run typecheck`

### Backend

1. Install dependencies and bootstrap the app:

```bash
cd laravel-api
composer setup
```

2. Make sure `.env` includes a strong `JWT_SECRET` and the correct frontend/API URLs.

3. Create the storage symlink for public media assets:

```bash
php artisan storage:link
```

4. Start the backend services:

```bash
composer dev
```

Useful backend scripts:

- `composer setup`
- `composer dev`
- `composer test`

## API Notes

- The frontend expects the Laravel API to respond with a `{ success, message, data, errors, meta }` envelope.
- Admin requests use bearer tokens and refresh cookies managed by the Next.js app.
- Some legacy behavior is intentionally preserved, including older asset bundles and compatibility helpers for migrated content.

## Documentation

- Backend API README: `laravel-api/README.md`
- Frontend environment example: `front-end-next/.env.example`
- Laravel API routes: `laravel-api/routes/api.php`

# NGO Laravel API

Backend API for an NGO platform, built with Laravel 12.

This project provides:

- Public endpoints for donations, blogs, books, testimonials, comments, contact form submissions, newsletter subscriptions, and transaction intake.
- Admin endpoints for managing users, roles, ministries, donations, donors, transactions, blogs, books, testimonials, contacts, and newsletter records.
- JWT-based admin authentication with refresh tokens.
- UUID-first schema with optional support for legacy numeric IDs in selected request payloads.
- Legacy media migration tools to move existing frontend assets into Laravel storage.

## Stack

- PHP 8.2+
- Laravel 12
- MySQL (default) or another Laravel-supported database
- Vite (frontend asset pipeline used by Laravel tooling)

## API Conventions

- Base prefix: `/api/v1`
- Response envelope:
  - success: `{ "success": true, "message": "...", "data": { ... }, "meta": {} }`
  - error: `{ "success": false, "message": "...", "errors": {}, "meta": {} }`
- Admin auth uses `Authorization: Bearer <access_token>`.
- Public throttle profile (`public-api`) limits selected endpoints to `10` requests/minute per `IP + path`.

## Authentication

Admin authentication endpoints:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/auth/profile`
- `PATCH /api/v1/auth/password`

Auth behavior:

- Access token: signed JWT (`HS256`) with configurable TTL.
- Refresh token: opaque token stored as a SHA-256 hash in `refresh_tokens`.
- Protected routes use custom middleware `auth.jwt`.

Required environment values for JWT:

- `JWT_SECRET` (required)
- `JWT_ISSUER` (default: `ngo-laravel-api`)
- `JWT_AUDIENCE` (default: `ngo-admin`)
- `JWT_ACCESS_TTL` (default: `900` seconds)
- `JWT_REFRESH_TTL` (default: `1209600` seconds)

## Roles and Authorization

Role names currently used in code:

- `admin`
- `manager`
- `author`
- `reviwer` (spelling kept as implemented in migrations/controllers)

Most admin routes are JWT-protected, with per-controller role checks.

## Endpoint Overview

Public routes include:

- `GET /health`
- `GET /donations`, `GET /donations/{id}`
- `GET /ministries`, `GET /ministries/{id}`
- `GET /blogs`, `GET /blogs/{id}`, `GET /blogs/slug/{slug}`
- `GET /books`, `GET /books/{id}`
- `GET /blogs/{blog}/comments`, `POST /comments`, `GET /comments/verify/{token}`
- `POST /contacts`
- `POST /newsletters`
- `POST /transactions`
- `GET /testimonials`

Admin routes (under `/api/v1/admin`) include API resources for:

- users (+ `PATCH /users/{user}/password`)
- roles
- donors
- transactions
- testimonials
- donations
- blogs (+ `POST /blogs/upload-image`)
- books
- contacts (`index`, `show`)
- newsletters (`index`, `show`)
- ministries

See `routes/api.php` for the exact route map.

## Local Setup

1. Install dependencies and bootstrap app:

```bash
composer setup
```

2. Ensure `.env` contains a strong `JWT_SECRET` (in addition to DB config):

```bash
php -r "echo bin2hex(random_bytes(32));"
```

3. Create storage symlink for public media URLs:

```bash
php artisan storage:link
```

4. Start local development services:

```bash
composer dev
```

The default `.env.example` targets:

- API URL: `http://localhost:8100`
- Frontend URL: `http://localhost:3000`
- MySQL DB: `ngo_laravel`

## Database Notes

- The schema uses UUID primary keys across domain tables.
- Several write endpoints accept either UUID or legacy numeric ID for related records via model lookup helpers.
- Default roles are inserted by migration: `admin`, `manager`, `author`, `reviwer`.

## Legacy Migration Utilities

Available artisan commands:

- `php artisan ngo:prepare-legacy-dump {path?}`
- `php artisan ngo:import-legacy-media --write`

`ngo:import-legacy-media` can run in dry-run mode (without `--write`) to report scanned/migrated/missing assets first.

## Testing

Run automated tests:

```bash
composer test
```

## API Client

A Postman collection is available at:

- `postman/ngo-laravel-api.postman_collection.json`

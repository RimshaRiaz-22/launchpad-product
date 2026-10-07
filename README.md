# Launchpad Backend API

Enterprise-grade REST API for the Launchpad SaaS design editor platform.

---

## Tech Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: PostgreSQL 16 (Knex.js query builder)
- **Auth**: JWT (access + refresh tokens) + bcrypt
- **Validation**: Joi
- **Logging**: Winston + Morgan
- **Testing**: Jest + Supertest

---

## Architecture (Layered)

```
Routes → Controllers → Services → Repositories → Database
```

| Layer | Responsibility |
|---|---|
| Routes | HTTP endpoint definitions, middleware chain |
| Controllers | Parse request → call service → return response |
| Services | Business logic, orchestration, rules |
| Repositories | Raw DB queries via Knex (no business logic) |
| Middlewares | Auth, RBAC, Validation, Upload, Rate Limit |
| Utils | ApiError, ApiResponse, asyncHandler, JWT, Hash, Pagination |

---

## Local Setup

### Prerequisites
- Node.js >= 20
- PostgreSQL 16 running locally

### 1. Create the database

```sql
-- Run as postgres superuser
CREATE USER launchpad_user WITH PASSWORD 'launchpad_pass';
CREATE DATABASE launchpad_db OWNER launchpad_user;
GRANT ALL PRIVILEGES ON DATABASE launchpad_db TO launchpad_user;
```

Or using the init.sql:
```bash
psql -U postgres -c "CREATE USER launchpad_user WITH PASSWORD 'launchpad_pass';"
psql -U postgres -c "CREATE DATABASE launchpad_db OWNER launchpad_user;"
psql -U launchpad_user -d launchpad_db -f database/init.sql
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work for local PG setup above)
```

### 4. Run migrations

```bash
npm run migrate
```

### 5. Seed development data

```bash
npm run seed
```

### 6. Start development server

```bash
npm run dev
```

Server starts at: `http://localhost:5000`

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with Nodemon (hot reload) |
| `npm start` | Start in production mode |
| `npm run migrate` | Run pending migrations |
| `npm run migrate:rollback` | Rollback last migration batch |
| `npm run seed` | Seed development data |
| `npm test` | Run all tests |
| `npm run test:coverage` | Tests with coverage report |

---

## API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new account |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Logout (revoke token) |
| POST | `/auth/logout-all` | Logout all devices |
| GET | `/auth/me` | Get current user |
| POST | `/auth/change-password` | Change password |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects` | List my projects |
| POST | `/projects` | Create project |
| GET | `/projects/explore` | Public gallery |
| GET | `/projects/:id` | Get project |
| PATCH | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |
| POST | `/projects/:id/duplicate` | Duplicate project |

### Assets
| Method | Endpoint | Description |
|---|---|---|
| GET | `/assets` | List my assets |
| POST | `/assets` | Upload asset |
| GET | `/assets/:id` | Get asset |
| PATCH | `/assets/:id` | Update asset name |
| DELETE | `/assets/:id` | Delete asset |

### Templates
| Method | Endpoint | Description |
|---|---|---|
| GET | `/templates` | List templates |
| GET | `/templates/:id` | Get template |
| POST | `/templates` | Create (admin) |
| PATCH | `/templates/:id` | Update (admin) |
| DELETE | `/templates/:id` | Delete (admin) |

### Billing
| Method | Endpoint | Description |
|---|---|---|
| GET | `/billing/plans` | Available plans |
| GET | `/billing/subscription` | My subscription |
| POST | `/billing/webhook` | Stripe webhook |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Root health check |
| GET | `/api/v1/health` | v1 health check |

---

## Seed Credentials (Development)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@launchpad.dev` | `Password123!` |
| User | `demo@launchpad.dev` | `Password123!` |

---

## Database Schema

7 tables:
- `users` — User accounts
- `refresh_tokens` — Hashed JWT refresh tokens
- `projects` — Design projects (Fabric.js JSONB)
- `assets` — User-uploaded files
- `templates` — Reusable design templates
- `subscriptions` — Stripe billing subscriptions
- `audit_logs` — Immutable action audit trail

---

## Response Format

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "meta": { "pagination": { ... } }
}
```

**Error:**
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "...",
  "errors": [{ "field": "email", "message": "..." }]
}
```

---

## Environment Variables

See `.env.example` for all required and optional variables.

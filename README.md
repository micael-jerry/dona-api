> *This project has been created as part of the 42 curriculum by \<login1\>[, \<login2\>[, \<login3\>[...]]].*

# 🚦 Dona — Road Event Signaling Platform

> A real-time, community-driven road event signaling application — think Waze-style crowdsourced alerts with live reactions, comments, and location-based chat channels.

---

## Description

**Dona** is a collaborative web platform where users can signal various types of road events (accidents, traffic jams, police controls, obstacles, etc.) on an interactive map. Each reported event accumulates community signals to validate its credibility. Users can react instantly, leave comments, and join a live geo-located chat channel specific to each incident point.

### Key Features
- 📍 **Event Signaling** — Report predefined road event types at your location
- 📊 **Signal Count & Credibility** — See how many users confirmed the same event
- ⚡ **Instant Reactions** — React to events with quick responses (✅ still there / ❌ resolved)
- 💬 **Event Comments** — Leave context-rich comments on any event
- 🗨️ **Location Chat** — Each event point has a real-time discussion channel (WebSocket)
- 🔐 **Secure Auth** — JWT-based authentication with email/password
- 🌍 **Interactive Map** — Live map with clustered event markers

---

## Team Information

| Member | Role(s) | Responsibilities |
|--------|---------|-----------------|
| TBD | Product Owner + Developer | Product vision, backlog, feature validation |
| TBD | Project Manager + Developer | Sprint planning, task tracking, blockers |
| TBD | Tech Lead + Developer | Architecture decisions, code reviews |
| TBD | Developer | Feature implementation |
| TBD | Developer | Feature implementation |

---

## Project Management

- **Task tracking**: Trello (backend) / GitHub Issues
- **Meetings**: Weekly sync + async on Discord
- **Communication**: Discord
- **Git workflow**: Feature branches + PR reviews (min. 1 reviewer)

---

## Technical Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Backend** | NestJS (Node.js) | Structured, scalable, TypeScript-first |
| **API Docs** | Swagger / OpenAPI | Auto-generated, used to generate frontend client |
| **ORM** | Prisma | Type-safe queries, easy migrations, great DX |
| **Database** | PostgreSQL | Relational, reliable, open-source |
| **Auth** | JWT (access + refresh tokens) | Stateless, scalable |
| **Real-time** | WebSockets (Socket.io via NestJS) | Event updates + location chat |
| **Frontend** | Next.js (React) | SSR, routing, ecosystem |
| **HTTP Client** | Axios + Swagger-generated client | Type-safe API consumption |
| **Containerization** | Docker + docker-compose | Single-command deployment |

---

## Database Schema

> See [DATABASE.md](./docs/DATABASE.md) for full ERD and field details.

**Core tables:**
- `users` — id, email, password_hash, username, avatar, role, created_at
- `events` — id, type, latitude, longitude, description, created_by, created_at, expires_at
- `event_signals` — id, event_id, user_id, created_at *(confirmation votes)*
- `event_reactions` — id, event_id, user_id, type (STILL_THERE | RESOLVED), created_at
- `event_comments` — id, event_id, user_id, content, created_at
- `chat_messages` — id, event_id, user_id, content, created_at *(location channel)*
- `notifications` — id, user_id, type, payload, read, created_at

---

## Features List

| Feature | Description | Owner |
|---------|-------------|-------|
| User signup/login | JWT auth with email+password | TBD |
| User profile | View/edit profile, avatar upload | TBD |
| Event creation | Signal a road event at geolocation | TBD |
| Event map | Interactive real-time event map | TBD |
| Signal confirmation | Vote to confirm an event | TBD |
| Event reactions | Quick STILL_THERE / RESOLVED reactions | TBD |
| Event comments | Threaded comments on events | TBD |
| Location chat | Real-time WebSocket chat per event point | TBD |
| Notifications | In-app notifications for interactions | TBD |
| Public API | Secured API key access + rate limiting | TBD |

---

## Modules

> **Target: 14+ points minimum** | Major = 2pts | Minor = 1pt

| # | Module | Type | Points | Status |
|---|--------|------|--------|--------|
| 1 | **Web — Use frameworks (frontend + backend)** | Major | 2 | [ ] |
| 2 | **Web — Real-time features (WebSockets)** | Major | 2 | [ ] |
| 3 | **Web — User Interaction** (chat + profile + friends) | Major | 2 | [ ] |
| 4 | **Web — Public API** (secured key, rate limiting, 5+ endpoints, docs) | Major | 2 | [ ] |
| 5 | **Web — ORM** (Prisma) | Minor | 1 | [ ] |
| 6 | **Web — Notification system** | Minor | 1 | [ ] |
| 7 | **User Management — Standard auth + profile** | Major | 2 | [ ] |
| 8 | **User Management — 2FA** | Minor | 1 | [ ] |
| 9 | **Devops — Health check & status page** | Minor | 1 | [ ] |
| | **TOTAL** | | **14** | |

*Bonus potential: SSR (Next.js - 1pt), Advanced search (1pt), File upload (1pt), Multiple languages (1pt)*

---

## Individual Contributions

> To be filled as work progresses.

| Member | Features / Modules | Challenges |
|--------|-------------------|------------|
| TBD | - | - |

---

## Instructions

### Prerequisites

- Node.js >= 24.14.0
- pnpm >= 11.x
- Docker + docker-compose
- PostgreSQL (or via Docker)

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your values
```

### Run with Docker (recommended)

```bash
docker-compose up --build
```

### Run locally (development)

```bash
# Backend
pnpm install
pnpm run start:dev

# API Docs available at:
# http://localhost:3000/swagger
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dona` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your-refresh-secret` |
| `APP_PORT` | API port | `3000` |
| `API_KEY` | Public API key | `sk_live_...` |

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs)
- [JWT Introduction](https://jwt.io/introduction)
- [OpenAPI / Swagger](https://swagger.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### AI Usage
AI (Claude / Antigravity IDE) was used for:
- Generating the initial project README structure and checklists
- Suggesting database schema design patterns
- Code review suggestions and best practices guidance
- Documentation drafts (reviewed and adapted by team members)

---

## See Also

- [CHECKLIST.md](./CHECKLIST.md) — Line-by-line subject compliance checklist
- [BACKEND_TODO.md](./BACKEND_TODO.md) — Backend implementation tasks with Trello estimates
- [docs/DATABASE.md](./docs/DATABASE.md) — Full ERD and database schema details


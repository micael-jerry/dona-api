# BACKEND TODO — Dona API (NestJS + Prisma + PostgreSQL + JWT)

> Stack: NestJS · Swagger · Prisma · JWT Auth · PostgreSQL · Socket.io (WebSockets)
> Chaque tâche a une estimation en heures pour Trello.
> Version mise à jour : intègre organisations, permissions avancées, OAuth, IA (modération/reconnaissance d'image/recommandation), RGPD, analytics, sécurité renforcée, i18n et module custom de recalcul d'itinéraire.

---

## PHASE 0 — FONDATIONS (AVANT TOUT CODE METIER)

> Ces tâches DOIVENT être faites avant d'implémenter la moindre feature.
> Un bug ici = refactoring douloureux partout.

---

### 0.1 — Modélisation des Données (MPD / ERD)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 0.1.1 | Identifier toutes les entités du domaine (User, Event, Signal, Reaction, Comment, ChatMessage, Notification, Friendship, Organization, OrganizationMember, RefreshToken, DataExportRequest, AuditLog) | 1h30 | CRITIQUE |
| 0.1.2 | Définir les relations (1-N, N-N) entre entités, y compris User↔Organization | 1h30 | CRITIQUE |
| 0.1.3 | Définir tous les champs, types, contraintes (NOT NULL, UNIQUE, DEFAULT) | 1h30 | CRITIQUE |
| 0.1.4 | Créer un ERD visuel (dbdiagram.io ou draw.io) — à inclure dans README | 1h | CRITIQUE |
| 0.1.5 | Valider le MPD en équipe avant d'écrire le premier schema.prisma | 30min | CRITIQUE |

**Livrable**: ERD validé par l'équipe + schema Prisma draft

---

### 0.2 — Setup Infrastructure locale

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 0.2.1 | Créer `docker-compose.yml` avec service PostgreSQL | 30min | CRITIQUE |
| 0.2.2 | Configurer variables d'environnement (`.env` + `.env.example`) | 30min | CRITIQUE |
| 0.2.3 | Vérifier que `pnpm run start:dev` boot correctement | 15min | CRITIQUE |
| 0.2.4 | Configurer le `.env.example` complet avec toutes les variables attendues | 30min | HAUTE |

**Variables `.env` requises (mises à jour):**
```
DATABASE_URL=postgresql://user:password@localhost:5432/dona
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
APP_PORT=3000
API_KEY=
TOTP_APP_NAME=Dona

# OAuth
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=
OAUTH_GITHUB_CLIENT_ID=
OAUTH_GITHUB_CLIENT_SECRET=
OAUTH_42_CLIENT_ID=
OAUTH_42_CLIENT_SECRET=
OAUTH_CALLBACK_BASE_URL=

# IA
AI_PROVIDER_API_KEY=
AI_IMAGE_RECOGNITION_MODEL=
AI_MODERATION_MODEL=
AI_RAG_VECTOR_STORE_URL=

# Routing / Recommandation
ROUTING_ENGINE_URL=
ROUTING_ENGINE_API_KEY=

# Secrets management
VAULT_ADDR=
VAULT_TOKEN=

# Monitoring
PROMETHEUS_METRICS_PATH=/metrics

# Mail (RGPD / confirmations)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

---

### 0.3 — Setup Prisma + Schéma de Base de Données

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 0.3.1 | Installer Prisma (`@prisma/client`, `prisma`) | 15min | CRITIQUE |
| 0.3.2 | Initialiser Prisma (`npx prisma init`) | 10min | CRITIQUE |
| 0.3.3 | Écrire le `schema.prisma` complet (voir modèle mis à jour ci-dessous) | 3h | CRITIQUE |
| 0.3.4 | Créer la première migration (`npx prisma migrate dev --name init`) | 15min | CRITIQUE |
| 0.3.5 | Créer le `PrismaModule` et `PrismaService` globaux dans NestJS | 30min | CRITIQUE |
| 0.3.6 | Ajouter `PrismaModule` à `AppModule` en global | 15min | HAUTE |
| 0.3.7 | Vérifier la connexion DB au démarrage (logs) | 15min | HAUTE |
| 0.3.8 | Ajouter les index nécessaires (géoloc, recherche, org lookup) | 45min | HAUTE |

**Draft `schema.prisma` (mis à jour):**
```prisma
model User {
  id              String   @id @default(uuid())
  email           String   @unique
  username        String   @unique
  passwordHash    String?
  avatar          String?
  role            GlobalRole @default(USER)
  locale          String   @default("fr")
  isOnline        Boolean  @default(false)
  reputationScore Int      @default(0)
  twoFaSecret     String?
  twoFaEnabled    Boolean  @default(false)

  oauthProvider   OAuthProvider?
  oauthId         String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  events          Event[]
  signals         EventSignal[]
  reactions       EventReaction[]
  comments        EventComment[]
  chatMessages    ChatMessage[]
  notifications   Notification[]
  friendsAsA      Friendship[]   @relation("FriendA")
  friendsAsB      Friendship[]   @relation("FriendB")
  refreshTokens   RefreshToken[]
  organizations   OrganizationMember[]
  dataExportRequests DataExportRequest[]
  auditLogs       AuditLog[]
  blockedUsers    BlockedUser[]  @relation("Blocker")
  blockedBy       BlockedUser[]  @relation("Blocked")

  @@unique([oauthProvider, oauthId])
}

enum GlobalRole { USER MODERATOR ADMIN }
enum OAuthProvider { GOOGLE GITHUB FORTYTWO }

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  tokenHash String
  revoked   Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Organization {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  logo        String?
  verified    Boolean  @default(false)
  createdAt   DateTime @default(now())

  members     OrganizationMember[]
  validatedEvents Event[] @relation("OrgValidatedEvents")
}

model OrganizationMember {
  id             String            @id @default(uuid())
  organizationId String
  userId         String
  role           OrganizationRole  @default(MEMBER)
  joinedAt       DateTime          @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
}

enum OrganizationRole { ORG_ADMIN ORG_MODERATOR MEMBER }

model Event {
  id              String      @id @default(uuid())
  type            EventType
  latitude        Float
  longitude       Float
  description     String?
  expiresAt       DateTime?
  veracityScore   Float       @default(0)
  aiImageVerdict  AiVerdict?
  aiImageConfidence Float?
  moderationStatus ModerationStatus @default(APPROVED)
  createdAt       DateTime    @default(now())
  createdBy       String
  user            User        @relation(fields: [createdBy], references: [id])

  validatedByOrgId String?
  validatedByOrg   Organization? @relation("OrgValidatedEvents", fields: [validatedByOrgId], references: [id])

  signals         EventSignal[]
  reactions       EventReaction[]
  comments        EventComment[]
  chatMessages    ChatMessage[]
  attachments     EventAttachment[]
}

enum EventType {
  ACCIDENT TRAFFIC_JAM POLICE OBSTACLE ROAD_CLOSED HAZARD OTHER
}

enum AiVerdict { MATCH MISMATCH UNCERTAIN }
enum ModerationStatus { PENDING APPROVED FLAGGED REMOVED }

model EventAttachment {
  id        String   @id @default(uuid())
  eventId   String
  url       String
  mimeType  String
  createdAt DateTime @default(now())
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

model EventSignal {
  id        String   @id @default(uuid())
  eventId   String
  userId    String
  createdAt DateTime @default(now())
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])

  @@unique([eventId, userId])
}

model EventReaction {
  id        String         @id @default(uuid())
  eventId   String
  userId    String
  type      ReactionType
  createdAt DateTime       @default(now())
  event     Event          @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User           @relation(fields: [userId], references: [id])

  @@unique([eventId, userId])
}

enum ReactionType { STILL_THERE RESOLVED }

model EventComment {
  id        String   @id @default(uuid())
  eventId   String
  userId    String
  content   String
  moderationStatus ModerationStatus @default(APPROVED)
  createdAt DateTime @default(now())
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
}

model ChatMessage {
  id        String   @id @default(uuid())
  eventId   String
  userId    String
  content   String
  moderationStatus ModerationStatus @default(APPROVED)
  createdAt DateTime @default(now())
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
}

model BlockedUser {
  id         String   @id @default(uuid())
  blockerId  String
  blockedId  String
  createdAt  DateTime @default(now())
  blocker    User     @relation("Blocker", fields: [blockerId], references: [id])
  blocked    User     @relation("Blocked", fields: [blockedId], references: [id])

  @@unique([blockerId, blockedId])
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  payload   Json
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())
  user      User             @relation(fields: [userId], references: [id])
}

enum NotificationType {
  NEW_SIGNAL NEW_REACTION NEW_COMMENT FRIEND_REQUEST FRIEND_ACCEPTED
  NEARBY_EVENT ORG_VALIDATION MODERATION_ALERT DATA_EXPORT_READY
}

model Friendship {
  id        String           @id @default(uuid())
  userAId   String
  userBId   String
  status    FriendshipStatus @default(PENDING)
  createdAt DateTime         @default(now())
  userA     User             @relation("FriendA", fields: [userAId], references: [id])
  userB     User             @relation("FriendB", fields: [userBId], references: [id])

  @@unique([userAId, userBId])
}

enum FriendshipStatus { PENDING ACCEPTED BLOCKED }

model DataExportRequest {
  id          String   @id @default(uuid())
  userId      String
  status      ExportStatus @default(PENDING)
  fileUrl     String?
  requestedAt DateTime @default(now())
  completedAt DateTime?
  user        User     @relation(fields: [userId], references: [id])
}

enum ExportStatus { PENDING PROCESSING READY FAILED }

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String
  metadata  Json?
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id])
}
```

---

### 0.4 — Architecture NestJS — Structure des modules

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 0.4.1 | Définir l'arborescence des modules NestJS | 45min | HAUTE |
| 0.4.2 | Créer les dossiers vides de chaque module avec fichier index | 30min | HAUTE |
| 0.4.3 | Configurer les barrel exports (`index.ts`) par module | 20min | MOYENNE |

**Structure cible (mise à jour):**
```
src/
  modules/
    auth/               # JWT auth, login, register, refresh, 2FA, OAuth
    users/              # CRUD users, profile, avatar, online status
    organizations/       # Organisations, membres, rôles, validation officielle
    events/             # Road events CRUD + types + veracité
    signals/            # Event confirmation signals
    reactions/          # Event reactions (STILL_THERE / RESOLVED)
    comments/           # Event comments
    chat/               # WebSocket real-time chat per event
    notifications/      # Notification system
    friends/            # Friendship system (add/remove/list/block)
    search/             # Recherche avancée (filtres, tri, pagination)
    ai-moderation/       # Modération automatique de contenu
    ai-image-recognition/ # Vérification photo ↔ catégorie
    recommendation/      # Recalcul d'itinéraire évitant zones à risque (module custom)
    analytics/           # Dashboard, heatmap, exports de données
    gdpr/                # Export / suppression de données personnelles
    public-api/          # Endpoints API Key sécurisés
    health/              # Health check + metrics
  common/
    decorators/          # Custom decorators (CurrentUser, Roles, OrgRole, ApiKey...)
    guards/              # JwtAuthGuard, RolesGuard, OrgRolesGuard, ApiKeyGuard
    interceptors/        # Response transform, logging, audit
    filters/             # Global exception filters
    pipes/               # Validation pipes
    i18n/                 # Fichiers de traduction, service de locale
    prisma/               # PrismaModule + PrismaService
  config/                # app, swagger, env.schema
```

---

### 0.5 — Setup Guards, Interceptors, Pipes globaux

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 0.5.1 | Configurer `ValidationPipe` global dans `main.ts` (whitelist, transform) | 20min | CRITIQUE |
| 0.5.2 | Créer `GlobalExceptionFilter` pour format d'erreur uniforme | 45min | HAUTE |
| 0.5.3 | Créer `TransformInterceptor` pour wrapper les réponses | 30min | HAUTE |
| 0.5.4 | Activer HTTPS (certificat auto-signé en dev, vrai cert en prod) | 1h | HAUTE |
| 0.5.5 | Créer `AuditLogInterceptor` (actions sensibles : suppression, modération, export RGPD) | 45min | HAUTE |

---

## PHASE 1 — AUTHENTIFICATION (AUTH MODULE)

> Dépendance de TOUT le reste. À faire en premier après les fondations.

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 1.1 | Installer `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt` | 15min | CRITIQUE |
| 1.2 | Créer `AuthModule` avec imports JWT + Passport | 30min | CRITIQUE |
| 1.3 | Créer `AuthService` — méthode `register(dto)` | 45min | CRITIQUE |
| 1.4 | Hachage du mot de passe avec `bcrypt` (salt rounds = 12) | 20min | CRITIQUE |
| 1.5 | Créer `AuthService` — méthode `login(dto)` → access + refresh tokens | 45min | CRITIQUE |
| 1.6 | Créer `JwtStrategy` (validate payload, retourne user) | 30min | CRITIQUE |
| 1.7 | Créer `JwtAuthGuard` | 20min | CRITIQUE |
| 1.8 | Créer `AuthController` — `POST /auth/register` | 30min | CRITIQUE |
| 1.9 | Créer `AuthController` — `POST /auth/login` | 30min | CRITIQUE |
| 1.10 | Créer `AuthController` — `POST /auth/refresh` (refresh token, table `RefreshToken`) | 45min | CRITIQUE |
| 1.11 | Créer `AuthController` — `POST /auth/logout` (révoquer le refresh token en DB) | 30min | HAUTE |
| 1.12 | Créer DTO `RegisterDto`, `LoginDto` avec class-validator | 30min | CRITIQUE |
| 1.13 | Créer décorateur `@CurrentUser()` | 15min | HAUTE |
| 1.14 | Ajouter Swagger decorators sur tous les endpoints auth | 30min | HAUTE |
| 1.15 | Écrire tests unitaires `AuthService` | 1h | MOYENNE |
| 1.16 | Endpoint `POST /auth/logout-all` — révoquer tous les refresh tokens d'un user | 20min | MOYENNE |

**Endpoints Auth:**
```
POST /auth/register       { email, username, password }
POST /auth/login          { email, password }
POST /auth/refresh        { refreshToken }
POST /auth/logout
POST /auth/logout-all
GET  /auth/me             (protégé JWT) → retourne user courant
```

---

## PHASE 2 — OAUTH 2.0 (Connexion via Google / GitHub / 42)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 2.1 | Installer `passport-google-oauth20`, `passport-github2`, stratégie 42 custom | 30min | HAUTE |
| 2.2 | Créer `GoogleStrategy` + config callback | 45min | HAUTE |
| 2.3 | Créer `GithubStrategy` + config callback | 45min | HAUTE |
| 2.4 | Créer `FortyTwoStrategy` (OAuth2 générique) | 45min | HAUTE |
| 2.5 | `GET /auth/oauth/:provider` — redirection vers le provider | 30min | HAUTE |
| 2.6 | `GET /auth/oauth/:provider/callback` — création/liaison de compte + émission JWT | 1h | HAUTE |
| 2.7 | Gérer le cas email déjà existant (lier compte OAuth à compte existant) | 45min | HAUTE |
| 2.8 | Tests manuels des 3 providers en environnement de dev | 45min | MOYENNE |

**Endpoints OAuth:**
```
GET /auth/oauth/google
GET /auth/oauth/google/callback
GET /auth/oauth/github
GET /auth/oauth/github/callback
GET /auth/oauth/42
GET /auth/oauth/42/callback
```

---

## PHASE 3 — MODULE 2FA (Two-Factor Authentication)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 3.1 | Installer `otplib`, `qrcode` | 10min | HAUTE |
| 3.2 | `POST /auth/2fa/generate` — générer un secret TOTP + QR code | 45min | HAUTE |
| 3.3 | `POST /auth/2fa/enable` — vérifier code TOTP + activer 2FA | 30min | HAUTE |
| 3.4 | `POST /auth/2fa/disable` — désactiver 2FA (avec vérif code) | 20min | HAUTE |
| 3.5 | `POST /auth/2fa/verify` — vérifier code lors du login | 30min | HAUTE |
| 3.6 | Adapter le flow de login : si 2FA activé → retourner token partiel | 45min | HAUTE |
| 3.7 | Créer guard `TwoFaGuard` pour routes nécessitant 2FA complet | 30min | HAUTE |

---

## PHASE 4 — MODULE USERS (Profil + Avatar + Online Status)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 4.1 | Créer `UsersModule`, `UsersService`, `UsersController` | 30min | HAUTE |
| 4.2 | `GET /users/:id` — voir le profil d'un utilisateur | 30min | HAUTE |
| 4.3 | `PATCH /users/me` — mettre à jour son propre profil (username, bio, locale) | 30min | HAUTE |
| 4.4 | `POST /users/me/avatar` — upload d'avatar (multipart/form-data) | 1h | HAUTE |
| 4.5 | Stocker l'avatar (local storage d'abord, S3 en bonus) | 45min | HAUTE |
| 4.6 | Avatar par défaut si aucun fourni (URL gravatar ou asset local) | 20min | HAUTE |
| 4.7 | `GET /users` — liste des utilisateurs (avec pagination) | 30min | MOYENNE |
| 4.8 | Mise à jour `isOnline` via WebSocket connect/disconnect | 30min | HAUTE |
| 4.9 | `GET /users/:id/friends` — liste des amis d'un user | 30min | MOYENNE |
| 4.10 | `GET /users/:id/reputation` — score de notoriété + historique | 30min | HAUTE |
| 4.11 | Logique métier : incrémenter `reputationScore` quand un signalement de l'user atteint un seuil de véracité confirmée | 1h | HAUTE |
| 4.12 | Ajouter Swagger decorators sur tous les endpoints | 20min | HAUTE |
| 4.13 | Créer DTOs (`UpdateUserDto`, `UserResponseDto`) | 30min | HAUTE |

---

## PHASE 5 — MODULE ORGANIZATIONS (Comptes officiels)

> Permet à une mairie, la police, ou une société de transport d'avoir un compte organisation qui valide officiellement des signalements. Rend l'app crédible pour un usage réel.

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 5.1 | Créer `OrganizationsModule`, `OrganizationsService`, `OrganizationsController` | 30min | HAUTE |
| 5.2 | `POST /organizations` — créer une organisation (créateur devient ORG_ADMIN) | 45min | HAUTE |
| 5.3 | `GET /organizations/:id` — détail d'une organisation | 20min | HAUTE |
| 5.4 | `PATCH /organizations/:id` — modifier (nom, description, logo) — ORG_ADMIN uniquement | 30min | HAUTE |
| 5.5 | `DELETE /organizations/:id` — supprimer (ORG_ADMIN uniquement) | 20min | HAUTE |
| 5.6 | `POST /organizations/:id/members` — ajouter un membre (par email/username) | 30min | HAUTE |
| 5.7 | `DELETE /organizations/:id/members/:userId` — retirer un membre | 20min | HAUTE |
| 5.8 | `PATCH /organizations/:id/members/:userId/role` — changer le rôle d'un membre | 20min | HAUTE |
| 5.9 | `GET /organizations/:id/members` — liste des membres | 20min | HAUTE |
| 5.10 | `GET /organizations` — liste/recherche d'organisations (avec statut vérifié) | 30min | MOYENNE |
| 5.11 | `POST /organizations/:id/events/:eventId/validate` — validation officielle d'un signalement | 45min | HAUTE |
| 5.12 | Créer `OrgRolesGuard` + décorateur `@OrgRole()` | 45min | HAUTE |
| 5.13 | Notifier l'auteur du signalement lors d'une validation officielle | 20min | HAUTE |
| 5.14 | Ajouter Swagger decorators + DTOs | 30min | HAUTE |

---

## PHASE 6 — MODULE PERMISSIONS AVANCEES (RBAC global)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 6.1 | Créer `RolesGuard` + décorateur `@Roles()` (global : USER / MODERATOR / ADMIN) | 30min | HAUTE |
| 6.2 | `GET /admin/users` — liste complète des utilisateurs (ADMIN) | 30min | HAUTE |
| 6.3 | `PATCH /admin/users/:id/role` — changer le rôle global d'un user (ADMIN) | 20min | HAUTE |
| 6.4 | `DELETE /admin/users/:id` — suppression d'un compte (ADMIN) | 20min | HAUTE |
| 6.5 | `PATCH /admin/events/:id/moderate` — approuver/supprimer un event (MODERATOR/ADMIN) | 30min | HAUTE |
| 6.6 | `GET /admin/audit-logs` — consultation des logs d'audit (ADMIN) | 30min | MOYENNE |
| 6.7 | Vues différenciées selon rôle (réponses API filtrées selon permissions) | 45min | HAUTE |

---

## PHASE 7 — MODULE EVENTS (Signalisation Routière)

> Coeur métier de l'application.

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 7.1 | Créer `EventsModule`, `EventsService`, `EventsController` | 30min | CRITIQUE |
| 7.2 | `POST /events` — créer un événement (type, lat, lng, description?, pièces jointes) | 1h | CRITIQUE |
| 7.3 | `GET /events` — liste des événements actifs (avec filtres zone géo) | 1h | CRITIQUE |
| 7.4 | `GET /events/:id` — détail d'un événement | 30min | CRITIQUE |
| 7.5 | `DELETE /events/:id` — supprimer son propre événement (ou modérateur/admin) | 30min | HAUTE |
| 7.6 | Logique d'expiration des événements (champ `expiresAt`, TTL par défaut selon catégorie) | 45min | HAUTE |
| 7.7 | Filtre géographique : récupérer événements dans un rayon donné (Haversine formula) | 1h | HAUTE |
| 7.8 | Agréger le nombre de signaux par événement dans la réponse | 30min | HAUTE |
| 7.9 | Agréger le nombre de réactions (STILL_THERE / RESOLVED) | 30min | HAUTE |
| 7.10 | Calcul du `veracityScore` (algorithme : signaux + réactions + confiance IA + validation organisation) | 1h30 | CRITIQUE |
| 7.11 | Endpoint upload de pièce jointe (photo) lié à l'event (`EventAttachment`) | 45min | HAUTE |
| 7.12 | Validation type/poids des fichiers uploadés (image only, taille max) | 30min | HAUTE |
| 7.13 | Créer DTOs (`CreateEventDto`, `EventResponseDto`, `EventListQueryDto`) | 45min | CRITIQUE |
| 7.14 | Validation des coordonnées (lat: -90/90, lng: -180/180) | 20min | HAUTE |
| 7.15 | Ajouter Swagger decorators | 20min | HAUTE |
| 7.16 | Écrire tests unitaires `EventsService` (dont le calcul de véracité) | 1h30 | MOYENNE |

**Endpoints Events:**
```
POST   /events                       { type, latitude, longitude, description? }
POST   /events/:id/attachments       (multipart)
GET    /events                       ?lat=&lng=&radius=&type=&page=&limit=
GET    /events/:id
DELETE /events/:id
GET    /events/types                 → liste des types disponibles (enum)
```

---

## PHASE 8 — MODULE SIGNALS (Confirmations)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 8.1 | Créer `SignalsModule`, `SignalsService`, `SignalsController` | 20min | HAUTE |
| 8.2 | `POST /events/:id/signals` — confirmer un événement (1 signal par user) | 30min | HAUTE |
| 8.3 | `DELETE /events/:id/signals` — retirer sa confirmation | 20min | HAUTE |
| 8.4 | `GET /events/:id/signals/count` — nombre de confirmations | 15min | HAUTE |
| 8.5 | Règle métier : un user ne peut signaler qu'une fois le même event | 20min | CRITIQUE |
| 8.6 | Recalcul du `veracityScore` de l'event à chaque nouveau signal | 30min | CRITIQUE |
| 8.7 | Émettre notification WebSocket lors d'un nouveau signal | 30min | HAUTE |
| 8.8 | Émettre notification DB (Notification table) pour le créateur | 30min | HAUTE |

---

## PHASE 9 — MODULE REACTIONS

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 9.1 | Créer `ReactionsModule`, `ReactionsService`, `ReactionsController` | 20min | HAUTE |
| 9.2 | `POST /events/:id/reactions` — réagir (STILL_THERE ou RESOLVED) | 30min | HAUTE |
| 9.3 | `PUT /events/:id/reactions` — changer sa réaction | 20min | HAUTE |
| 9.4 | `DELETE /events/:id/reactions` — retirer sa réaction | 20min | HAUTE |
| 9.5 | `GET /events/:id/reactions` — résumé des réactions | 20min | HAUTE |
| 9.6 | Règle : 1 seule réaction par user par événement (upsert) | 20min | CRITIQUE |
| 9.7 | Recalcul du `veracityScore` selon ratio STILL_THERE / RESOLVED | 30min | HAUTE |

---

## PHASE 10 — MODULE COMMENTS

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 10.1 | Créer `CommentsModule`, `CommentsService`, `CommentsController` | 20min | HAUTE |
| 10.2 | `POST /events/:id/comments` — ajouter un commentaire | 30min | HAUTE |
| 10.3 | `GET /events/:id/comments` — liste paginée des commentaires | 30min | HAUTE |
| 10.4 | `DELETE /events/:id/comments/:commentId` — supprimer son commentaire (ou modérateur) | 20min | HAUTE |
| 10.5 | Validation : max 500 caractères par commentaire | 10min | HAUTE |
| 10.6 | Passage automatique du commentaire par le module de modération IA avant publication | 30min | HAUTE |
| 10.7 | Émettre événement WebSocket nouveaux commentaires | 30min | HAUTE |

---

## PHASE 11 — MODULE CHAT (WebSocket — TEMPS REEL)

> Nécessite installation `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 11.1 | Installer `@nestjs/websockets`, `@nestjs/platform-socket.io` | 15min | CRITIQUE |
| 11.2 | Créer `ChatModule` et `ChatGateway` (Socket.io Gateway) | 45min | CRITIQUE |
| 11.3 | Authentifier les connexions WebSocket via JWT (middleware WS) | 1h | CRITIQUE |
| 11.4 | Gérer `connection` event → ajouter user aux rooms | 30min | CRITIQUE |
| 11.5 | Gérer `disconnection` event → mettre `isOnline = false` | 30min | CRITIQUE |
| 11.6 | Event `join-event-chat` → rejoindre le canal d'un event point | 30min | HAUTE |
| 11.7 | Event `leave-event-chat` → quitter le canal | 15min | HAUTE |
| 11.8 | Event `send-message` → envoyer un message dans un canal event | 30min | CRITIQUE |
| 11.9 | Filtrage anti-spam / modération IA avant broadcast | 30min | HAUTE |
| 11.10 | Persister les messages dans `ChatMessage` (DB) | 30min | CRITIQUE |
| 11.11 | Exclure les messages des utilisateurs bloqués (table `BlockedUser`) | 30min | HAUTE |
| 11.12 | `GET /events/:id/chat/history` — historique des messages (paginé) | 30min | HAUTE |
| 11.13 | Broadcaster les nouveaux messages à tous les users du canal | 30min | CRITIQUE |
| 11.14 | Broadcaster les nouvelles signalisations en temps réel | 30min | HAUTE |
| 11.15 | Broadcaster les réactions en temps réel | 20min | HAUTE |
| 11.16 | Indicateurs "en train d'écrire" (`typing`) et accusés de lecture (`read`) | 45min | MOYENNE |
| 11.17 | Gérer les erreurs de connexion/déconnexion gracieusement (reconnexion) | 30min | HAUTE |

**Événements WebSocket:**
```
Client → Server:
  join-event-chat    { eventId }
  leave-event-chat   { eventId }
  send-message       { eventId, content }
  typing             { eventId }
  read               { eventId, messageId }

Server → Client:
  new-message        { id, eventId, user, content, createdAt }
  new-signal         { eventId, signalCount, veracityScore }
  new-reaction       { eventId, reactions }
  new-comment        { eventId, comment }
  user-online-status { userId, isOnline }
  user-typing        { eventId, userId }
  message-read       { eventId, messageId, userId }
  org-validation      { eventId, organizationId }
```

---

## PHASE 12 — MODULE FRIENDS (Système d'amis + blocage)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 12.1 | Créer `FriendsModule`, `FriendsService`, `FriendsController` | 20min | HAUTE |
| 12.2 | `POST /friends/request/:userId` — envoyer une demande d'amitié | 30min | HAUTE |
| 12.3 | `POST /friends/accept/:friendshipId` — accepter une demande | 20min | HAUTE |
| 12.4 | `DELETE /friends/reject/:friendshipId` — refuser/annuler | 20min | HAUTE |
| 12.5 | `DELETE /friends/:userId` — supprimer un ami | 20min | HAUTE |
| 12.6 | `GET /friends` — liste de ses amis avec statut en ligne | 30min | HAUTE |
| 12.7 | `GET /friends/requests` — liste des demandes reçues | 20min | HAUTE |
| 12.8 | `POST /friends/block/:userId` — bloquer un utilisateur | 20min | HAUTE |
| 12.9 | `DELETE /friends/block/:userId` — débloquer | 15min | HAUTE |
| 12.10 | `GET /friends/blocked` — liste des utilisateurs bloqués | 15min | MOYENNE |
| 12.11 | Notifier l'utilisateur cible lors d'une demande d'amitié | 20min | HAUTE |
| 12.12 | Notifier lors de l'acceptation | 20min | HAUTE |

---

## PHASE 13 — MODULE NOTIFICATIONS

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 13.1 | Créer `NotificationsModule`, `NotificationsService` | 20min | HAUTE |
| 13.2 | `GET /notifications` — liste des notifications (paginées) | 30min | HAUTE |
| 13.3 | `PATCH /notifications/:id/read` — marquer comme lue | 20min | HAUTE |
| 13.4 | `PATCH /notifications/read-all` — tout marquer comme lu | 20min | HAUTE |
| 13.5 | `GET /notifications/unread-count` — nombre de non lues | 15min | HAUTE |
| 13.6 | `NotificationsService.create()` — méthode réutilisable | 30min | CRITIQUE |
| 13.7 | Pousser notification via WebSocket en temps réel (`notification` event) | 30min | HAUTE |
| 13.8 | Notification géo-déclenchée : alerte si un event apparaît près du trajet suivi de l'utilisateur | 1h | HAUTE |
| 13.9 | Notification de modération (contenu flaggé/supprimé) | 20min | HAUTE |
| 13.10 | Notification "export de données prêt" (RGPD) | 20min | MOYENNE |

---

## PHASE 14 — RECHERCHE AVANCEE (Search Module)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 14.1 | Créer `SearchModule`, `SearchService`, `SearchController` | 20min | HAUTE |
| 14.2 | `GET /search/events` — filtres combinés (type, période, zone, statut de véracité) | 1h | HAUTE |
| 14.3 | Tri des résultats (date, véracité, distance) | 30min | HAUTE |
| 14.4 | Pagination standardisée (page, limit, total, hasNext) | 30min | HAUTE |
| 14.5 | Indexation DB pour accélérer les recherches géo/texte | 45min | HAUTE |

---

## PHASE 15 — INTELLIGENCE ARTIFICIELLE : MODERATION DE CONTENU

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 15.1 | Créer `AiModerationModule`, `AiModerationService` | 30min | HAUTE |
| 15.2 | Intégration avec un fournisseur IA (analyse de texte) | 1h | HAUTE |
| 15.3 | Pipeline de modération : commentaires + messages de chat + descriptions d'événements | 1h | HAUTE |
| 15.4 | Statuts de modération (`PENDING`, `APPROVED`, `FLAGGED`, `REMOVED`) | 30min | HAUTE |
| 15.5 | Auto-suppression ou mise en attente selon le score de confiance | 45min | HAUTE |
| 15.6 | `GET /admin/moderation/queue` — file d'attente de contenu à valider manuellement | 30min | HAUTE |
| 15.7 | `PATCH /admin/moderation/:id/decision` — décision manuelle du modérateur | 30min | HAUTE |
| 15.8 | Notification à l'auteur en cas de contenu flaggé/supprimé | 20min | HAUTE |
| 15.9 | Tests avec cas limites (faux positifs / négatifs) | 45min | MOYENNE |

---

## PHASE 16 — INTELLIGENCE ARTIFICIELLE : RECONNAISSANCE D'IMAGE

> Vérifie que la photo jointe à un signalement correspond bien à la catégorie déclarée — renforce directement le score de véracité.

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 16.1 | Créer `AiImageRecognitionModule`, `AiImageRecognitionService` | 30min | HAUTE |
| 16.2 | Intégration avec un fournisseur IA (vision/classification d'image) | 1h | HAUTE |
| 16.3 | Déclenchement automatique de l'analyse à l'upload d'une pièce jointe | 45min | HAUTE |
| 16.4 | Stockage du verdict (`MATCH` / `MISMATCH` / `UNCERTAIN`) + score de confiance sur l'event | 30min | HAUTE |
| 16.5 | Pondération du verdict IA dans le calcul du `veracityScore` | 45min | CRITIQUE |
| 16.6 | Gestion des erreurs / timeouts de l'API IA (fallback `UNCERTAIN`) | 30min | HAUTE |
| 16.7 | Endpoint de re-analyse manuelle (modérateur) si contestation | 30min | MOYENNE |
| 16.8 | Documenter précisément le fonctionnement pour l'explication en soutenance | 30min | HAUTE |

---

## PHASE 17 — INTELLIGENCE ARTIFICIELLE : RECOMMANDATION D'ITINERAIRE (Module Custom)

> Fonctionnalité phare différenciante de Dona. Recalcule un itinéraire en évitant les zones à forte densité de signalements confirmés.

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 17.1 | Créer `RecommendationModule`, `RecommendationService` | 30min | HAUTE |
| 17.2 | Intégration avec un moteur de routage externe (OSRM/GraphHopper) | 1h30 | HAUTE |
| 17.3 | `POST /recommendation/route` — calcul d'un itinéraire de base entre deux points | 1h | HAUTE |
| 17.4 | Récupération des events à véracité confirmée le long du trajet | 45min | HAUTE |
| 17.5 | Algorithme de pondération : pénaliser les segments traversant une zone à risque | 1h30 | CRITIQUE |
| 17.6 | Proposer un itinéraire alternatif si la pénalité dépasse un seuil | 1h | HAUTE |
| 17.7 | `GET /recommendation/route/:id/alternatives` — comparer plusieurs itinéraires | 45min | MOYENNE |
| 17.8 | Historisation des recommandations pour analyse de pertinence (optionnel analytics) | 30min | MOYENNE |
| 17.9 | Rédiger la justification README (pourquoi Major, complexité technique, valeur ajoutée) | 30min | HAUTE |

---

## PHASE 18 — RGPD & GESTION DES DONNEES

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 18.1 | Créer `GdprModule`, `GdprService`, `GdprController` | 20min | HAUTE |
| 18.2 | `POST /gdpr/export-request` — demande d'export de ses données | 30min | HAUTE |
| 18.3 | Job asynchrone de génération de l'export (JSON complet des données utilisateur) | 1h | HAUTE |
| 18.4 | Envoi d'un email de confirmation avec lien de téléchargement | 45min | HAUTE |
| 18.5 | `DELETE /gdpr/account` — suppression de compte avec confirmation (soft delete + anonymisation) | 1h | HAUTE |
| 18.6 | Anonymisation des contenus liés (commentaires, messages) au lieu de suppression brute | 45min | HAUTE |
| 18.7 | Email de confirmation de suppression | 20min | HAUTE |
| 18.8 | `GET /gdpr/my-data` — consultation directe (sans export complet) | 20min | MOYENNE |
| 18.9 | Export/import de données en masse (JSON/CSV) pour usage analytique | 45min | MOYENNE |

---

## PHASE 19 — ANALYTICS & DASHBOARD

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 19.1 | Créer `AnalyticsModule`, `AnalyticsService`, `AnalyticsController` | 30min | HAUTE |
| 19.2 | `GET /analytics/heatmap` — densité de signalements par zone géographique | 1h | HAUTE |
| 19.3 | `GET /analytics/stats/overview` — statistiques globales (events créés, actifs, résolus) | 45min | HAUTE |
| 19.4 | `GET /analytics/stats/by-category` — répartition par type d'événement | 30min | HAUTE |
| 19.5 | `GET /analytics/stats/timeline` — évolution dans le temps (par jour/semaine) | 45min | HAUTE |
| 19.6 | Filtres par date et par zone sur tous les endpoints analytics | 30min | HAUTE |
| 19.7 | `GET /analytics/export` — export des données analytiques (CSV/PDF) | 1h | HAUTE |
| 19.8 | Restreindre l'accès aux analytics avancées (ADMIN / ORG_ADMIN) | 20min | HAUTE |

---

## PHASE 20 — INTERNATIONALISATION (Backend)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 20.1 | Installer `nestjs-i18n` (ou équivalent) | 15min | HAUTE |
| 20.2 | Créer les fichiers de traduction (fr, en, mg) pour messages d'erreur et notifications | 1h | HAUTE |
| 20.3 | Résoudre la locale depuis le header `Accept-Language` ou le champ `user.locale` | 30min | HAUTE |
| 20.4 | Traduire les libellés des `EventType` renvoyés par l'API | 30min | HAUTE |
| 20.5 | Traduire le contenu des notifications générées côté serveur | 30min | HAUTE |
| 20.6 | `PATCH /users/me/locale` — changer sa langue préférée | 15min | MOYENNE |

---

## PHASE 21 — PUBLIC API (API Key sécurisée)

> Module séparé exposant les données publiquement avec API Key + rate limiting

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 21.1 | Installer `@nestjs/throttler` pour rate limiting | 15min | HAUTE |
| 21.2 | Configurer ThrottlerModule globalement | 20min | HAUTE |
| 21.3 | Créer `ApiKeyGuard` — valide le header `x-api-key` | 30min | HAUTE |
| 21.4 | `GET /api/events` — liste publique des events actifs (+ filtres véracité) | 30min | HAUTE |
| 21.5 | `GET /api/events/:id` — détail public d'un event | 20min | HAUTE |
| 21.6 | `POST /api/events` — créer un event via API Key (ex : capteur externe, partenaire) | 20min | HAUTE |
| 21.7 | `PUT /api/events/:id` — mettre à jour un event | 20min | HAUTE |
| 21.8 | `DELETE /api/events/:id` — supprimer un event | 20min | HAUTE |
| 21.9 | `GET /api/analytics/summary` — statistiques publiques agrégées (organisations partenaires) | 30min | MOYENNE |
| 21.10 | Documenter l'API publique sur Swagger (tag `Public API`) | 30min | HAUTE |
| 21.11 | Tester le rate limiting (ex : 100 req/min par clé) | 20min | HAUTE |

---

## PHASE 22 — DEVOPS (Docker + Health + Monitoring)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 22.1 | Écrire `Dockerfile` multi-stage pour le backend | 1h | CRITIQUE |
| 22.2 | Écrire `docker-compose.yml` complet (api + postgres) | 1h | CRITIQUE |
| 22.3 | Configurer `docker-compose.prod.yml` (HTTPS, env prod) | 1h | HAUTE |
| 22.4 | Certificat HTTPS : Let's Encrypt ou self-signed pour dev | 1h | CRITIQUE |
| 22.5 | Tester le démarrage via `docker-compose up --build` | 30min | CRITIQUE |
| 22.6 | Compléter le module Health (déjà présent) avec check DB | 30min | HAUTE |
| 22.7 | Ajouter check Prisma/DB dans le health endpoint | 20min | HAUTE |
| 22.8 | Documenter la procédure de backup PostgreSQL | 30min | MOYENNE |
| 22.9 | Exposer un endpoint `/metrics` (format Prometheus) | 45min | HAUTE |
| 22.10 | Configurer Prometheus pour scraper l'API | 45min | HAUTE |
| 22.11 | Créer des dashboards Grafana (requêtes/s, latence, erreurs, connexions WS actives) | 1h30 | HAUTE |
| 22.12 | Configurer des règles d'alerte Grafana (ex : taux d'erreur élevé) | 45min | MOYENNE |
| 22.13 | Sécuriser l'accès à Grafana (authentification) | 30min | HAUTE |
| 22.14 | Procédure de sauvegarde automatisée + test de restauration | 1h | HAUTE |

---

## PHASE 23 — SECURITE RENFORCEE

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 23.1 | Installer `helmet` et l'activer dans `main.ts` | 15min | HAUTE |
| 23.2 | Vérifier la config CORS (origins whitelistés en prod) | 20min | HAUTE |
| 23.3 | Vérifier que tous les mots de passe sont bien hachés (bcrypt salt >= 12) | 20min | CRITIQUE |
| 23.4 | Vérifier que les tokens JWT ont une expiration courte (15min access) | 15min | HAUTE |
| 23.5 | Vérifier que les refresh tokens sont révocables (table `RefreshToken`) | 30min | HAUTE |
| 23.6 | Sanitizer toutes les entrées utilisateur (class-validator whitelist: true) | 20min | HAUTE |
| 23.7 | Vérifier qu'aucun champ sensible (passwordHash, twoFaSecret) n'est retourné dans les réponses | 30min | CRITIQUE |
| 23.8 | Créer `RolesGuard`/`OrgRolesGuard` + décorateurs associés | 30min | HAUTE |
| 23.9 | Implémenter la logique d'autorisation (owner, org, modérateur ou admin selon action) | 45min | HAUTE |
| 23.10 | Mettre en place un WAF/ModSecurity devant l'API (niveau infra/reverse proxy) | 1h30 | HAUTE |
| 23.11 | Externaliser les secrets dans HashiCorp Vault (API keys, JWT secrets, credentials DB) | 2h | HAUTE |
| 23.12 | Adapter le chargement de config pour lire depuis Vault au démarrage | 1h | HAUTE |
| 23.13 | Audit log sur les actions sensibles (suppression compte, changement de rôle, validation org) | 45min | HAUTE |

---

## PHASE 24 — TESTS

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 24.1 | Tests unitaires `AuthService` (register, login, token, OAuth, 2FA) | 2h | MOYENNE |
| 24.2 | Tests unitaires `EventsService` (dont calcul de véracité) | 1h30 | MOYENNE |
| 24.3 | Tests unitaires `OrganizationsService` | 1h | MOYENNE |
| 24.4 | Tests unitaires `AiModerationService` / `AiImageRecognitionService` (mock du fournisseur IA) | 1h30 | MOYENNE |
| 24.5 | Tests unitaires `RecommendationService` | 1h | MOYENNE |
| 24.6 | Tests e2e `AuthController` (register + login flow) | 1h | MOYENNE |
| 24.7 | Tests e2e `EventsController` (CRUD flow) | 1h | MOYENNE |
| 24.8 | Tests e2e flow complet (créer event → signaler → réagir → chat → véracité mise à jour) | 1h30 | MOYENNE |
| 24.9 | Configurer une DB de test séparée pour les e2e | 30min | MOYENNE |
| 24.10 | Test de charge basique sur les WebSockets (connexions simultanées) | 1h | MOYENNE |

---

## PHASE 25 — DOCUMENTATION FINALE

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 25.1 | Vérifier que TOUS les endpoints ont des decorators Swagger complets | 1h | CRITIQUE |
| 25.2 | Vérifier tous les DTOs documentés (ApiProperty sur chaque champ) | 1h | HAUTE |
| 25.3 | Tester le client généré par Swagger (pour le frontend) | 30min | HAUTE |
| 25.4 | Documenter les événements WebSocket dans README | 30min | HAUTE |
| 25.5 | Créer `docs/DATABASE.md` avec ERD + description des tables | 1h | HAUTE |
| 25.6 | Documenter l'algorithme de calcul de véracité et de notoriété | 45min | HAUTE |
| 25.7 | Documenter le fonctionnement de la recommandation d'itinéraire (justification module custom) | 45min | HAUTE |
| 25.8 | Documenter l'usage de l'IA (tâches concernées, prompts/modèles utilisés) pour la section Ressources | 30min | CRITIQUE |
| 25.9 | Mettre à jour le README principal avec les infos finales | 45min | HAUTE |

---

## RESUME ESTIMATION TOTALE

| Phase | Description | Estimation |
|-------|-------------|-----------|
| 0 | Fondations (MPD, infra, Prisma, architecture) | ~10h |
| 1 | Auth (JWT, register, login, refresh) | ~8h |
| 2 | OAuth 2.0 | ~5h |
| 3 | 2FA | ~4h |
| 4 | Users (profil, avatar, online, notoriété) | ~6h |
| 5 | Organizations | ~6h |
| 6 | Permissions avancées (RBAC) | ~3h |
| 7 | Events (CRUD, géo, filtres, véracité) | ~9h |
| 8 | Signals | ~3h |
| 9 | Reactions | ~2h30 |
| 10 | Comments | ~2h30 |
| 11 | Chat WebSocket | ~9h |
| 12 | Friends + blocage | ~4h30 |
| 13 | Notifications | ~4h |
| 14 | Recherche avancée | ~3h |
| 15 | IA — Modération de contenu | ~5h |
| 16 | IA — Reconnaissance d'image | ~4h30 |
| 17 | IA — Recommandation d'itinéraire (custom) | ~7h30 |
| 18 | RGPD | ~5h |
| 19 | Analytics & Dashboard | ~5h |
| 20 | Internationalisation backend | ~3h |
| 21 | Public API | ~4h |
| 22 | Devops (Docker, HTTPS, Monitoring) | ~10h |
| 23 | Sécurité renforcée (WAF, Vault) | ~9h |
| 24 | Tests | ~11h |
| 25 | Documentation finale | ~6h |
| **TOTAL** | | **~144h** |

---

## ORDRE DE PRIORITE ABSOLU (Chemin critique)

```
Phase 0 (Fondations + MPD + Prisma)
  → Phase 1 (Auth — TOUT dépend de ça)
    → Phase 2 (OAuth) ← après Auth stable
    → Phase 3 (2FA) ← après Auth stable
    → Phase 4 (Users)
    → Phase 5 (Organizations) ← après Users
      → Phase 6 (Permissions avancées / RBAC)
    → Phase 7 (Events) ← Coeur métier
      → Phase 8 (Signals)
      → Phase 9 (Reactions)
      → Phase 10 (Comments)
      → Phase 11 (Chat WebSocket) ← Module clé pour Real-time
      → Phase 14 (Recherche avancée)
      → Phase 15 (IA Modération) ← dépend Comments/Chat
      → Phase 16 (IA Reconnaissance d'image) ← dépend Events/Attachments
      → Phase 17 (IA Recommandation) ← dépend Events + véracité stabilisée
    → Phase 12 (Friends) ← Module User Interaction
    → Phase 13 (Notifications) ← dépend Auth + Events + Friends
    → Phase 18 (RGPD) ← après Users stable
    → Phase 19 (Analytics) ← après Events + IA stabilisés
    → Phase 20 (i18n backend)
    → Phase 21 (Public API) ← après Events stable
  → Phase 22 (Docker/DevOps/Monitoring)
  → Phase 23 (Sécurité renforcée : WAF/Vault)
  → Phase 24 (Tests)
  → Phase 25 (Docs finales)
```

---

## REGLES DE QUALITE (à respecter à chaque PR)

- [ ] Aucun `any` TypeScript sans justification
- [ ] Tous les endpoints testables via Swagger UI
- [ ] Validation des inputs avec `class-validator` sur chaque DTO
- [ ] Aucun secret dans le code source (tout dans `.env` ou Vault)
- [ ] Aucun champ sensible dans les réponses API (`passwordHash`, `twoFaSecret`, `oauthId`)
- [ ] Toute action sensible (suppression, modération, changement de rôle, validation org) est tracée dans `AuditLog`
- [ ] Tout contenu généré par un utilisateur (commentaire, message, description) passe par la modération avant diffusion publique large
- [ ] Commit messages conventionnels (`feat:`, `fix:`, `refactor:`, `docs:`)
- [ ] Au moins 1 reviewer par PR
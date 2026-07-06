# BACKEND TODO — Dona API (NestJS + Prisma + PostgreSQL + JWT)

> Stack: NestJS · Swagger · Prisma · JWT Auth · PostgreSQL · Socket.io (WebSockets)
> Chaque tâche a une estimation en heures pour Trello.

---

## PHASE 0 — FONDATIONS (AVANT TOUT CODE METIER)

> Ces tâches DOIVENT être faites avant d'implémenter la moindre feature.
> Un bug ici = refactoring douloureux partout.

---

### 0.1 — Modélisation des Données (MPD / ERD)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 0.1.1 | Identifier toutes les entités du domaine (User, Event, Signal, Reaction, Comment, ChatMessage, Notification, Friendship) | 1h | CRITIQUE |
| 0.1.2 | Définir les relations (1-N, N-N) entre entités | 1h | CRITIQUE |
| 0.1.3 | Définir tous les champs, types, contraintes (NOT NULL, UNIQUE, DEFAULT) | 1h | CRITIQUE |
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
| 0.2.4 | Configurer le `.env.example` complet avec toutes les variables attendues | 20min | HAUTE |

**Variables `.env` requises:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/dona
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
APP_PORT=3000
API_KEY=
TOTP_APP_NAME=Dona
```

---

### 0.3 — Setup Prisma + Schéma de Base de Données

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 0.3.1 | Installer Prisma (`@prisma/client`, `prisma`) | 15min | CRITIQUE |
| 0.3.2 | Initialiser Prisma (`npx prisma init`) | 10min | CRITIQUE |
| 0.3.3 | Écrire le `schema.prisma` complet (voir modèle ci-dessous) | 2h | CRITIQUE |
| 0.3.4 | Créer la première migration (`npx prisma migrate dev --name init`) | 15min | CRITIQUE |
| 0.3.5 | Créer le `PrismaModule` et `PrismaService` globaux dans NestJS | 30min | CRITIQUE |
| 0.3.6 | Ajouter `PrismaModule` à `AppModule` en global | 15min | HAUTE |
| 0.3.7 | Vérifier la connexion DB au démarrage (logs) | 15min | HAUTE |

**Draft `schema.prisma`:**
```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  username     String   @unique
  passwordHash String
  avatar       String?
  role         Role     @default(USER)
  isOnline     Boolean  @default(false)
  twoFaSecret  String?
  twoFaEnabled Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  events       Event[]
  signals      EventSignal[]
  reactions    EventReaction[]
  comments     EventComment[]
  chatMessages ChatMessage[]
  notifications Notification[]
  friendsAsA   Friendship[]   @relation("FriendA")
  friendsAsB   Friendship[]   @relation("FriendB")
}

enum Role { USER ADMIN MODERATOR }

model Event {
  id          String      @id @default(uuid())
  type        EventType
  latitude    Float
  longitude   Float
  description String?
  expiresAt   DateTime?
  createdAt   DateTime    @default(now())
  createdBy   String
  user        User        @relation(fields: [createdBy], references: [id])

  signals     EventSignal[]
  reactions   EventReaction[]
  comments    EventComment[]
  chatMessages ChatMessage[]
}

enum EventType {
  ACCIDENT TRAFFIC_JAM POLICE OBSTACLE ROAD_CLOSED HAZARD OTHER
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
  createdAt DateTime @default(now())
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
}

model ChatMessage {
  id        String   @id @default(uuid())
  eventId   String
  userId    String
  content   String
  createdAt DateTime @default(now())
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
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
```

---

### 0.4 — Architecture NestJS — Structure des modules

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 0.4.1 | Définir l'arborescence des modules NestJS | 30min | HAUTE |
| 0.4.2 | Créer les dossiers vides de chaque module avec fichier index | 30min | HAUTE |
| 0.4.3 | Configurer les barrel exports (`index.ts`) par module | 20min | MOYENNE |

**Structure cible:**
```
src/
  modules/
    auth/           # JWT auth, login, register, refresh, 2FA
    users/          # CRUD users, profile, avatar, online status
    events/         # Road events CRUD + types
    signals/        # Event confirmation signals
    reactions/      # Event reactions (STILL_THERE / RESOLVED)
    comments/       # Event comments
    chat/           # WebSocket real-time chat per event
    notifications/  # Notification system
    friends/        # Friendship system (add/remove/list)
    public-api/     # API key secured endpoints
    health/         # Health check (already exists)
  common/
    decorators/     # Custom decorators (CurrentUser, Roles, ApiKey...)
    guards/         # JwtAuthGuard, RolesGuard, ApiKeyGuard
    interceptors/   # Response transform, logging
    filters/        # Global exception filters
    pipes/          # Validation pipes
    prisma/         # PrismaModule + PrismaService
  config/           # Already exists (app, swagger, env.schema)
```

---

### 0.5 — Setup Guards, Interceptors, Pipes globaux

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 0.5.1 | Configurer `ValidationPipe` global dans `main.ts` (whitelist, transform) | 20min | CRITIQUE |
| 0.5.2 | Créer `GlobalExceptionFilter` pour format d'erreur uniforme | 45min | HAUTE |
| 0.5.3 | Créer `TransformInterceptor` pour wrapper les réponses | 30min | HAUTE |
| 0.5.4 | Activer HTTPS (certificat auto-signé en dev, vrai cert en prod) | 1h | HAUTE |

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
| 1.10 | Créer `AuthController` — `POST /auth/refresh` (refresh token) | 30min | CRITIQUE |
| 1.11 | Créer `AuthController` — `POST /auth/logout` (invalidate refresh) | 20min | HAUTE |
| 1.12 | Créer DTO `RegisterDto`, `LoginDto` avec class-validator | 30min | CRITIQUE |
| 1.13 | Créer décorateur `@CurrentUser()` | 15min | HAUTE |
| 1.14 | Ajouter Swagger decorators sur tous les endpoints auth | 30min | HAUTE |
| 1.15 | Écrire tests unitaires `AuthService` | 1h | MOYENNE |

**Endpoints Auth:**
```
POST /auth/register    { email, username, password }
POST /auth/login       { email, password }
POST /auth/refresh     { refreshToken }
POST /auth/logout
GET  /auth/me          (protégé JWT) → retourne user courant
```

---

## PHASE 2 — MODULE USERS (Profil + Avatar + Online Status)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 2.1 | Créer `UsersModule`, `UsersService`, `UsersController` | 30min | HAUTE |
| 2.2 | `GET /users/:id` — voir le profil d'un utilisateur | 30min | HAUTE |
| 2.3 | `PATCH /users/me` — mettre à jour son propre profil (username, bio) | 30min | HAUTE |
| 2.4 | `POST /users/me/avatar` — upload d'avatar (multipart/form-data) | 1h | HAUTE |
| 2.5 | Stocker l'avatar (local storage d'abord, S3 en bonus) | 45min | HAUTE |
| 2.6 | Avatar par défaut si aucun fourni (URL gravatar ou asset local) | 20min | HAUTE |
| 2.7 | `GET /users` — liste des utilisateurs (avec pagination) | 30min | MOYENNE |
| 2.8 | Mise à jour `isOnline` via WebSocket connect/disconnect | 30min | HAUTE |
| 2.9 | `GET /users/:id/friends` — liste des amis d'un user | 30min | MOYENNE |
| 2.10 | Ajouter Swagger decorators sur tous les endpoints | 20min | HAUTE |
| 2.11 | Créer DTOs (`UpdateUserDto`, `UserResponseDto`) | 30min | HAUTE |

---

## PHASE 3 — MODULE EVENTS (Signalisation Routière)

> Coeur métier de l'application.

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 3.1 | Créer `EventsModule`, `EventsService`, `EventsController` | 30min | CRITIQUE |
| 3.2 | `POST /events` — créer un événement (type, lat, lng, description?) | 45min | CRITIQUE |
| 3.3 | `GET /events` — liste des événements actifs (avec filtres zone géo) | 1h | CRITIQUE |
| 3.4 | `GET /events/:id` — détail d'un événement | 30min | CRITIQUE |
| 3.5 | `DELETE /events/:id` — supprimer son propre événement (ou admin) | 30min | HAUTE |
| 3.6 | Logique d'expiration des événements (champ `expiresAt`, TTL 2h par défaut) | 45min | HAUTE |
| 3.7 | Filtre géographique: récupérer événements dans un rayon donné (Haversine formula) | 1h | HAUTE |
| 3.8 | Agréger le nombre de signaux par événement dans la réponse | 30min | HAUTE |
| 3.9 | Agréger le nombre de réactions (STILL_THERE / RESOLVED) | 30min | HAUTE |
| 3.10 | Créer DTOs (`CreateEventDto`, `EventResponseDto`, `EventListQueryDto`) | 45min | CRITIQUE |
| 3.11 | Validation des coordonnées (lat: -90/90, lng: -180/180) | 20min | HAUTE |
| 3.12 | Ajouter Swagger decorators | 20min | HAUTE |
| 3.13 | Écrire tests unitaires `EventsService` | 1h | MOYENNE |

**Endpoints Events:**
```
POST   /events                { type, latitude, longitude, description? }
GET    /events                ?lat=&lng=&radius=&type=&page=&limit=
GET    /events/:id
DELETE /events/:id
GET    /events/types          → liste des types disponibles (enum)
```

---

## PHASE 4 — MODULE SIGNALS (Confirmations)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 4.1 | Créer `SignalsModule`, `SignalsService`, `SignalsController` | 20min | HAUTE |
| 4.2 | `POST /events/:id/signals` — confirmer un événement (1 signal par user) | 30min | HAUTE |
| 4.3 | `DELETE /events/:id/signals` — retirer sa confirmation | 20min | HAUTE |
| 4.4 | `GET /events/:id/signals/count` — nombre de confirmations | 15min | HAUTE |
| 4.5 | Règle métier: un user ne peut signaler qu'une fois le même event | 20min | CRITIQUE |
| 4.6 | Émettre notification WebSocket lors d'un nouveau signal | 30min | HAUTE |
| 4.7 | Émettre notification DB (Notification table) pour le créateur | 30min | HAUTE |

---

## PHASE 5 — MODULE REACTIONS

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 5.1 | Créer `ReactionsModule`, `ReactionsService`, `ReactionsController` | 20min | HAUTE |
| 5.2 | `POST /events/:id/reactions` — réagir (STILL_THERE ou RESOLVED) | 30min | HAUTE |
| 5.3 | `PUT /events/:id/reactions` — changer sa réaction | 20min | HAUTE |
| 5.4 | `DELETE /events/:id/reactions` — retirer sa réaction | 20min | HAUTE |
| 5.5 | `GET /events/:id/reactions` — résumé des réactions | 20min | HAUTE |
| 5.6 | Règle: 1 seule réaction par user par événement (upsert) | 20min | CRITIQUE |

---

## PHASE 6 — MODULE COMMENTS

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 6.1 | Créer `CommentsModule`, `CommentsService`, `CommentsController` | 20min | HAUTE |
| 6.2 | `POST /events/:id/comments` — ajouter un commentaire | 30min | HAUTE |
| 6.3 | `GET /events/:id/comments` — liste paginée des commentaires | 30min | HAUTE |
| 6.4 | `DELETE /events/:id/comments/:commentId` — supprimer son commentaire | 20min | HAUTE |
| 6.5 | Validation: max 500 caractères par commentaire | 10min | HAUTE |
| 6.6 | Émettre événement WebSocket nouveaux commentaires | 30min | HAUTE |

---

## PHASE 7 — MODULE CHAT (WebSocket — TEMPS REEL)

> Nécessite installation `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 7.1 | Installer `@nestjs/websockets`, `@nestjs/platform-socket.io` | 15min | CRITIQUE |
| 7.2 | Créer `ChatModule` et `ChatGateway` (Socket.io Gateway) | 45min | CRITIQUE |
| 7.3 | Authentifier les connexions WebSocket via JWT (middleware WS) | 1h | CRITIQUE |
| 7.4 | Gérer `connection` event → ajouter user aux rooms | 30min | CRITIQUE |
| 7.5 | Gérer `disconnection` event → mettre `isOnline = false` | 30min | CRITIQUE |
| 7.6 | Event `join-event-chat` → rejoindre le canal d'un event point | 30min | HAUTE |
| 7.7 | Event `leave-event-chat` → quitter le canal | 15min | HAUTE |
| 7.8 | Event `send-message` → envoyer un message dans un canal event | 30min | CRITIQUE |
| 7.9 | Persister les messages dans `ChatMessage` (DB) | 30min | CRITIQUE |
| 7.10 | `GET /events/:id/chat/history` — historique des messages (paginé) | 30min | HAUTE |
| 7.11 | Broadcaster les nouveaux messages à tous les users du canal | 30min | CRITIQUE |
| 7.12 | Broadcaster les nouvelles signalisations en temps réel | 30min | HAUTE |
| 7.13 | Broadcaster les réactions en temps réel | 20min | HAUTE |
| 7.14 | Gérer les erreurs de connexion/déconnexion gracieusement | 30min | HAUTE |

**Événements WebSocket:**
```
Client → Server:
  join-event-chat    { eventId }
  leave-event-chat   { eventId }
  send-message       { eventId, content }

Server → Client:
  new-message        { id, eventId, user, content, createdAt }
  new-signal         { eventId, signalCount }
  new-reaction       { eventId, reactions }
  new-comment        { eventId, comment }
  user-online-status { userId, isOnline }
```

---

## PHASE 8 — MODULE FRIENDS (Système d'amis)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 8.1 | Créer `FriendsModule`, `FriendsService`, `FriendsController` | 20min | HAUTE |
| 8.2 | `POST /friends/request/:userId` — envoyer une demande d'amitié | 30min | HAUTE |
| 8.3 | `POST /friends/accept/:friendshipId` — accepter une demande | 20min | HAUTE |
| 8.4 | `DELETE /friends/reject/:friendshipId` — refuser/annuler | 20min | HAUTE |
| 8.5 | `DELETE /friends/:userId` — supprimer un ami | 20min | HAUTE |
| 8.6 | `GET /friends` — liste de ses amis avec statut en ligne | 30min | HAUTE |
| 8.7 | `GET /friends/requests` — liste des demandes reçues | 20min | HAUTE |
| 8.8 | Notifier l'utilisateur cible lors d'une demande d'amitié | 20min | HAUTE |
| 8.9 | Notifier lors de l'acceptation | 20min | HAUTE |

---

## PHASE 9 — MODULE NOTIFICATIONS

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 9.1 | Créer `NotificationsModule`, `NotificationsService` | 20min | HAUTE |
| 9.2 | `GET /notifications` — liste des notifications (paginées) | 30min | HAUTE |
| 9.3 | `PATCH /notifications/:id/read` — marquer comme lue | 20min | HAUTE |
| 9.4 | `PATCH /notifications/read-all` — tout marquer comme lu | 20min | HAUTE |
| 9.5 | `GET /notifications/unread-count` — nombre de non lues | 15min | HAUTE |
| 9.6 | `NotificationsService.create()` — méthode réutilisable | 30min | CRITIQUE |
| 9.7 | Pousser notification via WebSocket en temps réel (`notification` event) | 30min | HAUTE |

---

## PHASE 10 — MODULE 2FA (Two-Factor Authentication)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 10.1 | Installer `otplib`, `qrcode` | 10min | HAUTE |
| 10.2 | `POST /auth/2fa/generate` — générer un secret TOTP + QR code | 45min | HAUTE |
| 10.3 | `POST /auth/2fa/enable` — vérifier code TOTP + activer 2FA | 30min | HAUTE |
| 10.4 | `POST /auth/2fa/disable` — désactiver 2FA (avec vérif code) | 20min | HAUTE |
| 10.5 | `POST /auth/2fa/verify` — vérifier code lors du login | 30min | HAUTE |
| 10.6 | Adapter le flow de login: si 2FA activé → retourner token partiel | 45min | HAUTE |
| 10.7 | Créer guard `TwoFaGuard` pour routes nécessitant 2FA complet | 30min | HAUTE |

---

## PHASE 11 — PUBLIC API (API Key sécurisée)

> Module séparé exposant les données publiquement avec API Key + rate limiting

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 11.1 | Installer `@nestjs/throttler` pour rate limiting | 15min | HAUTE |
| 11.2 | Configurer ThrottlerModule globalement | 20min | HAUTE |
| 11.3 | Créer `ApiKeyGuard` — valide le header `x-api-key` | 30min | HAUTE |
| 11.4 | `GET /api/events` — liste publique des events actifs | 20min | HAUTE |
| 11.5 | `GET /api/events/:id` — détail public d'un event | 20min | HAUTE |
| 11.6 | `POST /api/events` — créer un event via API Key | 20min | HAUTE |
| 11.7 | `PUT /api/events/:id` — mettre à jour un event | 20min | HAUTE |
| 11.8 | `DELETE /api/events/:id` — supprimer un event | 20min | HAUTE |
| 11.9 | Documenter l'API publique sur Swagger (tag `Public API`) | 30min | HAUTE |
| 11.10 | Tester le rate limiting (ex: 100 req/min par IP) | 20min | HAUTE |

---

## PHASE 12 — DEVOPS (Docker + Health)

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 12.1 | Écrire `Dockerfile` multi-stage pour le backend | 1h | CRITIQUE |
| 12.2 | Écrire `docker-compose.yml` complet (api + postgres) | 1h | CRITIQUE |
| 12.3 | Configurer `docker-compose.prod.yml` (HTTPS, env prod) | 1h | HAUTE |
| 12.4 | Certificat HTTPS: Let's Encrypt ou self-signed pour dev | 1h | CRITIQUE |
| 12.5 | Tester le démarrage via `docker-compose up --build` | 30min | CRITIQUE |
| 12.6 | Compléter le module Health (déjà présent) avec check DB | 30min | HAUTE |
| 12.7 | Ajouter check Prisma/DB dans le health endpoint | 20min | HAUTE |
| 12.8 | Documenter la procédure de backup PostgreSQL | 30min | MOYENNE |

---

## PHASE 13 — SECURITE ET VALIDATION

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 13.1 | Installer `helmet` et l'activer dans `main.ts` | 15min | HAUTE |
| 13.2 | Vérifier la config CORS (origins whitelistés en prod) | 20min | HAUTE |
| 13.3 | Vérifier que tous les mots de passe sont bien hachés (bcrypt salt >= 10) | 20min | CRITIQUE |
| 13.4 | Vérifier que les tokens JWT ont une expiration courte (15min access) | 15min | HAUTE |
| 13.5 | Vérifier que les refresh tokens sont révocables | 30min | HAUTE |
| 13.6 | Sanitizer toutes les entrées utilisateur (class-validator whitelist: true) | 20min | HAUTE |
| 13.7 | Vérifier qu'aucun champ sensible (passwordHash, twoFaSecret) n'est retourné dans les réponses | 30min | CRITIQUE |
| 13.8 | Créer `RolesGuard` + décorateur `@Roles()` | 30min | HAUTE |
| 13.9 | Implémenter la logique d'autorisation (owner ou admin seulement pour DELETE) | 30min | HAUTE |

---

## PHASE 14 — TESTS

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 14.1 | Tests unitaires `AuthService` (register, login, token) | 1h30 | MOYENNE |
| 14.2 | Tests unitaires `EventsService` | 1h | MOYENNE |
| 14.3 | Tests e2e `AuthController` (register + login flow) | 1h | MOYENNE |
| 14.4 | Tests e2e `EventsController` (CRUD flow) | 1h | MOYENNE |
| 14.5 | Configurer une DB de test séparée pour les e2e | 30min | MOYENNE |

---

## PHASE 15 — DOCUMENTATION FINALE

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|---------|
| 15.1 | Vérifier que TOUS les endpoints ont des decorators Swagger complets | 1h | CRITIQUE |
| 15.2 | Vérifier tous les DTOs documentés (ApiProperty sur chaque champ) | 1h | HAUTE |
| 15.3 | Tester le client généré par Swagger (pour le frontend) | 30min | HAUTE |
| 15.4 | Documenter les événements WebSocket dans README | 30min | HAUTE |
| 15.5 | Créer `docs/DATABASE.md` avec ERD + description des tables | 1h | HAUTE |
| 15.6 | Mettre à jour le README principal avec les infos finales | 30min | HAUTE |

---

## RESUME ESTIMATION TOTALE

| Phase | Description | Estimation |
|-------|-------------|-----------|
| 0 | Fondations (MPD, infra, Prisma, architecture) | ~8h |
| 1 | Auth (JWT, register, login, refresh) | ~8h |
| 2 | Users (profil, avatar, online) | ~5h |
| 3 | Events (CRUD, géo, filtres) | ~8h |
| 4 | Signals (confirmations) | ~3h |
| 5 | Reactions | ~2h |
| 6 | Comments | ~2h |
| 7 | Chat WebSocket | ~8h |
| 8 | Friends | ~4h |
| 9 | Notifications | ~3h |
| 10 | 2FA | ~4h |
| 11 | Public API | ~3h |
| 12 | Devops (Docker, HTTPS) | ~5h |
| 13 | Sécurité & validation | ~4h |
| 14 | Tests | ~6h |
| 15 | Documentation finale | ~4h |
| **TOTAL** | | **~77h** |

---

## ORDRE DE PRIORITE ABSOLU (Chemin critique)

```
Phase 0 (Fondations + MPD + Prisma)
  → Phase 1 (Auth — TOUT dépend de ça)
    → Phase 2 (Users)
    → Phase 3 (Events) ← Coeur métier
      → Phase 4 (Signals)
      → Phase 5 (Reactions)
      → Phase 6 (Comments)
      → Phase 7 (Chat WebSocket) ← Module clé pour Real-time
    → Phase 8 (Friends) ← Module User Interaction
    → Phase 9 (Notifications) ← Dépend Auth + Events + Friends
    → Phase 10 (2FA) ← Après Auth stable
    → Phase 11 (Public API) ← Après Events stable
  → Phase 12 (Docker/DevOps)
  → Phase 13 (Sécurité)
  → Phase 14 (Tests)
  → Phase 15 (Docs finales)
```

---

## REGLES DE QUALITE (à respecter à chaque PR)

- [ ] Aucun `any` TypeScript sans justification
- [ ] Tous les endpoints testables via Swagger UI
- [ ] Validation des inputs avec `class-validator` sur chaque DTO
- [ ] Aucun secret dans le code source (tout dans `.env`)
- [ ] Aucun champ sensible dans les réponses API (`passwordHash`, `twoFaSecret`)
- [ ] Commit messages conventionnels (`feat:`, `fix:`, `refactor:`, `docs:`)
- [ ] Au moins 1 reviewer par PR

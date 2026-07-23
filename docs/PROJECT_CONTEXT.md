# 🚦 Dona — Project Vision, Features & Product Requirements

> **Master Product & Context Document for Human Collaborators and AI Agents.**  
> This document defines the full product vision, core ideas, functional features, user experience, and 42 project requirements for **Dona**. It is kept tech-stack neutral so it can be shared across both Frontend and Backend repositories.

---

## 📌 1. Executive Summary & Product Vision

**Dona** is a real-time, community-driven road event signaling platform — built to combine the crowdsourced alert power of navigation apps like Waze with live social interaction, official organization validations, and intelligent safety routing.

### Core Problem & Value Proposition
- **The Problem**: Drivers and commuters lack real-time, verified information about road hazards, traffic bottlenecks, and accidents. Existing alert platforms often suffer from unverified or stale reports without direct communication channels between nearby commuters.
- **The Solution**: Dona provides an interactive, live map where users report road incidents, validate each other's reports through votes and quick reactions, participate in location-bound chat rooms, and receive smart route recalculations that automatically avoid confirmed high-risk areas.

---

## 💡 2. Key Features & Conceptual Modules

### 📍 1. Geolocation & Incident Signaling
- **Instant Event Reporting**: Users can pinpoint events directly at their current GPS location or selected map coordinates.
- **Predefined Categories**:
  - 🚗 **Accidents** (Minor / Major vehicle collisions)
  - 🚦 **Traffic Jams** (Heavy congestion, slowdowns)
  - 👮 **Police Controls** (Speed checks, road blocks)
  - ⚠️ **Hazards** (Debris, slippery roads, poor visibility)
  - 🚧 **Obstacles / Road Closures** (Construction, blocked lanes)
  - ❓ **Other** (Custom alerts with descriptions)
- **Media Attachments**: Option to attach real-time photo evidence to any reported incident.

---

### 📊 2. Community Signal & Veracity Rating System
- **Crowdsourced Confirmations ("Signals")**: Other users near the event can tap "Confirm Signal" to vouch for its authenticity.
- **Dynamic Veracity Score**: Each incident displays a live credibility rating (0% to 100%) calculated from community votes, reactions, photo verification, and official endorsements.
- **Automated Expiration**: Incidents automatically fade, expire, or get archived when they reach their time-to-live limit or when credibility drops due to "Resolved" reports.

---

### ⚡ 3. Quick Incident Reactions
- **Instant Status Feedback**: Buttons for quick community updates:
  - ✅ **Still There**: Extends event duration and boosts veracity score.
  - ❌ **Resolved**: Penalizes veracity score and triggers faster archiving when multiple users report resolution.

---

### 💬 4. Live Event Discussions & Location Chat Rooms
- **Threaded Event Comments**: Users can leave detailed comments under any active incident.
- **Geolocated Live Chat Channel (WebSockets)**: Every active event point hosts a dedicated real-time chat room where nearby drivers can exchange text messages, warnings, and updates instantly.
- **Real-Time Indicators**: Typing indicators, read receipts, and live online presence indicators.

---

### 🏛️ 5. Official Organization Accounts (Verified Entities)
- **Institutional Access**: Special organization profiles for municipalities, traffic police, emergency services, and transport agencies.
- **Official Endorsements**: Organizations can officially validate, manage, or clear incident reports. An official validation instantly boosts the event's credibility to 100%.

---

### 🗺️ 6. Intelligent Hazard-Aware Route Recommendation (Featured Module)
- **Risk Avoidance Navigation**: Route calculation engine that analyzes active events along potential navigation paths.
- **Dynamic Rerouting**: If a route segment intersects confirmed high-risk zones (e.g., major accidents or blocked roads with high veracity), the system automatically suggests safer alternative routes.

---

### 🤖 7. Artificial Intelligence Integration
- **Vision AI (Image Category Verification)**: Automatically analyzes uploaded photos to verify whether they match the declared incident category (e.g., checking if a photo reported as "Accident" actually contains damaged vehicles).
- **NLP AI (Automated Content Moderation)**: Real-time text analysis on comments, descriptions, and live chat messages to detect and filter toxicity, harassment, or spam before public broadcast.

---

### 🏆 8. User Reputation & Social Engagement
- **Reputation Score**: Users earn credibility points for submitting verified alerts and helpful confirmations, building a trusted contributor score displayed on their profile.
- **Friends & Social Network**: Add/remove friends, view online status, and share incident alerts directly with friends.
- **User Blocking & Safety**: Block abusive users to automatically hide their chat messages and comments.

---

### 🔔 9. Smart Notifications & Geofencing
- **Proximity Alerts**: Push/in-app notifications triggered when a new incident is reported within a configurable radius of the user's current location or active route.
- **Social & System Alerts**: Notifications for friend requests, reactions to reported incidents, official validations, and moderation actions.

---

### 🔒 10. Privacy, Security & GDPR Compliance
- **Data Export**: Complete user data export in JSON format.
- **Right to be Forgotten**: Account deletion with options to anonymize public contributions (preserving historical event map data without personal identifiers).
- **Multi-Factor Authentication (2FA)**: Time-based One-Time Password (TOTP) app support for account security.
- **OAuth 2.0 Integration**: Third-party login via Google, GitHub, and 42 Intra.

---

### 🌐 11. Internationalization & Accessibility (i18n)
- **Multi-language UI**: Full support for English, French, and Malagasy.
- **Accessibility**: Keyboard navigation, high-contrast map markers, screen reader support, and responsive mobile-first design.

---

## 🎯 3. Project Curriculum Requirements (42 ft_transcendence)

Dona is structured to fulfill the **14+ points target** of the 42 curriculum through modular feature groups:

| Feature Group | Description | Status |
|---|---|---|
| **Web Frameworks** | Full-stack modern architecture (Next.js Frontend + NestJS Backend) | 🎯 Included |
| **Real-time Engine** | Bidirectional WebSockets for live chat, marker updates, and typing states | 🎯 Included |
| **User Interactions** | Live chat channels, user profiles, friends system, and user blocking | 🎯 Included |
| **Public API** | Secured API Key endpoints, rate limiting, and complete OpenAPI/Swagger docs | 🎯 Included |
| **User Management & Auth** | Standard JWT authentication, profile customization, avatar management, OAuth2 | 🎯 Included |
| **Two-Factor Auth (2FA)** | TOTP / QR Code security layer | 🎯 Included |
| **Notification System** | Real-time in-app, social, and geofenced hazard notifications | 🎯 Included |
| **Health & Monitoring** | System status checking, database health, and metrics dashboards | 🎯 Included |
| **Custom Featured Module** | AI & routing integration for dynamic hazard-avoiding navigation | 🎯 Included |

---

## 👥 4. User Roles & Permission Hierarchy

1. **Guest / Anonymous User**: Can view public map incidents and search active events.
2. **Standard User**: Can report events, vote/signal, react, comment, join live chat rooms, manage profile/friends, and request route recommendations.
3. **Official Organization Member**: All standard features + ability to officially validate or clear events on behalf of a verified entity (City Council, Traffic Police, etc.).
4. **Moderator**: Can review flagged content queues, override AI verdicts, and resolve reported incidents.
5. **System Administrator**: Full system management, user role assignments, audit logs, and system analytics.

---

## 🤝 5. Guidelines for Human Collaborators & AI Agents

1. **User Experience First**: Keep map interactions fast, intuitive, and responsive. Mobile usability is crucial for drivers.
2. **Consistency Across Frontend & Backend**: Both repositories share this exact vision document. Any feature added to the API must mirror its UI flow in Next.js.
3. **Safety & Moderation**: Never bypass AI content moderation or user blocking rules in live chat features.
4. **Data Privacy**: Ensure user location tracking is explicit and respect user privacy settings for proximity alerts.

---
*End of Dona Master Product Vision Document.*

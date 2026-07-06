# ft_transcendence — Subject Compliance Checklist

> Line-by-line checklist — cochez chaque item au fur et à mesure de l'implémentation.
> Référence: [en.subject.pdf](./docs/en.subject.pdf) — Version 21.1

---

## Chapter II — Team and Project Management

### Required Team Roles
- [ ] **Product Owner (PO)** assigned
  - [ ] Maintains the product backlog
  - [ ] Makes decisions on features and priorities
  - [ ] Validates completed work
  - [ ] Communicates with stakeholders (evaluators, peers)
- [ ] **Project Manager (PM) / Scrum Master** assigned
  - [ ] Organizes team meetings and planning sessions
  - [ ] Tracks progress and deadlines
  - [ ] Ensures team communication
  - [ ] Manages risks and blockers
- [ ] **Technical Lead / Architect** assigned
  - [ ] Defines technical architecture
  - [ ] Makes technology stack decisions
  - [ ] Ensures code quality and best practices
  - [ ] Reviews critical code changes
- [ ] **All team members** have Developer role
  - [ ] Write code for assigned features
  - [ ] Participate in code reviews
  - [ ] Test their implementations
  - [ ] Document their work
- [ ] All roles clearly documented in `README.md`

### Project Management Practices
- [ ] Regular team meetings scheduled (weekly/bi-weekly)
- [ ] Task tracking tool set up (Trello / GitHub Issues)
- [ ] Work divided into smaller, manageable tasks
- [ ] Code review process established (min. 1 reviewer per PR)
- [ ] Communication channel set up (Discord/Slack)
- [ ] Team able to explain role distribution during evaluation
- [ ] Team able to explain work organization during evaluation
- [ ] Each member able to explain the project and their contributions

---

## Chapter III — Mandatory Part

### III.2 — General Requirements
- [ ] Project is a **web application** with frontend + backend + database
- [ ] **Git** used with clear, meaningful commit messages
  - [ ] Commits from **all team members**
  - [ ] Clear commit messages describing changes
  - [ ] Proper work distribution visible in git history
- [ ] Deployment uses **containerization** (Docker/Podman) — single command launch (`docker-compose up`)
- [ ] Website compatible with **latest stable Google Chrome**
- [ ] **No warnings or errors** in browser console
- [ ] Project includes **Privacy Policy** page (accessible, with relevant content)
- [ ] Project includes **Terms of Service** page (accessible, with relevant content)
- [ ] Frontend is **clear, responsive, and accessible** across all devices
- [ ] CSS framework / styling solution used
- [ ] Credentials stored in **local `.env` file** (git-ignored)
- [ ] **`.env.example`** file provided
- [ ] Database has a **clear schema and well-defined relations**
- [ ] Application has a **basic user management system**
  - [ ] Users can **sign up** securely
  - [ ] Users can **log in** securely
  - [ ] Email + password authentication implemented
  - [ ] **Passwords are hashed and salted**
- [ ] **All forms and user inputs** validated on the frontend
- [ ] **All forms and user inputs** validated on the backend
- [ ] All connections from browser/scripts/external APIs use **HTTPS**

### III.3 — Technical Requirements
- [ ] Frontend framework used — **Next.js**
- [ ] Backend framework used — **NestJS**

---

## Chapter IV — Modules (14pts minimum)

> Major = 2pts | Minor = 1pt | **Current target: 14pts**

### IV.1 — Web

#### [MAJOR +2pts] Use a framework for both frontend and backend
- [ ] Frontend framework implemented: **Next.js**
- [ ] Backend framework implemented: **NestJS**

#### [MAJOR +2pts] Real-time features (WebSockets)
- [ ] Real-time updates across clients implemented
- [ ] Connection/disconnection handled gracefully
- [ ] Efficient message broadcasting implemented

#### [MAJOR +2pts] User Interaction
- [ ] Basic **chat system** (send/receive messages between users)
- [ ] **Profile system** (view user information)
- [ ] **Friends system** (add/remove friends, see friends list)

#### [MAJOR +2pts] Public API
- [ ] API accessible with a **secured API key**
- [ ] **Rate limiting** implemented
- [ ] **Documentation** provided (Swagger / OpenAPI)
- [ ] At least **5 endpoints** covering all HTTP verbs:
  - [ ] `GET /api/{something}`
  - [ ] `POST /api/{something}`
  - [ ] `PUT /api/{something}`
  - [ ] `DELETE /api/{something}`

#### [MINOR +1pt] ORM
- [ ] ORM used for the database: **Prisma**

#### [MINOR +1pt] Notification system
- [ ] Notifications triggered on **creation** actions
- [ ] Notifications triggered on **update** actions
- [ ] Notifications triggered on **deletion** actions
- [ ] Notification system covers all relevant user actions

### IV.3 — User Management

#### [MAJOR +2pts] Standard user management and authentication
- [ ] Users can **update their profile information**
- [ ] Users can **upload an avatar** (with a default avatar if none provided)
- [ ] Users can **add other users as friends** and see their online status
- [ ] Users have a **profile page** displaying their information

#### [MINOR +1pt] Two-Factor Authentication (2FA)
- [ ] Complete **2FA system** implemented (TOTP)
- [ ] 2FA enrollment flow (generate + QR code)
- [ ] 2FA verification on login

### IV.7 — Devops

#### [MINOR +1pt] Health check and status page
- [ ] Health check endpoint implemented and functional
- [ ] Status page accessible
- [ ] Automated backup procedures documented
- [ ] Disaster recovery procedures documented

---

## Chapter VI — README Requirements

- [ ] **First line** is italicized: *"This project has been created as part of the 42 curriculum by \<logins\>..."*
- [ ] **Description** section present
  - [ ] Clear project name included
  - [ ] Project goal described
  - [ ] Brief overview included
  - [ ] Key features listed
- [ ] **Instructions** section present
  - [ ] All prerequisites listed (software, tools, versions)
  - [ ] `.env` setup described
  - [ ] Step-by-step instructions to run the project
- [ ] **Resources** section present
  - [ ] Classic references listed (docs, articles, tutorials)
  - [ ] AI usage described (which tasks, which parts of the project)
- [ ] **Team Information** section present
  - [ ] Each member listed with assigned role(s)
  - [ ] Brief description of responsibilities per member
- [ ] **Project Management** section present
  - [ ] Work organization described (task distribution, meetings, etc.)
  - [ ] Tools used listed (Trello, GitHub Issues, etc.)
  - [ ] Communication channels listed
- [ ] **Technical Stack** section present
  - [ ] Frontend technologies and frameworks
  - [ ] Backend technologies and frameworks
  - [ ] Database system + justification for choice
  - [ ] Other significant technologies/libraries
  - [ ] Justification for major technical choices
- [ ] **Database Schema** section present
  - [ ] Visual representation or description of the database structure
  - [ ] Tables/collections and their relationships
  - [ ] Key fields and data types
- [ ] **Features List** section present
  - [ ] Complete list of implemented features
  - [ ] Team member(s) per feature
  - [ ] Brief description of each feature's functionality
- [ ] **Modules** section present
  - [ ] All chosen modules listed (Major and Minor)
  - [ ] Point calculation shown (Major = 2pts, Minor = 1pt)
  - [ ] Justification for each module choice
  - [ ] How each module was implemented
  - [ ] Team member(s) per module
- [ ] **Individual Contributions** section present
  - [ ] Detailed breakdown per team member
  - [ ] Specific features/modules/components per person
  - [ ] Challenges faced and how they were overcome
- [ ] README written in **English**
- [ ] README is clear and well-organized
- [ ] README is complete with all required sections
- [ ] README is professional and easy to read
- [ ] README is honest about contributions and challenges

---

## Chapter VII — Bonus Part

> Bonus is considered **ONLY** if all required 14 mandatory points are fully validated.

- [ ] All 14 mandatory points implemented and validated
- [ ] Each extra module is **fully functional**
- [ ] Each extra module **meets the module's requirements**
- [ ] Each extra module **adds real value** to the project
- [ ] Each extra module has **proper justification in README**

*Maximum bonus: 5 points (e.g., 5 minor modules OR 2 major + 1 minor)*

### Bonus candidates for Dona
- [ ] [MINOR +1pt] SSR — Next.js server-side rendering
- [ ] [MINOR +1pt] Advanced search (filters, sorting, pagination)
- [ ] [MINOR +1pt] File upload and management
- [ ] [MINOR +1pt] Multiple languages (i18n — 3 languages minimum)
- [ ] [MINOR +1pt] PWA (offline support + installability)

---

## Chapter VIII — Submission

- [ ] All code committed and pushed to Git repository
- [ ] File names double-checked (no typos)
- [ ] Project runs with a **single command** (`docker-compose up`)
- [ ] Team prepared for a **live code modification** during evaluation
- [ ] Each member can **explain their part** of the project
- [ ] A brief modification can be done in **a few minutes** during evaluation

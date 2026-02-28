# FlowBoard Front

> **Agile project management, visualized in real time.**

FlowBoard Front is the React-based single-page application for the **FlowBoard** platform — a collaborative Agile project management tool designed to help software teams plan, track, and deliver work efficiently through Kanban boards, sprint management, and live team collaboration.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Use Cases & Target Audience](#2-use-cases--target-audience)
3. [Main Features & UI Highlights](#3-main-features--ui-highlights)
4. [Architecture & Non-Functional Requirements](#4-architecture--non-functional-requirements)
5. [Setup & Installation](#5-setup--installation)
6. [Environment Variables & Safe Configuration](#6-environment-variables--safe-configuration)
7. [API Endpoints Consumed](#7-api-endpoints-consumed)
8. [Available Scripts](#8-available-scripts)
9. [Testing](#9-testing)
10. [Deployment](#10-deployment)
11. [CI/CD Pipeline](#11-cicd-pipeline)
12. [Contributing](#12-contributing)
13. [License](#13-license)

---

## 1. Project Overview

FlowBoard Front provides a modern, intuitive interface for Agile teams to:

- **Authenticate** securely using JWT-based login and registration flows.
- **Manage teams** — create teams, invite members by email, and accept pending invitations in real time.
- **Run sprints** — create, select, and manage sprints tied to a team's board.
- **Visualize work** — interact with a Kanban board (To Do → In Progress → Done) with drag-and-drop task management.
- **Collaborate live** — receive real-time updates on board and task changes via WebSocket (STOMP over SockJS), so every team member sees changes instantly without manual refresh.

The application is deployed on **Azure Static Web Apps** and connects to a REST + WebSocket backend hosted on **Azure App Service**.

---

## 2. Use Cases & Target Audience

**Primary audience:** Software development teams, technical project managers, and Agile practitioners.

| Use Case | Who Benefits |
|---|---|
| Sprint planning and tracking | Scrum Masters, Product Owners |
| Real-time Kanban board collaboration | Development teams |
| Team creation and member management | Team leads and managers |
| Task creation, assignment, and lifecycle tracking | Individual contributors |
| Invitation-based onboarding | New team members |

FlowBoard is particularly well-suited as a **portfolio or production-grade reference** for frontend developers looking to demonstrate proficiency in React, WebSockets, drag-and-drop UX, and cloud deployment.

---

## 3. Main Features & UI Highlights

- **JWT Authentication** — Secure login and user registration with token stored in `localStorage`; token decoded client-side via `jwt-decode` to extract user identity.
- **Kanban Board with Drag-and-Drop** — Three-column Kanban board (To Do, In Progress, Done) built with [`@dnd-kit`](https://dndkit.com/), supporting smooth drag-and-drop task transitions with `DragOverlay` for visual feedback.
- **Real-Time Collaboration** — WebSocket connection (STOMP over SockJS) pushes board events (task moves, sprint creation) to all connected clients instantly.
- **Sprint Management** — Create new sprints with name, start/end dates, and goal; switch between sprints via a dropdown selector.
- **Task Management** — Add, view, and delete tasks per column per sprint; tasks display title and description.
- **Team Panel & Invitations** — Create teams, invite users by email, view and accept pending invitations via a notification bell badge.
- **Responsive Layout** — Full-width board layout capped at 1400 px, adapted for modern desktop displays.
- **Branded Header** — Persistent header with the FlowBoard logo and logout button on every protected view.

---

## 4. Architecture & Non-Functional Requirements

### Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| HTTP Client | Axios 1.10 |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/modifiers |
| Real-Time | STOMP.js (@stomp/stompjs) + SockJS |
| Auth | JWT (jwt-decode) |
| Build Tool | Create React App (react-scripts 5) |
| Hosting | Azure Static Web Apps |
| CI/CD | GitHub Actions |

### Security

FlowBoard Front applies the following security measures:

- **JWT-based authentication:** Every API request includes a `Bearer` token in the `Authorization` header. The token is obtained at login, stored in `localStorage`, and cleared on logout.
- **No secrets in source code:** API base URLs are hardcoded to the production backend; secret tokens (e.g., `AZURE_STATIC_WEB_APPS_API_TOKEN_*`) are stored exclusively as **GitHub Actions secrets** and never committed to the repository.
- **OIDC-based deployment authentication:** The CI/CD pipeline uses GitHub's OIDC token exchange (`actions/github-script` + `Install OIDC Client`) to authenticate with Azure — avoiding the need to store long-lived service principal credentials.
- **HTTPS-only communication:** The backend API and WebSocket endpoint are served over HTTPS/WSS from Azure App Service; the Azure Static Web Apps host enforces HTTPS for the frontend.
- **Token expiry & logout:** The app clears token and user state from `localStorage` on logout and redirects to the login page, preventing session fixation.

### High Availability

- **Azure Static Web Apps** provides globally distributed CDN-backed static hosting with built-in redundancy and 99.95% SLA — the frontend assets are served from the edge with no single point of failure.
- **Automatic PR preview environments:** The CI/CD pipeline creates isolated staging deployments for every pull request, enabling validation without touching production.
- **WebSocket reconnect logic:** The `WebSocketContext` configures a `reconnectDelay: 5000` ms on the STOMP client, so the real-time connection re-establishes automatically after transient network disruptions.
- **Stateless frontend:** No server-side session state is held in the SPA; all state is derived from the JWT and backend API, so any user can reload or resume from any edge node without data loss.

---

## 5. Setup & Installation

### Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **npm** ≥ 9

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Juanvelandia-p/flowboard-front.git
cd flowboard-front

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

---

## 6. Environment Variables & Safe Configuration

The current build uses the production backend URL hardcoded in the source. To configure the backend URL for different environments (development, staging, production), use a `.env` file at the project root:

```env
# .env.local  (never commit secrets — this file is gitignored)
REACT_APP_API_BASE_URL=https://your-backend.azurewebsites.net/api
REACT_APP_WS_BASE_URL=https://your-backend.azurewebsites.net/ws
```

> **Security note:** Never commit `.env` files containing real credentials or API keys. All deployment secrets (e.g., Azure Static Web Apps API tokens) must be stored as **repository secrets** in GitHub and injected at CI/CD time.

The `.gitignore` already excludes `.env.local`, `.env.development.local`, `.env.test.local`, and `.env.production.local`.

---

## 7. API Endpoints Consumed

All requests are made to `https://flowboard-b3avawgzaqftbtcd.canadacentral-01.azurewebsites.net/api`.  
Protected endpoints require the header: `Authorization: Bearer <token>`.

### Authentication

| Method | Path | Description | Example Payload |
|---|---|---|---|
| `POST` | `/auth/login` | Authenticate a user; returns a JWT. | `{ "email": "user@example.com", "password": "secret" }` |
| `POST` | `/users/register` | Register a new user. | `{ "username": "alice", "email": "alice@example.com", "password": "secret" }` |
| `POST` | `/users/userID` | Resolve a user's ID from their email (plain-text body). | `"alice@example.com"` |

### Teams

| Method | Path | Description | Example Payload |
|---|---|---|---|
| `GET` | `/teams/my` | List teams the authenticated user belongs to. | — |
| `POST` | `/teams` | Create a new team with optional member invites. | `{ "name": "Team Alpha", "invitedEmails": ["bob@example.com"] }` |
| `GET` | `/teams/pending-invitations` | List pending team invitations for the current user. | — |
| `POST` | `/teams/{teamId}/accept-invitation` | Accept a pending invitation to a team. | — |

### Boards & Sprints

| Method | Path | Description | Example Payload |
|---|---|---|---|
| `GET` | `/boards/team/{teamId}` | Get the board(s) associated with a team. | — |
| `GET` | `/sprints/board/{boardId}` | List all sprints for a board. | — |
| `POST` | `/sprints` | Create a new sprint on a board. | `{ "nombre": "Sprint 1", "boardId": "uuid", "fechaInicio": "2025-01-01", "fechaFin": "2025-01-14", "objetivo": "MVP features" }` |

### Tasks

| Method | Path | Description | Example Payload |
|---|---|---|---|
| `GET` | `/sprints/{sprintId}/tasks` | List all tasks for a sprint. | — |
| `POST` | `/tasks` | Create a new task in a sprint. | `{ "titulo": "Implement login", "descripcion": "...", "estado": "TO-DO", "boardId": "uuid", "sprintId": "uuid" }` |
| `PUT` | `/tasks/{taskId}/estado` | Update task status (plain-text body). | `"DOING"` |
| `DELETE` | `/tasks/{taskId}` | Delete a task. | — |

### WebSocket

| Endpoint | Protocol | Description |
|---|---|---|
| `/ws` | SockJS / STOMP | Main WebSocket endpoint for real-time events. |
| `/topic/board-sprints.{boardId}` | STOMP subscription | Broadcasts newly created sprints to all board subscribers. |
| `/topic/task-drag.{boardId}` | STOMP subscription | Broadcasts drag-and-drop task moves to collaborators. |
| `/topic/sprint-tasks.{sprintId}` | STOMP subscription | Broadcasts new task creation events for a sprint. |
| `/app/task/drag` | STOMP publish | Publishes a task drag event to the server. |

---

## 8. Available Scripts

In the project directory you can run:

| Script | Description |
|---|---|
| `npm start` | Starts the development server at [http://localhost:3000](http://localhost:3000) with hot reload. |
| `npm test` | Runs the test suite in interactive watch mode using Jest and React Testing Library. |
| `npm run build` | Builds the app for production to the `build/` folder — minified, tree-shaken, and hash-named for optimal caching. |
| `npm run eject` | Ejects CRA configuration for full control (irreversible). Not recommended unless customization is required. |

---

## 9. Testing

FlowBoard Front uses **Jest** and **React Testing Library** (provided via `react-scripts`).

Run all tests:

```bash
npm test
```

Run tests once (non-interactive, e.g., in CI):

```bash
CI=true npm test
```

Test files follow the `*.test.js` convention and live alongside their source files in `src/`. The existing test suite validates component rendering.

---

## 10. Deployment

### Production: Azure Static Web Apps

The app is automatically deployed to **Azure Static Web Apps** via the CI/CD pipeline (see [CI/CD Pipeline](#11-cicd-pipeline) below) on every push to the `main` branch.

**Manual production build:**

```bash
npm run build
```

The output is placed in `build/` — ready to upload to any static hosting provider (Azure Static Web Apps, Vercel, Netlify, GitHub Pages, etc.).

### Azure Static Web Apps Configuration

The workflow sets:

- `app_location: "/"` — source root
- `output_location: "build"` — compiled output directory
- `api_location: ""` — no Azure Functions API

---

## 11. CI/CD Pipeline

FlowBoard Front uses **GitHub Actions** with the official [Azure Static Web Apps deploy action](https://github.com/Azure/static-web-apps-deploy).

**Workflow file:** `.github/workflows/azure-static-web-apps-happy-bush-0e0054b0f.yml`

### Triggers

| Event | Branch / Condition | Effect |
|---|---|---|
| `push` | `main` | Full build and production deployment |
| `pull_request` opened/synchronize/reopened | any → `main` | Build and deploy to a **preview environment** |
| `pull_request` closed | any → `main` | Tear down the preview environment |

### Jobs

#### `build_and_deploy_job`

Runs on `ubuntu-latest` for every push to `main` and for open pull requests.

Steps:
1. **Checkout** — checks out the repository with `actions/checkout@v3`.
2. **Install OIDC Client** — installs `@actions/core` and `@actions/http-client` to support OIDC-based Azure auth.
3. **Get ID Token** — uses `actions/github-script@v6` to obtain a GitHub OIDC token for passwordless Azure authentication.
4. **Build and Deploy** — runs `Azure/static-web-apps-deploy@v1` which:
   - Installs Node.js dependencies
   - Runs `npm run build` to produce the production bundle
   - Deploys the `build/` output to Azure Static Web Apps

**Required secret:** `AZURE_STATIC_WEB_APPS_API_TOKEN_HAPPY_BUSH_0E0054B0F` — stored as a GitHub repository secret.

#### `close_pull_request_job`

Runs on `ubuntu-latest` when a pull request targeting `main` is closed.  
Calls `Azure/static-web-apps-deploy@v1` with `action: "close"` to remove the staging preview environment.

### Security in CI/CD

- Secrets are never printed to logs.
- The pipeline uses **OIDC token exchange** (not a stored service principal password) to authenticate with Azure, following the principle of short-lived, scope-limited credentials.
- The workflow uses the minimal required permissions (`id-token: write`, `contents: read`).

---

## 12. Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository and create your feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit** your changes with clear, descriptive messages:
   ```bash
   git commit -m "feat: add sprint burndown chart component"
   ```
3. **Push** to your fork and open a **Pull Request** against `main`.
4. Ensure your PR:
   - Does not break existing tests (`npm test`)
   - Builds cleanly (`npm run build`)
   - Follows the existing code style (ESLint via `react-app` config)
5. A CI preview deployment will be created automatically for your PR for review.

### Code Style

- Components are functional React components using hooks.
- CSS lives in `src/stylesheets/` as dedicated `.css` files per feature area.
- Keep API base URL configuration out of component logic (use constants or environment variables).

---

## 13. License

This project does not currently specify a license. All rights reserved by the author unless otherwise stated. Contact the repository owner for usage permissions.

---

*Built with ❤️ using React and deployed on Microsoft Azure.*

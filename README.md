# ⚡ CloudPipeline — CI/CD Automation Toolkit

A production-grade full-stack application demonstrating automated CI/CD pipelines, containerization, and cloud deployment — built as a portfolio project for Full Stack / DevOps engineering roles.

---

## 🏗️ Architecture

```
Developer
    │
    │  git push / pull request
    ▼
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions CI                    │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │  Server CI   │    │  Client CI   │                  │
│  │  Jest tests  │    │  React tests │                  │
│  │  ESLint      │    │  ESLint      │                  │
│  └──────┬───────┘    └──────┬───────┘                  │
│         └──────────┬─────────┘                         │
│                    │ both pass                          │
│          ┌─────────▼──────────┐                        │
│          │   Docker Build     │                        │
│          │  & Push to Hub     │                        │
│          │  tagged: sha + :latest │                    │
│          └─────────┬──────────┘                        │
└────────────────────┼────────────────────────────────────┘
                     │
                     │  GitHub Actions CD
                     ▼
        ┌────────────────────────┐
        │    Azure App Service   │
        │                        │
        │  ┌──────────────────┐  │
        │  │  Client (Nginx)  │  │
        │  │  :80             │  │
        │  └────────┬─────────┘  │
        │           │ proxy      │
        │  ┌────────▼─────────┐  │
        │  │  Server (Node)   │  │
        │  │  :5000           │  │
        │  │  /health ✓       │  │
        │  └──────────────────┘  │
        └────────────────────────┘
             Provisioned by Terraform
```

---

## 📁 Project Structure

```
cloudpipeline/
├── .github/
│   └── workflows/
│       ├── ci.yml          # Lint → Test → Docker Build → Push
│       └── cd.yml          # Deploy to Azure (+ manual rollback)
├── server/                 # Node.js / Express REST API
│   ├── src/
│   │   ├── app.js          # Express app (routes, middleware)
│   │   └── index.js        # Entry point (starts HTTP server)
│   ├── tests/
│   │   └── api.test.js     # Jest + Supertest (16 tests)
│   ├── Dockerfile          # Multi-stage, non-root
│   └── package.json
├── client/                 # React + TailwindCSS frontend
│   ├── src/
│   │   ├── App.jsx         # Root component
│   │   ├── App.test.jsx    # React Testing Library tests
│   │   ├── hooks/
│   │   │   └── useItems.js # Custom hook — fetch + create items
│   │   └── components/
│   │       ├── ItemCard.jsx
│   │       ├── AddItemForm.jsx
│   │       ├── SearchBar.jsx
│   │       └── HealthBadge.jsx
│   ├── Dockerfile          # Multi-stage: Node build → Nginx serve
│   ├── nginx.conf          # SPA routing + API proxy + security headers
│   └── package.json
├── terraform/
│   └── main.tf             # Azure Resource Group, App Service Plan, Web Apps
├── docker-compose.yml      # Local dev: both services + shared network
└── README.md
```

---

## 🚀 Quick Start — Local Development

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- Git

### Option A — Run directly (no Docker)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/cloudpipeline.git
cd cloudpipeline

# 2. Start the backend
cd server
cp .env.example .env
npm install
npm run dev
# API running at http://localhost:5000

# 3. Start the frontend (new terminal)
cd client
npm install
npm start
# App running at http://localhost:3000
```

### Option B — Run with Docker Compose

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# Health:   http://localhost:5000/health
```

---

## 🧪 Running Tests

```bash
# Backend tests (Jest + Supertest)
cd server && npm test

# Frontend tests (React Testing Library)
cd client && npm test

# Both with coverage
cd server && npm test -- --coverage
```

---

## 🌐 API Reference

| Method | Endpoint      | Description                        |
|--------|---------------|------------------------------------|
| GET    | `/health`     | Service health, uptime, memory     |
| GET    | `/api/items`  | List all items (`?name=` to filter)|
| POST   | `/api/items`  | Create item `{ name, description }`|

### Example requests

```bash
# Health check
curl http://localhost:5000/health

# Get all items
curl http://localhost:5000/api/items

# Filter by name
curl "http://localhost:5000/api/items?name=sample"

# Create item
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "My Item", "description": "Created via curl"}'
```

---

## ☁️ Cloud Deployment (Azure)

### 1. Provision infrastructure with Terraform

```bash
cd terraform
az login
terraform init
terraform plan -var="dockerhub_username=YOUR_HUB_USERNAME"
terraform apply -var="dockerhub_username=YOUR_HUB_USERNAME"
```

### 2. Add GitHub Secrets

Go to your repo → **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Your DockerHub username |
| `DOCKERHUB_TOKEN` | DockerHub access token (not password) |
| `AZURE_CREDENTIALS` | Output of `az ad sp create-for-rbac` (see below) |
| `AZURE_WEBAPP_NAME_SERVER` | `cloudpipeline-server-api` |
| `AZURE_WEBAPP_NAME_CLIENT` | `cloudpipeline-client-app` |
| `REACT_APP_API_URL` | Your Azure server app URL |

### 3. Create Azure Service Principal for GitHub Actions

```bash
az ad sp create-for-rbac \
  --name "cloudpipeline-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID \
  --sdk-auth
```

Copy the JSON output into the `AZURE_CREDENTIALS` secret.

### 4. Push to main — pipeline runs automatically

```
git push origin main
# Watch: GitHub → Actions tab
```

### Manual Rollback

```bash
# Via GitHub UI: Actions → CD workflow → Run workflow → enter image tag
# e.g. enter a previous git SHA like: abc1234def5678
```

---

## 🛠️ Environment Variables

### Server (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | HTTP port |
| `NODE_ENV` | `development` | Environment mode |

---

## 📖 Key Engineering Decisions

**Why multi-stage Dockerfiles?** Keeps the final image lean — the builder stage has all dev tools, the runner stage only has what's needed to serve. Server image goes from ~900MB → ~180MB.

**Why non-root Docker user?** Security best practice — if the container is compromised, the attacker doesn't have root privileges on the host.

**Why separate `app.js` and `index.js`?** Lets Jest import the Express app without actually starting the HTTP server. Supertest handles the port binding internally during tests.

**Why `resetItems()` in tests?** Each test resets the in-memory store to a known state — guarantees test isolation regardless of execution order.

**Why Nginx for the React app?** React's dev server is not production-ready. Nginx serves static files efficiently, handles SPA routing (`try_files`), proxies API calls, and adds security headers in one config.

---

## 🎯 Skills Demonstrated

- Full-stack JavaScript (React + Node.js/Express)
- REST API design with validation and error handling
- Docker multi-stage builds, docker-compose networking
- GitHub Actions CI/CD pipelines
- Azure App Service deployment via IaC (Terraform)
- Unit + integration testing (Jest, Supertest, React Testing Library)
- Security headers, non-root containers, health checks

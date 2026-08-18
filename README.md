# AI Chat Application (Hackathon Project)

This is a full-stack AI Chat application built with [Next.js](https://nextjs.org), utilizing **Prisma**, **PostgreSQL**, and **Qdrant** (Vector Database).

## 🚀 Quick Setup Guide

Follow these steps to get your development environment up and running in minutes. We use `bun` for ultra-fast dependency management and script execution.

### 1. Prerequisites
- [Bun](https://bun.sh/) installed
- [Docker](https://www.docker.com/) installed and running (for databases)

### 2. Environment Variables
Copy the example environment file and fill in any missing values (like your LLM API keys):
```bash
cp .env.example .env
```
*(The default `DATABASE_URL` and `VECTOR_DB_URL` are already pre-configured to work with the included Docker containers).*

### 3. Install Dependencies
```bash
bun install
```

### 4. Fast Setup (Databases & Prisma)
Run our custom setup script. This single command will spin up Postgres and Qdrant in Docker, run Prisma migrations, and generate the Prisma Client:
```bash
bun run setup
```

### 5. Start the Application
```bash
bun dev
```
The application will be running at [http://localhost:3000](http://localhost:3000).

---

## 🗂️ Folder Structure & Architecture

Our project follows a feature-based and highly organized structure to separate the UI, API, and business logic.

```text
├── app/
│   ├── (screens)/         # UI Pages & Layouts (Add your Frontend UI code here!)
│   └── api/               # Next.js API Routes (Backend Endpoints)
├── lib/
│   ├── api.error.ts       # Structured Error handling class
│   ├── api.response.ts    # Structured API Response class
│   ├── db/                # Database configurations (Prisma & Qdrant setups)
│   ├── env.ts             # Strongly typed Environment variables
│   └── features/          # Domain-driven feature modules (Business logic, services, types)
├── prisma/                # Prisma schema and migrations
└── docker-compose.yml     # Docker configuration for local databases
```

### 🎨 Where to write UI code
All frontend React components, pages, and layouts should be placed inside the `app/` directory (specifically inside `app/(screens)` for page routes). 
We are using **Tailwind CSS v4** for styling.

### ⚙️ Where to write Backend code
API endpoints belong in `app/api/`. However, keep the routes thin! Move actual business logic into `lib/features/<feature-name>/service/` to maintain clean architecture.

---

## 📖 API Documentation (Swagger)

We use `next-swagger-doc` with Swagger UI for beautiful, interactive API documentation. 

Once your local server is running (`bun dev`), you can find the complete API endpoint references here:
👉 **[http://localhost:3000/api-doc](http://localhost:3000/api-doc)**

When creating new endpoints in `app/api/`, make sure to add `@swagger` JSDoc comments above your route handlers to automatically populate these docs!

---

## 🛠️ Helpful Commands

Here are some built-in scripts you can run using `bun run <script>`:

- `bun run db:studio` - Opens Prisma Studio at `localhost:5555` to view/edit your Postgres database visually.
- `bun run db:migrate` - Creates and applies new database migrations after you edit `schema.prisma`.
- `bun run db:push` - Pushes schema changes directly to the DB without creating migration files (good for fast prototyping).
- `bun run docker:up` - Starts the Postgres and Qdrant Docker containers in the background.
- `bun run docker:down` - Stops and removes the Docker containers.
- `bun run format` - Runs Prettier to auto-format your codebase and sort Tailwind classes.

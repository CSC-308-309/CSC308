# Getting Started

!!! PLEASE NOTE !!!
DO NOT UPLOAD EXCESSIVE PHOTOS OR VIDEOS (in quantity or size) AS WE CANNOT FINANCIALLY AFFORD FOR THESE TO BE SAVED IN THE S3 BUCKET.
As much as we wish the opposite was true, our bank accounts are not unlimited to support a greater version of S3.
Do not try and test this unless you want to pay for it yourself.
Thank you for your cooperation.

## As a user

### New to the site?

Start by signing up and creating an account. You will be prompted to enter some basic information about yourself and your musical interests.

### Returning user?

Log in to your account to see your information and interact with other users.

### Guide to the site

- Home: Match with people here! Select a "match mode" (Concert Buddies or Musicians) depending on whether or not you're looking for a concert buddy or someone to jam with.
- Profile: Update and add any changes to your personal profile here
- Messages: Converse with friends
- Notifications: See any recent activity that you might have missed
- Events: Find music events in your area

## As a developer

Good luck.

### Installation

From the repo root, install all dependencies for both frontend and backend:

```bash
npm install
```

### Running Locally

Both servers must run simultaneously. Open two terminal tabs:

**Terminal 1 — Backend** (runs on port 8000):
```bash
npm run dev:backend
```

**Terminal 2 — Frontend** (runs on port 5173):
```bash
npm run dev:frontend
```

The app will be available at `http://localhost:5173`.

# Figma Storyboard

https://www.figma.com/files/team/1562171713696228317/project/478828045/user-profile-and-swiping-page-figma?fuid=1562170179457328451

Code linter/style checker:

- We will be using the following to style our code:
  - https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
  - https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
    To install these:
- Open VScode, click the extensions tab on the left, search "Prettier" and install the "Prettier- Code Checker" option
- Search "ESLint" and install

To run linting and formatting from the command line:

```bash
# Check for lint errors
npm run lint --workspace=frontend

# Auto-format all frontend files
npm run format --workspace=frontend
```

Linting runs automatically in CI on every push to `main`.

# Deployment Link

https://csc-308-frontend.vercel.app/

# Product Specification

https://docs.google.com/document/d/1cBSxzDnsi8fmFt1OEzrzvhNNLxf60j3GwNR_LEQkPOk/edit?usp=sharing

# Acceptance Criteria Specification

https://docs.google.com/document/d/1UCSDfnOukAlMDDa9tCvZlb1Q7RUqmdO0tZTUPfsYoag/edit?usp=sharing

# Database Schema

https://drawsql.app/teams/yanitsa-ivanova/diagrams/database

# Jira Board
https://csc308.atlassian.net/jira/software/projects/SCRUM/summary

# Software Tests

### Unit Tests (Backend — Jest)

```bash
npm run test:backend                                        # Run all unit tests
npm run test --workspace=backend -- --coverage              # Run with coverage report
```

Coverage output is written to `backend/coverage/`.

![Alt text](CodeCoverageReport.png)

### Acceptance Tests (Cypress — E2E + API)

Requires both servers running locally (see Running Locally above). Then from the `frontend/` directory:

```bash
cd frontend

# Interactive mode — opens Cypress GUI
npx cypress open

# Headless mode — runs in terminal, saves video to cypress/videos/
npx cypress run --spec "cypress/e2e/api_testing.cy.js,cypress/e2e/implemented_features.cy.js"
```

| File | Type | What it tests |
|------|------|---------------|
| `cypress/e2e/api_testing.cy.js` | API | `GET /`, `POST /auth/signup` |
| `cypress/e2e/implemented_features.cy.js` | E2E | Sign In, Messaging, Change Email |
| `cypress/e2e/acceptance_criteria.feature` | Gherkin docs | Acceptance criteria specs (not executable) |

Acceptance tests are run locally only and are not part of the CI pipeline.

# CI/CD

All pipelines trigger automatically on push to `main`. No manual setup is needed for existing team members.

| Workflow | File | What it does |
|----------|------|--------------|
| CI Testing | `.github/workflows/ci-testing.yml` | Lint frontend, run backend unit tests, build frontend |

The CI Testing pipeline runs on every push: installs dependencies, lints the frontend, runs backend unit tests, and verifies the frontend builds. Fix all lint and test errors before pushing to `main`.

Frontend is deployed via Vercel (see Deployment Link above). Backend deployment is managed separately.

# Final 308 Demo with Narration

https://youtu.be/d43Ztc0KPag

Slideshow presentation with additional details: https://docs.google.com/presentation/d/1nN9K7NHVVDa2uYaUaGTo0s8Ay0OibK8aS-BEL1VRync/edit?usp=sharing

# Database Setup

This project uses **PostgreSQL** as the database with support for multiple environments (Production, Development). The database is hosted on [Neon](https://neon.tech/).

## Environment Setup

1. Go to [Neon Tech](https://neon.tech/) and Copy your connection strings from the dashboard (for production and development). It should look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

2. Create a `.env` file in the **root directory** of your project with the following variables:

```env
DEVELOPMENT_CONNECTION_STRING=
PRODUCTION_CONNECTION_STRING=
PORT=8000
DB_TYPE=DEVELOPMENT
JWT_SECRET=
VITE_BASE_URL=
AWS_REGION=
S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

# Git Workflow Guide

## Medical Appointment Booking System

| Field            | Detail                                            |
|------------------|---------------------------------------------------|
| **Project**      | Medical Appointment Booking System                |
| **Tech Stack**   | React · Node.js/Express · MongoDB/Mongoose        |
| **Date Created** | February 13, 2026                                 |

---

## Table of Contents

1. [Remote Repository Setup & Best Practices](#1-remote-repository-setup--best-practices)
2. [Branching Strategy](#2-branching-strategy)
3. [Commit Convention](#3-commit-convention)
4. [Pull Request Workflow](#4-pull-request-workflow)
5. [Feature Breakdown & Commit Plans](#5-feature-breakdown--commit-plans)
6. [CI/CD & Branch Protection](#6-cicd--branch-protection)
7. [Quick Reference Cheat Sheet](#7-quick-reference-cheat-sheet)

---

## 1. Remote Repository Setup & Best Practices

### 1.1 Creating the Remote Repository

```bash
# 1. Create the repo on GitHub (using GitHub CLI)
gh repo create medical-appointment-booking-system \
  --public \
  --description "Full-stack Medical Appointment Booking System (React + Node.js/Express + MongoDB)" \
  --license MIT

# 2. Or create manually on github.com, then connect:
git init
git remote add origin https://github.com/<your-username>/medical-appointment-booking-system.git
```

### 1.2 Essential Files to Include from Day One

| File                | Purpose                                                     |
|---------------------|-------------------------------------------------------------|
| `README.md`         | Project overview, tech stack, setup instructions, screenshots |
| `.gitignore`        | Ignore `node_modules/`, `.env`, `dist/`, `build/`, logs     |
| `LICENSE`           | MIT or your preferred license                                |
| `.env.example`      | Template of all required env vars (**never** commit `.env**) |
| `docs/`             | SRS, API docs, workflow guides (this file)                   |

### 1.3 `.gitignore` (Combined Client + Server)

```gitignore
# Dependencies
node_modules/

# Environment
.env
.env.local
.env.*.local

# Build output
dist/
build/
coverage/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Logs
*.log
npm-debug.log*
```

### 1.4 Remote Repo Best Practices

| Practice                          | Why It Matters                                        |
|-----------------------------------|-------------------------------------------------------|
| **Never push to `main` directly** | Protects production-ready code from unreviewed changes |
| **Never commit secrets**          | `.env` files, API keys, and passwords stay local       |
| **Use SSH or HTTPS + credential helper** | Secure and avoids repeated password prompts   |
| **Tag releases with SemVer**      | `v1.0.0`, `v1.1.0` — tracks milestones clearly       |
| **Write a proper README**         | First impression; includes setup, usage, and architecture |
| **Keep the repo clean**           | No large binaries, no IDE configs, no OS artifacts     |

### 1.5 Initial Commit Sequence

```bash
git init
git add README.md .gitignore LICENSE docs/
git commit -m "chore: initial project setup with README, .gitignore, and SRS docs"
git branch -M main
git remote add origin <repo-url>
git push -u origin main
```

---

## 2. Branching Strategy

We use a **simplified Git Flow** with three branch tiers:

```
main ─────────────────────────────────────────────────── (production-ready)
  │
  └── develop ────────────────────────────────────────── (integration branch)
        │
        ├── feature/auth-registration ────────────────── (feature work)
        ├── feature/admin-user-management
        ├── fix/appointment-double-booking
        └── hotfix/login-token-expiry
```

### Branch Types

| Branch          | Pattern                    | Created From | Merges Into       | Purpose                       |
|-----------------|----------------------------|:------------:|:-----------------:|-------------------------------|
| `main`          | `main`                     | —            | —                 | Always deployable, tagged releases |
| `develop`       | `develop`                  | `main`       | `main`            | Integration of all features    |
| **Feature**     | `feature/<scope>-<desc>`   | `develop`    | `develop`         | New functionality              |
| **Fix**         | `fix/<scope>-<desc>`       | `develop`    | `develop`         | Bug fixes                      |
| **Hotfix**      | `hotfix/<desc>`            | `main`       | `main` + `develop`| Critical production fixes      |
| **Chore**       | `chore/<desc>`             | `develop`    | `develop`         | Config, CI, refactoring        |

### Naming Conventions

```
feature/auth-registration
feature/auth-login-jwt
feature/admin-user-management
feature/admin-specialty-crud
feature/doctor-availability
feature/doctor-appointments
feature/patient-browse-doctors
feature/patient-book-appointment
feature/patient-manage-appointments
feature/email-notifications
fix/appointment-validation
chore/ci-pipeline-setup
chore/docker-configuration
```

### Creating a Feature Branch

```bash
# Always start from an up-to-date develop
git checkout develop
git pull origin develop
git checkout -b feature/auth-registration
```

---

## 3. Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) to keep history clean and enable automated changelogs.

### Format

```
<type>(<scope>): <short description>

[optional body — explains WHY, not WHAT]

[optional footer — e.g. Closes #42]
```

### Types

| Type       | When to Use                                       | Example                                        |
|------------|---------------------------------------------------|------------------------------------------------|
| `feat`     | New feature or user-facing functionality           | `feat(auth): add user registration endpoint`   |
| `fix`      | Bug fix                                            | `fix(appointment): prevent double-booking race condition` |
| `docs`     | Documentation only                                 | `docs(api): add Swagger annotations for auth routes` |
| `style`    | Formatting, whitespace (no logic change)           | `style(client): fix linting warnings`          |
| `refactor` | Code restructure without behavior change           | `refactor(models): extract validation to utils`|
| `test`     | Add or update tests                                | `test(auth): add login integration tests`      |
| `chore`    | Build, config, CI/CD, dependencies                 | `chore(deps): upgrade mongoose to v8`          |
| `perf`     | Performance improvement                            | `perf(query): add index to appointments lookup`|

### Scopes (Derived from SRS Modules)

| Scope            | Maps to SRS Section                      |
|------------------|------------------------------------------|
| `auth`           | FR-AUTH-01 to FR-AUTH-03                 |
| `admin`          | FR-ADMIN-01 to FR-ADMIN-05              |
| `doctor`         | FR-DOC-01 to FR-DOC-05                  |
| `patient`        | FR-PAT-01 to FR-PAT-07                  |
| `appointment`    | FR-APPT-01 to FR-APPT-03                |
| `specialty`      | FR-ADMIN-03                              |
| `notification`   | FR-NOTIF-01                              |
| `middleware`      | Auth, RBAC, validation, error handling   |
| `models`         | Mongoose schemas                         |
| `config`         | DB, env, email config                    |
| `client`         | General frontend                         |
| `ui`             | MUI components & layouts                 |

### Rules

- **Atomic commits**: Each commit does ONE thing. If you can't describe it in one line, split it.
- **Present tense, imperative mood**: "add", not "added" or "adds".
- **Max 72 characters** for the subject line.
- **No periods** at the end of the subject.

---

## 4. Pull Request Workflow

### 4.1 Lifecycle

```
1. Create feature branch from develop
2. Make atomic commits (see Section 3)
3. Push branch to remote
4. Open Pull Request → develop
5. Fill in PR template (below)
6. Request review from at least 1 teammate
7. Address review comments (push new commits, don't force-push)
8. Reviewer approves → Squash & Merge into develop
9. Delete the feature branch (remote + local)
```

```bash
# Push and open PR
git push -u origin feature/auth-registration
# Then open PR on GitHub (or use CLI):
gh pr create --base develop --title "feat(auth): add user registration" --body-file .github/PULL_REQUEST_TEMPLATE.md
```

### 4.2 Pull Request Template

The full PR template lives at **[`.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md)** and is auto-populated by GitHub when opening a new PR. It includes the following sections:

| Section                  | Purpose                                                        |
|--------------------------|----------------------------------------------------------------|
| **Summary**              | Concise description of what the PR does and why                |
| **Related SRS Reqs**     | Traceability to Functional Requirements (e.g. `FR-AUTH-01`)   |
| **Type of Change**       | Feature, bug fix, docs, refactor, perf, test, security, breaking |
| **Changes Made**         | Backend / Frontend / Database subsections                      |
| **Screenshots**          | Before/after table for UI changes                              |
| **Testing**              | Checklist + test evidence block                                |
| **PR Checklist**         | Code quality, conventions, secrets, self-review                |
| **Deployment Notes**     | Post-merge steps (env vars, migrations, seeds)                 |
| **Additional Context**   | Trade-offs, alternatives, known limitations                    |

### 4.3 PR Rules

| Rule                               | Rationale                                         |
|------------------------------------|---------------------------------------------------|
| **PRs target `develop`**, never `main` | `main` is only updated via release merges       |
| **Keep PRs small** (< 400 lines)   | Easier to review, fewer merge conflicts            |
| **1 PR = 1 feature or 1 fix**      | Keeps changes focused and revertable               |
| **At least 1 reviewer**            | Catches bugs, shares knowledge                     |
| **Squash & Merge**                 | Keeps `develop` history linear and clean            |
| **Delete branch after merge**      | Prevents stale branches from accumulating           |
| **Link to SRS requirement**        | Traceability from code to requirements              |

---

## 5. Feature Breakdown & Commit Plans

Below is the recommended feature-by-feature breakdown with the exact commits per PR. Each feature maps to a PR targeting `develop`.

---

### PR #1 — `chore/project-setup`

> **Goal**: Initialize monorepo structure, tooling, and configuration.

| # | Commit Message | Files Touched |
|:-:|----------------|---------------|
| 1 | `chore: initialize project with README and .gitignore` | `README.md`, `.gitignore` |
| 2 | `chore(server): initialize Express backend with package.json` | `server/package.json`, `server/server.js`, `server/src/app.js` |
| 3 | `chore(server): add environment config and DB connection` | `server/src/config/db.js`, `server/src/config/env.js`, `server/.env.example` |
| 4 | `chore(client): initialize React app with Vite` | `client/package.json`, `client/vite.config.js`, `client/src/main.jsx`, `client/src/App.jsx` |
| 5 | `chore(client): configure MUI theme and global styles` | `client/src/styles/theme.js`, `client/src/styles/global.css` |
| 6 | `chore: add PR template and contributing guide` | `.github/PULL_REQUEST_TEMPLATE.md` |

---

### PR #2 — `feature/auth-registration`

> **SRS**: FR-AUTH-01 · FR-AUTH-02 · FR-AUTH-03

| # | Commit Message | Description |
|:-:|----------------|-------------|
| 1 | `feat(models): add User schema with role and auth fields` | `User.js` — name, email, password (bcrypt), role, isApproved, isBlocked |
| 2 | `feat(middleware): add JWT auth and role-based authorization` | `auth.js`, `authorize.js` — token verification, RBAC middleware |
| 3 | `feat(auth): add registration endpoint with validation` | `authController.js`, `authService.js`, `authRoutes.js` |
| 4 | `feat(auth): add login endpoint with JWT generation` | Login logic, `tokenUtils.js` |
| 5 | `feat(middleware): add global error handler and async wrapper` | `errorHandler.js`, `catchAsync.js`, `ApiError.js` |
| 6 | `test(auth): add unit tests for register and login` | Auth tests |

---

### PR #3 — `feature/auth-frontend`

> **SRS**: FR-AUTH-01 · FR-AUTH-02 (Frontend)

| # | Commit Message | Description |
|:-:|----------------|-------------|
| 1 | `feat(client): add Axios instance with auth interceptor` | `axiosInstance.js` — base URL, token attach, 401 redirect |
| 2 | `feat(auth): add AuthContext and useAuth hook` | `AuthContext.jsx`, `useAuth.js` — login/logout/register state |
| 3 | `feat(auth): add LoginPage with form validation` | `LoginPage.jsx`, `LoginForm.jsx` — MUI form, React Hook Form |
| 4 | `feat(auth): add RegisterPage with role selection` | `RegisterPage.jsx`, `RegisterForm.jsx` |
| 5 | `feat(ui): add ProtectedRoute component` | `ProtectedRoute.jsx` — role-gated routing |
| 6 | `feat(ui): add AppRouter with public and protected routes` | `AppRouter.jsx` |

---

### PR #4 — `feature/admin-user-management`

> **SRS**: FR-ADMIN-01 · FR-ADMIN-02 · FR-ADMIN-04

| # | Commit Message | Description |
|:-:|----------------|-------------|
| 1 | `feat(admin): add list users endpoint with pagination and filters` | `userController.js`, `userRoutes.js` |
| 2 | `feat(admin): add approve and block user endpoints` | PATCH `/users/:id/approve`, `/users/:id/block` |
| 3 | `feat(admin): add CRUD endpoints for doctor management` | Create, update, delete doctor accounts |
| 4 | `feat(admin): add AdminLayout with sidebar navigation` | `AdminLayout.jsx` |
| 5 | `feat(admin): add UsersPage with table, search, and actions` | `UsersPage.jsx`, `UsersTable.jsx` |
| 6 | `test(admin): add tests for user management endpoints` | API tests |

---

### PR #5 — `feature/admin-specialty-crud`

> **SRS**: FR-ADMIN-03

| # | Commit Message | Description |
|:-:|----------------|-------------|
| 1 | `feat(models): add Specialty schema` | `Specialty.js` — name (unique), description |
| 2 | `feat(specialty): add CRUD API endpoints` | `specialtyController.js`, `specialtyRoutes.js` |
| 3 | `feat(admin): add SpecialtiesPage with form and list` | `SpecialtiesPage.jsx`, `SpecialtyForm.jsx` |
| 4 | `test(specialty): add tests for specialty CRUD` | API tests |

---

### PR #6 — `feature/doctor-profile-availability`

> **SRS**: FR-DOC-01 · FR-DOC-03

| # | Commit Message | Description |
|:-:|----------------|-------------|
| 1 | `feat(models): add Doctor profile and Availability schemas` | `Doctor.js`, `Availability.js` with composite index |
| 2 | `feat(doctor): add profile update endpoint` | PUT `/doctors/profile` |
| 3 | `feat(doctor): add availability CRUD endpoints` | POST/PUT/DELETE `/doctors/availability` with overlap validation |
| 4 | `feat(doctor): add DoctorLayout with navigation` | `DoctorLayout.jsx` |
| 5 | `feat(doctor): add ProfilePage and AvailabilityPage` | Frontend forms for availability management |
| 6 | `test(doctor): add tests for availability slot validation` | Overlap detection, time format tests |

---

### PR #7 — `feature/patient-browse-doctors`

> **SRS**: FR-PAT-01 · FR-PAT-02

| # | Commit Message | Description |
|:-:|----------------|-------------|
| 1 | `feat(doctor): add public list and detail endpoints` | GET `/doctors`, GET `/doctors/:id` |
| 2 | `feat(doctor): add available-slots endpoint for specific date` | GET `/doctors/:id/available-slots?date=YYYY-MM-DD` |
| 3 | `feat(models): add Patient profile schema` | `Patient.js` |
| 4 | `feat(patient): add PatientLayout with navigation` | `PatientLayout.jsx` |
| 5 | `feat(patient): add DoctorsPage with search and filters` | `DoctorsPage.jsx`, `DoctorCard.jsx` — filter by specialty/name |
| 6 | `test(patient): add tests for doctor listing and filtering` | API tests |

---

### PR #8 — `feature/patient-book-appointment`

> **SRS**: FR-PAT-03 · FR-APPT-01 · FR-APPT-02 · FR-APPT-03

| # | Commit Message | Description |
|:-:|----------------|-------------|
| 1 | `feat(models): add Appointment schema with status lifecycle` | `Appointment.js` with compound unique index (`doctorId`, `date`, `startTime`) |
| 2 | `feat(appointment): add booking endpoint with double-booking prevention` | Atomic `findOneAndUpdate` or transaction |
| 3 | `feat(appointment): add status transition validation` | Enforce valid state machine (pending → confirmed/cancelled, etc.) |
| 4 | `feat(patient): add BookAppointmentPage with slot picker` | `BookAppointmentPage.jsx`, `BookingForm.jsx` |
| 5 | `test(appointment): add concurrency tests for double-booking` | Race condition tests |

---

### PR #9 — `feature/patient-manage-appointments`

> **SRS**: FR-PAT-04 · FR-PAT-05 · FR-PAT-06 · FR-PAT-07

| # | Commit Message | Description |
|:-:|----------------|-------------|
| 1 | `feat(appointment): add list own appointments endpoint` | GET `/appointments` with status and date filters |
| 2 | `feat(appointment): add cancel and reschedule endpoints` | PATCH `/appointments/:id/cancel`, `/appointments/:id/reschedule` |
| 3 | `feat(patient): add profile update endpoint and page` | PUT profile, `ProfilePage.jsx` |
| 4 | `feat(patient): add MyAppointmentsPage with status badges` | `MyAppointmentsPage.jsx`, `AppointmentList.jsx` |
| 5 | `test(appointment): add tests for cancel and reschedule flows` | Tests |

---

### PR #10 — `feature/doctor-appointments`

> **SRS**: FR-DOC-02 · FR-DOC-04 · FR-DOC-05

| # | Commit Message | Description |
|:-:|----------------|-------------|
| 1 | `feat(appointment): add doctor approve/reject endpoints` | PATCH `/appointments/:id/approve`, `/appointments/:id/reject` |
| 2 | `feat(appointment): add complete and add-notes endpoints` | PATCH `/appointments/:id/complete`, `/appointments/:id/notes` |
| 3 | `feat(doctor): add AppointmentsPage with filter and actions` | `AppointmentsPage.jsx`, `AppointmentCard.jsx` |
| 4 | `test(doctor): add tests for appointment status transitions` | Tests |

---

### PR #11 — `feature/admin-appointments`

> **SRS**: FR-ADMIN-05

| # | Commit Message | Description |
|:-:|----------------|-------------|
| 1 | `feat(admin): add list-all-appointments endpoint with filters` | GET `/appointments/all` — status, doctor, patient, date range |
| 2 | `feat(admin): add AppointmentsPage with data table` | `AppointmentsPage.jsx` |
| 3 | `test(admin): add tests for admin appointment listing` | Tests |

---

### PR #12 — `feature/email-notifications`

> **SRS**: FR-NOTIF-01

| # | Commit Message | Description |
|:-:|----------------|-------------|
| 1 | `feat(config): add Nodemailer transport configuration` | `email.js` with SMTP config |
| 2 | `feat(notification): add email service with booking templates` | `emailService.js` — confirmation, cancellation emails |
| 3 | `feat(appointment): integrate email on booking and status change` | Hook email into appointment controller |
| 4 | `test(notification): add email service tests with mock transport` | Tests with stubbed SMTP |

---

### PR #13 — `chore/dashboards-polish`

> **Goal**: Role-specific dashboard pages with summary stats and UI polish.

| # | Commit Message | Description |
|:-:|----------------|-------------|
| 1 | `feat(admin): add admin dashboard with stats cards` | `DashboardPage.jsx` — total users, appointments, pending approvals |
| 2 | `feat(doctor): add doctor dashboard with upcoming appointments` | `DashboardPage.jsx` — today's schedule, pending count |
| 3 | `feat(patient): add patient dashboard with quick actions` | `DashboardPage.jsx` — upcoming appointment, book new |
| 4 | `feat(ui): add shared Navbar and Footer components` | `Navbar.jsx`, `Footer.jsx` |
| 5 | `style(client): polish responsive layout and transitions` | CSS tweaks, animations |

---

## 6. CI/CD & Branch Protection

### 6.1 Recommended Branch Protection Rules (`main`)

| Setting                                  | Value   |
|------------------------------------------|---------|
| Require pull request before merging      | ✅ Yes  |
| Required number of approvals             | 1       |
| Dismiss stale reviews on new push        | ✅ Yes  |
| Require status checks to pass            | ✅ Yes  |
| Require branches to be up to date        | ✅ Yes  |
| Restrict who can push                    | Admins  |
| Include administrators in restrictions   | ✅ Yes  |

Apply similar rules to `develop` with approve count of 1.

### 6.2 Suggested GitHub Actions (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  pull_request:
    branches: [develop, main]

jobs:
  server-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: cd server && npm ci
      - run: cd server && npm test

  client-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: cd client && npm ci
      - run: cd client && npm run build

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: cd server && npm ci && npm run lint
      - run: cd client && npm ci && npm run lint
```

### 6.3 Release Process

```bash
# When develop is stable and all features are merged:
git checkout main
git merge develop --no-ff -m "release: v1.0.0 — initial release"
git tag -a v1.0.0 -m "v1.0.0: Full appointment booking system"
git push origin main --tags

# Keep develop in sync
git checkout develop
git merge main
git push origin develop
```

---

## 7. Quick Reference Cheat Sheet

### Daily Workflow

```bash
# 1. Start your day — sync develop
git checkout develop && git pull origin develop

# 2. Create or switch to your feature branch
git checkout -b feature/patient-book-appointment

# 3. Work & commit atomically
git add server/src/models/Appointment.js
git commit -m "feat(models): add Appointment schema with status lifecycle"

# 4. Push regularly
git push -u origin feature/patient-book-appointment

# 5. When done — open PR on GitHub targeting develop

# 6. After PR is merged — clean up
git checkout develop && git pull origin develop
git branch -d feature/patient-book-appointment
git push origin --delete feature/patient-book-appointment
```

### Handling Merge Conflicts

```bash
# Update your feature branch with latest develop
git checkout feature/your-feature
git fetch origin
git rebase origin/develop
# Resolve conflicts, then:
git add .
git rebase --continue
git push --force-with-lease
```

### Useful Aliases

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --decorate -20"
```

---

> **Document End** — This workflow is designed specifically for the Medical Appointment Booking System. All team members should follow these conventions to maintain a clean, traceable, and collaborative codebase.

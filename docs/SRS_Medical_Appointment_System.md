# Software Requirements Specification (SRS)

## Medical Appointment Booking System

### React + Node.js/Express

| Field             | Detail                                      |
|-------------------|---------------------------------------------|
| **Document Version** | 1.0                                       |
| **Date**             | February 12, 2026                         |
| **Project Name**     | Medical Appointment Booking System        |
| **Tech Stack**       | React (Frontend) · Node.js/Express (Backend) · MongoDB/Mongoose (Database) |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [System Architecture](#4-system-architecture)
5. [Database Design](#5-database-design)
6. [API Specification](#6-api-specification)
7. [Frontend Specification](#7-frontend-specification)
8. [Glossary](#8-glossary)

---

## 1. Introduction

### 1.1 Purpose

This document defines the complete software requirements for the **Medical Appointment Booking System**. The system enables patients to discover doctors, view their availability, and book appointments online. Doctors manage their schedules and respond to bookings, while administrators oversee the entire platform.

### 1.2 Scope

The application is a full-stack web platform composed of:

- **Frontend**: A React single-page application (SPA) that serves role-specific dashboards for Admins, Doctors, and Patients.
- **Backend**: A RESTful API built with Node.js and Express.js, responsible for business logic, data persistence, and authentication.
- **Database**: A MongoDB document database with Mongoose ODM, storing users, appointments, schedules, and specialties.

### 1.3 Definitions & Acronyms

| Term  | Definition                                          |
|-------|------------------------------------------------------|
| SRS   | Software Requirements Specification                 |
| JWT   | JSON Web Token                                      |
| RBAC  | Role-Based Access Control                           |
| SPA   | Single-Page Application                             |
| REST  | Representational State Transfer                     |
| CRUD  | Create, Read, Update, Delete                        |
| ODM   | Object-Document Mapping (Mongoose)                  |

---

## 2. Overall Description

### 2.1 Product Perspective

The system is a self-contained web application. It does not depend on external legacy systems. It communicates exclusively over HTTPS and follows the client-server architecture pattern:

```
┌──────────────┐       HTTPS/REST        ┌──────────────────────┐       ┌────────────┐
│  React SPA   │  ◄──────────────────►   │  Express.js API      │  ◄──► │  Database  │
│  (Frontend)  │                         │  (Backend)           │       │  (MongoDB) │
└──────────────┘                         └──────────────────────┘       └────────────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │ Email Service│
                                          │ (Nodemailer) │
                                          └──────────────┘
```

### 2.2 User Classes & Characteristics

| Role      | Description                                                                 |
|-----------|-----------------------------------------------------------------------------|
| **Admin** | Platform administrator with full access. Manages users, specialties, and system configuration. |
| **Doctor** | Medical professional who configures availability and manages appointments.  |
| **Patient** | End-user who searches for doctors, books appointments, and manages bookings. |

### 2.3 Operating Environment

| Component   | Requirement                                        |
|-------------|-----------------------------------------------------|
| Server      | Node.js >= 18 LTS, npm/yarn                        |
| Database    | MongoDB >= 6                                        |
| Frontend    | Modern browsers (Chrome, Firefox, Safari, Edge)     |
| Hosting     | Any cloud provider (AWS, GCP, Azure, DigitalOcean)  |

### 2.4 Constraints

- Bootstrap is **not** permitted for UI styling. Use Material UI (MUI) or another UI library.
- Authentication must use JWT.
- The API must be stateless; no server-side sessions.

### 2.5 Assumptions & Dependencies

- Users have a valid email address for registration.
- The server has access to an SMTP service for sending emails (e.g., Gmail SMTP, SendGrid, Mailgun).
- The system clock on the server is synchronized (NTP) for accurate appointment scheduling.

---

## 3. Functional Requirements

### 3.1 User Roles & Authentication

#### FR-AUTH-01: User Registration

| Attribute    | Detail |
|-------------|--------|
| **Description** | Patients and Doctors can create an account by providing required information. |
| **Actors**      | Patient, Doctor |
| **Preconditions** | None |
| **Input**       | Full name, email, password, role selection (patient/doctor) |
| **Processing**  | 1. Validate input (email format, password strength). 2. Check for duplicate email. 3. Hash password using bcrypt. 4. Store user record with `isApproved = false` for doctors. |
| **Output**      | Success message with user ID, or validation error. |
| **Priority**    | High |

#### FR-AUTH-02: User Login

| Attribute    | Detail |
|-------------|--------|
| **Description** | Registered users authenticate with email and password. |
| **Actors**      | Admin, Doctor, Patient |
| **Preconditions** | Account exists and is not blocked. |
| **Input**       | Email, password |
| **Processing**  | 1. Validate credentials against hashed password. 2. Check if user is blocked. 3. Generate JWT token. |
| **Output**      | `{ token, user: { id, name, email, role } }` |
| **Priority**    | High |

#### FR-AUTH-03: Role-Based Access Control (RBAC)

| Attribute    | Detail |
|-------------|--------|
| **Description** | Every API endpoint is protected by middleware that checks the user's role against the required permission. |
| **Roles & Permissions** | See the table below. |
| **Priority**    | High |

**Permissions Matrix:**

| Endpoint Group       | Admin | Doctor | Patient |
|----------------------|:-----:|:------:|:-------:|
| Manage all users     | ✅    | ❌     | ❌      |
| Approve/block users  | ✅    | ❌     | ❌      |
| CRUD specialties     | ✅    | ❌     | ❌      |
| View all appointments| ✅    | ❌     | ❌      |
| Set availability     | ❌    | ✅     | ❌      |
| View own appointments| ❌    | ✅     | ✅      |
| Manage own profile   | ❌    | ✅     | ✅      |
| Book appointment     | ❌    | ❌     | ✅      |
| Browse doctors       | ❌    | ❌     | ✅      |

---

### 3.2 Admin Capabilities

#### FR-ADMIN-01: View All Users

| Attribute    | Detail |
|-------------|--------|
| **Description** | Admin can view a paginated list of all registered doctors and patients. |
| **Filters**     | Role, approval status, name search |
| **Output**      | List of users with id, name, email, role, isApproved, isBlocked, createdAt |
| **Priority**    | High |

#### FR-ADMIN-02: Approve or Block Users

| Attribute    | Detail |
|-------------|--------|
| **Description** | Admin can approve pending doctor registrations or block/unblock any user. |
| **Processing**  | 1. Update `isApproved` or `isBlocked` field. |
| **Priority**    | High |

#### FR-ADMIN-03: Manage Specialties

| Attribute    | Detail |
|-------------|--------|
| **Description** | Admin can perform CRUD operations on medical specialties (e.g., Cardiology, Dermatology). |
| **Input**       | Specialty name, description (optional) |
| **Validation**  | Specialty name must be unique. |
| **Priority**    | Medium |

#### FR-ADMIN-04: Manage Doctors (CRUD)

| Attribute    | Detail |
|-------------|--------|
| **Description** | Admin can create, update, or remove doctor accounts and assign specialties. |
| **Priority**    | Medium |

#### FR-ADMIN-05: View All Appointments

| Attribute    | Detail |
|-------------|--------|
| **Description** | Admin can view all appointments across the platform with filtering and pagination. |
| **Filters**     | Status, doctor, patient, date range |
| **Priority**    | Medium |

---

### 3.3 Doctor Capabilities

#### FR-DOC-01: Set Availability Schedule

| Attribute    | Detail |
|-------------|--------|
| **Description** | Doctors define recurring or one-time availability slots (day of week + start/end time). |
| **Input**       | Array of `{ dayOfWeek, startTime, endTime }` or specific date slots. |
| **Validation**  | Time slots must not overlap. `endTime > startTime`. |
| **Priority**    | High |

#### FR-DOC-02: View Appointments

| Attribute    | Detail |
|-------------|--------|
| **Description** | Doctors can see a list of their upcoming and past appointments. |
| **Filters**     | Status (pending, confirmed, completed, cancelled), date range |
| **Output**      | Appointment details including patient info, date/time, status, notes. |
| **Priority**    | High |

#### FR-DOC-03: Manage Profile

| Attribute    | Detail |
|-------------|--------|
| **Description** | Doctors can update their specialty, bio, and contact information. |
| **Input**       | Bio, phone, specialty ID |
| **Priority**    | Medium |

#### FR-DOC-04: Approve/Reject Appointments *(Optional)*

| Attribute    | Detail |
|-------------|--------|
| **Description** | Doctors can approve or reject pending appointment requests. |
| **Processing**  | 1. Update appointment status to `confirmed` or `cancelled`. |
| **Priority**    | Medium |

#### FR-DOC-05: Add Appointment Notes *(Optional)*

| Attribute    | Detail |
|-------------|--------|
| **Description** | Doctors can add notes or comments to an appointment record. |
| **Input**       | Free-text notes |
| **Priority**    | Low |

---

### 3.4 Patient Capabilities

#### FR-PAT-01: Browse Doctors

| Attribute    | Detail |
|-------------|--------|
| **Description** | Patients can view a list of approved doctors with search and filter capabilities. |
| **Filters**     | Specialty, doctor name |
| **Output**      | Doctor name, specialty, bio, availability summary. |
| **Priority**    | High |

#### FR-PAT-02: View Doctor Availability

| Attribute    | Detail |
|-------------|--------|
| **Description** | Patients can view available time slots for a selected doctor on a given date. |
| **Processing**  | 1. Fetch doctor's schedule. 2. Subtract already-booked slots. 3. Return available slots. |
| **Output**      | List of available `{ date, startTime, endTime }` slots. |
| **Priority**    | High |

#### FR-PAT-03: Book Appointment

| Attribute    | Detail |
|-------------|--------|
| **Description** | Patients select an available slot and submit a booking request. |
| **Input**       | Doctor ID, date, time slot, optional reason/notes. |
| **Processing**  | 1. Re-validate slot availability (real-time check). 2. Create appointment with `status: "pending"`. 3. Send confirmation email. |
| **Concurrency** | Use database-level locking or atomic operations to prevent double-booking. |
| **Priority**    | High |

#### FR-PAT-04: View Own Appointments

| Attribute    | Detail |
|-------------|--------|
| **Description** | Patients can see their booked appointments list with statuses. |
| **Filters**     | Status, date range |
| **Priority**    | High |

#### FR-PAT-05: Cancel Appointment

| Attribute    | Detail |
|-------------|--------|
| **Description** | Patients can cancel a pending or confirmed appointment. |
| **Processing**  | 1. Update status to `cancelled`. 2. Free up the time slot. |
| **Priority**    | High |

#### FR-PAT-06: Reschedule Appointment

| Attribute    | Detail |
|-------------|--------|
| **Description** | Patients can change the date/time of an existing appointment. |
| **Processing**  | 1. Cancel old slot. 2. Validate new slot. 3. Book new slot. 4. Update appointment record. |
| **Priority**    | Medium |

#### FR-PAT-07: Edit Profile

| Attribute    | Detail |
|-------------|--------|
| **Description** | Patients can update their personal profile information (name, phone number). |
| **Priority**    | Medium |

---

### 3.5 Appointment Management

#### FR-APPT-01: Real-Time Availability Validation

| Attribute    | Detail |
|-------------|--------|
| **Description** | Before confirming a booking, the system checks that the requested slot is still available. |
| **Implementation** | Atomic database query using Mongoose `findOneAndUpdate` with conditions, or MongoDB transactions. |
| **Priority**    | High |

#### FR-APPT-02: Double-Booking Prevention

| Attribute    | Detail |
|-------------|--------|
| **Description** | The system must guarantee that no two patients can book the same doctor for the same time slot. |
| **Implementation** | Unique compound index on `{ doctorId, date, startTime }` in MongoDB via Mongoose schema. |
| **Priority**    | High |

#### FR-APPT-03: Appointment Status Lifecycle

The appointment follows this state machine:

```
  ┌──────────┐     book      ┌──────────┐    approve    ┌───────────┐
  │          │ ──────────►   │          │ ────────────► │           │
  │  (none)  │               │ PENDING  │               │ CONFIRMED │
  │          │               │          │ ◄──────────── │           │
  └──────────┘               └──────────┘    reject     └───────────┘
                                  │                          │
                          cancel  │                          │  complete
                                  ▼                          ▼
                            ┌───────────┐             ┌───────────┐
                            │ CANCELLED │             │ COMPLETED │
                            └───────────┘             └───────────┘
```

**Valid Statuses:** `pending`, `confirmed`, `completed`, `cancelled`

---

### 3.6 Notifications

#### FR-NOTIF-01: Email Confirmation on Booking

| Attribute    | Detail |
|-------------|--------|
| **Description** | When a patient books an appointment, an email confirmation is sent. |
| **Implementation** | Use **Nodemailer** with an SMTP transport (e.g., Gmail, SendGrid). |
| **Email Content** | Appointment date/time, doctor/patient name, status. |
| **Priority**    | Medium |

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     React Application                         │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  │  │ Auth    │  │ Patient  │  │ Doctor   │  │ Admin        │  │  │
│  │  │ Module  │  │ Module   │  │ Module   │  │ Module       │  │  │
│  │  └────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │  │
│  │       └─────────────┴────────────┴────────────────┘           │  │
│  │                     Axios HTTP Client                         │  │
│  └──────────────────────────┬────────────────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────┼──────────────────────────────────────┐
│                       SERVER (Node.js)                              │
│  ┌──────────────────────────┴────────────────────────────────────┐  │
│  │                     Express.js Application                    │  │
│  │                                                               │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌────────────────────────┐ │  │
│  │  │ Middleware  │  │  Routes     │  │  Controllers           │ │  │
│  │  │ - CORS     │  │  /api/auth  │  │  - authController      │ │  │
│  │  │ - Auth JWT │  │  /api/users │  │  - userController      │ │  │
│  │  │ - Validate │  │  /api/docs  │  │  - doctorController    │ │  │
│  │  │ - Error    │  │  /api/appts │  │  - appointmentController│ │  │
│  │  │            │  │  /api/spec  │  │  - specialtyController │ │  │
│  │  └────────────┘  └─────────────┘  └────────────────────────┘ │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────────────┐ │  │
│  │  │  Services    │  │  Models     │  │  Utilities            │ │  │
│  │  │  (Business   │  │  (Mongoose) │  │  - Email (Nodemailer)│ │  │
│  │  │   Logic)     │  │             │  │  - Token helpers     │ │  │
│  │  │              │  │             │  │  - Validators        │ │  │
│  │  └─────────────┘  └──────┬──────┘  └───────────────────────┘ │  │
│  └──────────────────────────┼────────────────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │    Database        │
                    │     MongoDB        │
                    └───────────────────┘
```

### 4.2 Backend Folder Structure

```
server/
├── src/
│   ├── config/
│   │   ├── db.js                 # MongoDB/Mongoose connection setup
│   │   ├── env.js                # Environment variable validation
│   │   └── email.js              # Nodemailer transport configuration
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   ├── authorize.js          # Role-based authorization middleware
│   │   ├── validate.js           # Request validation middleware (Joi/Zod)
│   │   └── errorHandler.js       # Global error handler
│   ├── models/
│   │   ├── User.js               # Mongoose User schema (base for all roles)
│   │   ├── Doctor.js             # Mongoose Doctor profile schema
│   │   ├── Patient.js            # Mongoose Patient profile schema
│   │   ├── Appointment.js        # Mongoose Appointment schema
│   │   ├── Specialty.js          # Mongoose Specialty schema
│   │   └── Availability.js       # Mongoose Doctor availability schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── userRoutes.js         # /api/users/* (admin)
│   │   ├── doctorRoutes.js       # /api/doctors/*
│   │   ├── patientRoutes.js      # /api/patients/*
│   │   ├── appointmentRoutes.js  # /api/appointments/*
│   │   └── specialtyRoutes.js    # /api/specialties/*
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   ├── appointmentController.js
│   │   └── specialtyController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── doctorService.js
│   │   ├── appointmentService.js
│   │   └── emailService.js
│   ├── utils/
│   │   ├── ApiError.js           # Custom error class
│   │   ├── catchAsync.js         # Async error wrapper
│   │   ├── tokenUtils.js         # JWT sign/verify helpers
│   │   └── constants.js          # Enums and constants
│   └── app.js                    # Express app setup
├── .env                          # Environment variables
├── .env.example                  # Template for environment variables
├── package.json
└── server.js                     # Entry point
```

### 4.3 Frontend Folder Structure (Feature-First)

Each feature is a self-contained module with its own components, pages, hooks, and API services.

```
client/
├── public/
│   └── index.html
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/       # LoginForm, RegisterForm
│   │   │   ├── pages/            # LoginPage.jsx, RegisterPage.jsx
│   │   │   ├── hooks/            # useAuth.js
│   │   │   ├── services/         # authApi.js (Axios calls)
│   │   │   ├── context/          # AuthContext.jsx
│   │   │   └── index.js          # Feature barrel export
│   │   ├── admin/
│   │   │   ├── components/       # UsersTable, SpecialtyForm
│   │   │   ├── pages/            # DashboardPage, UsersPage, SpecialtiesPage, AppointmentsPage
│   │   │   ├── hooks/            # useUsers.js, useSpecialties.js
│   │   │   ├── services/         # adminApi.js
│   │   │   └── index.js
│   │   ├── doctor/
│   │   │   ├── components/       # AvailabilityForm, AppointmentCard
│   │   │   ├── pages/            # DashboardPage, AvailabilityPage, AppointmentsPage, ProfilePage
│   │   │   ├── hooks/            # useAvailability.js, useAppointments.js
│   │   │   ├── services/         # doctorApi.js
│   │   │   └── index.js
│   │   └── patient/
│   │       ├── components/       # DoctorCard, BookingForm, AppointmentList
│   │       ├── pages/            # DashboardPage, DoctorsPage, BookAppointmentPage, MyAppointmentsPage, ProfilePage
│   │       ├── hooks/            # useDoctors.js, useBooking.js
│   │       ├── services/         # patientApi.js
│   │       └── index.js
│   ├── shared/
│   │   ├── components/           # Navbar, Footer, Loader, ProtectedRoute
│   │   ├── hooks/                # useAxios.js
│   │   ├── utils/                # helpers.js
│   │   └── api/                  # axiosInstance.js
│   ├── layouts/
│   │   ├── MainLayout.jsx        # Public layout (Login, Register)
│   │   ├── AdminLayout.jsx       # Admin sidebar + header
│   │   ├── DoctorLayout.jsx      # Doctor sidebar + header
│   │   └── PatientLayout.jsx     # Patient sidebar + header
│   ├── config/
│   │   └── index.js              # API base URL, env variables, app constants
│   ├── styles/
│   │   ├── theme.js              # MUI theme configuration (palette, typography)
│   │   └── global.css            # Global CSS resets and base styles
│   ├── store/                    # Redux Toolkit (alternative to Context)
│   │   ├── store.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       └── appointmentSlice.js
│   ├── routes/
│   │   └── AppRouter.jsx         # Main router (imports from features)
│   ├── assets/                   # Images, icons, fonts
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── vite.config.js
```

---

## 5. Database Design

### 5.1 Entity-Relationship Overview

```
┌──────────┐        ┌────────────┐         ┌──────────────┐
│  User    │ 1───1  │  Doctor    │ 1────M  │ Availability │
│          │        │  Profile   │         │  Slot        │
└──────────┘        └────────────┘         └──────────────┘
     │                    │
     │               M    │ 1
     │          ┌─────────┴──────┐
     │          │  Appointment   │
     │          └─────────┬──────┘
     │               1    │
     │                    │ M
┌──────────┐        ┌────────────┐
│  User    │ 1───1  │  Patient   │
│          │        │  Profile   │
└──────────┘        └────────────┘

┌──────────────┐
│  Specialty   │ 1────M  Doctor
└──────────────┘
```

### 5.2 Schema Definitions

#### Users

| Field         | Type         | Constraints                        |
|---------------|--------------|------------------------------------| 
| `_id`         | ObjectId     | Primary Key, auto-generated        |
| `name`        | String       | Required, max 100 chars            |
| `email`       | String       | Required, unique, valid email      |
| `password`    | String       | Required, bcrypt hashed            |
| `role`        | Enum         | `admin`, `doctor`, `patient`       |
| `isApproved`  | Boolean      | Default: `true` (patient), `false` (doctor) |
| `isBlocked`   | Boolean      | Default: `false`                   |
| `createdAt`   | DateTime     | Auto-generated                     |
| `updatedAt`   | DateTime     | Auto-generated                     |

#### Doctor Profile

| Field          | Type         | Constraints                       |
|----------------|--------------|-----------------------------------|
| `_id`          | ObjectId     | Primary Key                       |
| `userId`       | Ref → Users  | Required, unique                  |
| `specialtyId`  | Ref → Specialty | Required                      |
| `bio`          | Text         | Optional, max 1000 chars          |
| `phone`        | String       | Optional                          |

#### Patient Profile

| Field          | Type         | Constraints                       |
|----------------|--------------|-----------------------------------|
| `_id`          | ObjectId     | Primary Key                       |
| `userId`       | Ref → Users  | Required, unique                  |
| `phone`        | String       | Optional                          |
| `dateOfBirth`  | Date         | Optional                          |

#### Specialty

| Field         | Type         | Constraints                        |
|---------------|--------------|------------------------------------| 
| `_id`         | ObjectId     | Primary Key                        |
| `name`        | String       | Required, unique                   |
| `description` | Text         | Optional                           |

#### Availability

| Field       | Type         | Constraints                          |
|-------------|--------------|--------------------------------------|
| `_id`       | ObjectId     | Primary Key                          |
| `doctorId`  | Ref → Doctor | Required                             |
| `dayOfWeek` | Integer      | 0 (Sunday) – 6 (Saturday)           |
| `startTime` | Time/String  | `HH:mm` format                      |
| `endTime`   | Time/String  | `HH:mm` format, must be > startTime |

**Constraint:** Unique composite on `(doctorId, dayOfWeek, startTime)` to prevent overlapping slots.

#### Appointment

| Field       | Type         | Constraints                          |
|-------------|--------------|--------------------------------------|
| `_id`       | ObjectId     | Primary Key                          |
| `patientId` | Ref → Patient | Required                            |
| `doctorId`  | Ref → Doctor | Required                             |
| `date`      | Date         | Required, must be today or future    |
| `startTime` | Time/String  | Required, from available slot        |
| `endTime`   | Time/String  | Required                             |
| `status`    | Enum         | `pending`, `confirmed`, `completed`, `cancelled` |
| `reason`    | Text         | Optional (patient's reason for visit)|
| `notes`     | Text         | Optional (doctor's clinical notes)   |
| `createdAt` | DateTime     | Auto-generated                       |
| `updatedAt` | DateTime     | Auto-generated                       |

**Constraint:** Unique composite on `(doctorId, date, startTime)` to prevent double booking.

---

## 6. API Specification

### 6.1 Base URL

```
Production:  https://api.example.com/api
Development: http://localhost:5000/api
```

### 6.2 Authentication Endpoints

| Method | Endpoint              | Description            | Auth Required |
|--------|-----------------------|------------------------|:------------:|
| POST   | `/auth/register`      | Register a new user    | ❌           |
| POST   | `/auth/login`         | Login and get token    | ❌           |

#### POST `/auth/register` — Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecureP@ss1",
  "role": "patient"
}
```

#### POST `/auth/login` — Response Body

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient"
    }
  }
}
```

### 6.3 User Management Endpoints (Admin)

| Method | Endpoint              | Description              | Auth |
|--------|-----------------------|--------------------------|:----:|
| GET    | `/users`              | List all users (paginated)| Admin |
| GET    | `/users/:id`          | Get user details          | Admin |
| PATCH  | `/users/:id/approve`  | Approve a doctor          | Admin |
| PATCH  | `/users/:id/block`    | Block/unblock a user      | Admin |
| DELETE | `/users/:id`          | Delete a user             | Admin |

### 6.4 Specialty Endpoints

| Method | Endpoint              | Description              | Auth  |
|--------|-----------------------|--------------------------|:-----:|
| GET    | `/specialties`        | List all specialties      | Public |
| GET    | `/specialties/:id`    | Get specialty details     | Public |
| POST   | `/specialties`        | Create specialty          | Admin |
| PUT    | `/specialties/:id`    | Update specialty          | Admin |
| DELETE | `/specialties/:id`    | Delete specialty          | Admin |

### 6.5 Doctor Endpoints

| Method | Endpoint                         | Description                  | Auth    |
|--------|----------------------------------|------------------------------|:-------:|
| GET    | `/doctors`                       | List approved doctors        | Public  |
| GET    | `/doctors/:id`                   | Get doctor profile           | Public  |
| PUT    | `/doctors/profile`               | Update own profile           | Doctor  |
| GET    | `/doctors/availability`          | Get own availability         | Doctor  |
| POST   | `/doctors/availability`          | Set availability slots       | Doctor  |
| PUT    | `/doctors/availability/:slotId`  | Update a slot                | Doctor  |
| DELETE | `/doctors/availability/:slotId`  | Remove a slot                | Doctor  |
| GET    | `/doctors/:id/available-slots`   | Get available slots for date | Patient |

### 6.6 Appointment Endpoints

| Method | Endpoint                           | Description                    | Auth     |
|--------|-------------------------------------|--------------------------------|:--------:|
| POST   | `/appointments`                     | Book an appointment            | Patient  |
| GET    | `/appointments`                     | List own appointments          | Doctor/Patient |
| GET    | `/appointments/all`                 | List all appointments          | Admin    |
| GET    | `/appointments/:id`                 | Get appointment details        | Owner/Admin |
| PATCH  | `/appointments/:id/approve`         | Approve appointment            | Doctor   |
| PATCH  | `/appointments/:id/reject`          | Reject appointment             | Doctor   |
| PATCH  | `/appointments/:id/complete`        | Mark as completed              | Doctor   |
| PATCH  | `/appointments/:id/cancel`          | Cancel appointment             | Patient  |
| PATCH  | `/appointments/:id/reschedule`      | Reschedule appointment         | Patient  |
| PATCH  | `/appointments/:id/notes`           | Add/update notes               | Doctor   |

#### POST `/appointments` — Request Body

```json
{
  "doctorId": "doctor-uuid",
  "date": "2026-03-15",
  "startTime": "09:00",
  "endTime": "09:30",
  "reason": "Annual checkup"
}
```

### 6.7 Standard API Response Format

**Success Response:**

```json
{
  "success": true,
  "data": { },
  "message": "Operation completed successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Email is already registered" }
    ]
  }
}
```

**Paginated Response:**

```json
{
  "success": true,
  "data": [ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 45,
    "totalPages": 5
  }
}
```

---

## 7. Frontend Specification

### 7.1 Technology Choices

| Concern              | Technology                    |
|----------------------|-------------------------------|
| Framework            | React 18+ (Vite build tool)   |
| Routing              | React Router v6               |
| State Management     | Context API + Redux Toolkit   |
| UI Library           | Material UI (MUI) v5+         |
| HTTP Client          | Axios                         |
| Form Handling        | React Hook Form + Yup/Zod     |
| Date Handling        | Day.js or date-fns            |

### 7.2 Page Map

| Page                   | Route                        | Access   |
|------------------------|------------------------------|----------|
| Login                  | `/login`                     | Public   |
| Register               | `/register`                  | Public   |
| **Admin Dashboard**    | `/admin`                     | Admin    |
| Admin — Users          | `/admin/users`               | Admin    |
| Admin — Specialties    | `/admin/specialties`         | Admin    |
| Admin — Appointments   | `/admin/appointments`        | Admin    |
| **Doctor Dashboard**   | `/doctor`                    | Doctor   |
| Doctor — Availability  | `/doctor/availability`       | Doctor   |
| Doctor — Appointments  | `/doctor/appointments`       | Doctor   |
| Doctor — Profile       | `/doctor/profile`            | Doctor   |
| **Patient Dashboard**  | `/patient`                   | Patient  |
| Patient — Find Doctors | `/patient/doctors`           | Patient  |
| Patient — Book         | `/patient/book/:doctorId`    | Patient  |
| Patient — Appointments | `/patient/appointments`      | Patient  |
| Patient — Profile      | `/patient/profile`           | Patient  |

### 7.3 Protected Routes

```jsx
// ProtectedRoute.jsx
<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
  <Route path="/admin/*" element={<AdminLayout />} />
</Route>

<Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
  <Route path="/doctor/*" element={<DoctorLayout />} />
</Route>

<Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
  <Route path="/patient/*" element={<PatientLayout />} />
</Route>
```

### 7.4 Authentication Flow (Frontend)

```
1. User submits login form
2. POST /api/auth/login → receive { token }
3. Store token in memory (React state/context) or localStorage
4. Axios interceptor attaches Authorization: Bearer <token> to every request
5. On 401 response → redirect to /login
```

---

## 8. Glossary

| Term            | Definition                                                                  |
|-----------------|-----------------------------------------------------------------------------|
| Slot            | A block of time within a doctor's availability schedule.                    |
| Double Booking  | Two appointments occupying the same slot for the same doctor.              |
| JWT             | JSON Web Token used to authenticate API requests.                         |
| RBAC            | Role-Based Access Control — restricting access based on user role.         |
| Middleware      | Express function that processes requests before they reach route handlers. |
| ODM             | Object-Document Mapping — maps MongoDB documents to JavaScript objects (Mongoose). |
| Mongoose        | ODM library for MongoDB in Node.js, providing schema validation and query building. |

---

> **Document End** — This SRS serves as the single source of truth for the Medical Appointment Booking System requirements. All implementation should align with the specifications outlined in this document.
```

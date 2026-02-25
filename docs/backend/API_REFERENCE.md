# API Reference

This document outlines the RESTful API endpoints available in the Medical Appointment Booking System backend.

## Base URL
All API requests should be prefixed with:
```
/api/
```
*(e.g., `http://localhost:5000/api/auth/login`)*

## Authentication & Authorization
Most endpoints require authentication via a **JSON Web Token (JWT)**.
Include the token in the `Authorization` header of your HTTP request:
```
Authorization: Bearer <your_jwt_token_here>
```

Roles available in the system:
- `admin`, `doctor`, `patient`

---

## Auth Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Body Params |
|--------|----------|-------------|---------------|-------------|
| POST   | `/register` | Register a new user | No | `name, email, password, role` (patient/doctor/admin) |
| POST   | `/login` | Authenticate and get token | No | `email, password` |

---

## User Routes (`/api/users`)
*All user routes require **Admin** role.*

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all users | Yes (Admin) |
| GET | `/:id` | Get user by ID | Yes (Admin) |
| PATCH | `/:id/approve` | Approve a doctor registration | Yes (Admin) |
| PATCH | `/:id/block` | Block a user | Yes (Admin) |
| DELETE | `/:id` | Delete a user | Yes (Admin) |

---

## Doctor Routes (`/api/doctors`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get list of all doctors | No |
| GET | `/:id` | Get specific doctor details | No |
| GET | `/profile` | Get logged-in doctor profile | Yes (Doctor) |
| PUT | `/profile` | Update doctor profile | Yes (Doctor) |
| GET | `/availability` | Get doctor's availability slots | Yes (Doctor) |
| POST | `/availability` | Set new availability slot | Yes (Doctor) |
| PUT | `/availability/:slotId` | Update an existing slot | Yes (Doctor) |
| DELETE | `/availability/:slotId` | Remove an existing slot | Yes (Doctor) |
| GET | `/:id/available-slots` | Get a specific doctor's slots | Yes (Patient) |

---

## Patient Routes (`/api/patients`)
*All patient routes require **Patient** role.*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get logged-in patient profile |
| PUT | `/profile` | Update patient profile |
| GET | `/appointments` | List patient's appointments |
| POST | `/appointments` | Book a new appointment |
| PATCH | `/appointments/:id/cancel` | Cancel an appointment |
| PATCH | `/appointments/:id/reschedule`| Reschedule an appointment |

---

## Appointment Routes (`/api/appointments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/all` | Get all appointments across system | Yes (Admin) |
| GET | `/` | List doctor's appointments | Yes (Doctor) |
| GET | `/:id` | Get appointment details by ID | Yes (Token required) |
| PATCH | `/:id/approve` | Doctor accepts appointment request | Yes (Doctor) |
| PATCH | `/:id/reject` | Doctor rejects appointment request | Yes (Doctor) |
| PATCH | `/:id/complete` | Doctor marks appointment complete | Yes (Doctor) |
| PATCH | `/:id/notes` | Doctor adds consultation notes | Yes (Doctor) |

---

## Specialty Routes (`/api/specialties`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all medical specialties | No |
| GET | `/:id` | Get specialty by ID | No |
| POST | `/` | Create new specialty | Yes (Admin) |
| PUT | `/:id` | Update specialty details | Yes (Admin) |
| DELETE | `/:id` | Delete specialty | Yes (Admin) |

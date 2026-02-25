# Database Schema

This document outlines the MongoDB schema design for the Medical Appointment Booking System, using Mongoose ODE.
The database consists of 6 primary collections: `Users`, `Doctors`, `Patients`, `Specialties`, `Availabilities`, and `Appointments`.

---

## 1. User (`User.js`)
The `User` collection stores authentication and core user data for all roles (Admin, Doctor, Patient).

| Field | Type | Required | Details |
|-------|------|----------|---------|
| `name` | String | Yes | Min 2, Max 100 chars. |
| `email` | String | Yes | Unique, valid email format. |
| `password` | String | Yes | Hashed via bcrypt (min 6 chars). |
| `role` | String | Yes | Enum: `admin`, `doctor`, `patient`. |
| `isApproved`| Boolean | No | Default: `false`. |
| `isBlocked` | Boolean | No | Default: `false`. |

---

## 2. Specialty (`Specialty.js`)
Defines the medical specialties available for Doctors.

| Field | Type | Required | Details |
|-------|------|----------|---------|
| `name` | String | Yes | Unique, Min 2, Max 100 chars. |
| `description`| String | No | Max 300 chars. |

---

## 3. Doctor (`Doctor.js`)
Extends the `User` document with doctor-specific attributes.

| Field | Type | Required | Details |
|-------|------|----------|---------|
| `userId` | ObjectId| Yes | Reference to `User` (Unique). |
| `specialtyId`| ObjectId| Yes | Reference to `Specialty`. |
| `bio` | String | No | Max 500 chars. |
| `phone` | String | Yes | Valid phone format. |
| `address` | String | No | Max 300 chars. Default: ''. |
| `image` | String | No | URL string. Default avatar generator used. |

*Virtuals*: `user` (to populate `userId`), `specialty` (to populate `specialtyId`).

---

## 4. Patient (`Patient.js`)
Extends the `User` document with patient-specific attributes.

| Field | Type | Required | Details |
|-------|------|----------|---------|
| `userId` | ObjectId| Yes | Reference to `User` (Unique). |
| `phone` | String | Yes | Valid phone format. |
| `dateOfBirth`| Date | Yes | Must be in the past. |
| `address` | String | No | Max 300 chars. Default: ''. |
| `image` | String | No | URL string. Default avatar generator used. |

*Virtuals*: `user` (to populate `userId`).

---

## 5. Availability (`Availability.js`)
Defines specific time slots when doctors are available for appointments.

| Field | Type | Required | Details |
|-------|------|----------|---------|
| `doctorId` | ObjectId| Yes | Reference to `Doctor`. |
| `dayOfWeek` | Number | Yes | 0 (Sunday) to 6 (Saturday). |
| `startTime`| String | Yes | Format `HH:mm`. |
| `endTime`| String | Yes | Format `HH:mm`. Must be > `startTime`. |

*Indexes*: Unique compound index on `doctorId`, `dayOfWeek`, and `startTime`.

---

## 6. Appointment (`Appointment.js`)
Core collection for tracking patient-doctor interactions.

| Field | Type | Required | Details |
|-------|------|----------|---------|
| `patientId` | ObjectId| Yes | Reference to `Patient`. |
| `doctorId` | ObjectId| Yes | Reference to `Doctor`. |
| `date` | Date | Yes | Cannot be in the past. |
| `startTime` | String | Yes | Format `HH:mm`. |
| `endTime` | String | Yes | Format `HH:mm`. |
| `status` | String | Yes | Enum: `pending`, `confirmed`, `rejected`, `completed`, `cancelled`. Default: `pending`.|
| `reason` | String | Yes | Min 10, Max 500 chars. |
| `notes` | String | No | Max 1000 chars. Added by Doctor after visit. |

*Virtuals*: `patient`, `doctor`.
*Indexes*: Unique compound index on `doctorId`, `date`, and `startTime`.

---

## Entity Relationships
1. **One-to-One**: `User` (role='doctor') ↔ `Doctor` | `User` (role='patient') ↔ `Patient`.
2. **One-to-Many**: `Specialty` → `Doctor` (One specialty, multiple doctors).
3. **One-to-Many**: `Doctor` → `Availability` (A doctor has multiple availability slots).
4. **Many-to-Many** via Join Table (`Appointment`): `Doctor` ↔ `Appointment` ↔ `Patient`.

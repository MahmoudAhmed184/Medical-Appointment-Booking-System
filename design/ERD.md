# Entity Relationship Diagram (ERD)

This document visualizes the database schema for the Medical Appointment Booking System based on the Software Requirements Specification (SRS).

## Mermaid ERD

```mermaid
erDiagram
    %% Users Collection (Base for all roles)
    User {
        ObjectId _id PK
        String name
        String email
        String password
        String role "admin, doctor, patient"
        Boolean isApproved
        Boolean isBlocked
        DateTime createdAt
        DateTime updatedAt
    }

    %% Doctor Profile Collection
    Doctor {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId specialtyId FK
        String bio
        String phone
    }

    %% Patient Profile Collection
    Patient {
        ObjectId _id PK
        ObjectId userId FK
        String phone
        Date dateOfBirth
    }

    %% Specialty Collection
    Specialty {
        ObjectId _id PK
        String name
        String description
    }

    %% Availability Collection
    Availability {
        ObjectId _id PK
        ObjectId doctorId FK
        Integer dayOfWeek "0-6"
        String startTime "HH:mm"
        String endTime "HH:mm"
    }

    %% Appointment Collection
    Appointment {
        ObjectId _id PK
        ObjectId patientId FK
        ObjectId doctorId FK
        Date date
        String startTime
        String endTime
        String status "pending, confirmed, completed, cancelled"
        String reason
        String notes
        DateTime createdAt
        DateTime updatedAt
    }

    %% Relationships

    User ||--|| Doctor : "has profile (1:1)"
    User ||--|| Patient : "has profile (1:1)"
    
    Specialty ||--|{ Doctor : "has doctors (1:N)"
    
    Doctor ||--|{ Availability : "defines slots (1:N)"
    
    Doctor ||--|{ Appointment : "manages (1:N)"
    Patient ||--|{ Appointment : "books (1:N)"

```

## Schema Details

### **User**
Technically, all users (Admins, Doctors, Patients) share the `User` collection for authentication. `Doctor` and `Patient` collections store role-specific profile data linked via `userId`.

### **Relationships**
- **One User** can be **One Doctor** OR **One Patient**.
- **One Specialty** can have **Many Doctors**.
- **One Doctor** can have **Many Availability Slots**.
- **One Doctor** can have **Many Appointments**.
- **One Patient** can have **Many Appointments**.
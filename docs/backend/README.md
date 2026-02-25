# Backend: Medical Appointment Booking System

This is the backend for the Medical Appointment Booking System. It provides a RESTful API built with **Node.js**, **Express**, and **MongoDB** to handle user authentication, doctor-patient interactions, and appointment scheduling.

## Technologies Used
- **Node.js** & **Express.js**: Core API framework
- **MongoDB** & **Mongoose**: Database and ODM
- **JWT (JSON Web Tokens)**: Authentication
- **Bcrypt.js**: Password hashing
- **Joi**: Object validation
- **Nodemailer**: Email services
- **Helmet** & **Mongo Sanitize**: Security middleware
- **Cors**: Cross-Origin Resource Sharing

## Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **MongoDB** (running locally or a MongoDB Atlas URI)

## Setup & Installation

1. **Navigate to the server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the `server` root directory using `.env.example` as a template:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/medical_appointments
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   ```
   *(Add email/SMTP settings or other required variables as per your `.env.example`)*

## Running the Server

- **Development Mode** (with auto-reload via nodemon)
  ```bash
  npm run dev
  ```
- **Production Mode**
  ```bash
  npm start
  ```

By default, the server will run on `http://localhost:5000`.

## Core App Routes Overview
The API consists of the following foundational routing groups (prefixed with `/api/`):
- `/api/auth` - Authentication (Register, Login, etc.)
- `/api/users` - General User Management
- `/api/doctors` - Doctor-specific endpoints
- `/api/patients` - Patient-specific endpoints
- `/api/appointments` - Appointment Booking & Management
- `/api/specialties` - Medical Specialties

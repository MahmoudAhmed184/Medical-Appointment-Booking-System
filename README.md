# Medical Appointment Booking System

A full-stack web application for managing medical appointments, built with **React**, **Node.js/Express**, and **MongoDB**.

## Features

- **Patient Portal** — Browse doctors, book appointments, manage bookings
- **Doctor Dashboard** — Set availability, manage appointments, add notes
- **Admin Panel** — User management, specialty CRUD, appointment oversight
- **Authentication** — JWT-based auth with role-based access control (Admin, Doctor, Patient)
- **Email Notifications** — Booking confirmations and status updates via Nodemailer

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite, Material UI (MUI)  |
| Backend    | Node.js, Express                    |
| Database   | MongoDB, Mongoose                   |
| Auth       | JWT (jsonwebtoken, bcryptjs)        |
| Email      | Nodemailer                          |

## Project Structure

```
medical-appointment-booking-system/
├── client/          # React frontend (Vite)
├── server/          # Express backend
│   ├── src/
│   │   ├── config/       # DB & env configuration
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/    # Auth, RBAC, error handling
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helpers & utilities
│   └── server.js         # Entry point
├── docs/            # SRS, Git workflow, project docs
└── .github/         # PR template
```

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/mahmoudahmed184/medical-appointment-booking-system.git

# Install server dependencies
cd server
cp .env.example .env   # Configure your environment variables
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Copy `server/.env.example` to `server/.env` and fill in the required values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medical-appointment-db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### Running the App

```bash
# Start the backend server
cd server
npm run dev

# In a separate terminal, start the frontend
cd client
npm run dev
```

## Documentation

- [Software Requirements Specification (SRS)](docs/SRS_Medical_Appointment_System.md)
- [Git Workflow Guide](docs/GIT_WORKFLOW.md)

## Contributing

1. Follow the [Git Workflow Guide](docs/GIT_WORKFLOW.md)
2. Use [Conventional Commits](https://www.conventionalcommits.org/)
3. Open PRs against the `develop` branch
4. Ensure all tests pass before requesting review

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

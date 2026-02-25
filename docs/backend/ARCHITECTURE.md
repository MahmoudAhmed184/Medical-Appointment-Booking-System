# Backend Architecture & Design

This document provides a high-level overview of the backend architecture for the Medical Appointment Booking System. The server is structured following a strict **layered Service-Controller** pattern to ensure separation of concerns, testability, and maintainability.

## Folder Structure

The code is organized inside the `server/src/` directory:

```text
server/
├── app.js             # Express app setup and global middleware config
├── server.js          # Entry point, DB connection, and server initialization
├── package.json       # Dependencies and scripts scripts
└── src/
    ├── config/        # Environment and DB configuration, constants
    ├── controllers/   # Route handlers, extracting requests and calling services
    ├── middleware/    # Custom Express middlewares (auth, error handling, etc.)
    ├── models/        # Mongoose schemas and database models
    ├── routes/        # Express route definitions pointing to controllers
    ├── services/      # Business logic and database interactions
    ├── utils/         # Helper functions, formatters, and custom classes
    └── validations/   # Joi validation schemas for requests
```

## Design Patterns

### 1. Service-Controller Pattern (Layered Architecture)
The backend strictly separates routing, request handling, and business logic:
- **Routes (`src/routes/`)**: Define the HTTP methods and endpoints, applying necessary middlewares (like authentication/authorization or request validation). They pass the request to controllers.
- **Controllers (`src/controllers/`)**: Responsible only for handling the HTTP Request and Response cycle. They extract data from `req.body`, `req.params`, etc., call the appropriate Service layer function, and format the HTTP response (`res`).
- **Services (`src/services/`)**: Contain the core business logic. They interact directly with the database models. This makes business logic reusable across multiple controllers if necessary.

### 2. Middleware Pattern
Heavy use of Express middlewares for cross-cutting concerns:
- **`errorHandler.js`**: A centralized error-handling middleware that catches synchronous and asynchronous errors, formatting them into a standard JSON response structure.
- **Security Middlewares**: Pre-configured in `app.js` using `helmet()` for headers and `express-mongo-sanitize` for NoSQL injection prevention.

## Data Flow Example
When a user books an appointment:
1. **Client Request**: `POST /api/appointments`
2. **Router (`appointmentRoutes.js`)**: Matches the route. Passes through `protect` (authentication) middleware. Calls `bookAppointment` controller.
3. **Controller (`appointmentController.js`)**: Extracts patient ID, doctor ID, and date. Calls `appointmentService.createAppointment()`.
4. **Service (`appointmentService.js`)**: Processes business logic (e.g., checks if the doctor is available at that time). Interacts with `Appointment` Mongoose model to save to DB.
5. **Controller**: Receives created appointment (or error) and sends a `201 Created` HTTP response back to the client.

## Error Handling Flow
The app uses a custom `next(new AppError('message', statusCode))` approach inside services/controllers. This error is caught by `app.use(errorHandler)` in `app.js` to ensure the frontend always receives predictable error formats.

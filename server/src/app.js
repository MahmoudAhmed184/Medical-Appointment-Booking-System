import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import specialtyRoutes from './routes/specialtyRoutes.js';

const app = express();

// TODO: Configure global middleware (cors, json parser, morgan)
// TODO: Mount API routes (/api/auth, /api/users, etc.)
// TODO: Mount error handler

export default app;

import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../utils/constants.js';
import {
    listAppointments,
    getAllAppointments,
    getAppointmentById,
    approveAppointment,
    rejectAppointment,
    completeAppointment,
    addNotes,
} from '../controllers/appointmentController.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET    /api/appointments           — Doctor view own appointments
router.get('/', authorize(ROLES.DOCTOR), listAppointments);

// GET    /api/appointments/all       — Admin view all
router.get('/all', authorize(ROLES.ADMIN), getAllAppointments);

// GET    /api/appointments/:id       — Owner or Admin (ownership checked in controller)
router.get('/:id', getAppointmentById);

// PATCH  /api/appointments/:id/approve   — Doctor
router.patch('/:id/approve', authorize(ROLES.DOCTOR), approveAppointment);

// PATCH  /api/appointments/:id/reject    — Doctor
router.patch('/:id/reject', authorize(ROLES.DOCTOR), rejectAppointment);

// PATCH  /api/appointments/:id/complete  — Doctor
router.patch('/:id/complete', authorize(ROLES.DOCTOR), completeAppointment);

// PATCH  /api/appointments/:id/notes     — Doctor
router.patch('/:id/notes', authorize(ROLES.DOCTOR), addNotes);

export default router;

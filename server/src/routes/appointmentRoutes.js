import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../utils/constants.js';
import {
    bookAppointment,
    getAllAppointments,
    getAppointmentById,
    approveAppointment,
    rejectAppointment,
    completeAppointment,
    cancelAppointment,
    rescheduleAppointment,
    addNotes,
} from '../controllers/appointmentController.js';

const router = express.Router();

// POST   /api/appointments           — Patient books
router.post('/', bookAppointment);

// GET    /api/appointments/all       — Admin view all
router.get('/all', getAllAppointments);

// GET    /api/appointments/:id       — Owner or Admin
router.get('/:id', getAppointmentById);

// PATCH  /api/appointments/:id/approve   — Doctor
router.patch('/:id/approve', approveAppointment);

// PATCH  /api/appointments/:id/reject    — Doctor
router.patch('/:id/reject', rejectAppointment);

// PATCH  /api/appointments/:id/complete  — Doctor
router.patch('/:id/complete', completeAppointment);

// PATCH  /api/appointments/:id/cancel    — Patient
router.patch('/:id/cancel', cancelAppointment);

// PATCH  /api/appointments/:id/reschedule — Patient
router.patch('/:id/reschedule', rescheduleAppointment);

// PATCH  /api/appointments/:id/notes     — Doctor
router.patch('/:id/notes', addNotes);

export default router;

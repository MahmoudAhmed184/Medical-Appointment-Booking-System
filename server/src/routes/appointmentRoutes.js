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

router.use(auth);

router.get('/', authorize(ROLES.DOCTOR), listAppointments);
router.get('/all', authorize(ROLES.ADMIN), getAllAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/approve', authorize(ROLES.DOCTOR), approveAppointment);
router.patch('/:id/reject', authorize(ROLES.DOCTOR), rejectAppointment);
router.patch('/:id/complete', authorize(ROLES.DOCTOR), completeAppointment);
router.patch('/:id/notes', authorize(ROLES.DOCTOR), addNotes);

export default router;

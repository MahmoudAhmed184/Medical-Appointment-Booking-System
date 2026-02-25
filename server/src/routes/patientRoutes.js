import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { ROLES } from '../utils/constants.js';
import { updatePatientProfileSchema } from '../validations/profileValidation.js';
import { bookAppointmentSchema, rescheduleAppointmentSchema } from '../validations/appointmentValidation.js';
import {
  getProfile,
  updateProfile,
  listAppointments,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
} from '../controllers/patientController.js';

const router = express.Router();

router.use(auth, authorize(ROLES.PATIENT));

router.get('/profile', getProfile);
router.put('/profile', validate(updatePatientProfileSchema), updateProfile);
router.get('/appointments', listAppointments);
router.post('/appointments', validate(bookAppointmentSchema), bookAppointment);
router.patch('/appointments/:id/cancel', cancelAppointment);
router.patch('/appointments/:id/reschedule', validate(rescheduleAppointmentSchema), rescheduleAppointment);

export default router;

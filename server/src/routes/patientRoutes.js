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

// All routes require patient authentication
router.use(auth, authorize(ROLES.PATIENT));
/// ===== Patient Profile =====
router.get("/profile", getProfile);           // GET profile
router.put("/profile", validate(updatePatientProfileSchema), updateProfile);        // UPDATE profile

// ===== Appointments =====
router.get("/appointments", listAppointments); // GET all appointments of patient
router.post("/appointments", validate(bookAppointmentSchema), bookAppointment); // BOOK a new appointment
router.patch("/appointments/:id/cancel", cancelAppointment); // CANCEL appointment
router.patch("/appointments/:id/reschedule", validate(rescheduleAppointmentSchema), rescheduleAppointment); // RESCHEDULE appointment
export default router;

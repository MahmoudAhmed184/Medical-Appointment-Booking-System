import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../utils/constants.js';
import { getProfile, updateProfile , listAppointments, bookAppointment} from '../controllers/patientController.js';

const router = express.Router();

// All routes require patient authentication
router.use(auth, authorize(ROLES.PATIENT));
/// ===== Patient Profile =====
router.get("/profile", getProfile);           // GET profile
router.put("/profile", updateProfile);        // UPDATE profile

// ===== Appointments =====
router.get("/appointments", listAppointments); // GET all appointments of patient
router.post("/appointments", bookAppointment); // BOOK a new appointment
export default router;

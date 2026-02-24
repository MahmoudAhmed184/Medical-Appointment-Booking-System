import express from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import { ROLES } from "../utils/constants.js";
import {
  getAllDoctors,
  getDoctorById,
  updateProfile,
  getAvailability,
  setAvailability,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  getAvailableSlots,
} from "../controllers/doctorController.js";

const router = express.Router();

// // --- Public routes ---
// // GET /api/doctors
// router.get('/doctors', getAllDoctors);

// // GET /api/doctors/:id
// router.get('/doctor/:id', getDoctorById);

// // --- Patient routes ---
// // GET /api/doctors/:id/available-slots?date=YYYY-MM-DD
// router.get('/:id/available-slots', auth, authorize(ROLES.PATIENT), getAvailableSlots);

// // --- Doctor-only routes ---
// // PUT  /api/doctors/profile
// router.put('/doctor/profile', auth, authorize(ROLES.DOCTOR), updateProfile);

// // GET  /api/doctors/availability
// router.get('/doctor/availability', auth, authorize(ROLES.DOCTOR), getAvailability);

// // POST /api/doctors/availability
// router.post('/doctor/availability', auth, authorize(ROLES.DOCTOR), setAvailability);

// // PUT  /api/doctors/availability/:slotId
// router.put('/doctor/availability/:slotId', auth, authorize(ROLES.DOCTOR), updateAvailabilitySlot);

// // DELETE /api/doctors/availability/:slotId
// router.delete('/doctor/availability/:slotId', auth, authorize(ROLES.DOCTOR), deleteAvailabilitySlot);

// --- Public routes ---
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

// --- Patient routes ---
/////////router.get("/:id/available-slots",getAvailableSlots);///problemmmmmm

// --- Doctor-only routes ---
router.put("/profile", updateProfile);
router.get("/availability/:doctorId",getAvailability);
router.post("/availability",setAvailability);
router.put("/availability/:slotId",updateAvailabilitySlot,);
router.delete("/availability/:slotId",deleteAvailabilitySlot,);

export default router;

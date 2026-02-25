import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { ROLES } from '../utils/constants.js';
import { updateDoctorProfileSchema } from '../validations/profileValidation.js';
import { createAvailabilitySchema, updateAvailabilitySchema } from '../validations/availabilityValidation.js';
import {
    getAllDoctors,
    getDoctorById,
    getProfile,
    updateProfile,
    getAvailability,
    setAvailability,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    getAvailableSlots,
} from '../controllers/doctorController.js';

const router = express.Router();

router.get('/profile', auth, authorize(ROLES.DOCTOR), getProfile);
router.put('/profile', auth, authorize(ROLES.DOCTOR), validate(updateDoctorProfileSchema), updateProfile);
router.get('/availability', auth, authorize(ROLES.DOCTOR), getAvailability);
router.post('/availability', auth, authorize(ROLES.DOCTOR), validate(createAvailabilitySchema), setAvailability);
router.put('/availability/:slotId', auth, authorize(ROLES.DOCTOR), validate(updateAvailabilitySchema), updateAvailabilitySlot);
router.delete('/availability/:slotId', auth, authorize(ROLES.DOCTOR), deleteAvailabilitySlot);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/available-slots', auth, authorize(ROLES.PATIENT), getAvailableSlots);

export default router;

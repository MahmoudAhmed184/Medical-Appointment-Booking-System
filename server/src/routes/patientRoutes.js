import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../utils/constants.js';
import { getProfile, updateProfile } from '../controllers/patientController.js';

const router = express.Router();

// All routes require patient authentication
router.use(auth, authorize(ROLES.PATIENT));

// GET /api/patients/profile
router.get('/profile', getProfile);

// PUT /api/patients/profile
router.put('/profile', updateProfile);

export default router;

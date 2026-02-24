import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { ROLES } from '../utils/constants.js';
import {
    createSpecialtySchema,
    updateSpecialtySchema,
} from '../validations/specialtyValidation.js';
import {
    getAllSpecialties,
    getSpecialtyById,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
} from '../controllers/specialtyController.js';

const router = express.Router();

// --- Public routes ---
// GET /api/specialties
router.get('/', getAllSpecialties);

// GET /api/specialties/:id
router.get('/:id', getSpecialtyById);

// --- Admin-only routes ---
// POST   /api/specialties
router.post('/', auth, authorize(ROLES.ADMIN), validate(createSpecialtySchema), createSpecialty);

// PUT    /api/specialties/:id
router.put('/:id', auth, authorize(ROLES.ADMIN), validate(updateSpecialtySchema), updateSpecialty);

// // DELETE /api/specialties/:id
// router.delete('/admin/specialties/:id', auth, authorize(ROLES.ADMIN), deleteSpecialty);

// POST   /api/specialties/admin
router.post('/admin',  createSpecialty);

// // PUT    /api/specialties/:id
router.put('/:id', updateSpecialty);

// // DELETE /api/specialties/:id
router.delete('/admin/:id', deleteSpecialty);

export default router;

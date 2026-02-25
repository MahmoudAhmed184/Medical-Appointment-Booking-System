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

router.get('/', getAllSpecialties);
router.get('/:id', getSpecialtyById);
router.post('/', auth, authorize(ROLES.ADMIN), validate(createSpecialtySchema), createSpecialty);
router.put('/:id', auth, authorize(ROLES.ADMIN), validate(updateSpecialtySchema), updateSpecialty);
router.delete('/:id', auth, authorize(ROLES.ADMIN), deleteSpecialty);

export default router;

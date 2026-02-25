import Joi from 'joi';

const phonePattern = /^\+?[\d\s-]{7,15}$/;

const commonProfileFields = {
    name: Joi.string().trim().min(2).max(100).optional().messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
    }),

    email: Joi.string().trim().lowercase().email().optional().messages({
        'string.email': 'Please provide a valid email address',
    }),

    phone: Joi.string().trim().pattern(phonePattern).allow('').optional().messages({
        'string.pattern.base': 'Please provide a valid phone number',
    }),

    address: Joi.string().trim().max(300).allow('').optional().messages({
        'string.max': 'Address cannot exceed 300 characters',
    }),

    image: Joi.string().trim().uri().allow('').optional().messages({
        'string.uri': 'Image must be a valid URL',
    }),
};

const updatePatientProfileSchema = Joi.object({
    ...commonProfileFields,
    dateOfBirth: Joi.date().less('now').optional().messages({
        'date.less': 'Date of birth must be in the past',
    }),
})
    .min(1)
    .messages({
        'object.min': 'At least one field must be provided for update',
    });

const updateDoctorProfileSchema = Joi.object({
    ...commonProfileFields,
    bio: Joi.string().trim().max(500).allow('').optional().messages({
        'string.max': 'Bio cannot exceed 500 characters',
    }),
})
    .min(1)
    .messages({
        'object.min': 'At least one field must be provided for update',
    });

export { updatePatientProfileSchema, updateDoctorProfileSchema };

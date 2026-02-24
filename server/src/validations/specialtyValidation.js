import Joi from 'joi';

const createSpecialtySchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Specialty name is required',
        'string.min': 'Specialty name must be at least 2 characters long',
        'string.max': 'Specialty name cannot exceed 100 characters',
        'any.required': 'Specialty name is required',
    }),

    description: Joi.string().trim().max(300).allow('').optional().messages({
        'string.max': 'Description cannot exceed 300 characters',
    }),
});

const updateSpecialtySchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional().messages({
        'string.min': 'Specialty name must be at least 2 characters long',
        'string.max': 'Specialty name cannot exceed 100 characters',
    }),

    description: Joi.string().trim().max(300).allow('').optional().messages({
        'string.max': 'Description cannot exceed 300 characters',
    }),
}).min(1).messages({
    'object.min': 'At least one field must be provided for update',
});

export { createSpecialtySchema, updateSpecialtySchema };

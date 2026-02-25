import Joi from 'joi';

const timePattern = /^([0-1]\d|2[0-3]):[0-5]\d$/;

const createAvailabilitySchema = Joi.object({
    dayOfWeek: Joi.number().integer().min(0).max(6).required().messages({
        'number.base': 'Day of week must be a number',
        'number.min': 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
        'number.max': 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
        'any.required': 'Day of week is required',
    }),

    startTime: Joi.string().pattern(timePattern).required().messages({
        'string.empty': 'Start time is required',
        'string.pattern.base': 'Start time must be in HH:mm format (e.g., 09:00)',
        'any.required': 'Start time is required',
    }),

    endTime: Joi.string().pattern(timePattern).required().messages({
        'string.empty': 'End time is required',
        'string.pattern.base': 'End time must be in HH:mm format (e.g., 17:00)',
        'any.required': 'End time is required',
    }),
});

const updateAvailabilitySchema = Joi.object({
    startTime: Joi.string().pattern(timePattern).required().messages({
        'string.empty': 'Start time is required',
        'string.pattern.base': 'Start time must be in HH:mm format (e.g., 09:00)',
        'any.required': 'Start time is required',
    }),

    endTime: Joi.string().pattern(timePattern).required().messages({
        'string.empty': 'End time is required',
        'string.pattern.base': 'End time must be in HH:mm format (e.g., 17:00)',
        'any.required': 'End time is required',
    }),
});

export { createAvailabilitySchema, updateAvailabilitySchema };

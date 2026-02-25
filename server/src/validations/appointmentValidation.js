import Joi from 'joi';

const timePattern = /^([0-1]\d|2[0-3]):[0-5]\d$/;
const datePattern = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

const bookAppointmentSchema = Joi.object({
    doctorId: Joi.string().hex().length(24).required().messages({
        'string.empty': 'Doctor ID is required',
        'string.hex': 'Doctor ID must be a valid ObjectId',
        'string.length': 'Doctor ID must be a valid ObjectId',
        'any.required': 'Doctor ID is required',
    }),

    date: Joi.string().pattern(datePattern).required().messages({
        'string.empty': 'Appointment date is required',
        'string.pattern.base': 'Date must be in YYYY-MM-DD format',
        'any.required': 'Appointment date is required',
    }),

    startTime: Joi.string().pattern(timePattern).required().messages({
        'string.empty': 'Start time is required',
        'string.pattern.base': 'Start time must be in HH:mm format (e.g., 09:00)',
        'any.required': 'Start time is required',
    }),

    endTime: Joi.string().pattern(timePattern).required().messages({
        'string.empty': 'End time is required',
        'string.pattern.base': 'End time must be in HH:mm format (e.g., 10:00)',
        'any.required': 'End time is required',
    }),

    reason: Joi.string().trim().min(10).max(500).required().messages({
        'string.empty': 'Reason for appointment is required',
        'string.min': 'Reason must be at least 10 characters long',
        'string.max': 'Reason cannot exceed 500 characters',
        'any.required': 'Reason for appointment is required',
    }),
});

const rescheduleAppointmentSchema = Joi.object({
    date: Joi.string().pattern(datePattern).required().messages({
        'string.empty': 'Appointment date is required',
        'string.pattern.base': 'Date must be in YYYY-MM-DD format',
        'any.required': 'Appointment date is required',
    }),

    startTime: Joi.string().pattern(timePattern).required().messages({
        'string.empty': 'Start time is required',
        'string.pattern.base': 'Start time must be in HH:mm format (e.g., 09:00)',
        'any.required': 'Start time is required',
    }),

    endTime: Joi.string().pattern(timePattern).required().messages({
        'string.empty': 'End time is required',
        'string.pattern.base': 'End time must be in HH:mm format (e.g., 10:00)',
        'any.required': 'End time is required',
    }),
});

export { bookAppointmentSchema, rescheduleAppointmentSchema };

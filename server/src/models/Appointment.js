import mongoose from 'mongoose';
import { APPOINTMENT_STATUS } from '../utils/constants.js';

const appointmentSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: [true, 'Patient ID is required'],
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: [true, 'Doctor ID is required'],
        },
        date: {
            type: Date,
            required: [true, 'Appointment date is required'],
            validate: {
                validator: function (value) {
                    // Only validate for new appointments (not updates)
                    if (this.isNew) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return value >= today;
                    }
                    return true;
                },
                message: 'Appointment date cannot be in the past',
            },
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
            trim: true,
            match: [
                /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                'Start time must be in HH:mm format (e.g., 09:00)',
            ],
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
            trim: true,
            match: [
                /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                'End time must be in HH:mm format (e.g., 10:00)',
            ],
        },
        status: {
            type: String,
            required: [true, 'Status is required'],
            enum: {
                values: Object.values(APPOINTMENT_STATUS),
                message: 'Status must be pending, confirmed, completed, or cancelled',
            },
            default: APPOINTMENT_STATUS.PENDING,
        },
        reason: {
            type: String,
            required: [true, 'Reason for appointment is required'],
            trim: true,
            minlength: [10, 'Reason must be at least 10 characters long'],
            maxlength: [500, 'Reason cannot exceed 500 characters'],
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [1000, 'Notes cannot exceed 1000 characters'],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual populate for patient details
appointmentSchema.virtual('patient', {
    ref: 'Patient',
    localField: 'patientId',
    foreignField: '_id',
    justOne: true,
});

// Virtual populate for doctor details
appointmentSchema.virtual('doctor', {
    ref: 'Doctor',
    localField: 'doctorId',
    foreignField: '_id',
    justOne: true,
});


// Compound unique index to prevent double-booking (same doctor, same date, same time)
appointmentSchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });

// Additional indexes for common queries
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ status: 1 });


const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;

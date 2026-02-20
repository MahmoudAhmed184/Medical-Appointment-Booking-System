import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: [true, 'Doctor ID is required'],
        },
        dayOfWeek: {
            type: Number,
            required: [true, 'Day of week is required'],
            min: [0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'],
            max: [6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'],
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
                'End time must be in HH:mm format (e.g., 17:00)',
            ],
        },
    },
    {
        timestamps: true,
    }
);

// Custom validation: endTime must be after startTime
availabilitySchema.pre('save', function (next) {
    const start = this.startTime.split(':').map(Number);
    const end = this.endTime.split(':').map(Number);

    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];

    if (endMinutes <= startMinutes) {
        return next(new Error('End time must be after start time'));
    }

    next();
});


// Compound unique index to prevent duplicate slots for the same doctor on the same day and time
availabilitySchema.index({ doctorId: 1, dayOfWeek: 1, startTime: 1 }, { unique: true });


const Availability = mongoose.model('Availability', availabilitySchema);

export default Availability;

import mongoose from 'mongoose';

const specialtySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Specialty name is required'],
            unique: true,
            trim: true,
            minlength: [2, 'Specialty name must be at least 2 characters long'],
            maxlength: [100, 'Specialty name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [300, 'Description cannot exceed 300 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster lookups
//specialtySchema.index({ name: 1 });

const Specialty = mongoose.model('Specialty', specialtySchema);

export default Specialty;

import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            unique: true,
        },
        specialtyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Specialty',
            required: [true, 'Specialty is required'],
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            match: [
                /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
                'Please provide a valid phone number',
            ],
        },
        address: {
            type: String,
            trim: true,
            maxlength: [300, 'Address cannot exceed 300 characters'],
            default: '',
        },
        image: {
            type: String,
            trim: true,
            default: 'https://avatar.iran.liara.run/public/boy?username=doctor',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Index for faster lookups (userId index is auto-created by unique: true)
doctorSchema.index({ specialtyId: 1 });

// Virtual populate for user details
doctorSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

// Virtual populate for specialty details
doctorSchema.virtual('specialty', {
    ref: 'Specialty',
    localField: 'specialtyId',
    foreignField: '_id',
    justOne: true,
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;

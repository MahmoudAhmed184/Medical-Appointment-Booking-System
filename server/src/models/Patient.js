import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            unique: true,
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
        dateOfBirth: {
            type: Date,
            required: [true, 'Date of birth is required'],
            validate: {
                validator: function (value) {
                    // Date of birth must be in the past
                    return value < new Date();
                },
                message: 'Date of birth must be in the past',
            },
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
            default: 'https://avatar.iran.liara.run/public/girl?username=patient',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);



// Virtual populate for user details
patientSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;

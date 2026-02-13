import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
    // TODO: Implement availability schema
);

// TODO: Add unique compound index on (doctorId, dayOfWeek, startTime)

const Availability = mongoose.model('Availability', availabilitySchema);

export default Availability;

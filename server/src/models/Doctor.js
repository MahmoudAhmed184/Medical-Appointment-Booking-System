import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
    // TODO: Implement doctor schema
);

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;

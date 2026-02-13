import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
    // TODO: Implement patient schema
);

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;

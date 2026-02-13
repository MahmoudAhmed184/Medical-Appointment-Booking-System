import mongoose from 'mongoose';

const specialtySchema = new mongoose.Schema(
    // TODO: Implement specialty schema
);

const Specialty = mongoose.model('Specialty', specialtySchema);

export default Specialty;

import mongoose from 'mongoose';
import { APPOINTMENT_STATUS } from '../utils/constants.js';

const appointmentSchema = new mongoose.Schema(
    // TODO: Implement appointment schema
);

// TODO: Add unique compound index on (doctorId, date, startTime) to prevent double-booking

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;

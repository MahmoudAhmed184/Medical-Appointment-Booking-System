import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { isValidObjectId } from "mongoose";

// ===== GET Profile =====
const getProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id }).populate("user");
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });
    
    res.status(200).json({ patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE Profile =====
const updateProfile = async (req, res) => {
  try {
    const { phone, dateOfBirth, name, email } = req.body;

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Update patient fields
    if (phone) patient.phone = phone;
    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;

    await patient.save();

    // Update user fields
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== LIST Appointments =====
const listAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate("doctorId", "name specialty email phone")
      .sort({ date: 1 });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== BOOK Appointment =====
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, reason } = req.body;

    if (!isValidObjectId(doctorId))
      return res.status(400).json({ message: "Invalid doctor ID" });

    const existing = await Appointment.findOne({
      doctorId,
      date,
      startTime,
      endTime,
    });

    if (existing)
      return res.status(400).json({ message: "This time slot is already booked" });

    const appointment = await Appointment.create({
      doctorId,
      patientId: req.user._id,
      date,
      startTime,
      endTime,
      reason,
      status: "pending",
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getProfile, updateProfile, listAppointments, bookAppointment };
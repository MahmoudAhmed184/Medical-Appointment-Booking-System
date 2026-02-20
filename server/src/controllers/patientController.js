import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Availability from "../models/Availability.js";
import Doctor from "../models/Doctor.js";
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
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ date: 1 });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== CANCEL Appointment =====
const cancelAppointment = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: patient._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ message: "Already cancelled" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    return res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ===== BOOK Appointment =====
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, reason } = req.body;

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    if (!isValidObjectId(doctorId))
      return res.status(400).json({ message: "Invalid doctor ID" });

    const timeRegex = /^([0-1]?\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        message: "startTime and endTime must be in HH:mm format",
      });
    }

    const toMinutes = (value) => {
      const [h, m] = value.split(":").map(Number);
      return h * 60 + m;
    };

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);

    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        message: "endTime must be greater than startTime",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointmentDate = new Date(date);
    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }

    const now = new Date();
    const startDateTime = new Date(appointmentDate);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    if (startDateTime < now) {
      return res.status(400).json({
        message: "Cannot book an appointment in the past",
      });
    }

    const dayOfWeek = appointmentDate.getDay();
    const doctorAvailabilities = await Availability.find({ doctorId, dayOfWeek }).select(
      "startTime endTime"
    );

    const isWithinAvailability = doctorAvailabilities.some((slot) => {
      const slotStart = toMinutes(slot.startTime);
      const slotEnd = toMinutes(slot.endTime);
      return startMinutes >= slotStart && endMinutes <= slotEnd;
    });

    if (!isWithinAvailability) {
      return res.status(400).json({
        message: "Doctor is not available at this date/time",
      });
    }

    const dayStart = new Date(appointmentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(appointmentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      doctorId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: "cancelled" },
    }).select("startTime endTime");

    const hasOverlap = existingAppointments.some((item) => {
      const existingStart = toMinutes(item.startTime);
      const existingEnd = toMinutes(item.endTime);
      return startMinutes < existingEnd && endMinutes > existingStart;
    });

    if (hasOverlap) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    const normalizedDate = new Date(appointmentDate);
    normalizedDate.setHours(0, 0, 0, 0);

    const appointment = await Appointment.create({
      doctorId,
      patientId: patient._id,
      date: normalizedDate,
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

export { getProfile, updateProfile, listAppointments, bookAppointment, cancelAppointment };
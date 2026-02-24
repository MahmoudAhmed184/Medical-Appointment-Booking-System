import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Availability from "../models/Availability.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import { isValidObjectId } from "mongoose";
import {
  sendAppointmentConfirmation,
  sendAppointmentRescheduleConfirmation,
} from "../services/emailService.js";

const MAX_APPOINTMENT_DURATION_MINUTES = 60;

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
    const { phone, dateOfBirth, name, email, address, image } = req.body;

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Update patient fields
    if (phone) patient.phone = phone;
    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
    if (address !== undefined) patient.address = address;
    if (image !== undefined) patient.image = image;

    await patient.save();

    // Update user fields
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    const updatedPatient = await Patient.findById(patient._id).populate("user");
    res.status(200).json({ message: "Profile updated successfully", patient: updatedPatient });
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
        populate: [
          { path: "userId", select: "name email" },
          { path: "specialtyId", select: "name" },
        ],
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

// ===== RESCHEDULE Appointment =====
const rescheduleAppointment = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

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
      return res.status(400).json({ message: "Cannot reschedule a cancelled appointment" });
    }

    const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        message: "startTime and endTime must be in HH:mm format",
      });
    }

    const dateMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(date);
    if (!dateMatch) {
      return res.status(400).json({ message: "Invalid appointment date format (YYYY-MM-DD required)" });
    }

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);

    const appointmentDay = new Date(year, month - 1, day);
    if (
      Number.isNaN(appointmentDay.getTime()) ||
      appointmentDay.getFullYear() !== year ||
      appointmentDay.getMonth() !== month - 1 ||
      appointmentDay.getDate() !== day
    ) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }

    const toMinutes = (value) => {
      const [h, m] = value.split(":").map(Number);
      return h * 60 + m;
    };

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);
    if (endMinutes <= startMinutes) {
      return res.status(400).json({ message: "endTime must be greater than startTime" });
    }

    if (endMinutes - startMinutes > MAX_APPOINTMENT_DURATION_MINUTES) {
      return res
        .status(400)
        .json({ message: "Appointment duration cannot exceed 1 hour" });
    }

    const now = new Date();
    const startDateTime = new Date(appointmentDay);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    if (startDateTime < now) {
      return res.status(400).json({ message: "Cannot reschedule to a past time" });
    }

    const dayOfWeek = appointmentDay.getDay();
    const doctorAvailabilities = await Availability.find({
      doctorId: appointment.doctorId,
      dayOfWeek,
    }).select("startTime endTime");

    const isWithinAvailability = doctorAvailabilities.some((slot) => {
      const slotStart = toMinutes(slot.startTime);
      const slotEnd = toMinutes(slot.endTime);
      return startMinutes >= slotStart && endMinutes <= slotEnd;
    });

    if (!isWithinAvailability) {
      return res.status(400).json({ message: "Doctor is not available at this date/time" });
    }

    const dayStart = new Date(appointmentDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(appointmentDay);
    dayEnd.setHours(23, 59, 59, 999);

    const conflictingAppointment = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctorId: appointment.doctorId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: "cancelled" },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    appointment.date = dayStart;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.status = "pending";
    await appointment.save();

    if (req.user?.email) {
      try {
        const doctor = await Doctor.findById(appointment.doctorId).populate("userId", "name");

        await sendAppointmentRescheduleConfirmation({
          to: req.user.email,
          patientName: req.user.name,
          doctorName: doctor?.userId?.name,
          date,
          startTime,
          endTime,
        });
      } catch (mailError) {
        console.error("Failed to send appointment reschedule email:", mailError.message);
      }
    }

    return res.status(200).json({
      message: "Appointment rescheduled successfully",
      appointment,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "This time slot is already booked" });
    }

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

    const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        message: "startTime and endTime must be in HH:mm format",
      });
    }

    const dateMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(date);
    if (!dateMatch) {
      return res.status(400).json({ message: "Invalid appointment date format (YYYY-MM-DD required)" });
    }

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);

    const appointmentDay = new Date(year, month - 1, day);
    if (
      Number.isNaN(appointmentDay.getTime()) ||
      appointmentDay.getFullYear() !== year ||
      appointmentDay.getMonth() !== month - 1 ||
      appointmentDay.getDate() !== day
    ) {
      return res.status(400).json({ message: "Invalid appointment date" });
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

    if (endMinutes - startMinutes > MAX_APPOINTMENT_DURATION_MINUTES) {
      return res.status(400).json({
        message: "Appointment duration cannot exceed 1 hour",
      });
    }

    const doctor = await Doctor.findById(doctorId).populate("userId", "name");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const now = new Date();
    const startDateTime = new Date(appointmentDay);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    if (startDateTime < now) {
      return res.status(400).json({
        message: "Cannot book an appointment in the past",
      });
    }

    const dayOfWeek = appointmentDay.getDay();
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

    const dayStart = new Date(appointmentDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(appointmentDay);
    dayEnd.setHours(23, 59, 59, 999);

    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: "cancelled" },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    const normalizedDate = dayStart;

    const appointment = await Appointment.create({
      doctorId,
      patientId: patient._id,
      date: normalizedDate,
      startTime,
      endTime,
      reason,
      status: "pending",
    });

    if (req.user?.email) {
      try {
        await sendAppointmentConfirmation({
          to: req.user.email,
          patientName: req.user.name,
          doctorName: doctor.userId?.name,
          date,
          startTime,
          endTime,
        });
      } catch (mailError) {
        console.error("Failed to send appointment confirmation email:", mailError.message);
      }
    }

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "This time slot is already booked",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

export {
  getProfile,
  updateProfile,
  listAppointments,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
};
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Availability from "../models/Availability.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import { isValidObjectId } from "mongoose";
import { APPOINTMENT_STATUS } from "../utils/constants.js";
import {
  sendAppointmentConfirmation,
  sendAppointmentRescheduleConfirmation,
} from "../services/emailService.js";

const MAX_APPOINTMENT_DURATION_MINUTES = 60;

const toMinutes = (value) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};

/**
 * @desc    Get own patient profile
 * @route   GET /api/patients/profile
 * @access  Patient
 */
const getProfile = catchAsync(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user._id }).populate("user");
  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }

  res.status(200).json({ success: true, data: patient });
});

/**
 * @desc    Update own patient profile
 * @route   PUT /api/patients/profile
 * @access  Patient
 */
const updateProfile = catchAsync(async (req, res) => {
  const { phone, dateOfBirth, name, email, address, image } = req.body;

  const patient = await Patient.findOne({ userId: req.user._id });
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

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

  res.status(200).json({
    success: true,
    data: updatedPatient,
    message: "Profile updated successfully",
  });
});

/**
 * @desc    List own appointments
 * @route   GET /api/patients/appointments
 * @access  Patient
 */
const listAppointments = catchAsync(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user._id });
  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
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

  res.status(200).json({ success: true, data: appointments });
});

/**
 * @desc    Cancel own appointment
 * @route   PATCH /api/patients/appointments/:id/cancel
 * @access  Patient
 */
const cancelAppointment = catchAsync(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user._id });
  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }

  const appointment = await Appointment.findOne({
    _id: req.params.id,
    patientId: patient._id,
  });

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    throw new ApiError(400, "Already cancelled");
  }

  if (![APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED].includes(appointment.status)) {
    throw new ApiError(400, `Cannot cancel an appointment with status "${appointment.status}"`);
  }

  appointment.status = APPOINTMENT_STATUS.CANCELLED;
  await appointment.save();

  res.status(200).json({
    success: true,
    data: appointment,
    message: "Appointment cancelled successfully",
  });
});

/**
 * @desc    Reschedule own appointment
 * @route   PATCH /api/patients/appointments/:id/reschedule
 * @access  Patient
 */
const rescheduleAppointment = catchAsync(async (req, res) => {
  const { date, startTime, endTime } = req.body;

  const patient = await Patient.findOne({ userId: req.user._id });
  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }

  const appointment = await Appointment.findOne({
    _id: req.params.id,
    patientId: patient._id,
  });

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (![APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED].includes(appointment.status)) {
    throw new ApiError(400, `Cannot reschedule an appointment with status "${appointment.status}"`);
  }

  const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new ApiError(400, "startTime and endTime must be in HH:mm format");
  }

  const dateMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(date);
  if (!dateMatch) {
    throw new ApiError(400, "Invalid appointment date format (YYYY-MM-DD required)");
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
    throw new ApiError(400, "Invalid appointment date");
  }

  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  if (endMinutes <= startMinutes) {
    throw new ApiError(400, "endTime must be greater than startTime");
  }

  if (endMinutes - startMinutes > MAX_APPOINTMENT_DURATION_MINUTES) {
    throw new ApiError(400, "Appointment duration cannot exceed 1 hour");
  }

  const now = new Date();
  const startDateTime = new Date(appointmentDay);
  const [startHour, startMinute] = startTime.split(":").map(Number);
  startDateTime.setHours(startHour, startMinute, 0, 0);

  if (startDateTime < now) {
    throw new ApiError(400, "Cannot reschedule to a past time");
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
    throw new ApiError(400, "Doctor is not available at this date/time");
  }

  const dayStart = new Date(appointmentDay);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(appointmentDay);
  dayEnd.setHours(23, 59, 59, 999);

  const conflictingAppointment = await Appointment.findOne({
    _id: { $ne: appointment._id },
    doctorId: appointment.doctorId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });

  if (conflictingAppointment) {
    throw new ApiError(400, "This time slot is already booked");
  }

  appointment.date = dayStart;
  appointment.startTime = startTime;
  appointment.endTime = endTime;
  appointment.status = APPOINTMENT_STATUS.PENDING;
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

  res.status(200).json({
    success: true,
    data: appointment,
    message: "Appointment rescheduled successfully",
  });
});

/**
 * @desc    Book a new appointment
 * @route   POST /api/patients/appointments
 * @access  Patient
 */
const bookAppointment = catchAsync(async (req, res) => {
  const { doctorId, date, startTime, endTime, reason } = req.body;

  const patient = await Patient.findOne({ userId: req.user._id });
  if (!patient) {
    throw new ApiError(404, "Patient profile not found");
  }

  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "Invalid doctor ID");
  }

  const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new ApiError(400, "startTime and endTime must be in HH:mm format");
  }

  const dateMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(date);
  if (!dateMatch) {
    throw new ApiError(400, "Invalid appointment date format (YYYY-MM-DD required)");
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
    throw new ApiError(400, "Invalid appointment date");
  }

  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);

  if (endMinutes <= startMinutes) {
    throw new ApiError(400, "endTime must be greater than startTime");
  }

  if (endMinutes - startMinutes > MAX_APPOINTMENT_DURATION_MINUTES) {
    throw new ApiError(400, "Appointment duration cannot exceed 1 hour");
  }

  const doctor = await Doctor.findById(doctorId).populate("userId", "name");
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // Verify doctor is approved
  const doctorUser = await User.findById(doctor.userId._id || doctor.userId);
  if (!doctorUser || !doctorUser.isApproved) {
    throw new ApiError(400, "This doctor is not yet approved and cannot accept appointments");
  }

  const now = new Date();
  const startDateTime = new Date(appointmentDay);
  const [startHour, startMinute] = startTime.split(":").map(Number);
  startDateTime.setHours(startHour, startMinute, 0, 0);

  if (startDateTime < now) {
    throw new ApiError(400, "Cannot book an appointment in the past");
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
    throw new ApiError(400, "Doctor is not available at this date/time");
  }

  const dayStart = new Date(appointmentDay);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(appointmentDay);
  dayEnd.setHours(23, 59, 59, 999);

  const conflictingAppointment = await Appointment.findOne({
    doctorId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });

  if (conflictingAppointment) {
    throw new ApiError(400, "This time slot is already booked");
  }

  const appointment = await Appointment.create({
    doctorId,
    patientId: patient._id,
    date: dayStart,
    startTime,
    endTime,
    reason,
    status: APPOINTMENT_STATUS.PENDING,
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
    success: true,
    data: appointment,
    message: "Appointment booked successfully",
  });
});

export {
  getProfile,
  updateProfile,
  listAppointments,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
};
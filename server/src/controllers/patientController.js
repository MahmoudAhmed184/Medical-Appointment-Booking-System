import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import * as appointmentService from '../services/appointmentService.js';
import {
  sendAppointmentConfirmation,
  sendAppointmentRescheduleConfirmation,
} from '../services/emailService.js';

/**
 * @desc    Get own patient profile
 * @route   GET /api/patients/profile
 * @access  Patient
 */
const getProfile = catchAsync(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user._id }).populate('user');
  if (!patient) {
    throw new ApiError(404, 'Patient profile not found');
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
    throw new ApiError(404, 'Patient not found');
  }

  if (phone) patient.phone = phone;
  if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
  if (address !== undefined) patient.address = address;
  if (image !== undefined) patient.image = image;
  await patient.save();

  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (email) user.email = email;
  await user.save();

  const updatedPatient = await Patient.findById(patient._id).populate('user');

  res.status(200).json({
    success: true,
    data: updatedPatient,
    message: 'Profile updated successfully',
  });
});

/**
 * @desc    List own appointments
 * @route   GET /api/patients/appointments
 * @access  Patient
 */
const listAppointments = catchAsync(async (req, res) => {
  const data = await appointmentService.getPatientAppointments(req.user._id);

  res.status(200).json({ success: true, data });
});

/**
 * @desc    Cancel own appointment
 * @route   PATCH /api/patients/appointments/:id/cancel
 * @access  Patient
 */
const cancelAppointment = catchAsync(async (req, res) => {
  const data = await appointmentService.cancelPatientAppointment(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    data,
    message: 'Appointment cancelled successfully',
  });
});

/**
 * @desc    Reschedule own appointment
 * @route   PATCH /api/patients/appointments/:id/reschedule
 * @access  Patient
 */
const rescheduleAppointment = catchAsync(async (req, res) => {
  const { appointment, doctorName } = await appointmentService.reschedulePatientAppointment(
    req.params.id,
    req.user._id,
    req.body
  );

  // Send reschedule email (fire-and-forget)
  if (req.user?.email) {
    try {
      await sendAppointmentRescheduleConfirmation({
        to: req.user.email,
        patientName: req.user.name,
        doctorName,
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
      });
    } catch (mailError) {
      console.error('Failed to send reschedule email:', mailError.message);
    }
  }

  res.status(200).json({
    success: true,
    data: appointment,
    message: 'Appointment rescheduled successfully',
  });
});

/**
 * @desc    Book a new appointment
 * @route   POST /api/patients/appointments
 * @access  Patient
 */
const bookAppointment = catchAsync(async (req, res) => {
  const { appointment, doctorName } = await appointmentService.bookAppointment(
    req.user._id,
    req.body
  );

  // Send confirmation email (fire-and-forget)
  if (req.user?.email) {
    try {
      await sendAppointmentConfirmation({
        to: req.user.email,
        patientName: req.user.name,
        doctorName,
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
      });
    } catch (mailError) {
      console.error('Failed to send confirmation email:', mailError.message);
    }
  }

  res.status(201).json({
    success: true,
    data: appointment,
    message: 'Appointment booked successfully',
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
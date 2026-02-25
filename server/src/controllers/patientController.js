import catchAsync from '../utils/catchAsync.js';
import * as patientService from '../services/patientService.js';
import * as appointmentService from '../services/appointmentService.js';
import {
  sendAppointmentConfirmation,
  sendAppointmentRescheduleConfirmation,
} from '../services/emailService.js';

const getProfile = catchAsync(async (req, res) => {
  const data = await patientService.getProfile(req.user._id);

  res.status(200).json({ success: true, data });
});

const updateProfile = catchAsync(async (req, res) => {
  const data = await patientService.updateProfile(req.user._id, req.body);

  res.status(200).json({
    success: true,
    data,
    message: 'Profile updated successfully',
  });
});

const listAppointments = catchAsync(async (req, res) => {
  const { appointments, pagination } = await appointmentService.getPatientAppointments(req.user._id, req.query);

  res.status(200).json({ success: true, data: appointments, pagination });
});

const cancelAppointment = catchAsync(async (req, res) => {
  const data = await appointmentService.cancelPatientAppointment(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    data,
    message: 'Appointment cancelled successfully',
  });
});

const rescheduleAppointment = catchAsync(async (req, res) => {
  const { appointment, doctorName } = await appointmentService.reschedulePatientAppointment(
    req.params.id,
    req.user._id,
    req.body
  );

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

const bookAppointment = catchAsync(async (req, res) => {
  const { appointment, doctorName } = await appointmentService.bookAppointment(
    req.user._id,
    req.body
  );

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
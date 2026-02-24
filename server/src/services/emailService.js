import { transporter } from '../config/email.js';

const sendEmail = async (to, subject, html) => {
    if (!to) {
        throw new Error('Recipient email is required');
    }

    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    return transporter.sendMail({
        from,
        to,
        subject,
        html,
    });
};

const sendAppointmentConfirmation = async ({
    to,
    patientName,
    doctorName,
    date,
    startTime,
    endTime,
}) => {
    const subject = 'Appointment Booking Confirmation';

    const html = `
        <h2>Appointment Confirmed</h2>
        <p>Hello ${patientName || 'Patient'},</p>
        <p>Your appointment has been booked successfully.</p>
        <ul>
            <li><strong>Doctor:</strong> ${doctorName || 'N/A'}</li>
            <li><strong>Date:</strong> ${date}</li>
            <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
        </ul>
        <p>Thank you for using our Medical Appointment Booking System.</p>
    `;

    return sendEmail(to, subject, html);
};

const sendAppointmentRescheduleConfirmation = async ({
    to,
    patientName,
    doctorName,
    date,
    startTime,
    endTime,
}) => {
    const subject = 'Appointment Reschedule Confirmation';

    const html = `
        <h2>Appointment Rescheduled</h2>
        <p>Hello ${patientName || 'Patient'},</p>
        <p>Your appointment has been rescheduled successfully.</p>
        <ul>
            <li><strong>Doctor:</strong> ${doctorName || 'N/A'}</li>
            <li><strong>New Date:</strong> ${date}</li>
            <li><strong>New Time:</strong> ${startTime} - ${endTime}</li>
        </ul>
        <p>Thank you for using our Medical Appointment Booking System.</p>
    `;

    return sendEmail(to, subject, html);
};

export {
    sendEmail,
    sendAppointmentConfirmation,
    sendAppointmentRescheduleConfirmation,
};

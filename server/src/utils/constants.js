/**
 * Application-wide constants and enums.
 */

const ROLES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    PATIENT: 'patient',
};

const APPOINTMENT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
};

const DAYS_OF_WEEK = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
};

const MAX_APPOINTMENT_DURATION_MINUTES = 60;

/**
 * Convert an "HH:mm" time string to total minutes since midnight.
 */
const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

export {
    ROLES,
    APPOINTMENT_STATUS,
    DAYS_OF_WEEK,
    MAX_APPOINTMENT_DURATION_MINUTES,
    toMinutes,
};


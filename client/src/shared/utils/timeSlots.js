import {
  TIME_STEP_MINUTES,
  MAX_APPOINTMENT_DURATION_MINUTES,
} from './constants';

/**
 * Convert "HH:mm" string to total minutes since midnight.
 * Returns null if the input is invalid.
 */
export const toMinutes = (value) => {
  const [hours, minutes] = String(value || '').split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

/**
 * Convert total minutes back to "HH:mm" string.
 */
export const toTimeString = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Convert a date value to "YYYY-MM-DD" format suitable for <input type="date">.
 */
export const toLocalDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get availability slots that match the day-of-week for a given date value.
 */
export const getDayAvailability = (availability, dateValue) => {
  if (!dateValue) return [];
  const selectedDate = new Date(dateValue);
  if (Number.isNaN(selectedDate.getTime())) return [];
  const selectedDay = selectedDate.getDay();
  return (availability || []).filter((slot) => Number(slot.dayOfWeek) === selectedDay);
};

/**
 * Get start-time options for a given date based on availability.
 * Returns sorted array of "HH:mm" strings at TIME_STEP_MINUTES intervals.
 */
export const getStartOptions = (availability, dateValue) => {
  const daySlots = getDayAvailability(availability, dateValue);
  const options = new Set();

  daySlots.forEach((slot) => {
    const slotStart = toMinutes(slot.startTime);
    const slotEnd = toMinutes(slot.endTime);
    if (slotStart === null || slotEnd === null || slotEnd <= slotStart) return;

    for (let minute = slotStart; minute < slotEnd; minute += TIME_STEP_MINUTES) {
      options.add(toTimeString(minute));
    }
  });

  return Array.from(options).sort();
};

/**
 * Get end-time options for a given start time and date based on availability.
 * Capped at MAX_APPOINTMENT_DURATION_MINUTES from the start time.
 */
export const getEndOptions = (availability, dateValue, selectedStartTime) => {
  if (!selectedStartTime) return [];
  const startMinutes = toMinutes(selectedStartTime);
  if (startMinutes === null) return [];

  const daySlots = getDayAvailability(availability, dateValue);
  const options = new Set();

  daySlots.forEach((slot) => {
    const slotStart = toMinutes(slot.startTime);
    const slotEnd = toMinutes(slot.endTime);
    if (slotStart === null || slotEnd === null || slotEnd <= slotStart) return;
    if (startMinutes < slotStart || startMinutes >= slotEnd) return;

    const maxEnd = Math.min(slotEnd, startMinutes + MAX_APPOINTMENT_DURATION_MINUTES);
    for (
      let minute = startMinutes + TIME_STEP_MINUTES;
      minute <= maxEnd;
      minute += TIME_STEP_MINUTES
    ) {
      options.add(toTimeString(minute));
    }
  });

  return Array.from(options).sort();
};

/**
 * Normalize availability data: deduplicate, validate, and sort.
 */
export const normalizeAvailability = (availability) =>
  Array.from(
    new Map(
      (Array.isArray(availability) ? availability : [])
        .map((slot) => ({
          dayOfWeek: Number(slot?.dayOfWeek),
          startTime: slot?.startTime || '',
          endTime: slot?.endTime || '',
        }))
        .filter(
          (slot) =>
            Number.isInteger(slot.dayOfWeek) &&
            slot.dayOfWeek >= 0 &&
            slot.dayOfWeek <= 6 &&
            slot.startTime &&
            slot.endTime
        )
        .map((slot) => [`${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`, slot])
    ).values()
  ).sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return String(a.startTime).localeCompare(String(b.startTime));
  });

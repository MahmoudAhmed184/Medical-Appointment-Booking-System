/**
 * Format a date value for display.
 *
 * @param {string|Date} date  - Date string or Date object
 * @param {string} [format='short'] - 'short' (Jan 15, 2026), 'long' (January 15, 2026), 'iso' (2026-01-15)
 * @returns {string} Formatted date or empty string on invalid input
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  if (format === 'iso') {
    return d.toISOString().split('T')[0];
  }

  const options =
    format === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };

  return d.toLocaleDateString('en-US', options);
};

/**
 * Convert 24-hour "HH:mm" to 12-hour format with AM/PM.
 *
 * @param {string} time - Time string in "HH:mm" format
 * @returns {string} Formatted time (e.g. "2:30 PM") or original string on failure
 */
export const formatTime = (time) => {
  if (!time || typeof time !== 'string') return '';
  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  const displayMinute = String(minutes).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
};

/**
 * Get a human-readable label for an appointment status.
 *
 * @param {string} status
 * @returns {string} Capitalized status label
 */
export const getStatusLabel = (status) => {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

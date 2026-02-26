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
export const getStatusLabel = (status) => {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

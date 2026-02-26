/**
 * Extract the doctor's display name from a populated appointment object.
 */
export const getDoctorName = (appt) => {
  if (appt.doctorId?.userId?.name) return appt.doctorId.userId.name;
  if (appt.doctorId?.name) return appt.doctorId.name;
  return 'N/A';
};

/**
 * Extract the patient's display name from a populated appointment object.
 */
export const getPatientName = (appt) => {
  if (appt.patientId?.userId?.name) return appt.patientId.userId.name;
  if (appt.patientId?.name) return appt.patientId.name;
  return 'N/A';
};

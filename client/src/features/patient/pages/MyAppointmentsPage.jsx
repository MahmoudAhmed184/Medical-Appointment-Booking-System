import { useDispatch, useSelector } from 'react-redux';
import {
  cancelAppointment,
  fetchMyAppointments,
  rescheduleAppointment,
} from '../../../store/slices/appointmentSlice';
import { useEffect, useMemo, useState } from 'react';
import AppointmentList from '../components/AppointmentList';
import PatientNavbar from '../components/PatientNavbar';
import { getDoctorByIdApi, getPatientProfileApi } from '../services/patientApi';

const TIME_STEP_MINUTES = 15;
const MAX_APPOINTMENT_DURATION_MINUTES = 60;
const PATIENT_DEFAULT_AVATAR = 'https://avatar.iran.liara.run/public/girl?username=patient';

const toMinutes = (value) => {
  const [hours, minutes] = String(value || '').split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const toTimeString = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
};

const toLocalDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeAvailability = (availability) =>
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

const getDayAvailability = (availability, dateValue) => {
  if (!dateValue) return [];
  const selectedDate = new Date(dateValue);
  if (Number.isNaN(selectedDate.getTime())) return [];
  const selectedDay = selectedDate.getDay();
  return availability.filter((slot) => Number(slot.dayOfWeek) === selectedDay);
};

const getStartOptions = (availability, dateValue) => {
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

const getEndOptions = (availability, dateValue, selectedStartTime) => {
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

export default function MyAppointmentsPage() {
  const dispatch = useDispatch();
  const { appointments, loading, error } = useSelector((state) => state.appointments);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleId, setRescheduleId] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [rescheduleAvailability, setRescheduleAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState('');
  const [cancelTargetDoctorName, setCancelTargetDoctorName] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [patientNav, setPatientNav] = useState({ name: 'Patient', image: PATIENT_DEFAULT_AVATAR });

  const todayDateString = useMemo(() => toLocalDateInputValue(new Date()), []);
  const isPastRescheduleDate = Boolean(rescheduleDate && rescheduleDate < todayDateString);
  const rescheduleStartOptions = useMemo(
    () => getStartOptions(rescheduleAvailability, rescheduleDate),
    [rescheduleAvailability, rescheduleDate]
  );
  const rescheduleEndOptions = useMemo(
    () => getEndOptions(rescheduleAvailability, rescheduleDate, rescheduleStartTime),
    [rescheduleAvailability, rescheduleDate, rescheduleStartTime]
  );

  useEffect(() => {
    dispatch(fetchMyAppointments());
  }, [dispatch]);

  useEffect(() => {
    const loadPatientNav = async () => {
      try {
        const { data } = await getPatientProfileApi();
        const patient = data?.patient || data?.data?.patient || data?.data || {};
        const user = patient?.user || patient?.userId || {};
        setPatientNav({
          name: user?.name || 'Patient',
          image: patient?.image || PATIENT_DEFAULT_AVATAR,
        });
      } catch {
        setPatientNav({ name: 'Patient', image: PATIENT_DEFAULT_AVATAR });
      }
    };

    loadPatientNav();
  }, []);

  const mappedAppointments = appointments.map((item) => ({
    id: item._id,
    doctorName: item?.doctorId?.userId?.name || 'Doctor',
    specialty: item?.doctorId?.specialtyId?.name || 'Specialty',
    date: `${new Date(item.date).toLocaleDateString()} ${item.startTime} - ${item.endTime}`,
    status: String(item.status || '').replace(/^./, (c) => c.toUpperCase()),
    rawStatus: String(item.status || ''),
    image: item?.doctorId?.image || 'https://avatar.iran.liara.run/public/boy?username=doctor',
  }));

  const handleCancel = (id) => {
    const selectedAppointment = appointments.find((item) => item._id === id);
    const doctorName = selectedAppointment?.doctorId?.userId?.name || 'Doctor';

    setCancelTargetId(id);
    setCancelTargetDoctorName(doctorName);
    setCancelError('');
    setShowCancelConfirmModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelTargetId) return;

    try {
      setIsCancelling(true);
      setCancelError('');

      await dispatch(cancelAppointment(cancelTargetId)).unwrap();
      dispatch(fetchMyAppointments());
      setShowCancelConfirmModal(false);
      setCancelTargetId('');
      setCancelTargetDoctorName('');
    } catch (err) {
      setCancelError(err || 'Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReschedule = async (id) => {
    const selectedAppointment = appointments.find((item) => item._id === id);
    const doctorId = selectedAppointment?.doctorId?._id || selectedAppointment?.doctorId;

    setRescheduleId(id);
    setRescheduleDate(
      selectedAppointment?.date
        ? toLocalDateInputValue(selectedAppointment.date)
        : ''
    );
    setRescheduleStartTime('');
    setRescheduleEndTime('');
    setRescheduleAvailability([]);
    setRescheduleError('');
    setShowRescheduleModal(true);

    if (!doctorId) {
      setRescheduleError('Doctor availability could not be loaded.');
      return;
    }

    try {
      setAvailabilityLoading(true);
      const { data } = await getDoctorByIdApi(doctorId);
      const rawDoctor = data?.doctor || data?.data?.doctor || data?.data || null;
      setRescheduleAvailability(normalizeAvailability(rawDoctor?.availability));
    } catch (err) {
      setRescheduleError(err?.response?.data?.message || 'Failed to load doctor availability.');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const closeRescheduleModal = () => {
    setShowRescheduleModal(false);
    setRescheduleId('');
    setRescheduleDate('');
    setRescheduleStartTime('');
    setRescheduleEndTime('');
    setRescheduleAvailability([]);
    setRescheduleError('');
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleId || !rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) return;

    try {
      setIsRescheduling(true);
      setRescheduleError('');

      await dispatch(
        rescheduleAppointment({
          id: rescheduleId,
          payload: {
            date: rescheduleDate,
            startTime: rescheduleStartTime,
            endTime: rescheduleEndTime,
          },
        })
      ).unwrap();

      dispatch(fetchMyAppointments());
      closeRescheduleModal();
    } catch (err) {
      setRescheduleError(err || 'Failed to reschedule appointment');
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f8] dark:bg-[#101922] text-slate-800 dark:text-slate-100">

      <PatientNavbar
        activeTab="appointments"
        patientName={patientNav.name}
        patientImage={patientNav.image || PATIENT_DEFAULT_AVATAR}
      />

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full">

        <h1 className="text-2xl font-bold mb-2">My Appointments</h1>
        <p className="text-slate-500 mb-6">Here are all your booked appointments.</p>

        {loading && <p className="mb-4">Loading appointments...</p>}
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && mappedAppointments.length === 0 && (
          <p className="mb-4 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
            No appointments yet.
          </p>
        )}

        {/* Appointments List */}
        <AppointmentList
          appointments={mappedAppointments}
          onCancel={handleCancel}
          onReschedule={handleReschedule}
        />
      </main>

      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-[90%] max-w-md flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reschedule Appointment</h2>
              <button
                type="button"
                onClick={closeRescheduleModal}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">New Date:</label>
            <input
              type="date"
              value={rescheduleDate}
              min={todayDateString}
              onChange={(e) => {
                setRescheduleDate(e.target.value);
                setRescheduleStartTime('');
                setRescheduleEndTime('');
              }}
              className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white"
            />
            {isPastRescheduleDate && (
              <p className="text-xs text-red-600">Past date is not allowed.</p>
            )}
            {rescheduleDate && !isPastRescheduleDate && !availabilityLoading && rescheduleStartOptions.length === 0 && (
              <p className="text-xs text-red-600">Not available date.</p>
            )}

            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">New Start Time:</label>
            <select
              value={rescheduleStartTime}
              onChange={(e) => {
                setRescheduleStartTime(e.target.value);
                setRescheduleEndTime('');
              }}
              disabled={!rescheduleDate || isPastRescheduleDate || availabilityLoading || rescheduleStartOptions.length === 0}
              className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white"
            >
              <option value="">Choose start time</option>
              {rescheduleStartOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>

            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">New End Time:</label>
            <select
              value={rescheduleEndTime}
              onChange={(e) => setRescheduleEndTime(e.target.value)}
              disabled={!rescheduleStartTime || availabilityLoading || rescheduleEndOptions.length === 0}
              className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white"
            >
              <option value="">Choose end time</option>
              {rescheduleEndOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>

            {availabilityLoading && (
              <p className="text-xs text-slate-500">Loading doctor availability...</p>
            )}
            {rescheduleStartTime && !availabilityLoading && rescheduleEndOptions.length === 0 && (
              <p className="text-xs text-slate-500">No valid end time for this start (maximum duration is 1 hour).</p>
            )}

            {rescheduleError && (
              <p className="text-sm text-red-600">{rescheduleError}</p>
            )}

            <button
              type="button"
              disabled={
                isRescheduling ||
                !rescheduleDate ||
                isPastRescheduleDate ||
                !rescheduleStartTime ||
                !rescheduleEndTime
              }
              onClick={handleRescheduleSubmit}
              className={`w-full py-2 rounded-lg font-semibold transition ${
                !isRescheduling && rescheduleDate && rescheduleStartTime && rescheduleEndTime
                  ? 'bg-[#137fec] text-white hover:bg-[#137fec]/90'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isRescheduling ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {showCancelConfirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-[90%] max-w-md flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Cancel Appointment?
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Are you sure you want to cancel your appointment with{' '}
              <span className="font-semibold">{cancelTargetDoctorName}</span>?
            </p>

            {cancelError && <p className="text-sm text-red-600">{cancelError}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirmModal(false);
                  setCancelTargetId('');
                  setCancelTargetDoctorName('');
                  setCancelError('');
                }}
                className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={isCancelling}
                className={`flex-1 py-2 rounded-lg text-white ${
                  isCancelling ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
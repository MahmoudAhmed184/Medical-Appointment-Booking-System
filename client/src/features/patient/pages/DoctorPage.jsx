import { FiPhone, FiMail, FiX } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import BookConfirmModal from "../components/BookConfirmModal";
import PatientNavbar from "../components/PatientNavbar";
import { bookAppointmentApi, getDoctorByIdApi, getPatientProfileApi } from "../services/patientApi";
import { fetchMyAppointments } from "../../../store/slices/appointmentSlice";
import {
  resetBookingState,
  setReason,
  setSelectedDate,
  setSelectedEndTime,
  setSelectedStartTime,
  setSelectedTime,
  setShowConfirmModal,
  setShowSlots,
} from "../../../store/slices/patientBookingSlice";

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_STEP_MINUTES = 15;
const MAX_APPOINTMENT_DURATION_MINUTES = 60;
const DOCTOR_DEFAULT_AVATAR = 'https://avatar.iran.liara.run/public/boy?username=doctor';
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
  )
    .sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return String(a.startTime).localeCompare(String(b.startTime));
    });

export default function DoctorPage() {
  const dispatch = useDispatch();
  const { doctorId } = useParams();
  const {
    showSlots,
    selectedDate,
    selectedTime,
    selectedStartTime,
    selectedEndTime,
    reason,
    showConfirmModal,
  } = useSelector(
    (state) => state.patientBooking
  );
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientNav, setPatientNav] = useState({ name: 'Patient', image: PATIENT_DEFAULT_AVATAR });
  const todayDateString = useMemo(() => toLocalDateInputValue(new Date()), []);
  const isPastSelectedDate = Boolean(selectedDate && selectedDate < todayDateString);

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await getDoctorByIdApi(doctorId);
        const rawDoctor = data?.doctor || data?.data?.doctor || data?.data || null;

        if (!rawDoctor) {
          setDoctor(null);
          setError('Doctor not found.');
          return;
        }

        setDoctor({
          id: rawDoctor?._id,
          name: rawDoctor?.userId?.name || rawDoctor?.name || 'Doctor',
          specialty: rawDoctor?.specialtyId?.name || rawDoctor?.specialty || 'Specialty',
          image: rawDoctor?.image || DOCTOR_DEFAULT_AVATAR,
          availablity: rawDoctor?.availabilityText || 'Availability not set',
          bio: rawDoctor?.bio || 'No bio available.',
          address: rawDoctor?.address || 'Address not available',
          email: rawDoctor?.userId?.email || rawDoctor?.email || '-',
          phone: rawDoctor?.phone || '-',
          timeSlots: rawDoctor?.timeSlots || [],
          availability: normalizeAvailability(rawDoctor?.availability),
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load doctor details.');
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) loadDoctor();
  }, [doctorId]);

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

  const safeTimeSlots = useMemo(() => doctor?.timeSlots || [], [doctor]);
  const availability = useMemo(() => doctor?.availability || [], [doctor]);
  const startOptions = useMemo(
    () => getStartOptions(availability, selectedDate),
    [availability, selectedDate]
  );
  const endOptions = useMemo(
    () => getEndOptions(availability, selectedDate, selectedStartTime),
    [availability, selectedDate, selectedStartTime]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading doctor details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Doctor not found.</p>
      </div>
    );
  }

  const handleConfirmAppointment = async () => {
    if (!doctor?.id || !selectedDate || !selectedStartTime || !selectedEndTime || reason.trim().length < 10) {
      return;
    }

    try {
      setIsSubmitting(true);
      setBookingError('');

      await bookAppointmentApi({
        doctorId: doctor.id,
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        reason: reason.trim(),
      });

      dispatch(fetchMyAppointments());

      dispatch(setShowConfirmModal(true));
      dispatch(setShowSlots(false));
    } catch (err) {
      setBookingError(err?.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen font-display flex flex-col">

      <PatientNavbar
        activeTab="findDoctors"
        patientName={patientNav.name}
        patientImage={patientNav.image || PATIENT_DEFAULT_AVATAR}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-6 flex flex-col gap-6">

        {/* Doctor Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center gap-6">
          <img src={doctor.image} className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md" />
          <div className="w-full flex flex-col gap-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{doctor.name}</h1>
            <p className="text-blue-500 font-medium">{doctor.specialty}</p>
            {availability.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Availability not set</p>
            )}
            <p className="text-slate-700 dark:text-slate-200 mt-2">{doctor.bio}</p>
            <p className="text-slate-500 dark:text-slate-400 mt-2">{doctor.address}</p>
            {availability.length > 0 && (
              <div className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-700/60 p-3 text-left">
                <p className="text-sm font-semibold mb-2">Availability</p>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-200">
                  {availability.map((slot, idx) => (
                    <p key={`${slot.dayOfWeek}-${slot.startTime}-${idx}`}>
                      {DAY_NAMES[slot.dayOfWeek] ?? slot.dayOfWeek}: {slot.startTime} - {slot.endTime}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <FiMail className="text-blue-500" />
                <span>{doctor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <FiPhone className="text-blue-500" />
                <span>{doctor.phone}</span>
              </div>
            </div>

            {/* Book Button */}
            <button
              className="mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all"
              onClick={() => dispatch(setShowSlots(!showSlots))}
            >
              Book Appointment
            </button>

          </div>

          {/* Time Slots Card*/}
          {showSlots && (
            <div className="mt-6 bg-white dark:bg-slate-700 rounded-xl shadow-md border border-slate-200 dark:border-slate-600 p-6 flex flex-col gap-4 w-full">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                  Book with {doctor.name}
                </h2>
                <button
                  onClick={() => {
                    dispatch(setShowSlots(false));
                    dispatch(setSelectedDate(""));
                    dispatch(setSelectedTime(""));
                    dispatch(setSelectedStartTime(""));
                    dispatch(setSelectedEndTime(""));
                    dispatch(setReason(""));
                  }}
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Select Date:</label>
              <input
                type="date"
                min={todayDateString}
                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white"
                value={selectedDate}
                onChange={(e) => {
                  dispatch(setSelectedDate(e.target.value));
                  dispatch(setSelectedStartTime(""));
                  dispatch(setSelectedEndTime(""));
                  dispatch(setSelectedTime(""));
                }}
              />
              {isPastSelectedDate && (
                <p className="text-xs text-red-600">Past date is not allowed.</p>
              )}
              {selectedDate && !isPastSelectedDate && startOptions.length === 0 && (
                <p className="text-xs text-red-600">Not available date.</p>
              )}

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Select Start Time:</label>
              <select
                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white"
                value={selectedStartTime}
                onChange={(e) => {
                  const nextStart = e.target.value;
                  dispatch(setSelectedStartTime(nextStart));
                  dispatch(setSelectedEndTime(""));
                  dispatch(setSelectedTime(""));
                }}
                disabled={!selectedDate || isPastSelectedDate || startOptions.length === 0}
              >
                <option value="">Choose start time</option>
                {startOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Select End Time:</label>
              <select
                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white"
                value={selectedEndTime}
                onChange={(e) => {
                  const nextEnd = e.target.value;
                  dispatch(setSelectedEndTime(nextEnd));
                  dispatch(
                    setSelectedTime(
                      selectedStartTime && nextEnd ? `${selectedStartTime} - ${nextEnd}` : ""
                    )
                  );
                }}
                disabled={!selectedStartTime || endOptions.length === 0}
              >
                <option value="">Choose end time</option>
                {endOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              {selectedStartTime && endOptions.length === 0 && (
                <p className="text-xs text-slate-500">
                  No valid end time for this start (maximum duration is 1 hour).
                </p>
              )}

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Reason:</label>
              <textarea
                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white"
                rows={3}
                placeholder="Describe your issue (minimum 10 characters)"
                value={reason}
                onChange={(e) => dispatch(setReason(e.target.value))}
              />

              <button
                disabled={
                  isSubmitting ||
                  !selectedDate ||
                  isPastSelectedDate ||
                  !selectedStartTime ||
                  !selectedEndTime ||
                  reason.trim().length < 10
                }
                className={`w-full py-2 rounded-lg font-semibold transition ${selectedDate &&
                  selectedStartTime &&
                  selectedEndTime &&
                  reason.trim().length >= 10
                  ? "bg-[#137fec] text-white hover:bg-[#137fec]/90"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                onClick={handleConfirmAppointment}
              >
                {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
              </button>
              {bookingError && (
                <p className="text-xs text-red-600">{bookingError}</p>
              )}
            </div>
          )}

        </div>
      </main>
      {showConfirmModal && (
        <BookConfirmModal
          doctor={doctor}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedStartTime={selectedStartTime}
          selectedEndTime={selectedEndTime}
          reason={reason}
          onDone={() => {
            dispatch(setShowConfirmModal(false));
            dispatch(resetBookingState());
          }}
        />
      )}
    </div>


  );
}
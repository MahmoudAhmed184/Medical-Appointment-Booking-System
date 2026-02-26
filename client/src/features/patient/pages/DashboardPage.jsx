import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import BookConfirmModal from "../components/BookConfirmModal";
import DoctorCard from "../components/DoctorCard";
import PatientNavbar from "../components/PatientNavbar";
import { bookAppointmentApi, getPatientProfileApi } from "../services/patientApi";
import { fetchMyAppointments } from "../../../store/slices/appointmentSlice";
import {
  clearSelectedDoctor,
  setFilterSpecialty,
  fetchDoctors,
  setSearch,
  setSelectedDoctorById,
} from "../../../store/slices/patientDoctorsSlice";
import {
  resetBookingState,
  setReason,
  setSelectedDate,
  setSelectedEndTime,
  setSelectedStartTime,
  setSelectedTime,
  setShowConfirmModal,
} from "../../../store/slices/patientBookingSlice";
import {
  PATIENT_DEFAULT_AVATAR,
} from "../../../shared/utils/constants";
import {
  toLocalDateInputValue,
  getStartOptions,
  getEndOptions,
} from "../../../shared/utils/timeSlots";


export default function DashboardPage() {
  const dispatch = useDispatch();
  const { doctors, search, filterSpecialty, selectedDoctorId, loading, error } = useSelector(
    (state) => state.patientDoctors
  );
  const {
    selectedDate,
    selectedTime,
    selectedStartTime,
    selectedEndTime,
    reason,
    showConfirmModal,
  } = useSelector(
    (state) => state.patientBooking
  );
  const [bookingError, setBookingError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientNav, setPatientNav] = useState({ name: "Patient", image: PATIENT_DEFAULT_AVATAR });
  const [addressSearch, setAddressSearch] = useState("");
  const todayDateString = useMemo(() => toLocalDateInputValue(new Date()), []);
  const isPastSelectedDate = Boolean(selectedDate && selectedDate < todayDateString);

  const navigate = useNavigate();

  const handleDoctorClick = (doctor) => {
    navigate(`/patient/doctor/${doctor.id}`, { state: { doctor } });
  }

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    const loadPatientNav = async () => {
      try {
        const { data } = await getPatientProfileApi();
        const patient = data?.patient || data?.data?.patient || data?.data || {};
        const user = patient?.user || patient?.userId || {};
        setPatientNav({
          name: user?.name || "Patient",
          image: patient?.image || PATIENT_DEFAULT_AVATAR,
        });
      } catch {
        setPatientNav({ name: "Patient", image: PATIENT_DEFAULT_AVATAR });
      }
    };

    loadPatientNav();
  }, []);

  const selectedDoctor = useMemo(
    () => doctors.find((doc) => doc.id === selectedDoctorId) || null,
    [doctors, selectedDoctorId]
  );

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doc) => {
        const matchesName = String(doc.name || "")
          .toLowerCase()
          .includes(String(search || "").toLowerCase());
        const matchesAddress = String(doc.address || "")
          .toLowerCase()
          .includes(String(addressSearch || "").toLowerCase());
        const matchesSpecialty =
          filterSpecialty === "All" || String(doc.specialty || "") === filterSpecialty;
        return matchesName && matchesAddress && matchesSpecialty;
      }),
    [doctors, search, addressSearch, filterSpecialty]
  );

  const specialtyOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        doctors
          .map((doc) => String(doc.specialty || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    return ["All", ...values];
  }, [doctors]);

  const startOptions = useMemo(
    () => getStartOptions(selectedDoctor?.availability || [], selectedDate),
    [selectedDoctor, selectedDate]
  );

  const endOptions = useMemo(
    () => getEndOptions(selectedDoctor?.availability || [], selectedDate, selectedStartTime),
    [selectedDoctor, selectedDate, selectedStartTime]
  );

  const handleConfirmAppointment = async () => {
    if (
      !selectedDoctor?.id ||
      !selectedDate ||
      !selectedStartTime ||
      !selectedEndTime ||
      reason.trim().length < 10
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      setBookingError("");

      await bookAppointmentApi({
        doctorId: selectedDoctor.id,
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        reason: reason.trim(),
      });

      dispatch(fetchMyAppointments());

      dispatch(setShowConfirmModal(true));
    } catch (err) {
      setBookingError(err?.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f8] dark:bg-[#101922] text-slate-800 dark:text-slate-100">

      <PatientNavbar
        activeTab="findDoctors"
        patientName={patientNav.name}
        patientImage={patientNav.image || PATIENT_DEFAULT_AVATAR}
      />

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full grid lg:grid-cols-12 gap-8 transition-all duration-300">

        {/* Doctor List */}
        <div
          className={`space-y-6 transition-all duration-300 ${selectedDoctor ? "lg:col-span-8" : "lg:col-span-12"
            }`}
        >
          {/* Search / Filter */}
          <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl shadow bg-white dark:bg-slate-800 mb-4">
            <input
              type="text"
              placeholder="Search by doctor name..."
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              className="flex-1 border rounded-lg px-3 py-2 bg-white text-slate-900 border-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
            />
            <input
              type="text"
              placeholder="Search by address..."
              value={addressSearch}
              onChange={(e) => setAddressSearch(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 bg-white text-slate-900 border-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
            />
            <select
              value={filterSpecialty}
              onChange={(e) => dispatch(setFilterSpecialty(e.target.value))}
              className="border rounded-lg px-3 py-2 bg-white text-slate-900 border-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
            >
              {specialtyOptions.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
              }}
              className="px-5 py-2 rounded-lg text-white bg-[#137fec]"
            >
              Search
            </button>
          </div>

          {/* Doctor Cards */}
          {loading && <p className="text-sm text-slate-500">Loading doctors...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && filteredDoctors.length === 0 && (
            <p className="text-sm text-slate-500">No doctors found.</p>
          )}

          {filteredDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onOpenDoctor={handleDoctorClick}
              onBook={(doctor) => {
                dispatch(setSelectedDoctorById(doctor.id));
                dispatch(setSelectedDate(""));
                dispatch(setSelectedTime(""));
                dispatch(setSelectedStartTime(""));
                dispatch(setSelectedEndTime(""));
                dispatch(setReason(""));
                setBookingError("");
              }}
            />
          ))}
        </div>

        {/* Booking Card */}
        {selectedDoctor && (
          <div className="lg:col-span-4 relative transition-all duration-300">
            <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-xl shadow-lg border p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                  Book with {selectedDoctor.name}
                </h2>
                <button
                  onClick={() => {
                    dispatch(clearSelectedDoctor());
                    dispatch(setSelectedDate(""));
                    dispatch(setSelectedTime(""));
                    dispatch(setSelectedStartTime(""));
                    dispatch(setSelectedEndTime(""));
                    dispatch(setReason(""));
                    setBookingError("");
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
                {isSubmitting ? "Booking..." : "Confirm Appointment"}
              </button>
              {bookingError && <p className="text-xs text-red-600">{bookingError}</p>}
            </div>
          </div>
        )}

      </main>
      {showConfirmModal && selectedDoctor && (
        <BookConfirmModal
          doctor={selectedDoctor}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedStartTime={selectedStartTime}
          selectedEndTime={selectedEndTime}
          reason={reason}
          onDone={() => {
            dispatch(setShowConfirmModal(false));
            dispatch(resetBookingState());
            dispatch(clearSelectedDoctor());
          }}
        />
      )}



    </div>
  );
}
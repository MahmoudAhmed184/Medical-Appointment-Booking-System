import React from 'react'
import { FaCalendarAlt } from "react-icons/fa";
import { IoTime } from "react-icons/io5";

export default function BookConfirmModal({
  doctor,
  selectedTime,
  selectedStartTime,
  selectedEndTime,
  selectedDate,
  reason,
  onDone,
}) {
  const bookedTime =
    selectedTime ||
    (selectedStartTime && selectedEndTime
      ? `${selectedStartTime} - ${selectedEndTime}`
      : selectedStartTime || '-');

  return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    {/* Modal */}
    <div className="bg-white dark:bg-slate-800 text-xl text-center rounded-xl shadow-xl p-6 w-[90%] max-w-md flex flex-col gap-5">

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
        Appointment Confirmed 
      </h2>

      <p className="text-slate-600 dark:text-slate-300">
        You booked with <span className="font-semibold">{doctor.name}</span>
      </p>

      <div className="text-md text-slate-500 dark:text-slate-400">
        <FaCalendarAlt className="inline mr-2 text-blue-500" /> {selectedDate}  
        <br/>
        <IoTime className="inline mr-2 text-blue-500"/> {bookedTime}
      </div>

      {reason && (
        <p className="text-sm text-slate-600 dark:text-slate-300 text-left bg-slate-50 dark:bg-slate-700/40 rounded-lg p-3">
          <span className="font-semibold">Reason:</span> {reason}
        </p>
      )}

      <button
        onClick={() => {
          if (onDone) onDone();
        }}
        className="mt-4 py-2 bg-[#137fec] text-white rounded-lg hover:bg-[#137fec]/90 transition"
      >
        Done
      </button>

    </div>

  </div>
  )
}

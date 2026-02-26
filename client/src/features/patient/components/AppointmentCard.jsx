const getStatusClass = (status) => {
  if (status === 'Confirmed') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  if (status === 'Pending') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
};

const AppointmentCard = ({ appointment, onCancel, onReschedule }) => {
  const normalizedStatus = String(appointment?.rawStatus || '').toLowerCase();

  const isCancelled = normalizedStatus === 'cancelled';
  const isRejected = normalizedStatus === 'rejected';
  const isCompleted = normalizedStatus === 'completed';

  const canModify = !isCancelled && !isRejected && !isCompleted;

  return (
    <div className="p-5 rounded-xl shadow hover:shadow-lg transition bg-white dark:bg-slate-800 flex gap-4 items-center">
      <img
        src={appointment.image}
        alt={appointment.doctorName}
        className="w-24 h-24 rounded-lg object-cover"
      />
      <div className="flex-1">
        <h3 className="text-lg font-bold dark:text-white">{appointment.doctorName}</h3>
        <p className="text-sm text-[#137fec]">{appointment.specialty}</p>
        <p className="mt-1 text-slate-500 dark:text-slate-400">{appointment.date}</p>
        <span className={`mt-2 inline-block px-3 py-1 rounded-lg text-base font-semibold ${getStatusClass(appointment.status)}`}>
          {appointment.status}
        </span>

        {canModify && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onCancel?.(appointment.id)}
              className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onReschedule?.(appointment.id)}
              className="px-3 py-1.5 rounded-md bg-[#137fec] text-white text-sm"
            >
              Reschedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;

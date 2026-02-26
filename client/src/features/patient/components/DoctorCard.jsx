const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DoctorCard = ({ doctor, onOpenDoctor, onBook }) => {
  const availability = doctor.availability || [];

  return (
    <div
      onClick={() => onOpenDoctor?.(doctor)}
      className="bg-white dark:bg-slate-800 rounded-xl shadow p-5 hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex gap-4">
        <img src={doctor.image} className="w-24 h-24 rounded-lg object-cover" />
        <div className="flex-1">
          <h3 className="font-bold text-lg dark:text-white">{doctor.name}</h3>
          <p className="text-[#137fec] text-sm">{doctor.specialty}</p>
          <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">Address: {doctor.address}</p>
          {availability.length > 0 && (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              {availability.map((slot, idx) => (
                <p key={`${slot.dayOfWeek}-${slot.startTime}-${idx}`}>
                  {DAY_NAMES[slot.dayOfWeek] ?? slot.dayOfWeek}: {slot.startTime} - {slot.endTime}
                </p>
              ))}
            </div>
          )}
          {availability.length === 0 && (
            <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">Availability not set</p>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook?.(doctor);
            }}
            className="mt-3 text-[#137fec] font-semibold border px-3 py-1 rounded-lg hover:bg-[#137fec] hover:text-white transition"
          >
            Book Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;

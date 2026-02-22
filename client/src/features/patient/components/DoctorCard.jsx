const DoctorCard = ({ doctor, onOpenDoctor, onBook }) => {
  return (
    <div
      onClick={() => onOpenDoctor?.(doctor)}
      className="bg-white dark:bg-slate-800 rounded-xl shadow p-5 hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex gap-4">
        <img src={doctor.image} className="w-24 h-24 rounded-lg object-cover" />
        <div className="flex-1">
          <h3 className="font-bold text-lg">{doctor.name}</h3>
          <p className="text-[#137fec] text-sm">{doctor.specialty}</p>
          <p className="text-sm mt-2 text-slate-500">Address: {doctor.address}</p>
          <p className="text-sm mt-1 text-slate-400">Availablity: {doctor.availablity}</p>
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

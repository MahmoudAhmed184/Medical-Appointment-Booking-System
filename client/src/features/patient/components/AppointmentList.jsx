import AppointmentCard from './AppointmentCard';

const AppointmentList = ({ appointments, onCancel, onReschedule }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onCancel={onCancel}
          onReschedule={onReschedule}
        />
      ))}
    </div>
  );
};

export default AppointmentList;

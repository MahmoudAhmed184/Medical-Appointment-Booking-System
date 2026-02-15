import { useState } from "react";

export default function MyAppointmentsPage() {
  const appointments = [
    {
      id: 1,
      doctorName: "Dr. Sarah Jenkins",
      specialty: "Cardiologist",
      date: "24 Feb, 10:00 AM",
      status: "Confirmed",
      image: "https://i.pravatar.cc/100",
    },
    {
      id: 2,
      doctorName: "Dr. Michael Chen",
      specialty: "Dermatologist",
      date: "25 Feb, 01:00 PM",
      status: "Pending",
      image: "https://i.pravatar.cc/101",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f8] dark:bg-[#101922] text-slate-800 dark:text-slate-100">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b bg-white dark:bg-[#1a2632]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg text-[#137fec] bg-[#137fec1a]">
              <span className="material-icons-round">icon</span>
            </div>
            <span className="font-bold text-xl">MediBook</span>
          </div>

          {/* TABS */}
          <div className="hidden md:flex gap-6 text-mx">
            <span className="hover:text-[#137fec] cursor-pointer">Find Doctors</span>
            <span className="font-semibold text-[#137fec] border-b-2 border-[#137fec] cursor-pointer">My Appointments</span>
            <span className="hover:text-[#137fec] cursor-pointer">Profile</span>
          </div>

          {/* PROFILE */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800 dark:text-slate-100">Shaza Hamdy</span>
            <img
              src="https://i.pravatar.cc/40"
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            
          </div>

        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full">

        <h1 className="text-2xl font-bold mb-2">My Appointments</h1>
        <p className="text-slate-500 mb-6">Here are all your booked appointments.</p>

        {/* Appointments List */}
        <div className="grid md:grid-cols-2 gap-6">

          {appointments.map((app) => (
            <div key={app.id} className="p-5 rounded-xl shadow hover:shadow-lg transition bg-white dark:bg-slate-800 flex gap-4 items-center">
              <img
                src={app.image}
                alt={app.doctorName}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold">{app.doctorName}</h3>
                <p className="text-sm text-[#137fec]">{app.specialty}</p>
                <p className="mt-1 text-slate-500">{app.date}</p>
                <span className={`mt-2 inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                  app.status === "Confirmed"
                    ? "bg-green-100 text-green-800"
                    : app.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-slate-100 text-slate-800"
                }`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}

        </div>
      </main>
    </div>
  );
}
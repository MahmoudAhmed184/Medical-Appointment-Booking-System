import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import DoctorLayout from '../layouts/DoctorLayout';
import PatientLayout from '../layouts/PatientLayout';

// Shared
import ProtectedRoute from '../shared/components/ProtectedRoute';

// Auth pages
import { LoginPage, RegisterPage } from '../features/auth';

// Admin pages
import { AdminDashboardPage, UsersPage, SpecialtiesPage, AdminAppointmentsPage } from '../features/admin';

// Doctor pages
import { DoctorDashboardPage, AvailabilityPage, DoctorAppointmentsPage, DoctorProfilePage } from '../features/doctor';

// Patient pages
import { PatientDashboardPage, DoctorsPage, BookAppointmentPage, MyAppointmentsPage, PatientProfilePage } from '../features/patient';

const AppRouter = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/admin/users" element={<UsersPage />} />
                    <Route path="/admin/specialties" element={<SpecialtiesPage />} />
                    <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
                </Route>
            </Route>

            {/* Doctor routes */}
            <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                <Route element={<DoctorLayout />}>
                    <Route path="/doctor" element={<DoctorDashboardPage />} />
                    <Route path="/doctor/availability" element={<AvailabilityPage />} />
                    <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
                    <Route path="/doctor/profile" element={<DoctorProfilePage />} />
                </Route>
            </Route>

            {/* Patient routes */}
            <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
                <Route element={<PatientLayout />}>
                    <Route path="/patient" element={<PatientDashboardPage />} />
                    <Route path="/patient/doctors" element={<DoctorsPage />} />
                    <Route path="/patient/book/:doctorId" element={<BookAppointmentPage />} />
                    <Route path="/patient/appointments" element={<MyAppointmentsPage />} />
                    <Route path="/patient/profile" element={<PatientProfilePage />} />
                </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRouter;

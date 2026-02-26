import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import DoctorLayout from '../layouts/DoctorLayout';
import PatientLayout from '../layouts/PatientLayout';

import ProtectedRoute from '../shared/components/ProtectedRoute';

import { LoginPage, RegisterPage } from '../features/auth';

import { AdminDashboardPage, UsersPage, SpecialtiesPage, AdminAppointmentsPage } from '../features/admin';

import { DoctorDashboardPage, AvailabilityPage, DoctorAppointmentsPage, DoctorProfilePage } from '../features/doctor';

import { PatientDashboardPage, DoctorPage, MyAppointmentsPage, PatientProfilePage } from '../features/patient';

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
                    <Route path="/patient/doctor/:doctorId" element={<DoctorPage />} />
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

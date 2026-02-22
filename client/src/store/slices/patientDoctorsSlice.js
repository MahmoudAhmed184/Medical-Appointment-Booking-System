import { createSlice } from '@reduxjs/toolkit';

const initialDoctors = [
    {
        id: 1,
        name: 'Dr. Sarah Jenkins',
        specialty: 'Cardiologist',
        image: 'https://i.pravatar.cc/100',
        availablity: '24 Feb, 10:00 AM',
        bio: 'Dr. Jenkins is a board-certified cardiologist with over 15 years of experience. She specializes in treating heart conditions and improving cardiovascular health.',
        address: '123 Heart St, Cardio City',
        email: 'sarah.jenkins@medibook.com',
        phone: '+1 (555) 987-6543',
        timeSlots: ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'],
    },
    {
        id: 2,
        name: 'Dr. Michael Chen',
        specialty: 'Dermatologist',
        image: 'https://i.pravatar.cc/101',
        availablity: '25 Feb, 09:15 AM',
        bio: 'Dr. Chen is a highly skilled dermatologist with expertise in treating skin conditions such as acne, eczema, and psoriasis. He is dedicated to helping patients achieve healthy skin.',
        address: '456 Skin Ave, Dermaville',
        email: 'michael.chen@medibook.com',
        phone: '+1 (555) 123-4567',
        timeSlots: ['09:15 AM', '10:30 AM', '01:00 PM', '03:00 PM'],
    },
];

const patientDoctorsSlice = createSlice({
    name: 'patientDoctors',
    initialState: {
        doctors: initialDoctors,
        search: '',
        filterSpecialty: 'All',
        selectedDoctorId: null,
    },
    reducers: {
        setSearch: (state, action) => {
            state.search = action.payload;
        },
        setFilterSpecialty: (state, action) => {
            state.filterSpecialty = action.payload;
        },
        setSelectedDoctorById: (state, action) => {
            state.selectedDoctorId = action.payload;
        },
        clearSelectedDoctor: (state) => {
            state.selectedDoctorId = null;
        },
    },
});

export const {
    setSearch,
    setFilterSpecialty,
    setSelectedDoctorById,
    clearSelectedDoctor,
} = patientDoctorsSlice.actions;

export default patientDoctorsSlice.reducer;

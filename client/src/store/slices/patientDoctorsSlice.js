import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getDoctorsApi } from '../../features/patient/services/patientApi';

const normalizeAvailability = (availability) =>
    Array.from(
        new Map(
            (Array.isArray(availability) ? availability : [])
                .map((slot) => ({
                    dayOfWeek: Number(slot?.dayOfWeek),
                    startTime: slot?.startTime || '',
                    endTime: slot?.endTime || '',
                }))
                .filter(
                    (slot) =>
                        Number.isInteger(slot.dayOfWeek) &&
                        slot.dayOfWeek >= 0 &&
                        slot.dayOfWeek <= 6 &&
                        slot.startTime &&
                        slot.endTime
                )
                .map((slot) => [
                    `${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`,
                    slot,
                ])
        ).values()
    )
        .sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
            return String(a.startTime).localeCompare(String(b.startTime));
        });

const mapDoctor = (doctor) => ({
    id: doctor?._id || doctor?.id,
    name: doctor?.userId?.name || doctor?.name || 'Doctor',
    specialty: doctor?.specialtyId?.name || doctor?.specialty || 'Specialty',
    image: doctor?.image || 'https://i.pravatar.cc/100',
    availablity: doctor?.availabilityText || 'Availability not set',
    bio: doctor?.bio || 'No bio available.',
    address: doctor?.address || 'Address not available',
    email: doctor?.userId?.email || doctor?.email || '-',
    phone: doctor?.phone || '-',
    timeSlots: doctor?.timeSlots || [],
    availability: normalizeAvailability(doctor?.availability),
});

export const fetchDoctors = createAsyncThunk(
    'patientDoctors/fetchDoctors',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await getDoctorsApi();
            const rawDoctors =
                data?.doctors || data?.data?.doctors || data?.data || [];
            return Array.isArray(rawDoctors) ? rawDoctors.map(mapDoctor) : [];
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || 'Failed to load doctors'
            );
        }
    }
);

const patientDoctorsSlice = createSlice({
    name: 'patientDoctors',
    initialState: {
        doctors: [],
        search: '',
        filterSpecialty: 'All',
        selectedDoctorId: null,
        loading: false,
        error: null,
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
    extraReducers: (builder) => {
        builder
            .addCase(fetchDoctors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDoctors.fulfilled, (state, action) => {
                state.loading = false;
                state.doctors = action.payload;
            })
            .addCase(fetchDoctors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.doctors = [];
            });
    },
});

export const {
    setSearch,
    setFilterSpecialty,
    setSelectedDoctorById,
    clearSelectedDoctor,
} = patientDoctorsSlice.actions;

export default patientDoctorsSlice.reducer;

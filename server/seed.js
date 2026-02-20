import 'dotenv/config';
import { connectDB } from './src/config/db.js';
import User from './src/models/User.js';
import Doctor from './src/models/Doctor.js';
import Patient from './src/models/Patient.js';
import Specialty from './src/models/Specialty.js';
import Availability from './src/models/Availability.js';
import Appointment from './src/models/Appointment.js';
import bcrypt from 'bcryptjs';
import { ROLES, APPOINTMENT_STATUS } from './src/utils/constants.js';

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Doctor.deleteMany({});
        await Patient.deleteMany({});
        await Specialty.deleteMany({});
        await Availability.deleteMany({});
        await Appointment.deleteMany({});

        // Create Specialties
        console.log('📚 Creating specialties...');
        const specialties = await Specialty.insertMany([
            { name: 'Cardiology', description: 'Heart and cardiovascular system' },
            { name: 'Dermatology', description: 'Skin, hair, and nails' },
            { name: 'Pediatrics', description: 'Medical care for children' },
            { name: 'Orthopedics', description: 'Bones, joints, and muscles' },
            { name: 'Neurology', description: 'Brain and nervous system' },
        ]);
        console.log(`✅ Created ${specialties.length} specialties`);

        // Create Admin User
        console.log('Creating admin user...');
        const hashedAdminPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@hospital.com',
            password: hashedAdminPassword,
            role: ROLES.ADMIN,
            isApproved: true,
            isBlocked: false,
        });
        console.log('Created admin user');

      
        console.log('Creating doctors...');
        const hashedDoctorPassword = await bcrypt.hash('doctor123', 10);
        const doctorUsers = await User.insertMany([
            {
                name: 'Dr. Ahmed Hassan',
                email: 'ahmed.hassan@hospital.com',
                password: hashedDoctorPassword,
                role: ROLES.DOCTOR,
                isApproved: true,
                isBlocked: false,
            },
            {
                name: 'Dr. Fatima Ali',
                email: 'fatima.ali@hospital.com',
                password: hashedDoctorPassword,
                role: ROLES.DOCTOR,
                isApproved: true,
                isBlocked: false,
            },
            {
                name: 'Dr. Mohamed Salah',
                email: 'mohamed.salah@hospital.com',
                password: hashedDoctorPassword,
                role: ROLES.DOCTOR,
                isApproved: true,
                isBlocked: false,
            },
        ]);

        const doctors = await Doctor.insertMany([
            {
                userId: doctorUsers[0]._id,
                specialtyId: specialties[0]._id, // Cardiology
                bio: 'Experienced cardiologist with 15 years of practice',
                phone: '+201234567890',
            },
            {
                userId: doctorUsers[1]._id,
                specialtyId: specialties[1]._id, // Dermatology
                bio: 'Specialist in skin conditions and cosmetic dermatology',
                phone: '+201234567891',
            },
            {
                userId: doctorUsers[2]._id,
                specialtyId: specialties[2]._id, // Pediatrics
                bio: 'Caring for children\'s health and development',
                phone: '+201234567892',
            },
        ]);
        console.log(`Created ${doctors.length} doctors`);

        
        // Create Patient Users

        console.log('Creating patients...');
        const hashedPassword = await bcrypt.hash('patient123', 10);
        const patientUsers = await User.insertMany([
            {
                name: 'Sara Ibrahim',
                email: 'sara.ibrahim@email.com',
                password: hashedPassword,
                role: ROLES.PATIENT,
                isApproved: true,
                isBlocked: false,
            },
            {
                name: 'Omar Khaled',
                email: 'omar.khaled@email.com',
                password: hashedPassword,
                role: ROLES.PATIENT,
                isApproved: true,
                isBlocked: false,
            },
            {
                name: 'Layla Ahmed',
                email: 'layla.ahmed@email.com',
                password: hashedPassword,
                role: ROLES.PATIENT,
                isApproved: true,
                isBlocked: false,
            },
        ]);

        // Create Patient Profiles
        const patients = await Patient.insertMany([
            {
                userId: patientUsers[0]._id,
                phone: '+201112223333',
                dateOfBirth: new Date('1990-05-15'),
            },
            {
                userId: patientUsers[1]._id,
                phone: '+201112223334',
                dateOfBirth: new Date('1985-08-22'),
            },
            {
                userId: patientUsers[2]._id,
                phone: '+201112223335',
                dateOfBirth: new Date('2015-03-10'),
            },
        ]);
        console.log(`Created ${patients.length} patients`);

        // Create Availability Slots for Doctors
        console.log('Creating availability slots...');
        
        const availabilities = await Availability.insertMany([
            // Dr. Ahmed Hassan - Cardiology (Monday to Friday, 9 AM - 5 PM)
            { doctorId: doctors[0]._id, dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
            { doctorId: doctors[0]._id, dayOfWeek: 1, startTime: '13:00', endTime: '17:00' },
            { doctorId: doctors[0]._id, dayOfWeek: 3, startTime: '09:00', endTime: '12:00' },
            { doctorId: doctors[0]._id, dayOfWeek: 3, startTime: '13:00', endTime: '17:00' },

            // Dr. Fatima Ali - Dermatology (Tuesday, Thursday, Saturday)
            { doctorId: doctors[1]._id, dayOfWeek: 2, startTime: '10:00', endTime: '14:00' },
            { doctorId: doctors[1]._id, dayOfWeek: 4, startTime: '10:00', endTime: '14:00' },
            { doctorId: doctors[1]._id, dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },

            // Dr. Mohamed Salah - Pediatrics (Sunday to Thursday)
            { doctorId: doctors[2]._id, dayOfWeek: 0, startTime: '08:00', endTime: '12:00' },
            { doctorId: doctors[2]._id, dayOfWeek: 2, startTime: '08:00', endTime: '12:00' },
            { doctorId: doctors[2]._id, dayOfWeek: 4, startTime: '08:00', endTime: '12:00' },
        ]);
        console.log(`Created ${availabilities.length} availability slots`);

        // Create Sample Appointments
        console.log('Creating appointments...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const appointments = await Appointment.insertMany([
            {
                patientId: patients[0]._id,
                doctorId: doctors[0]._id,
                date: tomorrow,
                startTime: '09:00',
                endTime: '10:00',
                status: APPOINTMENT_STATUS.CONFIRMED,
                reason: 'Regular heart checkup and blood pressure monitoring',
                notes: 'Patient has history of hypertension',
            },
            {
                patientId: patients[1]._id,
                doctorId: doctors[1]._id,
                date: tomorrow,
                startTime: '10:00',
                endTime: '11:00',
                status: APPOINTMENT_STATUS.PENDING,
                reason: 'Skin rash examination and treatment consultation',
            },
            {
                patientId: patients[2]._id,
                doctorId: doctors[2]._id,
                date: nextWeek,
                startTime: '08:00',
                endTime: '09:00',
                status: APPOINTMENT_STATUS.CONFIRMED,
                reason: 'Annual pediatric checkup and vaccination',
                notes: 'Child is 8 years old, needs school physical',
            },
        ]);
        console.log(`✅ Created ${appointments.length} appointments`);

        console.log('\nDatabase seeding completed successfully!');
        console.log('\nSummary:');
        console.log(`   - Specialties: ${specialties.length}`);
        console.log(`   - Users: ${doctorUsers.length + patientUsers.length + 1} (${doctorUsers.length} doctors, ${patientUsers.length} patients, 1 admin)`);
        console.log(`   - Doctors: ${doctors.length}`);
        console.log(`   - Patients: ${patients.length}`);
        console.log(`   - Availability Slots: ${availabilities.length}`);
        console.log(`   - Appointments: ${appointments.length}`);
        console.log('\n✅ You can now view the data in MongoDB Compass!');
        console.log('   Refresh the connection and navigate to: medical-appointments database\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};


connectDB().then(() => {
    seedDatabase();
});

import mongoose from 'mongoose';

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
});

const connectDB = () => {
    return mongoose.connect(process.env.MONGO_URI);
};

export { connectDB };

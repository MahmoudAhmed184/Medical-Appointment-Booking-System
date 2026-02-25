import 'dotenv/config';
import { validateEnv } from './src/config/env.js';
validateEnv();

import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import app from './src/app.js';

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB()
    .then((conn) => {
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    })
    .catch((error) => {
        console.error('Failed to connect to database:', error.message);
        process.exit(1);
    });

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
});

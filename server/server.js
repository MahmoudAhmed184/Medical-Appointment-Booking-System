import 'dotenv/config';
import { validateEnv } from './src/config/env.js';
validateEnv();

import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import app from './src/app.js';

const PORT = process.env.PORT || 5000;

connectDB()
    .then((conn) => {
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        });

        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Shutting down gracefully…`);
            server.close(async () => {
                await mongoose.connection.close();
                console.log('MongoDB connection closed.');
                process.exit(0);
            });
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    })
    .catch((error) => {
        console.error('Failed to connect to database:', error.message);
        process.exit(1);
    });

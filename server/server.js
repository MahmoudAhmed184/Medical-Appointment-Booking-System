import 'dotenv/config';
import { connectDB } from './src/config/db.js';
import app from './src/app.js';

const PORT = process.env.PORT || 5000;

// TODO: Connect to database and start server

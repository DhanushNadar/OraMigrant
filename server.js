import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import convertRoute from './src/routes/convert.js';
import authRoutes from './src/routes/auth.js';
import historyRoutes from './src/routes/history.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? false : "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/convert', convertRoute);
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

// Global Error Handler
app.use(errorHandler);

// Database Connection
try {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB', err.message);
    });
} catch (err) {
  console.error('Mongoose connection setup error:', err.message);
}

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/dist")));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

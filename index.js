import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import itemRoutes from './routes/item.js';
import userRoutes from './routes/user.js';
import tradeRoutes from "./routes/trade.js";
 // Fixed import
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
app.use(cors({
    origin: "http://localhost:5173", // React frontend URL
    credentials: true,
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/items", itemRoutes);
app.use("/auth", userRoutes); // Fixed route usage
app.use('/api/trades', tradeRoutes);
// MongoDB connection
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Start the server
const PORT = process.env.PORT || 3000; // Ensure it defaults to 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

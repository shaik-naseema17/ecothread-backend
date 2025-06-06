import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import itemRoutes from './routes/item.js';
import userRoutes from './routes/user.js';
import tradeRoutes from './routes/trade.js';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://ecothread-frontend.vercel.app"
    ],
    credentials: true,
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/items", itemRoutes);
app.use("/auth", userRoutes);
app.use("/api/trades", tradeRoutes);

// Basic root and favicon routes
app.get("/", (req, res) => {
    res.send("API is working. Try hitting /auth/signup or /api/items.");
});
app.get("/favicon.ico", (req, res) => res.status(204).end());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

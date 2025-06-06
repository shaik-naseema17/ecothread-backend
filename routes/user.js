import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router(); // ✅ You missed this in your code

// === SIGNUP ===
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ status: true, message: 'User created successfully' });
    } catch (err) {
        console.error('❌ Error in signup route:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// === LOGIN ===
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.KEY,
            { expiresIn: '10d' }
        );

        // ✅ Secure cookie settings for production
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
        });

        return res.status(200).json({
            status: true,
            message: 'Login successful',
            role: user.role
        });
    } catch (error) {
        console.error('❌ Error in login route:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// === TOKEN VERIFY (optional) ===
router.get('/verify', (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ status: false, message: 'Unauthorized' });

    try {
        jwt.verify(token, process.env.KEY);
        return res.status(200).json({ status: true, message: 'Authorized' });
    } catch {
        return res.status(401).json({ status: false, message: 'Invalid token' });
    }
});

// === GET CURRENT USER ID ===
router.get("/me", (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ status: false, message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.KEY);
        res.status(200).json({ status: true, userId: decoded.id });
    } catch (error) {
        res.status(401).json({ status: false, message: "Invalid token" });
    }
});

// === LOGOUT ===
router.get("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });
    res.status(200).json({ status: true, message: "Logged out successfully" });
});

export default router;

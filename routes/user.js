import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const router = express.Router();

// Signup Route

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    

    try {
        // Ensure all fields are provided
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ status: true, message: 'User created successfully' });
    } catch (err) {
        console.error('Error in signup route:', err); // Log the error for debugging
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.KEY, { expiresIn: '10d' });
        res.cookie('token', token, { httpOnly: true });

        return res.status(200).json({
            status: true,
            message: 'Login successful',
            role: user.role // Include the role in the response
        });
    } catch (error) {
        console.error('Error in login route:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/verify', (req, res) => {
    const token = req.cookies?.token; // Assuming you're using cookies
    if (!token) {
        return res.status(401).json({ status: false, message: 'Unauthorized' });
    }
    // Verify token logic here
    return res.status(200).json({ status: true, message: 'Authorized' });
});
router.get("/me", (req, res) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.KEY);
        res.status(200).json({ status: true, userId: decoded.id });
    } catch (error) {
        res.status(401).json({ status: false, message: "Invalid token" });
    }
});
// Other routes remain unchanged...

// Backend logout route
router.get("/logout", (req, res) => {
    res.clearCookie("token"); // Clear the token cookie
    res.status(200).json({ status: true, message: "Logged out successfully" });
  });
export default router;

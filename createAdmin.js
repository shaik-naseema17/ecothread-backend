import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from './models/User.js'; // Adjust the path as needed
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

(async () => {
    try {
        // Connect to the database
        await mongoose.connect('mongodb://127.0.0.1:27017/authentication')
            .then(() => console.log("Connected to MongoDB"))
            .catch((err) => console.error("MongoDB connection error:", err));

        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@example.com' });
        if (adminExists) {
            console.log('Admin already exists');
            return;
        }

        // Create a new admin
        const hashedPassword = await bcrypt.hash('adminpassword', 10);
        const adminUser = new User({
            username: 'Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin' // Explicitly set role as admin
        });

        await adminUser.save();
        console.log('Admin created successfully');
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        mongoose.connection.close();
    }
})();

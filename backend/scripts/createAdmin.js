// scripts/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import User model
const User = require('../models/User');

// Admin details - CHANGE THESE!
const adminData = {
    name: "Admin User",
    email: "admin@teamtime.com", // Only ONE admin email
    password: "Admin123@", // Change this to a strong password
    role: "admin",
    department: "Administration"
};

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        
        if (existingAdmin) {
            console.log('⚠️ Admin already exists');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        // Create admin user
        const admin = await User.create({
            name: adminData.name,
            email: adminData.email,
            password: hashedPassword,
            role: 'admin',
            department: 'Administration'
        });

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password:', adminData.password);
        console.log('⚠️ Please save these credentials safely!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

// Run the script
createAdmin();
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

const app = express();

// ✅ FIX 1: Single CORS configuration (REMOVE the duplicate one at the bottom)
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// ✅ FIX 2: Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIX 3: Mount routes (order doesn't matter now)
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/departments', departmentRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('TeamTime API is running');
});

// ✅ FIX 4: MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        app.listen(process.env.PORT || 5000, () => {
            console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch(err => {
        console.log('❌ DB Error:', err.message);
        process.exit(1);
    });
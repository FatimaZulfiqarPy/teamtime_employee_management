const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path'); // to safetly handle file paths

// Load .env from parent directory (backend folder)
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        // Check if MONGO_URI is loaded
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }

        console.log('Attempting to connect to MongoDB...');
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, //use new way to read MongoDB URL
            useUnifiedTopology: true, // better connection handling
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
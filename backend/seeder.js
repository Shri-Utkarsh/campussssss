const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminExists = await User.findOne({ email: 'admin@campus.com' });

        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            name: 'System Admin',
            email: 'admin@campus.com',
            password: hashedPassword,
            role: 'admin',
        });

        console.log('Admin account created: admin@campus.com / admin123');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedAdmin();

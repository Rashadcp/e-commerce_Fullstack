import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetAdminPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const admin = await User.findOne({ email: 'admin@refuel.com' });

        if (!admin) {
            console.log('ERROR: Admin user not found!');
            console.log('Run: node createAdmin.js to create an admin user');
            await mongoose.connection.close();
            process.exit(1);
        }

        // New password
        const newPassword = 'admin123';

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password
        admin.password = hashedPassword;
        await admin.save();

        console.log('========================================');
        console.log('ADMIN PASSWORD RESET SUCCESSFUL!');
        console.log('========================================');
        console.log('Email:    admin@refuel.com');
        console.log('Password: admin123');
        console.log('========================================');
        console.log('\nIMPORTANT: Change this password after login!');
        console.log('========================================\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

resetAdminPassword();

require('dotenv').config();
const mongoose = require('mongoose');
const Users = require('../src/models/Users');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    await mongoose.connect(process.env.MONGO_URI);
    const existingAdmin = await Users.findOne({ role: 'admin' });
    if (existingAdmin) {
        console.log('Admin user already exists.');
        mongoose.disconnect();
        return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    await Users.create({
        name: 'Admin User',
        email: 'admin.ad000000@sis.hust.edu.vn',
        password: hashedPassword,
        dob: new Date('1990-01-01'),
        gender: 'Nam',
        code: '20000000',
        role: 'admin',
        ethnic: 'Kinh',
        university: 'Đại học Bách Khoa Hà Nội',
        schoolYear: 0
    });

    console.log('Admin user created successfully.');
    process.exit();
    mongoose.disconnect();
}

seedAdmin();
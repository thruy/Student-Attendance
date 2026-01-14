require('dotenv').config();
const mongoose = require('mongoose');
const Users = require('../src/models/Users');
const bcrypt = require('bcryptjs');

async function seedTeacher() {
    await mongoose.connect(process.env.MONGO_URI);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    await Users.create({
        name: 'Đức Huy',
        email: 'huy.duc212121@sis.hust.edu.vn',
        password: hashedPassword,
        dob: new Date('1990-01-01'),
        gender: 'Nam',
        code: '20212121',
        role: 'teacher',
        ethnic: 'Kinh',
        university: 'Đại học Bách Khoa Hà Nội',
        schoolYear: 66
    });

    await Users.create({
        name: 'Trần Đức',
        email: 'duc.tran151515@sis.hust.edu.vn',
        password: hashedPassword,
        dob: new Date('1988-01-01'),
        gender: 'Nam',
        code: '20151515',
        role: 'teacher',
        ethnic: 'Kinh',
        university: 'Đại học Bách Khoa Hà Nội',
        schoolYear: 60
    });

    console.log('Teacher user created successfully.');
    process.exit();
    mongoose.disconnect();
}

seedTeacher();
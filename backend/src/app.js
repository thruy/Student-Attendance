require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(cookieParser());
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/students', require('./routes/student.route'));
app.use('/api/teachers', require('./routes/teacher.route'));
app.use('/api/admin', require('./routes/admin.route'));


app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
module.exports = app;
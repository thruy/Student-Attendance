require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', require('./routes/auth.route'));

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
module.exports = app;
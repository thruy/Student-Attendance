const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const tokenHeader = req.headers.authorization;
        if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = tokenHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = { verifyToken };
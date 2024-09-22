// auth.js
const jwt = require('jsonwebtoken');

// สร้าง middleware สำหรับการตรวจสอบ JWT
const authenticateToken = (req, res, next) => {
    // ดึง token จาก header ของ request
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'No token provided' }); // ไม่มี token
    }

    // ตรวจสอบ token ด้วย secret key
    jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' }); // token ไม่ถูกต้อง
        }

        req.user = user; // เก็บข้อมูลผู้ใช้ไว้ใน req
        next(); // ไปยัง middleware หรือ route ถัดไป
    });
};

module.exports = authenticateToken;

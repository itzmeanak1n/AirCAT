// caregiver.js
const express = require('express');
const router = express.Router();
const connection = require('./db');

// Route สำหรับเพิ่มห้องใหม่
router.post('/addRoom', (req, res) => {
    console.log(req.body);  // Log req.body เพื่อตรวจสอบข้อมูล

    const { room_name, description, price_per_night, availability } = req.body;
    const user_id = req.session.user.id; // ใช้ user_id จาก session
    const user_role = req.session.user.role; // ดึง role จาก session

    // ตรวจสอบว่า user เป็น caregiver ก่อน
    if (user_role !== 'caregiver') {
        return res.status(403).json({ error: 'Access denied' });
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!room_name || !price_per_night || typeof availability === 'undefined') {
        return res.status(400).json({ error: 'Required fields are missing' });
    }

    const query = `
        INSERT INTO rooms (user_id, room_name, description, price_per_night, availability)
        VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(
        query,
        [user_id, room_name, description, price_per_night, availability],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.redirect('/caregiver'); // เปลี่ยนเส้นทางไปยัง dashboard ของ caregiver
        }
    );
});

module.exports = router;

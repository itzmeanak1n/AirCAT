const express = require('express');
const router = express.Router();
const connection = require('./db');

// Route สำหรับเพิ่มห้องใหม่
router.post('/addRoom', (req, res) => {
    const { room_name, description, price_per_night, availability } = req.body;

    // ตรวจสอบว่า user มีการล็อกอินและ role เป็น caregiver หรือไม่
    if (req.session.user && req.session.user.role === 'caregiver') {
        console.log('Session user:', req.session.user); // ตรวจสอบค่า session
        const user_id = req.session.user.id; // ดึง user_id ของ caregiver

        // Query สำหรับเพิ่มห้อง
        const query = `
            INSERT INTO rooms (user_id, room_name, description, price_per_night, availability, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())`;

        // ตรวจสอบว่า availability ถูกส่งมาหรือไม่
        const availabilityValue = availability ? 1 : 0; // ตั้งค่า availability เป็น 1 ถ้า checked, หรือ 0 ถ้าไม่ checked

        connection.query(query, [user_id, room_name, description, price_per_night, availabilityValue], (error, results) => {
            if (error) {
                console.error('Error inserting room:', error); // เพิ่มบรรทัดนี้เพื่อดู error message
                return res.status(500).send('Database error');
            }
            res.redirect('/caregiver'); 
        });
    } else {
        return res.status(403).send('Access denied');
    }
});

// Route สำหรับแสดงห้องของ caregiver (myRoom)
router.get('/myRoom', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'caregiver') {
        return res.status(403).send('Access denied');
    }

    const user_id = req.session.user.id;  // ดึง user_id ของ caregiver ที่ล็อกอิน
    const query = `SELECT * FROM rooms WHERE user_id = ?`;

    connection.query(query, [user_id], (error, results) => {
        if (error) {
            return res.status(500).send('Database error');
        }

        // ส่งข้อมูลห้องไปยังหน้า myRoom.ejs
        res.render('myRoom', { rooms: results, user: req.session.user });
    });
});


module.exports = router;
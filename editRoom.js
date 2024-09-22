const express = require('express');
const router = express.Router();
const connection = require('./db'); // อย่าลืมนำเข้าการเชื่อมต่อฐานข้อมูล

router.get('/:room_id', (req, res) => {
    const room_id = req.params.room_id;
    const user_id = req.session.user.id;

    // ตรวจสอบว่าผู้ใช้นั้นเป็น caregiver หรือไม่
    if (!req.session.user || req.session.user.role !== 'caregiver') {
        return res.status(403).send('Access denied');
    }

    // Query เพื่อดึงข้อมูลห้องจากฐานข้อมูล
    const query = `SELECT * FROM rooms WHERE room_id = ? AND user_id = ?`;
    connection.query(query, [room_id, user_id], (error, results) => {
        if (error || results.length === 0) {
            return res.status(500).send('Database error or no room found');
        }

        // ส่งข้อมูลห้องไปยังหน้า editRoom.ejs
        res.render('editRoom', { room: results[0] });
    });
});

module.exports = router;

// Route สำหรับบันทึกการแก้ไขห้อง
router.post('/:room_id', (req, res) => {
    const room_id = req.params.room_id;
    const user_id = req.session.user.id;
    const { room_name, description, price_per_night, availability } = req.body;

    // ตรวจสอบว่า user นั้นเป็น caregiver หรือไม่
    if (!req.session.user || req.session.user.role !== 'caregiver') {
        return res.status(403).send('Access denied');
    }

    // Query สำหรับอัปเดตข้อมูลห้อง
    const query = `
        UPDATE rooms 
        SET room_name = ?, description = ?, price_per_night = ?, availability = ?
        WHERE room_id = ? AND user_id = ?`;

    // กำหนด availability เป็น 0 ถ้าไม่มีใน request body
    const availabilityValue = availability ? 1 : 0;

    connection.query(query, [room_name, description, price_per_night, availabilityValue, room_id, user_id], (error, results) => {
        if (error) {
            return res.status(500).send('Database error');
        }

        res.redirect('/myRoom');  // Redirect กลับไปยังหน้า myRoom หลังจากแก้ไขเสร็จ
    });
});

module.exports = router;
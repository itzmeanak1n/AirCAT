// catOwner.js
const express = require('express');
const router = express.Router();
const connection = require('./db');

// Route สำหรับแสดงห้องทั้งหมดที่มี availability = 1 ให้กับ catOwner
router.get('/availableRooms', (req, res) => {
    // ดึงเฉพาะห้องที่ availability เป็น 1 (พร้อมให้บริการ)
    const query = `SELECT * FROM rooms WHERE availability = 1`;

    connection.query(query, (error, results) => {
        if (error) {
            return res.status(500).send('Database error');
        }

        // ส่งข้อมูลห้องที่พร้อมใช้งานไปยังหน้า catOwner.ejs
        res.render('catOwner', { rooms: results, user: req.session.user });
    });
});

module.exports = router;

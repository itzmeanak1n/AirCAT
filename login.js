const express = require('express');
const bcrypt = require('bcryptjs');
const connection = require('./db'); // เชื่อมต่อฐานข้อมูล MySQL
const router = express.Router();

router.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    // ตรวจสอบว่าอีเมลและรหัสผ่านถูกส่งมา
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // คำสั่ง SQL เพื่อค้นหาผู้ใช้จากอีเมล
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], async (error, results) => {
        if (error) {
            // หากมีข้อผิดพลาดในฐานข้อมูล
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            // หากไม่พบอีเมลในระบบ
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = results[0];

        // ตรวจสอบรหัสผ่านโดยใช้ bcrypt เพื่อเทียบกับรหัสผ่านที่เก็บในฐานข้อมูล
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // หากรหัสผ่านไม่ถูกต้อง
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // สร้าง session หลังจาก login สำเร็จ
        req.session.user = {
            id: user.user_id,  // เปลี่ยนจาก id เป็น user_id เพราะในฐานข้อมูลควรใช้ user_id
            displayName: user.display_name,
            role: user.role
        };

        // ตรวจสอบ role และ redirect ไปยังหน้าที่เหมาะสม
        if (user.role === 'caregiver') {
            return res.redirect('/caregiver');
        } else if (user.role === 'catOwner') {
            return res.redirect('/catOwner');
        } else {
            return res.status(400).json({ error: 'User role not recognized' });
        }
    });
});

module.exports = router;

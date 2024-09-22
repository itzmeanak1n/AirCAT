// register.js
const express = require('express');
const bcrypt = require('bcryptjs');
const connection = require('./db');
const path = require('path');

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registerForm.html'));
});

// POST API สำหรับการสมัครสมาชิก
router.post('/api/register', async (req, res) => {
    const { role, displayName, email, phoneNumber, profileImage, password } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!role || !displayName || !email || !password) {
        return res.status(400).json({ error: 'Required fields are missing' });
    }

    try {
        // แฮชรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // SQL query สำหรับบันทึกข้อมูลลงในตาราง users
        const query = `
            INSERT INTO users (role, display_name, email, phone_number, profile_image, password)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        // ส่งข้อมูลเข้าไปในฐานข้อมูล
        connection.query(
            query,
            [role, displayName, email, phoneNumber, profileImage, hashedPassword],
            (error, results) => {
                if (error) {
                    // ตรวจสอบถ้า email ซ้ำ
                    if (error.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: 'Database error' });
                }

                // สมัครสมาชิกเสร็จสมบูรณ์ redirect ไปหน้า login
                return res.redirect('/login');
            }
        );
    } catch (err) {
        // จัดการข้อผิดพลาดจาก bcrypt
        return res.status(500).json({ error: 'Error hashing password' });
    }
});

module.exports = router;

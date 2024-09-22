const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const session = require('express-session');
const connection = require('./db'); // เชื่อมต่อกับฐานข้อมูล MySQL

// นำเข้าโมดูลต่าง ๆ
const registerRouter = require('./register');
const loginRouter = require('./login');
const roomsRouter = require('./rooms');
const editRoomRouter = require('./editRoom'); // เส้นทางสำหรับจัดการการแก้ไขห้อง

const caregiverRouter = require('./caregiver');
const catOwnerRouter = require('./catOwner');

// ตั้งค่า session สำหรับการจัดการ session
app.use(session({
    secret: 'key',  // คีย์ลับสำหรับ session (ควรเปลี่ยนเป็นค่าที่ปลอดภัย)
    resave: false,  // ไม่ให้บันทึก session ทุกครั้งที่มีการร้องขอ
    saveUninitialized: false,  // ไม่บันทึก session ที่ยังไม่ถูกใช้งาน
    cookie: { secure: false }  // กำหนด secure: false หากยังไม่ใช้ HTTPS
}));

// Middleware สำหรับ static files และ body parsing
app.use(express.static('public'));  // ให้ Express สามารถใช้ไฟล์ static เช่น CSS หรือรูปภาพ
app.use(express.urlencoded({ extended: true }));  // สำหรับการจัดการฟอร์ม HTML
app.use(express.json());  // สำหรับการจัดการ request ที่เป็น JSON

// ตั้งค่า view engine เป็น EJS เพื่อการเรนเดอร์ HTML
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // ระบุที่อยู่ของโฟลเดอร์ views สำหรับ EJS

// Middleware สำหรับตรวจสอบการ login
function checkLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');  // ถ้าไม่ได้ login จะ redirect ไปยังหน้า login
    }
    next();
}

// Middleware สำหรับตรวจสอบ role
function checkRole(role) {
    return (req, res, next) => {
        if (!req.session.user || req.session.user.role !== role) {
            return res.status(403).send('Access denied');  // ถ้า role ไม่ตรงกับที่กำหนด ไม่ให้เข้าถึง
        }
        next();
    };
}

// ใช้ router ที่เกี่ยวข้องกับการจัดการต่าง ๆ
app.use('/', registerRouter);  // เส้นทางสำหรับการลงทะเบียน
app.use('/', loginRouter);  // เส้นทางสำหรับการ login
app.use('/rooms', roomsRouter);  // เส้นทางสำหรับจัดการห้องทั้งหมด
app.use('/editRoom', editRoomRouter);  // เส้นทางสำหรับการแก้ไขห้อง


// Route สำหรับหน้าแรก
app.get('/', checkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));  // ส่งไฟล์ index.html ให้ผู้ใช้
});

// Route สำหรับหน้า login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));  // ใช้หน้า index.html สำหรับหน้า login
});

// Route สำหรับ caregiver (ผู้ให้บริการดูแล)
app.get('/caregiver', checkLogin, checkRole('caregiver'), (req, res) => {
    res.render('caregiver', { user: req.session.user });  // แสดงหน้าสำหรับ caregiver พร้อมข้อมูล user
});

// Route สำหรับ catOwner (เจ้าของแมว) และดึงห้องจากฐานข้อมูล
app.get('/catOwner', checkLogin, checkRole('catOwner'), (req, res) => {
    const query = 'SELECT * FROM rooms WHERE availability = 1';  // ดึงห้องที่ยังว่างอยู่
    connection.query(query, (error, results) => {
        if (error) {
            return res.status(500).send('Database error');  // ส่ง error หาก query ล้มเหลว
        }
        res.render('catOwner', { user: req.session.user, rooms: results });  // ส่งข้อมูลห้องไปยังหน้า catOwner.ejs
    });
});

// Route สำหรับการ register
app.get('/registerForm', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registerForm.html'));  // แสดงหน้า register form
});

// Route สำหรับ logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {  // ลบ session
        if (err) {
            return res.status(500).send('Failed to log out');  // แสดงข้อความหากลบ session ไม่สำเร็จ
        }
        res.redirect('/login');  // กลับไปที่หน้า login หลังจาก logout
    });
});

app.get('/myRoom', (req, res) => {
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



// เริ่มเซิร์ฟเวอร์ที่พอร์ต 3000
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

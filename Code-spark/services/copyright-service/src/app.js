const express = require('express');
const copyrightRoutes = require('./routes/copyright.routes');

// 1. Nhúng thêm verifyToken từ thư viện chung
const { globalExceptionHandler, NotificationProducerService, verifyToken } = require('common-node-library');

const app = express();

// ==========================================
// KHỞI TẠO DỊCH VỤ KAFKA
// ==========================================
const notifier = new NotificationProducerService(
    [process.env.KAFKA_BROKERS || 'localhost:9092'],
    'copyright-service'
);
notifier.connect();

// ==========================================
// MIDDLEWARE CƠ BẢN
// ==========================================
app.use(express.json());

// SỬA LỖI CÚ PHÁP: Cần có dấu ngoặc đơn bao quanh (req, res, next)
app.use((req, res, next) => {
    req.notifier = notifier;
    next();
});

// ==========================================
// BẢO VỆ TOÀN CỤC (GLOBAL AUTHENTICATION)
// ==========================================
const SECRET_KEY = process.env.JWT_SECRET;

// Đứng chặn ở đây: Yêu cầu Token cho tất cả request, NGOẠI TRỪ các API trong mảng path
const PUBLIC_PATHS = ['/health'];
app.use((req, res, next) => {
    if (PUBLIC_PATHS.some(p => req.path === p || req.path.startsWith(p + '/'))) {
        return next();
    }
    verifyToken(SECRET_KEY)(req, res, next);
});

// ==========================================
// API ROUTES
// ==========================================
app.use('/', copyrightRoutes);
// Nếu có admin routes thì thêm vào đây: app.use('/admin', adminRoutes);

// Health check endpoint (Sẽ an toàn vượt qua trạm kiểm soát do đã khai báo trong unless)
app.get('/health', (req, res) => {
    res.status(200).send('Copyright service is running.');
});

// ==========================================
// BẮT LỖI TỔNG
// ==========================================
app.use(globalExceptionHandler);

module.exports = app;
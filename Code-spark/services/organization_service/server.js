require('dotenv').config();
const express = require('express');
const routes = require('./src/routes');
const {
  profileDbSequelize,
  organizationDbSequelize, // THÊM MỚI
  identityDbSequelize,
  courseDbSequelize
} = require('./src/config/db');
const config = require('./src/config');
const syncDatabase = require('./db/init-data.js');
const { globalExceptionHandler } = require('common-node-library');

// --- HÀM KIỂM TRA KẾT NỐI DATABASE ---
async function checkDatabaseConnections() {
  try {
    console.log('🔍 Đang kiểm tra kết nối database...');
    
    // Kiểm tra kết nối tới từng database
    await profileDbSequelize.authenticate();
    console.log('✅ Kết nối thành công tới profile_db');
    
    await organizationDbSequelize.authenticate();
    console.log('✅ Kết nối thành công tới organization_db');
    
    await identityDbSequelize.authenticate();
    console.log('✅ Kết nối thành công tới identity_db');
    
    await courseDbSequelize.authenticate();
    console.log('✅ Kết nối thành công tới course_db');
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error.message);
    return false;
  }
}

// --- KHỞI TẠO ỨNG DỤNG ---
const app = express();
const PORT = config.port || 8008;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - CHỈ BẬT KHI CHẠY STANDALONE (không qua Gateway)
// Khi chạy qua API Gateway, Gateway đã xử lý CORS rồi
if (process.env.STANDALONE_MODE === 'true') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  console.log('🌐 CORS enabled (Standalone mode)');
}

// Routes
app.use('/api/v1', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'organization-service' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Không tìm thấy tài nguyên',
    path: req.originalUrl
  });
});

// Error handler from common-node-library
app.use(globalExceptionHandler);

// --- KHỞI ĐỘNG SERVER ---
async function startServer() {
  try {
    // 1. Kiểm tra kết nối DB
    const allDatabasesConnected = await checkDatabaseConnections();
    if (!allDatabasesConnected) {
      console.error('❌ Không thể khởi động server do lỗi kết nối DB');
      process.exit(1);
    }

    // 2. Đồng bộ hóa schema
    await syncDatabase();

    // 3. Khởi động server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Organization Service đang chạy trên http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Lỗi khởi động server:', error);
    process.exit(1);
  }
}

// Khởi động server
startServer();

// Xử lý tín hiệu dừng
process.on('SIGTERM', () => {
  console.log('🛑 Nhận được tín hiệu dừng. Đang đóng kết nối...');
  // Đóng kết nối database
  Promise.all([
    profileDbSequelize.close(),
    organizationDbSequelize.close(),
    identityDbSequelize.close(),
    courseDbSequelize.close()
  ]).then(() => {
    console.log('✅ Đã đóng tất cả kết nối database');
    process.exit(0);
  });
});

module.exports = app;
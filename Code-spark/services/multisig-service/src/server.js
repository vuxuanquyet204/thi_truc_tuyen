const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const serviceDiscovery = require('./discovery/client');
const multisigRoutes = require('./routes/multisig.routes');
const db = require('./models');
const { globalExceptionHandler } = require('common-node-library');

class MicroservicesServer {
    constructor() {
        this.app = express();
        this.initializeMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    initializeMiddleware() {
        this.app.use(helmet());
        // CORS is handled by API Gateway - Disabled to prevent duplicate headers
        // this.app.use(cors());
        this.app.use(morgan('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    setupRoutes() {
        this.app.get('/health', (req, res) => res.status(200).send('UP'));
        this.app.use('/api/v1/multisig', multisigRoutes);
    }

    setupErrorHandling() {
        // 404 handler
        this.app.use((req, res, next) => {
            res.status(404).json({ error: 'Endpoint not found' });
        });

        // Global error handler from common-node-library
        this.app.use(globalExceptionHandler);
    }

    async start() {
        try {
            // 1. Đồng bộ Database
            // Dùng { force: true } khi test để xóa và tạo lại bảng
            // await db.sequelize.sync({ force: true }); 
            await db.sequelize.sync();
            console.log('✅ Database đã đồng bộ.');

            // 2. Khởi tạo Service Discovery (nếu bật)
            serviceDiscovery.initialize();
            
            // 3. Khởi động Server
            const port = config.server.port;
            this.server = this.app.listen(port, () => {
                console.log(`🚀 Multisig Service đang chạy trên cổng ${port}`);
            });

        } catch (error) {
            console.error('❌ Lỗi khởi động server:', error);
            process.exit(1);
        }
    }
}

// Khởi chạy server
(async () => {
    // Đảm bảo web3.js và solc đã sẵn sàng (đã được biên dịch)
    // TRƯỚC KHI start server
    try {
        require('./config/web3'); 
    } catch (web3Error) {
        console.error('Không thể khởi tạo web3. Dừng server.');
        process.exit(1);
    }
    
    const server = new MicroservicesServer();
    await server.start();
})();

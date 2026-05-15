const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');

// Database initialization
const db = require('./models');

// Import existing components - wrapped in try-catch for optional modules
let serviceDiscovery = { initialize: () => {}, stop: () => {}, getHealthStatus: () => ({ status: 'UNKNOWN' }), getRegisteredServices: () => [] };
let serviceCommunication = { healthCheck: async () => ({}), getCircuitBreakerStatus: () => ({}) };
let dataSynchronizer = { startPeriodicSync: () => {}, getSyncStatus: () => ({}), processSyncQueue: async () => {}, retryFailedSyncs: async () => {} };

try { serviceDiscovery = require('./discovery/client'); } catch (e) { console.warn('Service discovery module not found, using mock'); }
try { serviceCommunication = require('./services/communication'); } catch (e) { console.warn('Service communication module not found, using mock'); }
try { dataSynchronizer = require('./services/synchronizer'); } catch (e) { console.warn('Data synchronizer module not found, using mock'); }

const { verifyToken } = require('common-node-library');

// Import routes
const copyrightRoutes = require('./routes/copyright.routes');
const copyrightExtendedRoutes = require('./routes/copyrightExtended.routes');

class MicroservicesServer {
    constructor() {
        this.app = express();
        this.server = null;
        this.initializeMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        // Initialize services asynchronously
        this.initializeServices().catch(err => {
            console.error('Failed to initialize services:', err);
        });
    }

    /**
     * Initialize middleware stack
     */
    initializeMiddleware() {
        this.app.use((req, res, next) => {
            console.log('Incoming Headers:', req.headers);
            next();
        });

        this.app.use((req, res, next) => {
            res.removeHeader('Access-Control-Allow-Credentials');
            next();
        });

        // CORS handled by gateway - no CORS middleware here

        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"]
                }
            },
            crossOriginEmbedderPolicy: false
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: config.security.rateLimit.windowMs,
            max: config.security.rateLimit.max,
            message: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: Math.ceil(config.security.rateLimit.windowMs / 1000)
            },
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use('/api/', limiter);

        // Logging middleware
        this.app.use(morgan(config.logging.format, {
            skip: (req, res) => res.statusCode < 400
        }));

        // Request parsing - increased to 100MB for file uploads
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '100mb' }));

        // Global authentication - skip /health, /status, /services, /sync-status, /sync-retry, /gateway, /api-docs
        this.app.use((req, res, next) => {
            const PUBLIC_PATHS = ['/health', '/status', '/services', '/sync-status', '/sync-retry', '/gateway', '/api-docs'];
            if (PUBLIC_PATHS.some(p => req.path === p || req.path.startsWith(p))) {
                return next();
            }
            verifyToken(config.security.jwt.secret)(req, res, next);
        });

        // Request ID middleware
        this.app.use((req, res, next) => {
            req.requestId = req.headers['x-request-id'] || this.generateRequestId();
            res.setHeader('X-Request-ID', req.requestId);
            next();
        });
    }

    /**
     * Setup API routes
     */
    setupRoutes() {
        // Health and status endpoints
        this.app.get('/health', (req, res) => this.healthCheck(req, res));
        this.app.get('/status', (req, res) => this.detailedStatus(req, res));

        // Microservices management endpoints
        this.app.get('/services', (req, res) => this.getServices(req, res));
        this.app.get('/sync-status', (req, res) => this.getSyncStatus(req, res));
        this.app.post('/sync-retry', (req, res) => this.retrySync(req, res));

        // Java Gateway integration endpoints
        this.app.get('/gateway/health', async (req, res) => this.javaGatewayHealth(req, res));
        this.app.get('/gateway/services', async (req, res) => this.javaGatewayServices(req, res));

        // Mount copyright routes with backward compatibility for /api/copyrights (no v1 prefix for API Gateway compatibility)
        this.app.use('/api/copyrights', copyrightRoutes);

        // Mount copyright extended routes (all missing endpoints)
        this.app.use('/api/copyrights', copyrightExtendedRoutes);

        // Mount copyright routes
        this.app.use('/api/v1/copyrights', copyrightRoutes);

        // Legacy route support (for backward compatibility)
        this.app.use('/copyrights', copyrightRoutes);

        // API documentation
        this.app.get('/api-docs', (req, res) => {
            res.json({
                title: 'Copyright Service API',
                version: '1.0.0',
                description: 'Microservices-based copyright registration system',
                endpoints: {
                    copyrights: '/api/copyrights',
                    copyrightsV1: '/api/v1/copyrights',
                    similarityCheck: '/api/v1/copyrights/check-similarity',
                    health: '/health',
                    status: '/status'
                }
            });
        });
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        // 404 handler
        this.app.use((req, res, next) => {
            res.status(404).json({
                error: 'Endpoint not found',
                path: req.originalUrl,
                method: req.method,
                timestamp: new Date().toISOString()
            });
        });

        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('Global error handler:', error);

            const statusCode = error.statusCode || 500;
            const message = config.server.env === 'development' ? error.message : 'Internal server error';

            res.status(statusCode).json({
                error: message,
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                ...(config.server.env === 'development' && {
                    stack: error.stack,
                    details: error.details
                })
            });
        });
    }

    /**
     * Initialize microservices components
     */
    async initializeServices() {
        try {
            console.log('🚀 Initializing microservices components...');

            // Initialize database connection
            try {
                await db.sequelize.authenticate();
                console.log('✅ Database connection established successfully');
                
                // Try sync with alter first
                try {
                    await db.sequelize.sync({ alter: true });
                    console.log('✅ Database models synchronized with alter');
                } catch (syncError) {
                    console.warn('⚠️ Alter sync failed, running manual migration:', syncError.message);
                    
                    // Manual migration for missing columns
                    const missingColumns = [
                        { name: 'owner_address', type: 'VARCHAR(255)' },
                        { name: 'owner_username', type: 'VARCHAR(255)' },
                        { name: 'owner_email', type: 'VARCHAR(255)' },
                        { name: 'transaction_hash', type: 'VARCHAR(255)' },
                        { name: 'file_size', type: 'BIGINT' },
                        { name: 'mime_type', type: 'VARCHAR(100)' },
                        { name: 'content_hash', type: 'VARCHAR(255)' }
                    ];
                    
                    for (const col of missingColumns) {
                        try {
                            await db.sequelize.query(`
                                DO $$
                                BEGIN
                                    IF NOT EXISTS (
                                        SELECT 1 FROM information_schema.columns 
                                        WHERE table_name = 'copyrights' AND column_name = '${col.name}'
                                    ) THEN
                                        ALTER TABLE copyrights ADD COLUMN "${col.name}" ${col.type};
                                    END IF;
                                END $$;
                            `);
                            console.log(`✅ Column ${col.name} added or exists`);
                        } catch (colError) {
                            console.warn(`⚠️ Could not add column ${col.name}:`, colError.message);
                        }
                    }
                }
            } catch (dbError) {
                console.warn('⚠️ Database initialization warning:', dbError.message);
            }

            // Initialize service discovery
            try {
                if (serviceDiscovery && typeof serviceDiscovery.initialize === 'function') {
                    serviceDiscovery.initialize();
                }
            } catch (e) {
                console.warn('Service discovery not available:', e.message);
            }

            // Start periodic synchronization
            try {
                if (dataSynchronizer && typeof dataSynchronizer.startPeriodicSync === 'function') {
                    dataSynchronizer.startPeriodicSync(5);
                }
            } catch (e) {
                console.warn('Data synchronizer not available:', e.message);
            }

            // Setup graceful shutdown
            this.setupGracefulShutdown();

            console.log('✅ Microservices components initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize microservices:', error);
            process.exit(1);
        }
    }

    /**
     * Health check endpoint
     */
    async healthCheck(req, res) {
        const healthStatus = {
            status: 'UP',
            timestamp: new Date().toISOString(),
            service: 'copyright-service',
            version: require('../package.json').version,
            uptime: process.uptime()
        };

        try {
            // Check service discovery
            healthStatus.discovery = serviceDiscovery.getHealthStatus();

            // Check dependent services
            const servicesHealth = await serviceCommunication.healthCheck();
            healthStatus.dependencies = servicesHealth;

            // Overall status determination
            const hasUnhealthyDeps = Object.values(servicesHealth).some(service => service.status === 'DOWN');
            if (hasUnhealthyDeps) {
                healthStatus.status = 'DEGRADED';
            }
        } catch (error) {
            healthStatus.status = 'DEGRADED';
            healthStatus.error = error.message;
        }

        const statusCode = healthStatus.status === 'UP' ? 200 : 503;
        res.status(statusCode).json(healthStatus);
    }

    /**
     * Detailed status endpoint
     */
    async detailedStatus(req, res) {
        try {
            const status = {
                ...serviceDiscovery.getHealthStatus(),
                dependencies: await serviceCommunication.healthCheck(),
                circuitBreakers: serviceCommunication.getCircuitBreakerStatus(),
                syncStatus: dataSynchronizer.getSyncStatus(),
                config: {
                    environment: config.server.env,
                    discoveryEnabled: config.discovery.enabled,
                    gatewayEnabled: config.gateway.enabled
                },
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                    external: Math.round(process.memoryUsage().external / 1024 / 1024)
                }
            };

            res.json(status);
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get detailed status',
                details: error.message
            });
        }
    }

    /**
     * Java Gateway health check
     */
    async javaGatewayHealth(req, res) {
        try {
            const axios = require('axios');
            const config = require('./config');

            const response = await axios.get(`${config.gateway.baseUrl}${config.gateway.javaGateway.healthPath}`, {
                timeout: 5000,
                headers: {
                    'Accept': 'application/json'
                }
            });

            res.json({
                status: 'UP',
                timestamp: new Date().toISOString(),
                javaGateway: {
                    status: response.data.status || 'UP',
                    details: response.data,
                    url: config.gateway.baseUrl
                }
            });
        } catch (error) {
            res.status(503).json({
                status: 'DOWN',
                timestamp: new Date().toISOString(),
                javaGateway: {
                    status: 'DOWN',
                    error: error.message,
                    url: config.gateway.baseUrl
                }
            });
        }
    }

    /**
     * Java Gateway services
     */
    async javaGatewayServices(req, res) {
        try {
            const services = serviceDiscovery.getRegisteredServices();
            res.json({
                services: services.map(service => ({
                    name: service.app,
                    status: service.status,
                    host: service.ipAddr,
                    port: service.port.$,
                    metadata: service.metadata,
                    javaCompatible: service.metadata?.['service.type'] === 'java' || false
                }))
            });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get Java Gateway services',
                details: error.message
            });
        }
    }

    /**
     * Get synchronization status
     */
    getSyncStatus(req, res) {
        const syncStatus = dataSynchronizer.getSyncStatus();
        res.json(syncStatus);
    }

    /**
     * Retry failed synchronizations
     */
    async retrySync(req, res) {
        try {
            await dataSynchronizer.retryFailedSyncs();
            res.json({ message: 'Synchronization retry initiated' });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to retry synchronization',
                details: error.message
            });
        }
    }

    /**
     * Setup graceful shutdown
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(`🛑 Received ${signal}. Starting graceful shutdown...`);

            const forceTimer = setTimeout(() => {
                console.error('❌ Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 30000);

            const withTimeout = async (fn, label, ms = 5000) => {
                try {
                    const result = await Promise.race([
                        Promise.resolve(fn()),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)
                        )
                    ]);
                    return result;
                } catch (e) {
                    console.warn(`⚠️ ${label}:`, e.message);
                    return null;
                }
            };

            // Close database
            await withTimeout(async () => {
                if (db.sequelize) {
                    await db.sequelize.close();
                }
            }, 'Database close', 5000);

            // Stop service discovery
            await withTimeout(() => {
                if (serviceDiscovery && typeof serviceDiscovery.stop === 'function') {
                    serviceDiscovery.stop();
                }
            }, 'Service discovery stop', 3000);

            // Process sync queue (skip on shutdown, just clear)
            await withTimeout(() => {
                if (dataSynchronizer && typeof dataSynchronizer.clearSyncQueue === 'function') {
                    dataSynchronizer.clearSyncQueue();
                }
            }, 'Sync queue clear', 3000);

            clearTimeout(forceTimer);
            console.log('✅ Graceful shutdown completed');
            process.exit(0);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }

    /**
     * Generate request ID for tracing
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Start the microservices server
     */
    start() {
        const port = config.server.port;
        this.server = this.app.listen(port, () => {
            console.log(`🚀 Copyright Microservices Server started on port ${port}`);
            console.log(`📊 Environment: ${config.server.env}`);
            console.log(`🔍 Service Discovery: ${config.discovery.enabled ? 'ENABLED' : 'DISABLED'}`);
            console.log(`🌐 API Gateway: ${config.gateway.enabled ? 'ENABLED' : 'DISABLED'}`);
            console.log(`📋 Health Check: http://localhost:${port}/health`);
            console.log(`📊 Detailed Status: http://localhost:${port}/status`);
            console.log(`🔗 API Documentation: http://localhost:${port}/api-docs`);
        });
    }

    /**
     * Start API Gateway mode
     */
    startGateway() {
        console.log('🌐 Starting in API Gateway mode...');
        this.gateway.start();
    }
}

module.exports = MicroservicesServer;

const server = new MicroservicesServer();
server.start();

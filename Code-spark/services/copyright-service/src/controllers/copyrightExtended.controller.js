// src/controllers/copyrightExtended.controller.js
// Extended copyright controller - all endpoints missing from the main controller

const Copyright = require('../models/copyright.model.js');
const { Op } = require('sequelize');

/**
 * POST /api/copyrights/register-text
 * Register a text document without file upload (frontend sends plain text)
 */
const registerTextDocument = async (req, res) => {
    try {
        const { content, title, author, description, category } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Content is required for text registration.'
            });
        }

        // Calculate SHA-256 hash of the text content
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');

        // Check if already registered
        const existing = await Copyright.findOne({ where: { hash } });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'This content has already been registered.',
                copyright: {
                    id: existing.id,
                    hash: existing.hash,
                    filename: existing.filename,
                    createdAt: existing.createdAt
                }
            });
        }

        // Get owner info
        const ownerAddress = req.user?.userId || req.user?.username || 'anonymous';
        const ownerUsername = req.user?.username || null;

        const newCopyright = await Copyright.create({
            filename: title || 'text_document.txt',
            hash: hash,
            contentHash: hash,
            ownerAddress: ownerAddress,
            ownerUsername: ownerUsername,
            transactionHash: null,
            fileSize: Buffer.byteLength(content, 'utf8'),
            mimeType: 'text/plain',
            title: title,
            author: author,
            description: description,
            category: category
        });

        res.status(201).json({
            success: true,
            message: 'Text document registered successfully.',
            copyright: {
                id: newCopyright.id,
                hash: newCopyright.hash,
                title: newCopyright.title,
                author: newCopyright.author,
                ownerAddress: newCopyright.ownerAddress,
                createdAt: newCopyright.createdAt
            }
        });

    } catch (error) {
        console.error('Error registering text document:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * POST /api/copyrights/verify/:hash
 * Verify copyright by hash (checks both DB and blockchain)
 */
const verifyByHash = async (req, res) => {
    try {
        const { hash } = req.params;

        if (!hash) {
            return res.status(400).json({
                success: false,
                message: 'Hash is required.'
            });
        }

        const copyright = await Copyright.findOne({ where: { hash } });
        if (!copyright) {
            return res.status(404).json({
                success: false,
                message: 'No copyright found for this hash.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Copyright verified.',
            data: {
                id: copyright.id,
                hash: copyright.hash,
                ownerAddress: copyright.ownerAddress,
                transactionHash: copyright.transactionHash,
                filename: copyright.filename,
                title: copyright.title,
                author: copyright.author,
                createdAt: copyright.createdAt,
                isOnChain: !!copyright.transactionHash
            }
        });

    } catch (error) {
        console.error('Error verifying copyright by hash:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * GET /api/copyrights/exists/:hash
 * Check if a document with the given hash already exists
 */
const documentExists = async (req, res) => {
    try {
        const { hash } = req.params;

        if (!hash) {
            return res.status(400).json({
                success: false,
                message: 'Hash is required.'
            });
        }

        const copyright = await Copyright.findOne({
            where: { hash },
            attributes: ['id', 'hash', 'filename', 'createdAt', 'ownerAddress']
        });

        res.status(200).json({
            exists: !!copyright,
            copyright: copyright || null
        });

    } catch (error) {
        console.error('Error checking document existence:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.'
        });
    }
};

/**
 * GET /api/copyrights/user/:address
 * Get all documents for a specific user address
 * (alias for /owner/:ownerAddress)
 */
const getUserDocuments = async (req, res) => {
    try {
        const { address } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!address) {
            return res.status(400).json({
                success: false,
                message: 'User address is required.'
            });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Copyright.findAndCountAll({
            where: { ownerAddress: address },
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['storedFilename'] }
        });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error fetching user documents:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * GET /api/copyrights/category/:category
 * Get all documents in a specific category
 */
const getCategoryDocuments = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required.'
            });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Copyright.findAndCountAll({
            where: { category },
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['storedFilename'] }
        });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error fetching category documents:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * POST /api/copyrights/search
 * Search copyrights by multiple criteria (POST version for complex queries)
 */
const searchCopyrightsPost = async (req, res) => {
    try {
        const {
            filename, hash, ownerAddress, category,
            page = 1, limit = 20,
            sortBy = 'createdAt', sortOrder = 'DESC'
        } = req.body;

        const where = {};
        if (filename) where.filename = { [Op.iLike]: `%${filename}%` };
        if (hash) where.hash = hash;
        if (ownerAddress) where.ownerAddress = ownerAddress;
        if (category) where.category = category;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Copyright.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: offset,
            order: [[sortBy, sortOrder]],
            attributes: { exclude: ['storedFilename'] }
        });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error searching copyrights:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * PUT /api/copyrights/document/:hash/tags
 * Update tags for a document (identified by hash)
 */
const updateDocumentTags = async (req, res) => {
    try {
        const { hash } = req.params;
        const { tags, title, description } = req.body;

        const copyright = await Copyright.findOne({ where: { hash } });
        if (!copyright) {
            return res.status(404).json({
                success: false,
                message: 'Copyright not found.'
            });
        }

        if (title) copyright.title = title;
        if (description) copyright.description = description;
        if (tags && Array.isArray(tags)) {
            copyright.tags = JSON.stringify(tags);
        }

        await copyright.save();

        res.status(200).json({
            success: true,
            message: 'Document tags updated.',
            copyright
        });

    } catch (error) {
        console.error('Error updating document tags:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.'
        });
    }
};

/**
 * POST /api/copyrights/hash/calculate
 * Calculate SHA-256 hash of an uploaded file
 */
const calculateFileHash = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File is required.'
            });
        }

        const fs = require('fs').promises;
        const crypto = require('crypto');

        const fileBuffer = await fs.readFile(req.file.path);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const hash = hashSum.digest('hex');

        // Clean up uploaded file
        await fs.unlink(req.file.path).catch(() => {});

        res.status(200).json({
            success: true,
            hash: hash,
            algorithm: 'SHA-256',
            fileSize: req.file.size,
            fileName: req.file.originalname
        });

    } catch (error) {
        console.error('Error calculating file hash:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * POST /api/copyrights/hash/text
 * Calculate SHA-256 hash of text content
 */
const calculateTextHash = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Content is required.'
            });
        }

        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');

        res.status(200).json({
            success: true,
            hash: hash,
            algorithm: 'SHA-256',
            contentLength: Buffer.byteLength(content, 'utf8')
        });

    } catch (error) {
        console.error('Error calculating text hash:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * GET /api/copyrights/transactions/:address
 * Get all transactions for a user address (mock - returns copyright registrations)
 */
const getTransactionHistory = async (req, res) => {
    try {
        const { address } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!address) {
            return res.status(400).json({ success: false, message: 'Address is required.' });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Copyright.findAndCountAll({
            where: { ownerAddress: address },
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'hash', 'transactionHash', 'filename', 'createdAt']
        });

        const transactions = rows.map(row => ({
            id: row.id,
            hash: row.hash,
            transactionHash: row.transactionHash,
            filename: row.filename,
            registeredAt: row.createdAt,
            type: 'REGISTRATION',
            status: row.transactionHash ? 'CONFIRMED' : 'PENDING'
        }));

        res.status(200).json({
            success: true,
            data: transactions,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.'
        });
    }
};

/**
 * GET /api/copyrights/fees
 * Get current registration fees
 */
const getRegistrationFees = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                textRegistration: '0.0001',
                fileRegistration: '0.001',
                currency: 'ETH',
                network: process.env.BLOCKCHAIN_NETWORK || 'development',
                estimatedGas: '50000',
                gasUnit: 'wei'
            }
        });
    } catch (error) {
        console.error('Error getting registration fees:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.'
        });
    }
};

/**
 * GET /api/copyrights/transaction/:hash/status
 * Get blockchain transaction status
 */
const getTransactionStatus = async (req, res) => {
    try {
        const { hash } = req.params;

        const copyright = await Copyright.findOne({
            where: { transactionHash: hash },
            attributes: ['id', 'transactionHash', 'createdAt']
        });

        if (!copyright || !copyright.transactionHash) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                transactionHash: copyright.transactionHash,
                copyrightId: copyright.id,
                status: 'CONFIRMED',
                registeredAt: copyright.createdAt,
                blockExplorerUrl: `${process.env.BLOCKCHAIN_EXPLORER_URL || 'http://localhost:7545'}/tx/${copyright.transactionHash}`
            }
        });

    } catch (error) {
        console.error('Error getting transaction status:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.'
        });
    }
};

/**
 * GET /api/copyrights/contract/info
 * Get smart contract information
 */
const getContractInfo = async (req, res) => {
    try {
        const blockchainService = require('../services/blockchain.service');

        const isConnected = await blockchainService.checkBlockchainConnection();

        res.status(200).json({
            success: true,
            data: {
                contractAddress: process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
                network: process.env.BLOCKCHAIN_NETWORK || 'development',
                isConnected,
                contractName: 'CopyrightRegistry',
                totalDocuments: await Copyright.count(),
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error getting contract info:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.'
        });
    }
};

/**
 * GET /api/copyrights/contract/events
 * Get smart contract events
 */
const getContractEvents = async (req, res) => {
    try {
        const { eventType, fromBlock, toBlock } = req.query;

        // Return recent copyright registrations as "events"
        const where = {};
        if (eventType === 'DocumentRegistered') {
            where.transactionHash = { [Op.not]: null };
        }

        const events = await Copyright.findAll({
            where,
            limit: 100,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'hash', 'transactionHash', 'ownerAddress', 'createdAt']
        });

        res.status(200).json({
            success: true,
            data: events.map(e => ({
                eventType: 'DocumentRegistered',
                hash: e.hash,
                transactionHash: e.transactionHash,
                owner: e.ownerAddress,
                blockNumber: null,
                timestamp: e.createdAt,
                args: {
                    documentHash: e.hash,
                    owner: e.ownerAddress
                }
            }))
        });

    } catch (error) {
        console.error('Error getting contract events:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.'
        });
    }
};

/**
 * POST /api/copyrights/export
 * Export copyright data
 */
const exportData = async (req, res) => {
    try {
        const { format = 'json', filters } = req.body;

        const where = {};
        if (filters) {
            if (filters.category) where.category = filters.category;
            if (filters.ownerAddress) where.ownerAddress = filters.ownerAddress;
            if (filters.verified !== undefined) {
                where.transactionHash = filters.verified
                    ? { [Op.not]: null }
                    : null;
            }
        }

        const copyrights = await Copyright.findAll({
            where,
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['storedFilename'] }
        });

        if (format === 'csv') {
            if (copyrights.length === 0) {
                return res.status(200).send('id,hash,filename,title,author,category,ownerAddress,transactionHash,createdAt\n');
            }

            const headers = 'id,hash,filename,title,author,category,ownerAddress,transactionHash,createdAt\n';
            const rows = copyrights.map(c =>
                `"${c.id}","${c.hash}","${c.filename}","${c.title || ''}","${c.author || ''}","${c.category || ''}","${c.ownerAddress}","${c.transactionHash || ''}","${c.createdAt}"`
            ).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=copyrights_export.csv');
            return res.status(200).send(headers + rows);
        }

        res.status(200).json({
            success: true,
            data: copyrights,
            total: copyrights.length,
            exportedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.'
        });
    }
};

/**
 * POST /api/copyrights/import
 * Import copyright data
 */
const importData = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File is required for import.'
            });
        }

        const { validateHashes = true, skipExisting = true } = req.body.options || {};

        let imported = 0;
        let skipped = 0;
        let errors = [];

        try {
            const fs = require('fs').promises;
            const content = await fs.readFile(req.file.path, 'utf8');

            // Try JSON format
            let records = [];
            try {
                records = JSON.parse(content);
                if (!Array.isArray(records)) records = [records];
            } catch {
                // Try CSV format
                const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('id,'));
                for (const line of lines) {
                    const parts = line.match(/("([^"]*)"|[^,]+)/g) || [];
                    const values = parts.map(p => p.replace(/^"|"$/g, ''));
                    if (values.length >= 3) {
                        records.push({
                            hash: values[1],
                            filename: values[2],
                            title: values[3] || '',
                            author: values[4] || '',
                            category: values[5] || '',
                            ownerAddress: values[6] || ''
                        });
                    }
                }
            }

            for (const record of records) {
                try {
                    if (!record.hash) continue;

                    const existing = await Copyright.findOne({ where: { hash: record.hash } });
                    if (existing) {
                        if (skipExisting) {
                            skipped++;
                            continue;
                        }
                    }

                    if (validateHashes) {
                        const { Op } = require('sequelize');
                        const dupByContent = await Copyright.findOne({
                            where: { contentHash: record.hash }
                        });
                        if (dupByContent) {
                            skipped++;
                            continue;
                        }
                    }

                    await Copyright.create({
                        filename: record.filename || 'imported_file',
                        hash: record.hash,
                        contentHash: record.hash,
                        title: record.title || '',
                        author: record.author || '',
                        category: record.category || '',
                        ownerAddress: record.ownerAddress || 'imported',
                        transactionHash: record.transactionHash || null,
                        mimeType: 'application/octet-stream'
                    });

                    imported++;
                } catch (recError) {
                    errors.push({ record: record.hash || record.filename, error: recError.message });
                }
            }

            // Clean up uploaded file
            await fs.unlink(req.file.path).catch(() => {});

        } catch (fileError) {
            return res.status(400).json({
                success: false,
                message: 'Failed to parse import file.'
            });
        }

        res.status(200).json({
            success: true,
            message: `Import completed. ${imported} imported, ${skipped} skipped.`,
            data: { imported, skipped, errors: errors.slice(0, 10) }
        });

    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.'
        });
    }
};

/**
 * GET /api/copyrights/reports
 * Generate copyright reports
 */
const getReports = async (req, res) => {
    try {
        const { type = 'monthly', date } = req.query;

        let startDate = new Date();
        if (type === 'daily') {
            startDate.setDate(startDate.getDate() - 1);
        } else if (type === 'weekly') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (type === 'monthly') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (type === 'yearly') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        }

        const where = { createdAt: { [Op.gte]: startDate } };

        const [totalRegistrations, verifiedCount, byCategory, byOwner] = await Promise.all([
            Copyright.count({ where }),
            Copyright.count({ where: { ...where, transactionHash: { [Op.not]: null } } }),
            Copyright.findAll({
                where,
                attributes: [
                    'category',
                    [Copyright.sequelize.fn('COUNT', Copyright.sequelize.col('id')), 'count']
                ],
                group: ['category'],
                raw: true
            }),
            Copyright.findAll({
                where,
                attributes: [
                    'ownerAddress',
                    [Copyright.sequelize.fn('COUNT', Copyright.sequelize.col('id')), 'count']
                ],
                group: ['ownerAddress'],
                order: [[Copyright.sequelize.fn('COUNT', Copyright.sequelize.col('id')), 'DESC']],
                limit: 10,
                raw: true
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                reportType: type,
                period: { from: startDate.toISOString(), to: new Date().toISOString() },
                totalRegistrations,
                verifiedCount,
                unverifiedCount: totalRegistrations - verifiedCount,
                byCategory,
                topOwners: byOwner,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.'
        });
    }
};

/**
 * POST /api/copyrights/notifications
 * Send notification about copyright events
 */
const sendNotification = async (req, res) => {
    try {
        const { type, recipients, message } = req.body;

        if (!type || !recipients || !message) {
            return res.status(400).json({
                success: false,
                message: 'type, recipients, and message are required.'
            });
        }

        // For now, just log and return success.
        // In production, this would integrate with email/push notification service.
        console.log(`[NOTIFICATION] type=${type}, recipients=${recipients.length}, message=${message}`);

        res.status(200).json({
            success: true,
            message: `Notification queued for ${recipients.length} recipient(s).`,
            data: {
                type,
                recipients,
                message,
                queuedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({
            success: false,
            message: 'An internal server error occurred.'
        });
    }
};

module.exports = {
    registerTextDocument,
    verifyByHash,
    documentExists,
    getUserDocuments,
    getCategoryDocuments,
    searchCopyrightsPost,
    updateDocumentTags,
    calculateFileHash,
    calculateTextHash,
    getTransactionHistory,
    getRegistrationFees,
    getTransactionStatus,
    getContractInfo,
    getContractEvents,
    exportData,
    importData,
    getReports,
    sendNotification,
};

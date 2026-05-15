const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { Op } = require('sequelize');
const Copyright = require('../models/copyright.model');

// Calculate SHA-256 hash from Buffer or file path
const calculateHash = async (filePathOrBuffer) => {
    const fileBuffer = Buffer.isBuffer(filePathOrBuffer)
        ? filePathOrBuffer
        : await fs.readFile(filePathOrBuffer);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

// Calculate MD5 hash from Buffer or file path
const calculateContentHash = async (filePathOrBuffer) => {
    const fileBuffer = Buffer.isBuffer(filePathOrBuffer)
        ? filePathOrBuffer
        : await fs.readFile(filePathOrBuffer);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
};

// Check for duplicate content in the database
const findDuplicateByContent = async (filePathOrBuffer) => {
    try {
        const contentHash = await calculateContentHash(filePathOrBuffer);
        
        // Check if a document with the same content hash exists
        const existingDoc = await Copyright.findOne({
            where: { contentHash }
        });

        if (existingDoc) {
            return {
                isDuplicate: true,
                existingDoc,
                contentHash,
                message: 'Document with identical content already exists'
            };
        }

        return { isDuplicate: false, contentHash };
    } catch (error) {
        console.error('Error checking for duplicate content:', error);
        throw error;
    }
};

/**
 * Save uploaded file with unique name
 * @param {Object} file - Multer file object (from memory storage)
 * @returns {Object} File information
 */
const saveUploadedFile = async (file) => {
    if (!file) {
        throw new Error('Không có file được tải lên');
    }

    if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
        throw new Error('Dữ liệu file không hợp lệ (buffer rỗng hoặc không đúng định dạng)');
    }

    // Get file extension from original name or mimetype
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext) {
        const mimeToExt = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'application/pdf': '.pdf',
            'application/msword': '.doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'text/plain': '.txt'
        };
        ext = mimeToExt[file.mimetype] || '';
    }

    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

    return {
        originalName: file.originalname,
        storedName: uniqueName,
        path: null,
        buffer: file.buffer,
        size: file.size,
        mimetype: file.mimetype,
        extension: ext
    };
};

// Clean up temporary files
const cleanupFile = async (filePath) => {
    try {
        if (filePath && await fs.access(filePath).then(() => true).catch(() => false)) {
            await fs.unlink(filePath);
        }
    } catch (error) {
        console.error('Error cleaning up file:', error);
    }
};

module.exports = {
    calculateHash,
    calculateContentHash,
    findDuplicateByContent,
    saveUploadedFile,
    cleanupFile,
};
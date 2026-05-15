// file: src/models/copyright.model.js
// crypto_db: copyrights table
// ERD: copyrights(id uuid PK, filename varchar, stored_filename varchar, hash varchar,
//              content_hash varchar, owner_address varchar, owner_username varchar,
//              owner_email varchar, transaction_hash varchar, file_size bigint,
//              mime_type varchar, title varchar, author varchar, description text,
//              category varchar, status varchar, created_at, updated_at)

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Copyright = sequelize.define('Copyright', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    filename: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    storedFilename: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'stored_filename',
    },
    hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
    },
    contentHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'content_hash',
    },
    ownerAddress: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'owner_address',
    },
    ownerUsername: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'owner_username',
    },
    ownerEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'owner_email',
    },
    transactionHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'transaction_hash',
    },
    fileSize: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'file_size',
    },
    mimeType: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'mime_type',
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    author: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'active',
    },
}, {
    tableName: 'copyrights',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['hash'],
            name: 'uk_copyright_hash'
        },
        {
            unique: true,
            fields: ['content_hash'],
            name: 'uk_copyright_content_hash'
        },
        {
            fields: ['owner_address'],
            name: 'idx_copyright_owner'
        },
        {
            fields: ['category'],
            name: 'idx_copyright_category'
        },
        {
            fields: ['status'],
            name: 'idx_copyright_status'
        },
        {
            fields: ['created_at'],
            name: 'idx_copyright_created'
        }
    ]
});

module.exports = Copyright;

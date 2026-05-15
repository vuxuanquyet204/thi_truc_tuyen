// ERD: gifts(id uuid PK, sender_id uuid, recipient_id uuid,
//         crypto_account_id uuid, amount integer, token_symbol,
//         message, status, tx_hash, created_at, updated_at)

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Gift = sequelize.define('Gift', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        senderId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'sender_id'
        },
        recipientId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'recipient_id'
        },
        cryptoAccountId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'crypto_account_id'
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'name'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        imageUrl: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'image_url'
        },
        tokenPrice: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'token_price'
        },
        stockQuantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: 'stock_quantity'
        },
        category: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'category'
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'amount'
        },
        tokenSymbol: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'token_symbol'
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'message'
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'PENDING',
            field: 'status'
        },
        txHash: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'tx_hash'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'updated_at'
        }
    }, {
        tableName: 'cm_gifts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Gift;
};

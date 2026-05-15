// src/models/walletAccount.model.js
// Table: cm_wallet_accounts
// ERD: wallet_accounts(id uuid PK, user_id uuid, address UNIQUE,
//         signature, status, linked_at, last_seen_at, created_at, updated_at)

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const WalletAccount = sequelize.define('WalletAccount', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'user_id'
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            field: 'address',
            set(value) {
                if (typeof value === 'string') {
                    this.setDataValue('address', value.toLowerCase());
                } else {
                    this.setDataValue('address', value);
                }
            }
        },
        signature: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'signature'
        },
        status: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: 'linked',
            field: 'status'
        },
        linkedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'linked_at'
        },
        lastSeenAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'last_seen_at'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'updated_at'
        }
    }, {
        tableName: 'cm_wallet_accounts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return WalletAccount;
};

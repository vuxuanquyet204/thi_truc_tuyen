// ERD: token_deposits(id uuid PK, user_id uuid,
//         wallet_address varchar, tx_hash, from_address, to_address,
//         amount_raw decimal(78,0), amount_tokens bigint,
//         token_address, block_number bigint, block_timestamp,
//         status, metadata jsonb, confirmed_at, created_at, updated_at)

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TokenDeposit = sequelize.define('TokenDeposit', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'user_id'
        },
        walletAddress: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'wallet_address'
        },
        txHash: {
            type: DataTypes.STRING(80),
            allowNull: false,
            unique: true,
            field: 'tx_hash'
        },
        tokenAddress: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'token_address'
        },
        fromAddress: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'from_address'
        },
        toAddress: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'to_address'
        },
        amountRaw: {
            type: DataTypes.DECIMAL(78, 0),
            allowNull: false,
            field: 'amount_raw'
        },
        amountTokens: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'amount_tokens'
        },
        blockNumber: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'block_number'
        },
        blockTimestamp: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'block_timestamp'
        },
        status: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: 'pending',
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
            field: 'metadata'
        },
        confirmedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'confirmed_at'
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
        tableName: 'cm_token_deposits',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return TokenDeposit;
};

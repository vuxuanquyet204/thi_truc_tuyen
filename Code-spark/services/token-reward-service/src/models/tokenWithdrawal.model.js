// ERD: token_withdrawals(id uuid PK, user_id uuid,
//         wallet_address varchar, amount integer, token_symbol,
//         status, tx_hash, escrow_request_id, metadata jsonb,
//         created_at, updated_at, completed_at)

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TokenWithdrawal = sequelize.define('TokenWithdrawal', {
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
        walletAddress: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'wallet_address'
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
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'PENDING',
        },
        txHash: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'tx_hash'
        },
        escrowRequestId: {
            type: DataTypes.STRING(80),
            allowNull: true,
            field: 'escrow_request_id'
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
            field: 'metadata'
        },
        tokenAddress: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'token_address'
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'completed_at'
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
        tableName: 'cm_token_withdrawals',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return TokenWithdrawal;
};

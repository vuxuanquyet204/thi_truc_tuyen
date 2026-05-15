// src/models/reward.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Reward = sequelize.define('Reward', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        studentId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'student_id'
        },
        tokensAwarded: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'tokens_awarded'
        },
        reasonCode: {
            type: DataTypes.STRING,
            field: 'reason_code'
        },
        relatedId: {
            type: DataTypes.STRING(255),
            field: 'related_id'
        },
        awardedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'awarded_at'
        },
        transaction_type: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'EARN'
        }
    }, {
        tableName: 'cm_rewards',
        timestamps: false
    });

    return Reward;
};

// src/models/user.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        tokenBalance: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            field: 'token_balance'
        }
    }, {
        tableName: 'cm_users',
        timestamps: true
    });

    return User;
};

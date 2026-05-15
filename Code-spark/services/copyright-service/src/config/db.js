// file: src/config/db.js
// crypto_db connection for copyright-service
const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    {
        host: config.db.host,
        port: config.db.port,
        dialect: 'postgres',
        logging: config.server.env === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true
        }
    }
);

module.exports = sequelize;
module.exports.sequelize = sequelize;

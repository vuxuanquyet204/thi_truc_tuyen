// file: src/models/index.js
// crypto_db models for copyright-service

const sequelize = require('../config/db');
const Copyright = require('./copyright.model');
const DocumentSimilarity = require('./documentSimilarity.model');

// Setup associations
DocumentSimilarity.associate = DocumentSimilarity.associate || ((models) => {
    DocumentSimilarity.belongsTo(models.Copyright, {
        foreignKey: 'sourceDocumentId',
        as: 'sourceDocument'
    });
    DocumentSimilarity.belongsTo(models.Copyright, {
        foreignKey: 'targetDocumentId',
        as: 'targetDocument'
    });
});

// Initialize associations
if (DocumentSimilarity.associate) {
    DocumentSimilarity.associate({ Copyright });
}

const db = {
    sequelize,
    Sequelize: require('sequelize'),
    Copyright,
    DocumentSimilarity,
};

module.exports = db;

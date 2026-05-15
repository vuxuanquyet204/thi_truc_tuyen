// src/controllers/tokenController.js
const tokenService = require('../services/tokenService');

const isDebugEnabled = process.env.LOG_LEVEL === 'debug';

const tokenController = {
    grantTokenHandler: async (req, res) => {
        try {
            const { studentId, amount, reasonCode, relatedId } = req.body;

            if (!studentId || !amount) {
                return res.status(400).json({ message: 'studentId and amount are required.' });
            }

            const newReward = await tokenService.grantTokens({
                studentId,
                amount,
                reasonCode,
                relatedId
            });

            res.status(201).json(newReward);

        } catch (error) {
            console.error('Error granting tokens:', error);
            if (error.message === 'User not found.') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'An internal server error occurred.' });
        }
    },

    spendTokenHandler: async (req, res) => {
        try {
            const { studentId, amount, reasonCode, relatedId } = req.body;
            if (!studentId || !amount) {
                return res.status(400).json({ message: 'studentId and amount are required.' });
            }

            const spendLog = await tokenService.spendTokens({ studentId, amount, reasonCode, relatedId });
            res.status(201).json(spendLog);

        } catch (error) {
            console.error('Error spending tokens:', error);
            if (error.message === 'User not found.') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'Insufficient funds.') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'An internal server error occurred.' });
        }
    },

    getBalanceHandler: async (req, res) => {
        try {
            const { studentId } = req.params;
            if (isDebugEnabled) {
                console.debug('getBalanceHandler -> studentId:', studentId);
            }
            const balance = await tokenService.getBalance(studentId);
            return res.status(200).json(balance);

        } catch (error) {
            console.error('Error getting balance:', error);
            if (error.message === 'User not found.') {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: 'An internal server error occurred.' });
        }
    },

    getHistoryHandler: async (req, res) => {
        try {
            const { studentId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const history = await tokenService.getHistory(studentId, page, limit);
            res.status(200).json(history);

        } catch (error) {
            console.error('Error getting history:', error);
            res.status(500).json({ message: 'An internal server error occurred.' });
        }
    },

    withdrawTokenHandler: async (req, res) => {
        try {
            const { studentId, amount, toAddress } = req.body;
            if (!studentId || !amount || !toAddress) {
                return res.status(400).json({ message: 'studentId, amount, and toAddress are required.' });
            }

            const result = await tokenService.withdrawTokens({
                studentId,
                amount: Number(amount),
                toAddress
            });
            res.status(200).json(result);

        } catch (error) {
            console.error('Error withdrawing tokens:', error.message);
            if (error.message.includes('Insufficient funds') || error.message.includes('User not found')) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = tokenController;

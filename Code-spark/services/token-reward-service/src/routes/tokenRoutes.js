// src/routes/tokenRoutes.js
const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const redeemController = require('../controllers/redeemController');
const walletController = require('../controllers/walletController');
const db = require('../models');
const { verifyToken } = require('common-node-library');

const authMiddleware = verifyToken(process.env.JWT_SECRET);

router.post('/grant', authMiddleware, tokenController.grantTokenHandler);
router.post('/spend', authMiddleware, tokenController.spendTokenHandler);
router.post('/redeem/gift', authMiddleware, redeemController.redeemGiftHandler);
router.post('/redeem/course', authMiddleware, redeemController.redeemCourseHandler);
router.post('/verify', redeemController.verifyTransactionHandler);
router.get('/stats', redeemController.getStatsHandler);

router.get('/wallets/me', authMiddleware, walletController.getLinkedWallet);
router.post('/wallets/link', authMiddleware, walletController.linkWallet);
router.delete('/wallets/me', authMiddleware, walletController.unlinkWallet);

router.get('/test', (req, res) => {
    res.json({ message: 'Route test works!' });
});

router.get('/balance/:studentId', authMiddleware, tokenController.getBalanceHandler);
router.get('/history/:studentId', authMiddleware, tokenController.getHistoryHandler);

router.get('/gifts', async (req, res) => {
    try {
        const gifts = await db.Gift.findAll();
        const transformedGifts = gifts.map(gift => ({
            id: gift.id,
            name: gift.name,
            description: gift.description,
            imageUrl: gift.imageUrl,
            tokenPrice: gift.tokenPrice,
            stockQuantity: gift.stockQuantity,
            category: gift.category
        }));

        res.json(transformedGifts);
    } catch (error) {
        console.error('Error fetching gifts:', error);
        res.status(500).json({ error: 'Failed to fetch gifts' });
    }
});

router.get('/gifts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const gift = await db.Gift.findByPk(id);

        if (!gift) {
            return res.status(404).json({ error: 'Gift not found' });
        }

        const transformedGift = {
            id: gift.id,
            name: gift.name,
            description: gift.description,
            imageUrl: gift.imageUrl,
            tokenPrice: gift.tokenPrice,
            stockQuantity: gift.stockQuantity,
            category: gift.category
        };

        res.json(transformedGift);
    } catch (error) {
        console.error('Error fetching gift:', error);
        res.status(500).json({ error: 'Failed to fetch gift' });
    }
});

router.get('/admin/transactions', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        const { count, rows: rewards } = await db.Reward.findAndCountAll({
            order: [['awardedAt', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            totalItems: count,
            totalPages,
            currentPage: page,
            transactions: rewards.map(r => ({
                id: r.id,
                studentId: r.studentId,
                tokensAwarded: r.tokensAwarded,
                reasonCode: r.reasonCode,
                relatedId: r.relatedId,
                awardedAt: r.awardedAt,
                transaction_type: r.transaction_type
            }))
        });
    } catch (error) {
        console.error('Error getting all transactions:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

router.get('/admin/stats', authMiddleware, async (req, res) => {
    try {
        console.log('[ADMIN STATS] Request received');

        if (!db.Reward) {
            console.error('[ADMIN STATS] db.Reward is not defined. Available models:', Object.keys(db));
            return res.status(500).json({
                error: 'Database model not initialized',
                details: 'Reward model not found',
                availableModels: Object.keys(db)
            });
        }

        console.log('[ADMIN STATS] Querying database...');
        const allRewards = await db.Reward.findAll();
        console.log('[ADMIN STATS] Found', allRewards.length, 'rewards');

        const earnRecords = allRewards.filter(r => r.transaction_type === 'EARN');
        const spendRecords = allRewards.filter(r => r.transaction_type === 'SPEND');

        const totalEarned = earnRecords.reduce((sum, r) => sum + Number(r.tokensAwarded || 0), 0);
        const totalSpent = spendRecords.reduce((sum, r) => sum + Number(r.tokensAwarded || 0), 0);
        const currentBalance = totalEarned - totalSpent;

        const uniqueUsers = new Set(allRewards.map(r => r.studentId).filter(Boolean));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRewards = allRewards.filter(r => {
            if (!r.awardedAt) return false;
            const awardedDate = new Date(r.awardedAt);
            return awardedDate >= today;
        });
        const todayTokens = todayRewards.reduce((sum, r) => sum + Number(r.tokensAwarded || 0), 0);

        res.json({
            totalTokensIssued: totalEarned,
            totalTokensSpent: totalSpent,
            currentBalance,
            totalUsers: uniqueUsers.size,
            totalTransactions: allRewards.length,
            totalEarnTransactions: earnRecords.length,
            totalSpendTransactions: spendRecords.length,
            todayTransactions: todayRewards.length,
            todayTokensDistributed: todayTokens
        });
    } catch (error) {
        console.error('[ADMIN STATS] Error getting stats:', error);

        const errorResponse = {
            error: 'Failed to get stats',
            message: error.message || 'Internal server error',
        };

        if (process.env.NODE_ENV === 'development') {
            errorResponse.details = error.stack;
            errorResponse.errorName = error.name;
        }

        res.status(500).json(errorResponse);
    }
});

router.get('/admin/top-users', authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const allRewards = await db.Reward.findAll();

        const userBalances = {};
        allRewards.forEach(r => {
            const studentId = String(r.studentId);
            if (!userBalances[studentId]) {
                userBalances[studentId] = {
                    studentId,
                    totalEarned: 0,
                    totalSpent: 0,
                    balance: 0,
                    transactionCount: 0
                };
            }

            if (r.transaction_type === 'EARN') {
                userBalances[studentId].totalEarned += Number(r.tokensAwarded);
            } else {
                userBalances[studentId].totalSpent += Number(r.tokensAwarded);
            }
            userBalances[studentId].balance = userBalances[studentId].totalEarned - userBalances[studentId].totalSpent;
            userBalances[studentId].transactionCount += 1;
        });

        const topUsers = Object.values(userBalances)
            .sort((a, b) => b.balance - a.balance)
            .slice(0, limit);

        res.json(topUsers);
    } catch (error) {
        console.error('Error getting top users:', error);
        res.status(500).json({ error: 'Failed to get top users' });
    }
});

router.get('/admin/rule-performance', authMiddleware, async (req, res) => {
    try {
        const allRewards = await db.Reward.findAll({
            where: {
                transaction_type: 'EARN'
            }
        });

        const ruleStats = {};
        allRewards.forEach(r => {
            const reasonCode = r.reasonCode || 'UNKNOWN';
            if (!ruleStats[reasonCode]) {
                ruleStats[reasonCode] = {
                    ruleId: reasonCode,
                    ruleName: reasonCode.replace(/_/g, ' '),
                    usageCount: 0,
                    totalTokensDistributed: 0,
                    successRate: 100,
                    averageReward: 0
                };
            }

            ruleStats[reasonCode].usageCount += 1;
            ruleStats[reasonCode].totalTokensDistributed += Number(r.tokensAwarded);
        });

        Object.values(ruleStats).forEach((rule) => {
            rule.averageReward = Math.round(rule.totalTokensDistributed / rule.usageCount);
        });

        const rulePerformance = Object.values(ruleStats)
            .sort((a, b) => b.totalTokensDistributed - a.totalTokensDistributed);

        res.json(rulePerformance);
    } catch (error) {
        console.error('Error getting rule performance:', error);
        res.status(500).json({ error: 'Failed to get rule performance' });
    }
});

router.post('/withdraw', authMiddleware, tokenController.withdrawTokenHandler);

router.use((req, res, next) => {
    console.log('Route not matched:', req.method, req.originalUrl);
    next();
});

module.exports = router;

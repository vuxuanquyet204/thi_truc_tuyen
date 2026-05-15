// src/controllers/redeemController.js
const tokenService = require('../services/tokenService');
const db = require('../models');

const redeemController = {
    redeemGiftHandler: async (req, res) => {
        try {
            const { userId, walletAddress, giftId, quantity = 1, deliveryAddress } = req.body;

            if (!userId || !giftId) {
                return res.status(400).json({ message: 'userId and giftId are required.' });
            }

            const gift = await db.Gift.findByPk(giftId);
            if (!gift) {
                return res.status(404).json({ message: 'Gift not found.' });
            }

            const totalCost = Number(gift.amount) * quantity;

            const balance = await tokenService.getBalance(userId);
            if (balance.balance < totalCost) {
                return res.status(400).json({ message: 'Insufficient token balance.' });
            }

            const userWallet = await db.WalletAccount.findOne({
                where: { userId }
            });

            if (!userWallet) {
                return res.status(400).json({ message: 'No wallet linked. Please link a wallet first.' });
            }

            const spendLog = await tokenService.spendTokens({
                studentId: userId,
                amount: totalCost,
                reasonCode: 'GIFT_REDEEM',
                relatedId: giftId
            });

            const giftOrder = await db.Gift.create({
                senderId: userId,
                recipientId: userId,
                cryptoAccountId: userWallet.id,
                amount: totalCost,
                tokenSymbol: 'LEARN',
                message: `Redeemed gift: ${gift.tokenSymbol || 'Gift'}`,
                status: 'COMPLETED',
                txHash: spendLog?.id || null
            });

            res.status(201).json({
                success: true,
                message: 'Gift redeemed successfully.',
                data: {
                    giftOrderId: giftOrder.id,
                    giftId,
                    totalCost,
                    quantity,
                    deliveryAddress,
                    status: 'COMPLETED',
                    transactionHash: spendLog?.id || null
                }
            });

        } catch (error) {
            console.error('Error redeeming gift:', error);
            res.status(500).json({ message: 'An internal server error occurred.' });
        }
    },

    redeemCourseHandler: async (req, res) => {
        try {
            const { userId, courseId, tokenPrice } = req.body;

            if (!userId || !courseId || !tokenPrice) {
                return res.status(400).json({ message: 'userId, courseId, and tokenPrice are required.' });
            }

            const amount = Number(tokenPrice);
            if (amount <= 0) {
                return res.status(400).json({ message: 'Token price must be positive.' });
            }

            const balance = await tokenService.getBalance(userId);
            if (balance.balance < amount) {
                return res.status(400).json({ message: 'Insufficient token balance.' });
            }

            const spendLog = await tokenService.spendTokens({
                studentId: userId,
                amount,
                reasonCode: 'COURSE_UNLOCK',
                relatedId: courseId
            });

            const userWallet = await db.WalletAccount.findOne({
                where: { userId }
            });

            const orderId = userWallet
                ? `course-unlock-${Date.now()}`
                : null;

            res.status(201).json({
                success: true,
                message: 'Course unlocked successfully.',
                data: {
                    courseId,
                    tokenSpent: amount,
                    orderId,
                    transactionHash: spendLog?.id || null,
                    unlockedAt: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Error unlocking course:', error);
            res.status(500).json({ message: 'An internal server error occurred.' });
        }
    },

    verifyTransactionHandler: async (req, res) => {
        try {
            const { transactionHash } = req.body;

            if (!transactionHash) {
                return res.status(400).json({ message: 'transactionHash is required.' });
            }

            const withdrawal = await db.TokenWithdrawal.findOne({
                where: { txHash: transactionHash }
            });

            if (withdrawal) {
                return res.status(200).json({
                    verified: true,
                    status: withdrawal.status,
                    type: 'WITHDRAWAL',
                    details: {
                        id: withdrawal.id,
                        userId: withdrawal.userId,
                        amount: withdrawal.amount,
                        walletAddress: withdrawal.walletAddress,
                        completedAt: withdrawal.completedAt,
                        createdAt: withdrawal.createdAt
                    }
                });
            }

            const reward = await db.Reward.findOne({
                where: { id: transactionHash }
            });

            if (reward) {
                return res.status(200).json({
                    verified: true,
                    status: 'COMPLETED',
                    type: reward.transaction_type === 'EARN' ? 'REWARD' : 'SPEND',
                    details: {
                        id: reward.id,
                        studentId: reward.studentId,
                        amount: reward.tokensAwarded,
                        reasonCode: reward.reasonCode,
                        awardedAt: reward.awardedAt,
                        createdAt: reward.awardedAt
                    }
                });
            }

            return res.status(404).json({
                verified: false,
                status: 'NOT_FOUND',
                message: 'Transaction not found in off-chain or on-chain records.'
            });

        } catch (error) {
            console.error('Error verifying transaction:', error);
            res.status(500).json({ message: 'An internal server error occurred.' });
        }
    },

    getStatsHandler: async (req, res) => {
        try {
            const [totalEarnedRaw, totalSpentRaw, userCount, transactionCount] = await Promise.all([
                db.Reward.sum('tokensAwarded', { where: { transaction_type: 'EARN' } }),
                db.Reward.sum('tokensAwarded', { where: { transaction_type: 'SPEND' } }),
                db.User.count(),
                db.Reward.count()
            ]);

            const totalEarned = Number(totalEarnedRaw) || 0;
            const totalSpent = Number(totalSpentRaw) || 0;
            const totalSupply = totalEarned - totalSpent;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStart = today.toISOString();

            const [todayTransactions, todayEarnedRaw] = await Promise.all([
                db.Reward.count({ where: { awardedAt: { [db.Sequelize.Op.gte]: todayStart } } }),
                db.Reward.sum('tokensAwarded', {
                    where: {
                        awardedAt: { [db.Sequelize.Op.gte]: todayStart },
                        transaction_type: 'EARN'
                    }
                })
            ]);

            const todayEarned = Number(todayEarnedRaw) || 0;

            res.status(200).json({
                success: true,
                data: {
                    totalSupply,
                    totalUsers: userCount,
                    totalTransactions: transactionCount,
                    totalRewardsIssued: totalEarned,
                    totalRedeemed: totalSpent,
                    todayTransactions,
                    todayTokensDistributed: todayEarned,
                    asOf: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Error getting token stats:', error);
            res.status(500).json({ message: 'An internal server error occurred.' });
        }
    }
};

module.exports = redeemController;

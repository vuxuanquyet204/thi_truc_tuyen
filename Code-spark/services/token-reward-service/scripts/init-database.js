// scripts/init-database.js
const db = require('../src/models');
const { migrate } = require('./migrate-student-id-type');

async function initDatabase(options = {}) {
    try {
        console.log('Bat dau khoi tao database...');

        await db.sequelize.authenticate();
        console.log('Ket noi database thanh cong!');

        // Migrate existing tables to fix type mismatches
        await migrate(db.sequelize);

        await db.sequelize.sync({ alter: true });
        console.log('Dong bo hoa database thanh cong!');

        await insertSampleData(db);

        console.log('Khoi tao database hoan tat!');

    } catch (error) {
        console.error('Loi khi khoi tao database:', error);
        throw error;
    } finally {
        if (options.closeConnection !== false && require.main === module) {
            if (db.sequelize) await db.sequelize.close();
        }
    }
}

async function insertSampleData(models) {
    console.log('Chen du lieu mau...');
    const { User, WalletAccount, Reward, Gift } = models;

    const userCount = await User.count();
    if (userCount > 0) {
        console.log('Database da co du lieu, bo qua chen du lieu mau.');
        return;
    }

    const USER_ID_1 = '00000000-0000-0000-0000-000000000001';
    const USER_ID_2 = '00000000-0000-0000-0000-000000000002';
    const USER_ID_3 = '00000000-0000-0000-0000-000000000003';

    await User.bulkCreate([
        { id: USER_ID_1, tokenBalance: 1000 },
        { id: USER_ID_2, tokenBalance: 500 },
        { id: USER_ID_3, tokenBalance: 2500 },
    ]);

    await WalletAccount.bulkCreate([
        { userId: USER_ID_1, address: '0x1234567890abcdef1234567890abcdef12345678', status: 'linked' },
        { userId: USER_ID_2, address: '0xabcdef1234567890abcdef1234567890abcdef12', status: 'linked' },
        { userId: USER_ID_3, address: '0x567890abcdef1234567890abcdef1234567890ab', status: 'linked' },
    ]);

    await Reward.bulkCreate([
        { studentId: USER_ID_1, tokensAwarded: 100, reasonCode: 'HOMEWORK', relatedId: 'HW001', transaction_type: 'EARN' },
        { studentId: USER_ID_2, tokensAwarded: 50, reasonCode: 'QUIZ', relatedId: 'QZ001', transaction_type: 'EARN' },
        { studentId: USER_ID_3, tokensAwarded: 200, reasonCode: 'PROJECT', relatedId: 'PJ001', transaction_type: 'EARN' },
    ]);

    await Gift.bulkCreate([
        { senderId: USER_ID_1, recipientId: USER_ID_2, amount: 100, tokenSymbol: 'LEARN', message: 'Chuc Mung Sinh Nhat!', status: 'COMPLETED' },
        { senderId: USER_ID_2, recipientId: USER_ID_3, amount: 50, tokenSymbol: 'LEARN', message: 'Qua tang tu lop 10A!', status: 'PENDING' },
    ]);

    console.log('Hoan tat chen du lieu mau!');
}

if (require.main === module) {
    initDatabase()
        .then(() => {
            console.log('Database initialization completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Database initialization failed:', error);
            process.exit(1);
        });
}

module.exports = { initDatabase };

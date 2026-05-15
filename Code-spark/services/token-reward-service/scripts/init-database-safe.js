// scripts/init-database-safe.js
// Raw SQL approach — creates tables directly without Sequelize.sync()
// Safe to run on existing databases (uses CREATE TABLE IF NOT EXISTS)
const { Sequelize } = require('sequelize');
const config = require('../src/config/db.js').development;

async function initDatabase() {
    let sequelize;
    try {
        console.log('Bat dau khoi tao database...');

        sequelize = new Sequelize(config.database, config.username, config.password, {
            host: config.host,
            dialect: 'postgres',
            logging: false
        });

        await sequelize.authenticate();
        console.log('Ket noi database thanh cong!');

        await createTables(sequelize);
        await addMissingColumns(sequelize);

        console.log('Khoi tao database hoan tat!');

    } catch (error) {
        console.error('Loi khi khoi tao database:', error);
        throw error;
    } finally {
        if (sequelize) await sequelize.close();
    }
}

async function createTables(sequelize) {
    console.log('Tao bang...');

    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS cm_users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            token_balance INTEGER DEFAULT 0 NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS cm_wallet_accounts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            address VARCHAR(255) NOT NULL UNIQUE,
            signature TEXT,
            status VARCHAR(32) DEFAULT 'linked' NOT NULL,
            linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            last_seen_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
    `);

    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS cm_rewards (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_id UUID NOT NULL,
            tokens_awarded INTEGER NOT NULL,
            reason_code VARCHAR(255),
            related_id VARCHAR(255),
            awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            transaction_type VARCHAR(10) DEFAULT 'EARN' NOT NULL
        );
    `);

    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS cm_gifts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            sender_id UUID NOT NULL,
            recipient_id UUID NOT NULL,
            crypto_account_id UUID,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            image_url VARCHAR(255),
            token_price INTEGER,
            stock_quantity INTEGER DEFAULT 0,
            category VARCHAR(50),
            amount INTEGER NOT NULL,
            token_symbol VARCHAR(50),
            message TEXT,
            status VARCHAR(50) DEFAULT 'PENDING',
            tx_hash VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS cm_token_deposits (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            wallet_address VARCHAR(255),
            tx_hash VARCHAR(80) NOT NULL UNIQUE,
            token_address VARCHAR(255) NOT NULL,
            from_address VARCHAR(255) NOT NULL,
            to_address VARCHAR(255) NOT NULL,
            amount_raw DECIMAL(78,0) NOT NULL,
            amount_tokens INTEGER NOT NULL,
            block_number BIGINT,
            block_timestamp TIMESTAMP,
            status VARCHAR(32) DEFAULT 'pending' NOT NULL,
            metadata JSONB,
            confirmed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
    `);

    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS cm_token_withdrawals (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            wallet_address VARCHAR(255) NOT NULL,
            amount INTEGER NOT NULL,
            token_address VARCHAR(255),
            tx_hash VARCHAR(80),
            escrow_request_id VARCHAR(80),
            status VARCHAR(32) DEFAULT 'requested' NOT NULL,
            metadata JSONB,
            completed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
    `);

    console.log('Tao bang hoan tat!');
}

async function addMissingColumns(sequelize) {
    console.log('Kiem tra cot...');

    const rewardColumns = [
        { name: 'transaction_type', sql: 'transaction_type VARCHAR(10) DEFAULT EARN NOT NULL' },
        { name: 'related_id', sql: 'related_id VARCHAR(255)' },
    ];
    for (const col of rewardColumns) {
        const [exists] = await sequelize.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'cm_rewards' AND column_name = '${col.name}';
        `, { type: Sequelize.QueryTypes.SELECT });
        if (!exists || exists.length === 0) {
            await sequelize.query(`ALTER TABLE cm_rewards ADD COLUMN IF NOT EXISTS ${col.sql};`);
        }
    }

    const userColumns = [
        { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
    ];
    for (const col of userColumns) {
        const [exists] = await sequelize.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'cm_users' AND column_name = '${col.name}';
        `, { type: Sequelize.QueryTypes.SELECT });
        if (!exists || exists.length === 0) {
            await sequelize.query(`ALTER TABLE cm_users ADD COLUMN IF NOT EXISTS ${col.sql};`);
        }
    }

    const giftColumns = [
        { name: 'sender_id', sql: 'sender_id UUID' },
        { name: 'recipient_id', sql: 'recipient_id UUID' },
        { name: 'amount', sql: 'amount INTEGER' },
        { name: 'created_at', sql: 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updated_at', sql: 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
    ];
    for (const col of giftColumns) {
        const [exists] = await sequelize.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'cm_gifts' AND column_name = '${col.name}';
        `, { type: Sequelize.QueryTypes.SELECT });
        if (!exists || exists.length === 0) {
            await sequelize.query(`ALTER TABLE cm_gifts ADD COLUMN IF NOT EXISTS ${col.sql};`);
        }
    }

    const depositColumns = [
        { name: 'from_address', sql: 'from_address VARCHAR(255) NOT NULL' },
        { name: 'amount_raw', sql: 'amount_raw DECIMAL(78,0) NOT NULL' },
        { name: 'amount_tokens', sql: 'amount_tokens INTEGER NOT NULL' },
        { name: 'block_number', sql: 'block_number BIGINT' },
        { name: 'metadata', sql: 'metadata JSONB' },
        { name: 'confirmed_at', sql: 'confirmed_at TIMESTAMP' },
    ];
    for (const col of depositColumns) {
        const [exists] = await sequelize.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'cm_token_deposits' AND column_name = '${col.name}';
        `, { type: Sequelize.QueryTypes.SELECT });
        if (!exists || exists.length === 0) {
            await sequelize.query(`ALTER TABLE cm_token_deposits ADD COLUMN IF NOT EXISTS ${col.sql};`);
        }
    }

    const withdrawalColumns = [
        { name: 'escrow_request_id', sql: 'escrow_request_id VARCHAR(80)' },
        { name: 'metadata', sql: 'metadata JSONB' },
        { name: 'completed_at', sql: 'completed_at TIMESTAMP' },
    ];
    for (const col of withdrawalColumns) {
        const [exists] = await sequelize.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'cm_token_withdrawals' AND column_name = '${col.name}';
        `, { type: Sequelize.QueryTypes.SELECT });
        if (!exists || exists.length === 0) {
            await sequelize.query(`ALTER TABLE cm_token_withdrawals ADD COLUMN IF NOT EXISTS ${col.sql};`);
        }
    }

    console.log('Kiem tra cot hoan tat!');
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

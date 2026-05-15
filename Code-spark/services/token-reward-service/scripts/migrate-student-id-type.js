// scripts/migrate-student-id-type.js
// Migration: Fix student_id column type in cm_rewards table
// Converts TEXT/VARCHAR to UUID with proper casting
const { Sequelize } = require('sequelize');
const config = require('../src/config/db.js').development;

async function migrate(sequelize) {
    try {
        console.log('Bat dau migrate student_id type...');

        // Check if column is currently TEXT or VARCHAR
        const [results] = await sequelize.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'cm_rewards' AND column_name = 'student_id'
        `);

        if (results.length === 0) {
            console.log('Cot student_id khong ton tai, khong can migrate.');
            return;
        }

        const col = results[0];
        console.log(`Kiem tra cot student_id: type=${col.data_type}, length=${col.character_maximum_length}`);

        if (col.data_type === 'uuid') {
            console.log('Cot student_id da la UUID, khong can migrate.');
            return;
        }

        // Check if data can be cast to UUID
        const [castCheck] = await sequelize.query(`
            SELECT student_id FROM cm_rewards LIMIT 1
        `);

        if (castCheck.length > 0) {
            const sampleValue = castCheck[0].student_id;
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(sampleValue)) {
                console.warn('Du lieu hien tai khong phai UUID hop le. Vui long kiem tra du lieu truoc khi migrate.');
                console.warn(`Gia tri mau: ${sampleValue}`);
            }
        }

        // Step 1: Drop NOT NULL constraint first (if exists)
        await sequelize.query(`
            ALTER TABLE cm_rewards ALTER COLUMN student_id DROP NOT NULL
        `);
        console.log('Da drop NOT NULL constraint');

        // Step 2: Convert to UUID using explicit cast
        await sequelize.query(`
            ALTER TABLE cm_rewards ALTER COLUMN student_id TYPE UUID USING student_id::uuid
        `);
        console.log('Da chuyen doi sang UUID');

        // Step 3: Re-add NOT NULL
        await sequelize.query(`
            ALTER TABLE cm_rewards ALTER COLUMN student_id SET NOT NULL
        `);
        console.log('Da them lai NOT NULL constraint');

        console.log('Migrate hoan tat!');
    } catch (error) {
        console.error('Loi khi migrate:', error.message);
        throw error;
    }
}

if (require.main === module) {
    const sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging || false
    });

    migrate(sequelize)
        .then(async () => {
            console.log('Migration completed!');
            await sequelize.close();
            process.exit(0);
        })
        .catch(async (error) => {
            console.error('Migration failed:', error);
            await sequelize.close();
            process.exit(1);
        });
}

module.exports = { migrate };

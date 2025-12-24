const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: process.env.DB_PASSWORD || 'ADVindiancoder@860964',
    database: 'LMS',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function setupDatabase() {
    try {
        console.log('Connecting to MySQL (LMS Database)...');
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database
        });

        console.log('Connected! Creating/Checking "articles" table...');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS articles (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                original_content LONGTEXT NOT NULL,
                updated_content LONGTEXT,
                source_url VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'original',
                references_json JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `;

        await connection.execute(createTableQuery);
        console.log('✅ "articles" table is ready in LMS database.');

        await connection.end();
    } catch (error) {
        console.error('❌ Database Setup Failed:', error.message);
    }
}

setupDatabase();

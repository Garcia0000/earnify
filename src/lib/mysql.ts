import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

export async function initDb() {
  console.log('Attempting to connect to MySQL at:', process.env.DB_HOST);
  const connection = await pool.getConnection();
  try {
    console.log('MySQL Connection established. Initializing tables...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(128) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(10, 2) DEFAULT 0.00,
        total_earned DECIMAL(10, 2) DEFAULT 0.00,
        referral_code VARCHAR(50) UNIQUE NOT NULL,
        referred_by VARCHAR(128),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_referral_code (referral_code)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        offer_name VARCHAR(255),
        amount_cpagrip DECIMAL(10, 4),
        amount_user DECIMAL(10, 4),
        amount_referral DECIMAL(10, 4),
        tracking_id VARCHAR(255),
        type ENUM('offer', 'referral', 'withdrawal') DEFAULT 'offer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        details TEXT,
        status ENUM('pending', 'approved', 'paid', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await connection.query('SET NAMES utf8mb4');
    
    console.log('Database tables verified/created.');
    
    // Check if we should seed a test user
    const [users]: any = await connection.query('SELECT count(*) as count FROM users');
    if (users[0].count === 0) {
      console.log('Seeding initial admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(
        'INSERT INTO users (id, email, password, balance, referral_code) VALUES (?, ?, ?, ?, ?)',
        ['admin-id', 'admin@earnify.test', hashedPassword, 100.00, 'ADMIN']
      );
      console.log('Initial user created: admin@earnify.test / admin123');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    connection.release();
  }
}

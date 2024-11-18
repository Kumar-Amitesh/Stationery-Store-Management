// db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'statstore',
  password: '22BCE2130',
  port: 5432,
});

pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Failed to connect to database:', err));

export default pool;

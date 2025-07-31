// db.js
import pkg from 'pg';
const { Pool } = pkg;

// const pool = new Pool({
//   user: process.env.USER,
//   host: process.env.HOST,
//   database: process.env.DATABASE,
//   password: process.env.PASS,
//   port: process.env.PORT,
// });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Failed to connect to database:', err));

export default pool;

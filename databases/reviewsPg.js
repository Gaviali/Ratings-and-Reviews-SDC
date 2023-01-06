require('dotenv').config();
const { Pool } = require('pg');
const connectionString = 'postgresql://localhost:5432/reviews';
const parser = require('csv-parser');
const fs = require('fs'); // maybe need promises

const pool = new Pool({
  // connectionString,
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// runs postgres on the .sql file, where table is created
// psql -d reviews -a -f databases/reviewsPg.sql

module.exports = pool;

// \l list all databases
// \dt list all database tables
const Pool = require('pg').Pool;

const pool = new Pool({
  user: "postgres",
  password: "LeBron",
  host: "localhost",
  port: 5432,
  database: "assessment_system"
});

// Add error handling for pool connection  
pool.on('error', (err) => {  
    console.error('Unexpected error on idle client', err);  
  });  

module.exports = pool;  
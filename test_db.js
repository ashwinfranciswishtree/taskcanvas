const { Pool } = require('pg');

const passwords = ['postgres', 'password', 'root', 'admin', '123456', 'Wishtree2025', 'wishtree', '', 'password123'];

async function testPasswords() {
  console.log("Starting password brute-force test on local postgres user...");
  for (let pwd of passwords) {
    let uri = `postgresql://postgres:${pwd}@localhost:5432/wishtree`;
    if (pwd === '') uri = `postgresql://postgres@localhost:5432/wishtree`;
    
    const pool = new Pool({ connectionString: uri });
    try {
      await pool.query('SELECT 1');
      console.log(`\n\nSUCCESS!!! The password is: "${pwd}"\n\n`);
      process.exit(0);
    } catch (err) {
      process.stdout.write(`.` ); // failed
    } finally {
      await pool.end();
    }
  }
  console.log("\nCouldn't guess the password.");
  process.exit(1);
}

testPasswords();

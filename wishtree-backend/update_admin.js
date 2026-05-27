const getDbConnection = require('./db');
const bcrypt = require('bcryptjs');

async function updateAdmin() {
  try {
    const db = await getDbConnection();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Admin123$%^', salt);

    // Try updating if it exist as admin@wishtree.com
    await db.query(
      `UPDATE users SET email = $1, password_hash = $2 WHERE email = $3`,
      ['admin@gmail.com', hash, 'admin@wishtree.com']
    );

    // Also just in case it already became admin@gmail.com, update the password anyway
    await db.query(
      `UPDATE users SET password_hash = $1 WHERE email = $2`,
      [hash, 'admin@gmail.com']
    );

    console.log("Admin credentials updated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error updating admin credentials:", error);
    process.exit(1);
  }
}

updateAdmin();

const getDbConnection = require('./db');
const bcrypt = require('bcryptjs');

const initDb = async () => {
  try {
    console.log("Initializing database schema...");
    const db = await getDbConnection();

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        designation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Feedback',
        priority TEXT DEFAULT 'Medium',
        due_date TIMESTAMP,
        assigned_designer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        client_approval BOOLEAN DEFAULT FALSE,
        passed_checks BOOLEAN DEFAULT FALSE,
        approved BOOLEAN DEFAULT FALSE,
        scheduled_for_ads BOOLEAN DEFAULT FALSE,
        used_for_ads BOOLEAN DEFAULT FALSE,
        is_rejected BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS project_images (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        from_status TEXT,
        to_status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed admin if doesn't exist
    const { rows } = await db.query(`SELECT id FROM users WHERE email = $1`, ['admin@gmail.com']);
    if (rows.length === 0) {
      console.log("Seeding Admin user...");
      const salt = await bcrypt.genSalt(10);
      const adminHash = await bcrypt.hash('Admin123$%^', salt);

      await db.query(
        `INSERT INTO users (name, email, password_hash, role, designation) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
        ['Admin User', 'admin@gmail.com', adminHash, 'Admin', 'Administrator']
      );
    }

    console.log("Database initialization complete!");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

if (require.main === module) {
  initDb().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = initDb;

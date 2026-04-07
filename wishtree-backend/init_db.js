const getDbConnection = require('./db');
const bcrypt = require('bcryptjs');

const initDb = async () => {
  try {
    console.log("Initializing database schema...");
    const db = await getDbConnection();

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        designation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Feedback',
        priority TEXT DEFAULT 'Medium',
        due_date DATETIME,
        assigned_designer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        client_approval BOOLEAN DEFAULT 0,
        passed_checks BOOLEAN DEFAULT 0,
        approved BOOLEAN DEFAULT 0,
        scheduled_for_ads BOOLEAN DEFAULT 0,
        used_for_ads BOOLEAN DEFAULT 0,
        is_rejected BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS project_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        from_status TEXT,
        to_status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed dummy users if admin doesn't exist
    const row = await db.get(`SELECT id FROM users WHERE email = ?`, ['admin@wishtree.com']);
    if (!row) {
      console.log("Seeding initial users...");
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('password123', salt);

      const users = [
        ['Admin User', 'admin@wishtree.com', hash, 'Admin', 'Administrator'],
        ['John Designer', 'designer@wishtree.com', hash, 'Designer', 'Senior UI Designer'],
        ['Jane Manager', 'manager@wishtree.com', hash, 'Manager', 'Project Manager'],
        ['Mark Marketer', 'dm@wishtree.com', hash, 'Digital Marketing', 'Marketing Lead']
      ];

      for (let user of users) {
        await db.run(
          `INSERT INTO users (name, email, password_hash, role, designation) VALUES (?, ?, ?, ?, ?)`,
          user
        );
      }
    }

    console.log("Database initialization complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
};

initDb();

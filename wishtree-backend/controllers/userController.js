const getDbConnection = require('../db');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
  try {
    const db = await getDbConnection();
    const users = await db.all('SELECT id, name, email, role, designation, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createUser = async (req, res) => {
  const { name, email, password, role, designation } = req.body;
  try {
    const db = await getDbConnection();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash, role, designation) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, role, designation]
    );
    const newUser = await db.get('SELECT id, name, email, role, designation FROM users WHERE id = ?', [result.lastID]);
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, designation, password } = req.body;
  try {
    const db = await getDbConnection();
    let query = 'UPDATE users SET name = ?, email = ?, role = ?, designation = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    let values = [name, email, role, designation, id];

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      query = 'UPDATE users SET name = ?, email = ?, role = ?, designation = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      values = [name, email, role, designation, hash, id];
    }

    await db.run(query, values);
    const updatedUser = await db.get('SELECT id, name, email, role, designation FROM users WHERE id = ?', [id]);
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDbConnection();
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };

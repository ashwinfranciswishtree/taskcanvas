const getDbConnection = require('../db');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
  try {
    const db = await getDbConnection();
    const { rows } = await db.query('SELECT id, name, email, role, designation, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
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
    
    const { rows } = await db.query(
      'INSERT INTO users (name, email, password_hash, role, designation) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, designation',
      [name, email, hash, role, designation]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    // Postgres unique violation code is 23505
    if (error.code === '23505') return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, designation, password } = req.body;
  try {
    const db = await getDbConnection();
    let query = 'UPDATE users SET name = $1, email = $2, role = $3, designation = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, name, email, role, designation';
    let values = [name, email, role, designation, id];

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      query = 'UPDATE users SET name = $1, email = $2, role = $3, designation = $4, password_hash = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, name, email, role, designation';
      values = [name, email, role, designation, hash, id];
    }

    const { rows } = await db.query(query, values);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDbConnection();
    const result = await db.query('DELETE FROM users WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };

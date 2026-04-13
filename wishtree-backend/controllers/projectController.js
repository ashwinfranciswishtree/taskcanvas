const getDbConnection = require('../db');

const logActivity = async (db, projectId, userId, action, fromStatus = null, toStatus = null) => {
  await db.run(
    'INSERT INTO activity_logs (project_id, user_id, action, from_status, to_status) VALUES (?, ?, ?, ?, ?)',
    [projectId, userId, action, fromStatus, toStatus]
  );
};

const getProjects = async (req, res) => {
  try {
    const db = await getDbConnection();
    const { status, is_rejected, search } = req.query;
    let query = `
      SELECT p.*, u.name as assigned_designer_name, c.name as created_by_name,
      (SELECT json_group_array(image_url) FROM project_images qi WHERE qi.project_id = p.id) as images
      FROM projects p
      LEFT JOIN users u ON p.assigned_designer_id = u.id
      LEFT JOIN users c ON p.created_by_id = c.id
      WHERE 1=1
    `;
    let params = [];
    if (status && status !== 'all') {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    if (is_rejected !== undefined) {
      query += ` AND p.is_rejected = ?`;
      params.push(is_rejected);
    } else {
      query += ` AND p.is_rejected = 0`;
    }
    query += ` ORDER BY p.created_at DESC`;
    
    let rows = await db.all(query, params);
    
    // SQLite json_group_array returns '[null]' if empty, so we map it cleanly:
    rows = rows.map(r => {
      let imgs = JSON.parse(r.images || '[]');
      if (imgs.length === 1 && imgs[0] === null) imgs = [];
      r.images = imgs;
      return r;
    });

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDbConnection();
    let row = await db.get(`
      SELECT p.*, u.name as assigned_designer_name, c.name as created_by_name,
      (SELECT json_group_array(image_url) FROM project_images qi WHERE qi.project_id = p.id) as images
      FROM projects p
      LEFT JOIN users u ON p.assigned_designer_id = u.id
      LEFT JOIN users c ON p.created_by_id = c.id
      WHERE p.id = ?
    `, [id]);
    
    if (!row) return res.status(404).json({ message: 'Project not found' });
    
    let imgs = JSON.parse(row.images || '[]');
    if (imgs.length === 1 && imgs[0] === null) imgs = [];
    row.images = imgs;

    res.json(row);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createProject = async (req, res) => {
  const db = await getDbConnection();
  try {
    const { name, description, assigned_designer_id, priority } = req.body;
    await db.run('BEGIN TRANSACTION');
    
    const result = await db.run(
      `INSERT INTO projects (name, description, assigned_designer_id, created_by_id, priority, status) 
       VALUES (?, ?, ?, ?, ?, 'Feedback')`,
      [name, description, assigned_designer_id || null, req.user.id, priority || 'Medium']
    );
    const projectId = result.lastID;

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.run(
          'INSERT INTO project_images (project_id, image_url) VALUES (?, ?)',
          [projectId, `/uploads/${file.filename}`]
        );
      }
    }

    await logActivity(db, projectId, req.user.id, 'Created Project', null, 'Feedback');
    
    await db.run('COMMIT');
    const newProject = await db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
    res.status(201).json(newProject);
  } catch (error) {
    await db.run('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProjectStatus = async (req, res) => {
  const { id } = req.params;
  const { status, client_approval, passed_checks, approved, scheduled_for_ads, used_for_ads, is_rejected } = req.body;
  const db = await getDbConnection();
  
  try {
    await db.run('BEGIN TRANSACTION');
    const projectRow = await db.get('SELECT status FROM projects WHERE id = ?', [id]);
    if (!projectRow) return res.status(404).json({ message: 'Project not found' });
    const fromStatus = projectRow.status;

    let queryParts = [];
    let params = [];

    if (status) { queryParts.push(`status = ?`); params.push(status); }
    if (client_approval !== undefined) { queryParts.push(`client_approval = ?`); params.push(client_approval); }
    if (passed_checks !== undefined) { queryParts.push(`passed_checks = ?`); params.push(passed_checks); }
    if (approved !== undefined) { queryParts.push(`approved = ?`); params.push(approved); }
    if (scheduled_for_ads !== undefined) { queryParts.push(`scheduled_for_ads = ?`); params.push(scheduled_for_ads); }
    if (used_for_ads !== undefined) { queryParts.push(`used_for_ads = ?`); params.push(used_for_ads); }
    if (is_rejected !== undefined) { queryParts.push(`is_rejected = ?`); params.push(is_rejected); }

    queryParts.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    
    const updateQuery = `UPDATE projects SET ${queryParts.join(', ')} WHERE id = ?`;
    await db.run(updateQuery, params);

    if (status && status !== fromStatus) {
      await logActivity(db, id, req.user.id, 'Moved Stage', fromStatus, status);
    } else {
      await logActivity(db, id, req.user.id, 'Updated Details', fromStatus, fromStatus);
    }

    await db.run('COMMIT');
    const updatedProject = await db.get('SELECT * FROM projects WHERE id = ?', [id]);
    res.json(updatedProject);
  } catch (error) {
    await db.run('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addComment = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  try {
    const db = await getDbConnection();
    const result = await db.run(
      'INSERT INTO comments (project_id, user_id, message) VALUES (?, ?, ?)',
      [id, req.user.id, message]
    );
    const comment = await db.get('SELECT * FROM comments WHERE id = ?', [result.lastID]);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getComments = async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDbConnection();
    const comments = await db.all(`
      SELECT c.*, u.name as user_name, u.role as user_role 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.project_id = ?
      ORDER BY c.created_at ASC
    `, [id]);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const db = await getDbConnection();
    const totalProjects = (await db.get('SELECT COUNT(*) as count FROM projects WHERE is_rejected = 0')).count;
    const feedbackPending = (await db.get("SELECT COUNT(*) as count FROM projects WHERE status = 'Feedback' AND is_rejected = 0")).count;
    const creativesPending = (await db.get("SELECT COUNT(*) as count FROM projects WHERE status = 'Creatives' AND is_rejected = 0")).count;
    const approvalPending = (await db.get("SELECT COUNT(*) as count FROM projects WHERE status = 'Approval' AND is_rejected = 0")).count;
    const completedTasks = (await db.get("SELECT COUNT(*) as count FROM projects WHERE status = 'Completed' AND is_rejected = 0")).count;
    const overdueTasks = (await db.get("SELECT COUNT(*) as count FROM projects WHERE due_date < CURRENT_TIMESTAMP AND status != 'Completed' AND is_rejected = 0")).count;
    const rejectedTasks = (await db.get('SELECT COUNT(*) as count FROM projects WHERE is_rejected = 1')).count;

    // For the graph activity overview
    const monthlyActivity = await db.all(`
      SELECT 
        substr(created_at, 1, 7) as month,
        COUNT(*) as count
      FROM projects 
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `);
    
    res.json({
      totalProjects: parseInt(totalProjects),
      feedbackPending: parseInt(feedbackPending),
      creativesPending: parseInt(creativesPending),
      approvalPending: parseInt(approvalPending),
      completedTasks: parseInt(completedTasks),
      overdueTasks: parseInt(overdueTasks),
      rejectedTasks: parseInt(rejectedTasks),
      monthlyActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, assigned_designer_id, priority, replaceImages } = req.body;
  try {
    const db = await getDbConnection();
    await db.run('BEGIN TRANSACTION');
    
    await db.run(
      'UPDATE projects SET name = ?, description = ?, assigned_designer_id = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, assigned_designer_id || null, priority, id]
    );

    if (req.files && req.files.length > 0) {
      if (replaceImages === 'true' || replaceImages === true) {
        await db.run('DELETE FROM project_images WHERE project_id = ?', [id]);
      }
      for (const file of req.files) {
        await db.run(
          'INSERT INTO project_images (project_id, image_url) VALUES (?, ?)',
          [id, `/uploads/${file.filename}`]
        );
      }
    }

    await db.run('COMMIT');
    const updated = await db.get('SELECT * FROM projects WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error(error);
    const db = await getDbConnection();
    await db.run('ROLLBACK');
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDbConnection();
    await db.run('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProjectStatus, updateProject, deleteProject, addComment, getComments, getDashboardStats };

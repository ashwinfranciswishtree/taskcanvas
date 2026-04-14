const getDbConnection = require('../db');

const logActivity = async (db, projectId, userId, action, fromStatus = null, toStatus = null) => {
  await db.query(
    'INSERT INTO activity_logs (project_id, user_id, action, from_status, to_status) VALUES ($1, $2, $3, $4, $5)',
    [projectId, userId, action, fromStatus, toStatus]
  );
};

const getProjects = async (req, res) => {
  try {
    const db = await getDbConnection();
    const { status, is_rejected, search } = req.query;
    let query = `
      SELECT p.*, u.name as assigned_designer_name, c.name as created_by_name,
      (SELECT json_agg(image_url) FROM project_images qi WHERE qi.project_id = p.id) as images
      FROM projects p
      LEFT JOIN users u ON p.assigned_designer_id = u.id
      LEFT JOIN users c ON p.created_by_id = c.id
      WHERE 1=1
    `;
    let params = [];
    if (status && status !== 'all') {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`, `%${search}%`);
      query += ` AND (p.name LIKE $${params.length - 1} OR p.description LIKE $${params.length})`;
    }
    if (is_rejected !== undefined) {
      params.push(is_rejected === 'true' || is_rejected === '1' || is_rejected === true);
      query += ` AND p.is_rejected = $${params.length}`;
    } else {
      query += ` AND p.is_rejected = FALSE`;
    }
    query += ` ORDER BY p.created_at DESC`;
    
    let { rows } = await db.query(query, params);
    
    // PG json_agg returns null if nothing aggregated
    rows = rows.map(r => {
      r.images = r.images || [];
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
    let { rows } = await db.query(`
      SELECT p.*, u.name as assigned_designer_name, c.name as created_by_name,
      (SELECT json_agg(image_url) FROM project_images qi WHERE qi.project_id = p.id) as images
      FROM projects p
      LEFT JOIN users u ON p.assigned_designer_id = u.id
      LEFT JOIN users c ON p.created_by_id = c.id
      WHERE p.id = $1
    `, [id]);
    
    let row = rows[0];
    if (!row) return res.status(404).json({ message: 'Project not found' });
    
    row.images = row.images || [];
    res.json(row);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createProject = async (req, res) => {
  const db = await getDbConnection();
  try {
    const { name, description, assigned_designer_id, priority } = req.body;
    await db.query('BEGIN');
    
    const { rows } = await db.query(
      `INSERT INTO projects (name, description, assigned_designer_id, created_by_id, priority, status) 
       VALUES ($1, $2, $3, $4, $5, 'Feedback') RETURNING id`,
      [name, description, assigned_designer_id || null, req.user.id, priority || 'Medium']
    );
    const projectId = rows[0].id;

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.query(
          'INSERT INTO project_images (project_id, image_url) VALUES ($1, $2)',
          [projectId, `/uploads/${file.filename}`]
        );
      }
    }

    await logActivity(db, projectId, req.user.id, 'Created Project', null, 'Feedback');
    
    await db.query('COMMIT');
    const newProjectResult = await db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    res.status(201).json(newProjectResult.rows[0]);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProjectStatus = async (req, res) => {
  const { id } = req.params;
  const { status, client_approval, passed_checks, approved, scheduled_for_ads, used_for_ads, is_rejected } = req.body;
  const db = await getDbConnection();
  
  try {
    await db.query('BEGIN');
    const { rows: projectRows } = await db.query('SELECT status FROM projects WHERE id = $1', [id]);
    const projectRow = projectRows[0];
    if (!projectRow) return res.status(404).json({ message: 'Project not found' });
    const fromStatus = projectRow.status;

    let queryParts = [];
    let params = [];

    if (status) { params.push(status); queryParts.push(`status = $${params.length}`); }
    if (client_approval !== undefined) { params.push(client_approval); queryParts.push(`client_approval = $${params.length}`); }
    if (passed_checks !== undefined) { params.push(passed_checks); queryParts.push(`passed_checks = $${params.length}`); }
    if (approved !== undefined) { params.push(approved); queryParts.push(`approved = $${params.length}`); }
    if (scheduled_for_ads !== undefined) { params.push(scheduled_for_ads); queryParts.push(`scheduled_for_ads = $${params.length}`); }
    if (used_for_ads !== undefined) { params.push(used_for_ads); queryParts.push(`used_for_ads = $${params.length}`); }
    if (is_rejected !== undefined) { params.push(is_rejected); queryParts.push(`is_rejected = $${params.length}`); }

    queryParts.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    
    const updateQuery = `UPDATE projects SET ${queryParts.join(', ')} WHERE id = $${params.length}`;
    await db.query(updateQuery, params);

    if (status && status !== fromStatus) {
      await logActivity(db, id, req.user.id, 'Moved Stage', fromStatus, status);
    } else {
      await logActivity(db, id, req.user.id, 'Updated Details', fromStatus, fromStatus);
    }

    await db.query('COMMIT');
    const { rows: updatedRows } = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    res.json(updatedRows[0]);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addComment = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  try {
    const db = await getDbConnection();
    const { rows: resultRows } = await db.query(
      'INSERT INTO comments (project_id, user_id, message) VALUES ($1, $2, $3) RETURNING id',
      [id, req.user.id, message]
    );
    const { rows: commentRows } = await db.query('SELECT * FROM comments WHERE id = $1', [resultRows[0].id]);
    res.status(201).json(commentRows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getComments = async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDbConnection();
    const { rows } = await db.query(`
      SELECT c.*, u.name as user_name, u.role as user_role 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.project_id = $1
      ORDER BY c.created_at ASC
    `, [id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const db = await getDbConnection();
    const totalProjects = (await db.query('SELECT COUNT(*) as count FROM projects WHERE is_rejected = FALSE')).rows[0].count;
    const feedbackPending = (await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'Feedback' AND is_rejected = FALSE")).rows[0].count;
    const creativesPending = (await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'Creatives' AND is_rejected = FALSE")).rows[0].count;
    const approvalPending = (await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'Approval' AND is_rejected = FALSE")).rows[0].count;
    const completedTasks = (await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'Completed' AND is_rejected = FALSE")).rows[0].count;
    const overdueTasks = (await db.query("SELECT COUNT(*) as count FROM projects WHERE due_date < CURRENT_TIMESTAMP AND status != 'Completed' AND is_rejected = FALSE")).rows[0].count;
    const rejectedTasks = (await db.query('SELECT COUNT(*) as count FROM projects WHERE is_rejected = TRUE')).rows[0].count;

    // For the graph activity overview
    const { rows: monthlyActivity } = await db.query(`
      SELECT 
        to_char(created_at, 'YYYY-MM') as month,
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
    await db.query('BEGIN');
    
    await db.query(
      'UPDATE projects SET name = $1, description = $2, assigned_designer_id = $3, priority = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
      [name, description, assigned_designer_id || null, priority, id]
    );

    if (req.files && req.files.length > 0) {
      if (replaceImages === 'true' || replaceImages === true) {
        await db.query('DELETE FROM project_images WHERE project_id = $1', [id]);
      }
      for (const file of req.files) {
        await db.query(
          'INSERT INTO project_images (project_id, image_url) VALUES ($1, $2)',
          [id, `/uploads/${file.filename}`]
        );
      }
    }

    await db.query('COMMIT');
    const { rows: updatedRows } = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    res.json(updatedRows[0]);
  } catch (error) {
    console.error(error);
    const db = await getDbConnection();
    await db.query('ROLLBACK');
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDbConnection();
    await db.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const db = await getDbConnection();
    const { rows } = await db.query(`
      SELECT a.*, p.name as project_name, u.name as user_name, u.role as user_role
      FROM activity_logs a
      JOIN projects p ON a.project_id = p.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProjectStatus, updateProject, deleteProject, addComment, getComments, getDashboardStats, getNotifications };

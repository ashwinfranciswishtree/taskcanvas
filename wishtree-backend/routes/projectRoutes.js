const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProjectStatus, 
  updateProject,
  deleteProject,
  addComment, 
  getComments, 
  getDashboardStats,
  getNotifications
} = require('../controllers/projectController');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Images only!');
    }
  }
});

router.use(protect);

router.get('/notifications', getNotifications);
router.get('/stats', getDashboardStats);
router.get('/', getProjects);
router.post('/', upload.array('images', 10), createProject);
router.get('/:id', getProjectById);
router.put('/:id', upload.array('images', 10), updateProject);
router.delete('/:id', deleteProject);
router.put('/:id/status', updateProjectStatus);

router.post('/:id/comments', addComment);
router.get('/:id/comments', getComments);

module.exports = router;

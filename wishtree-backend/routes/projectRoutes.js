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

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dhrmpxdzo',
  api_key: process.env.CLOUDINARY_API_KEY || '974444864558684',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'BC-E-Ky9oVOdl_cA9-V72Cz-gUw'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wishtree_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
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

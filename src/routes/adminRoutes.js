const express = require('express');
const {
  getLogin,
  postLogin,
  logout,
  dashboard,
  getNewMember,
  createMember,
  getEditMember,
  updateMember,
  deleteMember,
  contentList,
  getNewContent,
  createContent,
  getEditContent,
  updateContent,
  deleteContent
} = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { imageUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/login', asyncHandler(getLogin));
router.post('/login', asyncHandler(postLogin));
router.post('/logout', requireAdmin, asyncHandler(logout));

router.get('/', requireAdmin, asyncHandler(dashboard));
router.get('/members/new', requireAdmin, asyncHandler(getNewMember));
router.post('/members', requireAdmin, imageUpload.single('photoFile'), asyncHandler(createMember));
router.get('/members/:id/edit', requireAdmin, asyncHandler(getEditMember));
router.post('/members/:id', requireAdmin, imageUpload.single('photoFile'), asyncHandler(updateMember));
router.post('/members/:id/delete', requireAdmin, asyncHandler(deleteMember));
router.get('/content/:type', requireAdmin, asyncHandler(contentList));
router.get('/content/:type/new', requireAdmin, asyncHandler(getNewContent));
router.post('/content/:type', requireAdmin, imageUpload.single('imageFile'), asyncHandler(createContent));
router.get('/content/:type/:id/edit', requireAdmin, asyncHandler(getEditContent));
router.post('/content/:type/:id', requireAdmin, imageUpload.single('imageFile'), asyncHandler(updateContent));
router.post('/content/:type/:id/delete', requireAdmin, asyncHandler(deleteContent));

module.exports = router;

const express = require('express');
const {
  home,
  memberProfile,
  dashboardPage,
  newsPage,
  calendarPage,
  mapPage,
  galleryPage,
  discussionsPage,
  recipesPage,
  archivesPage
} = require('../controllers/publicController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(home));
router.get('/dashboard', asyncHandler(dashboardPage));
router.get('/news', asyncHandler(newsPage));
router.get('/calendar', asyncHandler(calendarPage));
router.get('/map', asyncHandler(mapPage));
router.get('/gallery', asyncHandler(galleryPage));
router.get('/discussions', asyncHandler(discussionsPage));
router.get('/recipes', asyncHandler(recipesPage));
router.get('/archives', asyncHandler(archivesPage));
router.get('/members/:slug', asyncHandler(memberProfile));

module.exports = router;

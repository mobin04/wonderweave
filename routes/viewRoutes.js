const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();


router.get('/', authController.isUserLoggedIn, viewsController.getOverview);
router.get(
  '/tour/:slug',
  authController.isUserLoggedIn,
  authController.protect,
  viewsController.getTour,
);
router.get(
  '/login',
  authController.isUserLoggedIn,
  viewsController.getLoginForm,
);
router.get('/me', authController.protect, viewsController.getAccount);

module.exports = router;

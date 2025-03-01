const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);

// NESTED ROUTE EG:
// POST /tour/234fad4/reviews => Create a review for a tour
// GET /tour/234fad4/reviews => Get all reviews for a tour

//Tour router should use the review router in case it's ever encounter like this.
//This is actually again mounting the router. Like in the 'app.js'
router.use('/:tourId/reviews', reviewRouter); //router itself is a middleware

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

// Geospatial route
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithIn);

// Geospatial aggregation route(calculating distance)
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/') //mounting the router
  //first run protect middleware, if its success then run getAllTours
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router; // use because there is only one thing to export.

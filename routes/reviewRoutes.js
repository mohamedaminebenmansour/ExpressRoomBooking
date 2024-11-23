const express = require('express');
const reviewController = require('./../Controllers/reviewController');
const authController = require('./../Controllers/authController');
/*"{mergeParams: true} "why do we actualy need this here??
    It's because , by dfault each router has only access to the parameters
of their specific routes
with the mergeParams we have access to tourId*/
const router = express.Router({ mergeParams: true });
// POST /tour/rez6ezr56ezt/review
// POST /reviews

router.use(authController.protect)
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview);

module.exports = router;

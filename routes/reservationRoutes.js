const express = require('express');
const reservationController = require('./../Controllers/reservationController');
const authController = require('./../Controllers/authController');

/*"{mergeParams: true} "why do we actualy need this here??
    It's because , by dfault each router has only access to the parameters
of their specific routes
with the mergeParams we have access to tourId*/
const router = express.Router({ mergeParams: true });
// POST /tour/rez6ezr56ezt/reservation
// POST /reservations

router.use(authController.protect)
router
    .route('/')
    .get(reservationController.getAllReservations)
    .post(
        authController.restrictTo('user'),
        reservationController.setRoomUserIds,
        reservationController.createReservation
    );

router
    .route('/:id')
    .get(reservationController.getReservation)
    .delete(
        authController.restrictTo('user', 'admin'),
        reservationController.deleteReservation)
    .patch(
        authController.restrictTo('user', 'admin'),
        reservationController.updateReservation);

module.exports = router;

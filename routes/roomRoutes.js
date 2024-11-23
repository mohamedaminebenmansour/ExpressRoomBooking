const express = require('express');

const roomController = require('./../Controllers/roomController');
const authController = require('./../Controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const reservationRoutes = require('./../routes/reservationRoutes');

const router = express.Router();

router.use('/:roomId/reservations', reservationRoutes);
router.use('/:roomId/reviews', reviewRouter);
router
    .route('/top-5-cheap')
    .get(roomController.aliasTopRooms, roomController.getAllRooms)

router
    .route('/room-stats')
    .get(roomController.getRoomStats)

router
    .route('/rooms-within/:distance/center/:latlng/unit/:unit')
    .get(roomController.getroomsWithin)
// /tours-distance?distance=500&center=-40,45&unit=km
// /tours-distance/233/center/-40,50/unit/km
router.route('/distances/:latlng/unit/:unit').get(roomController.getDistances);
router
    .route('/')
    .get(roomController.getAllRooms)
    .post(
        authController.protect,
        authController.restrictTo('admin'),
        roomController.createRoom
    );
router
    .route('/:id')
    .get(roomController.getRoom)
    .patch(
        authController.protect,
        authController.restrictTo('admin'),
        roomController.uploadRoomImages,
        roomController.resizeRoomImages,
        roomController.updateRoom
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin'),
        roomController.deleteRoom);


module.exports = router;

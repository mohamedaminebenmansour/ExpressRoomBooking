const Reservation = require('../models/reservationModel');
const factory = require('./handlerFactroy')
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const User = require('../models/userModel');
exports.setRoomUserIds = (req, res, next) => {
    //allow nested tours
    if (!req.body.room) req.body.room = req.params.roomId
    if (!req.body.user) req.body.user = req.user.id;//from protected middle
    next();
}
exports.createReservation = catchAsync(async (req, res, next) => {
    const dateToCheckString = req.body.schedule.appointments[0].startDate;
    const duration = Number(req.body.schedule.appointments[0].duration);
    const room = req.body.room;
    const dateToCheckStart = new Date(dateToCheckString); // Corrected line
    const dateToCheckEnd = new Date(dateToCheckStart.getTime() + duration * 60000);
    console.log("I am here")
    // Check for existing reservations for the specified room and period
    const existingReservation = await Reservation.findOne({
        room: room,
        $or: [
            { 'schedule.appointments.startDate': { $lt: dateToCheckEnd }, 'schedule.appointments.endDate': { $gt: dateToCheckStart } },
            { 'schedule.appointments.startDate': { $gte: dateToCheckStart, $lt: dateToCheckEnd } },
            { 'schedule.appointments.endDate': { $gt: dateToCheckStart, $lte: dateToCheckEnd } },
        ],
    });

    if (existingReservation) {
        return res.status(409).json({
            message: "Reservation conflict: the room is already booked for this period.",
        });
    }
    const user = await User.findById(req.body.user)

    await new Email(user, "").sendConfirmValidation();

    const data = await Reservation.create(req.body);//"req.body" that's the data that comes with the post request
    // Create the new reservation


    res.status(201).json({
        status: 'ok',
        data
    });

})

exports.getAllReservations = factory.getAll(Reservation);

exports.getReservation = factory.getOne(Reservation);
exports.deleteReservation = factory.deleteOne(Reservation);
exports.updateReservation = catchAsync(async (req, res, next) => {
    console.log("--------------------------------")
    const { id } = req.params; // Assuming reservation ID is passed in the request parameters
    const dateToCheckString = req.body.schedule.appointments[0].startDate;
    const startDate = new Date(dateToCheckString);
    console.log("reservationId=", id)
    console.log("req=", req.body.schedule)

    // Calculate the new end date based on the updated start date and duration
    const duration = Number(req.body.schedule.appointments[0].duration);
    console.log("duration=", duration)
    const newEndDate = new Date(startDate.getTime() + duration * 60000);
    console.log("newEndDate=", newEndDate)

    // Check for existing reservations that conflict with the updated schedule
    console.log("check for existing reservations that conflict with the updated schedule")
    const existingReservation = await Reservation.findOne({
        room: req.body.room,
        _id: { $ne: id }, // Exclude the current reservation from the check
        $or: [
            { 'schedule.appointments.startDate': { $lt: newEndDate }, 'schedule.appointments.endDate': { $gt: startDate } },
            { 'schedule.appointments.startDate': { $gte: startDate, $lt: newEndDate } },
            { 'schedule.appointments.endDate': { $gt: startDate, $lte: newEndDate } },
        ],
    });
    console.log("existingReservation=", existingReservation)

    if (existingReservation) {
        return res.status(409).json({
            message: "Reservation conflict: the room is already booked for this period.",
        });
    }
    console.log("update the reservation");
    const reservation = await Reservation.findById(id);

    if (!reservation) {
        // Handle case where reservation with given id is not found
        return res.status(404).json({ message: 'Reservation not found' });
    }
    // Update the reservation
    console.log("reservation updated pre :", reservation.schedule);
    reservation.schedule.appointments[0].startDate = startDate;
    reservation.schedule.appointments[0].duration = duration;
    console.log("reservation updated post :", reservation.schedule);
    // Save the updated reservation
    console.log("save it!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!pre")
    const data = await reservation.save();
    console.log("save it!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!post")
    // Assuming you need to send an email after updating the reservation
    const user = await User.findById(reservation.user);
    console.log("user=", user)
    await new Email(user, "").sendUpdateConfirmation();
    console.log("data=", data.schedule)
    res.status(200).json({
        status: 'ok',
        data
    });
});


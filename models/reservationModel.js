// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');
const User = require('./userModel');
const Room = require('./roomModel');
const Email = require('../utils/email');

const reservationSchema = new mongoose.Schema(
    {
        createdAt: {
            type: Date,
            default: Date.now
        },
        room: {
            type: mongoose.Schema.ObjectId,
            ref: 'Room',
            required: [true, 'reservation must belong to a room.']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'reservation must belong to a user']
        },
        schedule: {
            appointments: [
                {
                    startDate: {
                        type: Date,
                        required: true,
                    },
                    duration: {
                        type: Number,
                        required: true,
                    },
                    endDate: {
                        type: Date
                    }
                }]
        }

    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


reservationSchema.virtual('schedule.appointments.calculatedEndDate').get(async function () {
    const reservation = this; // Assuming you need access to other reservation properties
    const startDate = await reservation.schedule.appointments[0].startDate; // Wait for startDate
    const duration = await reservation.schedule.appointments[0].duration;
    return new Date(startDate.getTime() + duration * 60000); // Convert duration to milliseconds
});

reservationSchema.methods.calculateEndDate = function () {
    if (this.schedule.appointments[0].startDate && this.schedule.appointments[0].duration) {
        const startDate = this.schedule.appointments[0].startDate;
        const durationInMinutes = this.schedule.appointments[0].duration;
        return new Date(startDate.getTime() + durationInMinutes * 60000);
    } else {
        return null; // Handle case where start date or duration is missing
    }
};

reservationSchema.pre('save', async function (next) {
    const newReservation = this; // Refers to the new reservation being saved

    // Calculate end date based on startDate and duration
    newReservation.schedule.appointments[0].endDate = new Date(
        newReservation.schedule.appointments[0].startDate.getTime() +
        newReservation.schedule.appointments[0].duration * 60000
    );

    next(); // Proceed with saving if calculation successful
});
reservationSchema.pre(/^find/, function (next) {
    // this.populate({
    //   path: 'tour',
    //   select: 'name'
    // }).populate({
    //   path: 'user',
    //   select: 'name photo'
    // });

    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});



// findByIdAndUpdate
// findByIdAndDelete

reservationSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    console.log("this r===", this.r);
    next();
});

reservationSchema.post(/^findOneAnd/, async function () {
    // await this.findOne(); does NOT work here, query has already executed
    console.log("fromPost=", this.r)
    await this.r.constructor.calcAverageRatings(this.r.room);
});




const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;

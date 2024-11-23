const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Room = require('../models/roomModel');
const Reservation = require('../models/reservationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
    //1) Get tour data from collection
    const tours = await Tour.find();
    //2)Building template

    //3) Render template using data from 
    res.status(200).render('overview', {
        title: 'All tours',
        tours: tours
    });
})

exports.getOverviewRoom = catchAsync(async (req, res) => {
    //1) Get tour data from collection
    const rooms = await Room.find();
    //2)Building template

    //3) Render template using data from 
    res.status(200).render('overviewroom', {
        title: 'All rooms',
        rooms
    });
})

exports.getTour = catchAsync(async (req, res, next) => {
    // 1) Get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    // 2) Build template
    // 3) Render template using data from 1)
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getRoom = catchAsync(async (req, res, next) => {
    // 1) Get the data, for the requested tour (including reviews and guides)
    const room = await Room.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!room) {
        return next(new AppError('There is no room with that name.', 404));
    }

    // 2) Build template
    // 3) Render template using data from 1)
    res.status(200).render('room', {
        title: `${room.name} room`,
        room
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
};
exports.getLoginSignUp = (req, res) => {
    res.status(200).render('signup', {
        title: 'create new a account'
    });
};
exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    });
};
exports.getForgotPasswrd = (req, res) => {
    res.status(200).render('forgotpasswrd', {
        title: 'forgotten passwrd'
    });
};

exports.resetPasswrd = (req, res) => {
    res.status(200).render('resetpassword', {
        title: 'forgotten passwrd'
    });
};

exports.roomsManagement = catchAsync(async (req, res) => {
    //1) Get tour data from collection
    const rooms = await Room.find();
    //2)Building template

    //3) Render template using data from 
    res.status(200).render('managerooms', {
        title: 'manage rooms',
        rooms
    });
})

exports.addRoom = catchAsync(async (req, res) => {

    res.status(200).render('addroom', {
        title: 'add room'
    });
})

exports.updateRoom = catchAsync(async (req, res) => {
    // console.log('req=' + req.body)
    const roomId = req.params.roomId;
    const room = await Room.findById(roomId);
    // console.log("room=", room)
    res.status(200).render('updateroom', {
        title: 'updateroom',
        room,
        roomId

    });
})

exports.bookRoom = catchAsync(async (req, res) => {
    // Retrieve the room details based on the roomId parameter
    const room = await Room.findById(req.params.roomId); // Assuming you have a Room model

    const reservations = await Reservation.find({ room: req.params.roomId });
    // Render the 'bookroom' template with the room details
    res.status(200).render('bookroom', {
        title: 'Book Room',
        roomId: req.params.roomId,
        room,// Pass the room object to the template
        reservations
    });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        }
    );
    // console.log("updatedUser", req.body);

    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Error if user POSTs passwrod data

    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updateMyPassword.',
                400
            )
        );
    }
    // 2) update user
    //body.role: adimn "Not allowed"
    const fileredBody = filterObj(req.body, 'name', 'email');
    const updatesUser = await User.findByIdAndUpdate(req.user.id, fileredBody, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: 'OK',
        data: {
            user: updatesUser
        }
    })
})

exports.usersManagement = catchAsync(async (req, res) => {
    //1) Get tour data from collection
    const users = await User.find();
    //2)Building template

    //3) Render template using data from 
    res.status(200).render('usermanagement', {
        title: 'user management',
        users
    });
})

exports.myBooking = catchAsync(async (req, res) => {
    // Retrieve the room details based on the roomId parameter


    const reservations = await Reservation.find({ user: req.user });
    // Render the 'bookroom' template with the room details
    res.status(200).render('myBookings', {
        title: 'Book Room',

        reservations
    });
});

exports.updateBook = catchAsync(async (req, res) => {
    // console.log('req=' + req.body)
    const bookId = req.params.bookId;
    console.log('bookId===================' + bookId)
    const reservation = await Reservation.findById(bookId);
    console.log('reservation===================' + reservation)
    const room = Room.findById(reservation.room)
    console.log("room=", room)
    res.status(200).render('updatebooking', {
        title: 'update booking',
        room,
        reservation,
        bookId

    });
})
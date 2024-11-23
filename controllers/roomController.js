const Room = require('../models/roomModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactroy')
const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');
// 
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadRoomImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'image', maxCount: 3 }
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeRoomImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.image) return next();

    // 1) Cover image
    req.body.imageCover = `room-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/rooms/${req.body.imageCover}`);

    // 2) Images
    req.body.image = [];

    await Promise.all(
        req.files.image.map(async (file, i) => {
            const filename = `room-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/rooms/${filename}`);

            req.body.image.push(filename);
        })
    );

    next();
});

exports.aliasTopRooms = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage';
    next();
}

exports.getAllRooms = factory.getAll(Room);
exports.getRoom = factory.getOne(Room, { path: 'reviews' }, { path: 'reservations' })
exports.createRoom = factory.createOne(Room);
exports.updateRoom = factory.updateOne(Room)
exports.deleteRoom = factory.deleteOne(Room);

exports.getRoomStats = catchAsync(async (req, res, next) => {
    const stats = await Room.aggregate([
        {
            $match: {
                ratingsAverge: {
                    $gte: 4.5
                }
            }
        },
        {
            $group: {
                _id: { $toUpper: '$name' },
                avgRating: { $avg: '$ratingsAverge' },
                numRooms: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }

            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ])
    //  console.log(stats);
    res.status(200).json({
        status: 'success',
        data: {
            stats: stats
        }
    });
})


exports.getroomsWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit == "mi" ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng) {
        next(new AppError('Please provide latiture and logitude in the format lat,lng', 400));
    }
    const rooms = await Room.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    })
    //  console.log(distance, lat, lng, unit)
    res.status(200).json({
        status: 'success',
        results: rooms.length,
        data: {
            rooms: rooms
        }
    })
})

// /distances/:latlng/unit/:/unit

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitutr and longitude in the format lat,lng.',
                400
            )
        );
    }

    const distances = await Room.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});
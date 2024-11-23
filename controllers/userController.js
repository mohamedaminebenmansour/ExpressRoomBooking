const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { findByIdAndUpdate } = require('../models/tourModel');
const factory = require('./handlerFactroy')
const multer = require('multer');
const sharp = require('sharp');
/*
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }
});*/
const multerStorage = multer.memoryStorage();//buffer
//const upload = multer({ dest: 'public/img/users' })

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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    //console.log("sharp")
    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObject = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el))
            newObject[el] = obj[el];
    })
    return newObject;
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}
exports.getAllUsers = factory.getAll(User);
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yed defined! please use /signup instead'
    })
}
exports.getUser = factory.getOne(User);

//Do not update passwrds with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);



exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Error if user POSTs passwrod data
    //console.log("req.file=", req.file)
    //console.log("res.body=", req.body)
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
    if (req.file) fileredBody.photo = req.file.filename;
    const updatesUser = await User.findByIdAndUpdate(req.user.id, fileredBody, {
        new: true,
        runValidators: true
    });
    //console.log("updatesUser=", updatesUser)
    res.status(200).json({
        status: 'OK',
        data: {
            user: updatesUser
        }
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })
    res.status(204).json({
        status: 'OK',
        data: null
    })
})
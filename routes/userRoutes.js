const express = require('express');
const userController = require('../Controllers/userController');
const authController = require('../Controllers/authController');




const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgetPassword', authController.forgotPasswrd);
router.patch('/resetPassword/:token', authController.resetPassword);

/*protect all the routes that comes after this line "router.use(authController.protect);
that because middelware runs in sequence" */
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMe',
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
);
/*We are not actually delete a user from the database */
router.delete('/deleteMe', userController.deleteMe);
router.get('/me',
    userController.getMe, userController.getUser);

//
router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)


module.exports = router;
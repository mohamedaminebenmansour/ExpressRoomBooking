const Review = require('./../models/reviewModel');
const factory =require('./handlerFactroy')
exports.setTourUserIds = (req, res, next) => {
    //allow nested tours
    if(!req.body.tour) req.body.tour = req.params.tourId
    if(!req.body.user) req.body.user = req.user.id;//from protected middle
    next();
}

exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review); 
exports.getReview =factory.getOne(Review);
exports.deleteReview =factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
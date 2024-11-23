const { Model } = require('mongoose');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures')
/** I must learn JavaScript closures */
exports.deleteOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndDelete(req.params.id)
  if (!doc) {
    return next(new AppError('document not found', 404));
  }
  res.status(204).json({
    status: 'OK',
    data: null
  })
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!doc) {
    return next(new AppError('document not found', 404));
  }
  res.status(200).json({
    status: 'OK',
    data: {
      data: doc
    }
  }
  )
})
exports.createOne = Model => catchAsync(async (req, res, next) => {
  const newDoc = await Model.create(req.body);//"req.body" that's the data that comes with the post request
  res.status(201).json({
    status: 'ok',
    data: {
      data: newDoc // Sending the newly created tour in the response 
    }
  });
})

exports.getOne = (Model, popOptinos) => catchAsync(async (req, res, next) => {
  let query = Model.findById(req.params.id);
  if (popOptinos) query = query.populate(popOptinos);
  const doc = await query;
  if (!doc) {
    return next(new AppError('document not found', 404));
  }
  res.status(200).json({
    status: 'OK',
    data: {
      doc
    }
  });
})


exports.getAll = Model => catchAsync(async (req, res, next) => {
  //to allow for nested GET reviews on tour
  let filter = {}
  if (req.params.tourId) filter = { tour: req.params.tourId }
  const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const docs = await features.query;
  //  const docs = await features.query.explain();
  res.status(200).json({
    status: 'OK',
    results: docs.length,
    data: {
      data: docs
    }
  });
})
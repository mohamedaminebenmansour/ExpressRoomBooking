const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema({
  name:
  {
    type: String,
    required: [true, "A tour must have a name "],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour name must have less or equal then 40 characters'],
    minlength: [10, 'A tour name must have more or equal then 10 characters']
    // validate: [validator.isAlpha, 'Tour name must only contain characters']

  },
  slug: String,
  duration:
  {
    type: Number,
    required: [true, "A tour must have a duration"]
  },
  maxGroupSize:
  {
    type: Number,
    required: [true, "A tour must have a maxGroupSize"]
  },
  difficulty:
  {
    type: String,
    required: [true, "A tour must have a difficulty"],
    enum: {// only for Strings
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium, difficult'
    }
  },
  rating:
  {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0']
  },
  ratingsAverge:
  {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: val => Math.round(val * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 4.5
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"]
  },
  priceDiscount: {
    type: Number,
    validate: function (val) {
      //this only points to current doc on NEW document creation
      return val < this.price;
    },
    message: 'Discount price ({VALUE}) should be below regular price'
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  image: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  }
  ,

  startLocation: {//new object with tow fields
    //GeoJSON
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],//that basically means the coordinates that we expect an array of numbers
      address: String,
      description: String
    }
  },
  /*In order to really create new documents and theb embed them into another document
  We actually need to create an array*/

  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],

},

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
    /*we cannot use this virtual property here in a query, because they're technically not part of the database.
    So we can not say, for example,tour.find where duration weeks is equal to one. That's not gonna work, 
    again because this property is not actually part of the database. */
  });
/*
my Questions here:
1)How do we decided which field we actually need to index??
2)why don"t we set indexes on all the fields??
after my research I find my response
1)
    a. Identify frequently queried fields: Analyze your application's queries to identify which fields are frequently used in your 
    find, update, delete, and aggregate operations. These are good candidates for indexing.

    b. Consider fields used in sorting and filtering: If your queries involve sorting or filtering based on certain fields, 
    those fields should be indexed.

    c. Analyze the cardinality of fields: Fields with high cardinality (i.e., a large number of unique values) 
    are good candidates for indexing because they can help narrow down search results efficiently.

    d. Consider compound indexes: If your queries often involve multiple fields together, consider creating compound indexes (indexes that include multiple fields). This can improve the efficiency of queries that filter or sort on multiple criteria.
    
2)While indexing can improve query performance, it also has drawbacks:

    a. Increased storage space: Indexes consume additional storage space. Creating indexes on every field can significantly 
    increase storage requirements, especially for large collections.

    b. Impact on write performance: Indexes need to be updated whenever a document is inserted, updated, or deleted. 
    Adding indexes to every field can increase the overhead of these operations, potentially impacting write performance.

    c. Maintenance overhead: Managing indexes requires additional overhead. This includes monitoring index usage, 
    rebuilding indexes when necessary, and considering index strategies as the application evolves.

    d. Diminishing returns: Indexes are most beneficial for fields that are frequently queried or used for sorting/filtering. 
    Indexing fields that are rarely queried may not provide significant performance benefits but can still incur the aforementioned costs.

    Therefore, it's essential to carefully consider the trade-offs and only index fields that are critical for query performance. Regularly analyze query patterns and adjust indexing strategies as needed to ensure optimal performance.

  */
//tourSchema.index({price:1})
tourSchema.index({ price: 1, ratingsAverge: -1 });
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })
/*Virtual properties are basically fields that we can define on our schema but that will not be persisted.
So they will not be saved into the database in order to save us some space there.And most of the time, of course,
we want to really save our data to the database, but virtual properties make a lot of sense for fields that 
can be derived from one another. For example a conversion from miles to kilometers,it doesn't make sense to store 
these two fields in a database if we can easily convert one to the other */
/*I used this regular function here because remember, an arrow function does not get its own "this" keyword.
In here we actually need the "this" keyword because the disk keyword in this caseis going to be pointing to the current document.
And so usually when we want to use this,then we should always use a regular function. */
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//VIRTUAL populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',//this is the name of the field in other model (on reviewModel in our case)
  localField: '_id',
})

tourSchema.virtual('reservations', {
  ref: 'Reservation',
  foreignField: 'tour',//this is the name of the field in other model (on reviewModel in our case)
  localField: '_id',
})

//Document Middelware: runs before .save() and .create() not .insertMany()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
})

tourSchema.pre('save', async function (next) {
  if (!this.guides) {
    return next(); // or handle this case as needed
  }

  const guidesPromises = this.guides.map(async id => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});

/*
 tourSchema.pre('save', function(next){
  console.log('wil save document ...');
  next();
 })
tourSchema.post('save', function(doc,next){
  console.log(doc);
  next();
})
*/

// QUERY MIDDLEWARE
/*query middleware allows us to run functions before or after a certain query is executed.
And so let's now add a pre-find hook, so basically, a middleware that is gonna run
before any find query is executed.
 */

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-passwordConfirm -__v"
  })
  next();
})

//AGGREGATION MIDDLEWARE
/*
tourSchema.pre('aggregate', function(next){
  this.pipeline().unshift({
    $match : {
      secretTour: { $ne: true }
    }
  })
  console.log(this.pipeline());
  next();
})
*/
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
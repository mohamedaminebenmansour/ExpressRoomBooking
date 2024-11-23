const path = require('path');
const express = require('express');

const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const roomRouter = require('./routes/roomRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const reservationRouter = require('./routes/reservationRoutes')
const cors = require('cors');
const app = express(); // Creating an instance of Express application

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// 1) Global MIDDLEWARES
//set security HTTP headers
app.use(helmet());//put it really in the beginning
//development looging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// limit resuests from same API
/*we need to find a balancewhich work best for our application
For ex : If we're building an API which needs a lot of requests for one IP */
const limiter = rateLimit({
  max: 80,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use(cors());
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// DATA sanitization against NOsql query injection " "email": {"$gt":""}"
/*so what's this middleware does is to lock at the resuest body, the request 
query string and Request.Params and then it will basically filter out all of the
dollar signs and dots because that's how monogoDB operators are written */
app.use(mongoSanitize());
// DATA sanitization against XSS attacks (XSS Cross-Site Scripting )
/*This middleware will clean any user input from malicious HTML code , basically
Imagine that an attacker would try to insert some malicious HTML code with some JS 
code attached to it.
If that wwould then later be injected into our HTML site,it could really create some
damage then. Using this middleware, we prevent that basically by converting all these
HTML symbols */
app.use(xss());

// Prevent parameter pollution

app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));



// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies.jwt)
  next();
});
app.use(function (req, res, next) { res.setHeader('Content-Security-Policy', "script-src 'self' cdnjs.cloudflare.com"); return next(); });

// 3) ROUTES
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/rooms', roomRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/reservations', reservationRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

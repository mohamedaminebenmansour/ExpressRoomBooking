/*REMEMBER:: evertying that is not related to Express we're gonna do it outiside app.js file */
const dotenv = require('dotenv');
const mongoose = require('mongoose')



dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
  console.log('Uncaught Exception!! Shutting down ...');
  console.log(err.name, err.message);

  /*we really need to crach our app because after these was an uncaught exception
  the entire node process is in a so cold UNCLEAN STATE.
    So to fix that the process need to terminate and then too be restard*/
  process.exit(1);


})

const app = require('./app');

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB)
  .then(con => console.log("DB connection established"))

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection!! Shutting down ...');
  server.close(() => {
    process.exit(1);// optional
  })

})

//console.log(x);// exemple of Uncaught Exception x in not defined
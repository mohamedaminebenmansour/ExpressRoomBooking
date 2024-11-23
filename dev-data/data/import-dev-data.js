const fs = require("fs");

const mongoose = require('mongoose');
//const Tour = require('./../../models/tourModel');
const Room = require('./../../models/roomModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });


//const app = require('./app');

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(con =>
        console.log("DB connection established"))


    .catch(err => console.error('Error connecting to MongoDB:', err));
//convert into a JS object using JSON.parse
/*const tours= JSON.parse(fs.readFileSync('./tour-simple.json','utf-8'));
error path: with "./" not the current folder is actually where the node application was actually started*/
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const rooms = JSON.parse(fs.readFileSync(`${__dirname}/rooms.json`, 'utf-8'));
//Import Data Into MongoDB
//console.log(tours)
const importData = async () => {
    try {
        await Room.create(rooms, { validateBeforeSave: false })
        //await Tour.create(tours, { validateBeforeSave: false });
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log("Data Imported");
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

//Delete all data from collection ( from DB )
const deletDate = async () => {
    try {
        await Room.deleteMany();
        //await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("data successfully deleted");
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deletDate();
}
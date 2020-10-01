const mongoose = require('mongoose');
const db = 'mongodb://localhost:27017/ChatDB'

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("Connected to the Database");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}
module.exports = connectDB;


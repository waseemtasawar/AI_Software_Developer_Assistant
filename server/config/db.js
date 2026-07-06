const mongoose = require('mongoose');
const dotenv = require('dotenv');


const ConnectDB = process.env.DATABASE.replace(
    '<PASSWORD>', 
    process.env.DATABASE_PASSWORD);


mongoose.connect(ConnectDB)
.then(()=>{
    console.log('DB connection successful')
})
.catch((err)=>{
    console.log('DB connection failed', err)
})

module.exports = ConnectDB;
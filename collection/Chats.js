const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ChatSchema = new Schema({
    id: String,
    user:[],
    endedAt: Date,
    messages: []  
})
module.exports = Chat = mongoose.model('chat', ChatSchema)
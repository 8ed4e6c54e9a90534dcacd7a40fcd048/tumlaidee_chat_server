const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const connectDB = require('./config/db');
const port = 4445;
const app = express()
const server = http.createServer(app)
const io = socketIO(server)
connectDB();

const Chats = require('./collection/Chats')

io.on('connection', socket => {
    // เมื่อ Client มีเชื่อมต่อ
    console.log('user connection', socket.id)
    // console.log('============================')
    // // เมื่อ Client ตัดการเชื่อมต่อ
    // client.on('disconnect', () => {
    // console.log('============================')

    socket.on('send message', async (endedAt, user, target, msg, isPicture) => {
        console.log("_id", endedAt);
        console.log("user", user);
        console.log("target", target);
        console.log("msg", msg);


        // const chatList = await Chats.find({ $and: [{ 'user': { $in: [user] } }, { 'user': { $in: [target] } }] });
        const chatList = await Chats.find({ 'endedAt': endedAt });
        console.log("chatList", chatList);

        if (!chatList.length) {
            const new_Date = + new Date();
            const Chat = new Chats({
                user: [user, target],
                endedAt: new_Date,
                messages: [
                    {
                        user: target,
                        message: isPicture === true ? '' : msg,
                        isRead: true
                    },
                ]
            });
            Chat.save(function (err, doc) {
                if (err) return console.error(err);
                console.log("Document inserted succussfully!");
              
            });
        } else {
            let messages = {
                user: user,
                message: isPicture === true ? '' : msg,
                isRead: true
            }


            Chats.updateOne({ 'endedAt': endedAt }, {
                $push:
                    { 'messages': messages }
            }, { upsert: true }, function (err, docs) {
               
            });
            const newChatList = await Chats.find({ 'endedAt': endedAt });
            io.sockets.emit('receive message', newChatList);
        }

    })
    socket.on('read message', async (user, target) => {
        console.log("user", user);
        console.log("target", target);
        const chatList = await Chats.find({ $and: [{ 'user': { $in: [user] } }, { 'user': { $in: [target] } }] });
        let newData = [];
        if (!chatList.length) {
            const new_Date = + new Date();
            const Chat = new Chats({
                user: [user, target],
                endedAt: new_Date,
                messages: []
            });
            Chat.save(function (err, doc) {
                if (err) return console.error(err);
                console.log("Document inserted succussfully!");
            });
            const newchatList = await Chats.find({ $and: [{ 'user': { $in: [user] } }, { 'user': { $in: [target] } }] });

            newData = newchatList
        } else {
            newData = chatList

        }
        io.sockets.emit('receive message', newData);

    });

})

// _remove = (client_id) => {
//     for (let i = 0; i < user_in_page.length; i++) {
//         user_in_page[i].users = user_in_page[i].users.filter(val => val.client_id !== client_id)
//     }
// }
server.listen(port, () => console.log(`Listening on port ${port}`))
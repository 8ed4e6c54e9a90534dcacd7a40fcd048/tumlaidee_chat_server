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

    socket.on('send message', async (_id, msg, limit) => {
        console.log("limit",limit);

        let messages = {
            user: msg.user,
            message: msg.isPicture === true ? '' : msg.msg,
            isRead: true
        }
        Chats.updateOne({ '_id': _id }, {
            $push:
                { 'messages': messages }
        }, { upsert: true }, function (err, docs) {
        });
        await Chats.find({ "_id": _id }, function (err, chats) {
            console.log("chats", chats);
            let new_messages = []
            let newdata = (chats !== undefined ? chats[0].messages.reverse() : [])
            for (let i = 0; i < newdata.length; i++) {
                if (i < limit) {
                    new_messages.push(newdata[i])
                } else {
                    break;
                }
            }
        console.log("new_messages",new_messages);

            const res = {
                _id: chats[0]._id,
                user: chats[0].user,
                endedAt: chats[0].endedAt,
                res_messages: new_messages.reverse()
            }
            io.sockets.emit('receive message' + _id, res);
        });

    })
    socket.on('read message', async (user, target, limit) => {
        console.log("limit",limit);
        const chatList = await Chats.find({ $and: [{ 'user': { $in: [user] } }, { 'user': { $in: [target] } }] });
        console.log("chatList",chatList);

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
            const chatList = await Chats.find({ $and: [{ 'user': { $in: [user] } }, { 'user': { $in: [target] } }] });
            io.sockets.emit('receive new message' + user + target, chatList);

        } else {
            await Chats.find({ $and: [{ 'user': { $in: [user] } }, { 'user': { $in: [target] } }] }, function (err, chats) {
                let new_messages = []
            console.log("chats", chats);

                let newdata = (chats !== undefined ? chats[0].messages.reverse() : [])
        console.log("newdata",newdata);

                for (let i = 0; i < newdata.length; i++) {
                    if (i < limit) {
                        new_messages.push(newdata[i])
                    } else {
                        break;
                    }
                }

      
        console.log("new_messages",new_messages);

                const res = {
                    _id: chats[0]._id,
                    user: chats[0].user,
                    endedAt: chats[0].endedAt,
                    res_messages: new_messages.reverse()
                }
                io.sockets.emit('receive new message' + user + target, res);
            });
        }


    });

})

server.listen(port, () => console.log(`Listening on port ${port}`))
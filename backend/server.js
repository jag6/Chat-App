const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const config = require('./config');
const userRouter = require('./routers/userRouter');

//use static content
app.use(express.static('public')); 
app.set('view engine', 'ejs');

//use userrouter
app.use('/', userRouter);

//get index page
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});
//get room page
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

//set up socket io server
io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        //join room
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        //leave room
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });
    socket.on('message', (msg) => {
        io.emit('message', msg);
    });
});

//set up node server
server.listen(config.PORT, () => {
    console.log(`server on http://localhost:${config.PORT}`);
});
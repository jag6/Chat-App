const express = require('express');
const mongoose = require('mongoose');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const config = require('./config');
const userRouter = require('./routers/userRouter');

mongoose.connect(config.MONGODB_URL,
    {   useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('connected to mongodb');
    }).catch((error) => {
        console.log(error.reason);
    });

//use static content
app.use(express.static('public')); 
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false })); //recognize request objects as strings or arrays
app.use(express.json()); //read request's body section

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
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');

//use static content
app.use(express.static('public')); 
app.set('view engine', 'ejs');

//get index page
app.get('/', (req, res) => {
    res.render('index');
});

//set up socket io server
const io = new Server(server);

io.on('connection', (socket) => {
    socket.on('message', (msg) => {
        io.emit('message', msg);
    });
});

//set up node server
const port = 3000;
server.listen(port, () => {
    console.log(`server on http://localhost:${port}`);
});
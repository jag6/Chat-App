window.addEventListener('load', () => {
    const socket = io('/');

    //peerjs --port 3001
    const myPeer = new Peer(undefined, {
        host: '/',
        port: '3001'
    });
    const videoGrid = document.getElementById('video-grid');
    const myVideo = document.createElement('video');
    myVideo.muted = true;
    const peers = {};

    //add and append video, both yours and others
    const addVideoStream = (video, stream) => {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
        videoGrid.append(video);
    };

    //connect to new user(s)
    const connectToNewUser = (userId, stream) => {
        const call = myPeer.call(userId, stream);
        const video = document.createElement('video');
        call.on('stream', (userVideoStream) => {
            addVideoStream(video, userVideoStream);
        });
        call.on('close', () => {
            video.remove();
        });
        peers[userId] = call;
    };

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        addVideoStream(myVideo, stream);

        myPeer.on('call', (call) => {
            call.answer(stream);
            const video = document.createElement('video');
            call.on('stream', (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on('user-connected', (userId) => {
            connectToNewUser(userId, stream);
            console.log(userId + ' connected');
        })
    });

    socket.on('user-disconnected', (userId) => {
        if(peers[userId]) {
            peers[userId].close();
            console.log(userId + ' left');
        }
    });

    myPeer.on('open', (id) => {
        socket.emit('join-room', ROOM_ID, id)
    });


    //display chatbox
    const chatbox = document.getElementById('chatbox');
    document.getElementById('chat-btn').addEventListener('click', () => {
        chatbox.style.display = 'flex';
    });
    document.getElementById('close-chatbox').addEventListener('click', () => {
        chatbox.style.display = 'none';
    });

    //send messages with chatbox
    const messageForm = document.getElementById('message-form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    messageForm.addEventListener('click', () => {
        if(input.value) {
            socket.emit('message', input.value);
            input.value = '';
        }
    });

    input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            messageForm.click();
        }
    });

    socket.on('message', (msg) => {
        const item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
    });
});
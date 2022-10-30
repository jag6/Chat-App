//message box for form success or error
const showMessage = (message, callback) => {
    document.getElementById('message-overlay').innerHTML =
    `
        <div>
            <div id="message-overlay-content">
                <p>${message}</p>
            </div>
            <button id="message-overlay-close-btn" class="message-overlay-close-btn">OK</button>
        </div>
    `;
    document.getElementById('message-overlay').classList.add('active');
    document.getElementById('message-overlay-close-btn').addEventListener('click', () => {
        document.getElementById('message-overlay').classList.remove('active');
        if(callback) {
            callback();
        }
    });
};

//set userinfo into session storage
const setUserInfo = (
    {
        _id = '',
        email = '',
        password = ''
    }) => 
    {
        sessionStorage.setItem('userInfo', JSON.stringify({
            _id,
            email,
            password
        })
    );
};

//login API
const logginIn = async ({ email, password }) => {
    try {
        const getUrl = window.location.href;
        const response = await axios ({
            url: getUrl,
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            data: {
                email,
                password
            }
        });
        if(response.statusText !== 'OK') {
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err) {
        console.log(err);
        return { error: err.response.data.message || err.message };
    }
};

//login 
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = await logginIn({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    });
    if(data.error) {
        showMessage(data.error);
    }else {
        setUserInfo(data);
        showMessage('Login Successful');
        document.getElementById('login-form-container').style.display = 'none';
        videoMessage();
    }
});

//video and send messages
const videoMessage = () => {
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

    //play and append video, both yours and others
    const addVideoStream = (video, stream) => {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
        videoGrid.append(video);
    };

    //connect and remove users
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
    }).then((stream) => {
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
        });
    })
    .catch((err) => {
        console.log('Error: ' + err);
    });

    socket.on('user-disconnected', (userId) => {
        if(peers[userId]) {
            peers[userId].close();
            console.log(userId + ' left');
        }
    });

    myPeer.on('open', (id) => {
        socket.emit('join-room', ROOM_ID, id);
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
}
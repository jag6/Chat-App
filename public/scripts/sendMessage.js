window.addEventListener('load', () => {
    const socket = io();

    const messages = document.getElementById('messages');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('input');

    sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if(input.value) {
            socket.emit('message', input.value);
            input.value = '';
        }
    });

    input.addEventListener('keyup', (e) => {
        e.preventDefault();
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });

    socket.on('message', (msg) => {
        const item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });
});
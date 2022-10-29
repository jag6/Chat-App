const chatbox = document.getElementById('chatbox');

document.getElementById('chat-btn').addEventListener('click', () => {
    chatbox.style.display = 'flex';
});

document.getElementById('close-chatbox').addEventListener('click', () => {
    chatbox.style.display = 'none';
});
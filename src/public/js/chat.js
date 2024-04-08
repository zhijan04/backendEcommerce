function initChat() {
    const socket = io();

    socket.on('chat history', (messages) => {
        messages.forEach((message) => {
            appendMessage(`${message.user}: ${message.message}`);
        });
    });

    socket.on('chat message', (data) => {
        appendMessage(`${data.user}: ${data.message}`);
    });

    function submitMessage() {
        const user = prompt("Ingrese su nombre de usuario:");
        const message = $('#m').val();
        if (message) {
            socket.emit('chat message', { user: user, message: message });
            $('#m').val('');
        }
    }

    function appendMessage(text) {
        $('#messages').append($('<li>').text(text));
    }

    return {
        submitMessage: submitMessage
    };
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = initChat;
}
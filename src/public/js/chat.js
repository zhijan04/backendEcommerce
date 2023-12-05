function initChat() {
    const socket = io();

    // Recibir mensajes antiguos al cargar la página
    socket.on('chat history', (messages) => {
        messages.forEach((message) => {
            appendMessage(`${message.user}: ${message.message}`);
        });
    });

    // Manejar nuevos mensajes
    socket.on('chat message', (data) => {
        appendMessage(`${data.user}: ${data.message}`);
    });

    // Enviar mensajes al servidor
    function submitMessage() {
        const user = prompt("Ingrese su nombre de usuario:");
        const message = $('#m').val();
        if (message) {
            socket.emit('chat message', { user: user, message: message });
            $('#m').val('');
        }
    }

    // Función para agregar mensajes a la lista
    function appendMessage(text) {
        $('#messages').append($('<li>').text(text));
    }

    // Exponer la función para enviar mensajes
    return {
        submitMessage: submitMessage
    };
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = initChat;
}
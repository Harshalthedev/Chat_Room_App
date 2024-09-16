var stompClient = null;
var isConnected = false;  // Track connection status

function sendMessage() {
    let messageContent = $("#message-value").val().trim();

    // Only send a message if the input field is not empty
    if (messageContent !== "") {
        let jsonOb = {
            name: localStorage.getItem("name"),
            content: messageContent
        };

        stompClient.send("/app/message", {}, JSON.stringify(jsonOb));

        // Clear the input field after sending the message
        $("#message-value").val('');
    }
}

function connect() {
    // Avoid reconnecting if already connected
    if (isConnected) {
        console.log("Already connected!");
        return;
    }

    let socket = new SockJS("/server1");
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log("Connected: " + frame);
        isConnected = true;

        $("#name-from").addClass('d-none');
        $("#chat-room").removeClass('d-none');

        // Hide footer in the chat room
        $("footer").addClass('d-none');

        // Subscribe to the topic and handle incoming messages
        stompClient.subscribe("/topic/return-to", function (response) {
            showMessage(JSON.parse(response.body));
        });
    }, function (error) {
        // Handle connection error
        console.error("Connection error: " + error);
        alert("Failed to connect to the chat server. Please try again later.");
    });
}

function showMessage(message) {
    $("#message-container-table").append(
        `<tr><td><b>${message.name} :</b> ${message.content}</td></tr>`
    );

    // Scroll directly to the bottom of the table container for smooth message flow
    let messageContainer = $("#message-container-table").closest('.table-responsive');
    messageContainer.scrollTop(messageContainer.prop("scrollHeight"));
}

$(document).ready(() => {
    function login() {
        let name = $("#name-value").val().trim();
        if (name !== "") {
            localStorage.setItem("name", name);
            $("#name-title").html(`Welcome, <b>${name}</b>`);
            connect();  // Connect to the chat server
        } else {
            alert("Please enter a valid name!");
        }
    }

    $("#login").click(() => {
        login();
    });

    // Trigger login when Enter key is pressed in the name input field
    $("#name-value").keydown((e) => {
        if (e.key === "Enter" || e.keyCode === 13) {
            login();
        }
    });

    $("#send-btn").click(() => {
        sendMessage();
    });

    // Send message when Enter key is pressed in the message input field
    $("#message-value").keydown((e) => {
        if ((e.key === "Enter" || e.keyCode === 13) && $("#message-value").val().trim() !== "") {
            sendMessage();
        }
    });

    $("#logout").click(() => {
        localStorage.removeItem("name");
        if (stompClient !== null && isConnected) {
            stompClient.disconnect(() => {
                console.log("Disconnected from the server");
            });

            // Reset UI
            $("#name-from").removeClass('d-none');
            $("#chat-room").addClass('d-none');

            // Show footer again on logout
            $("footer").removeClass('d-none');

            isConnected = false;  // Reset connection status
        } else {
            console.log("No active connection to disconnect.");
        }
    });
});

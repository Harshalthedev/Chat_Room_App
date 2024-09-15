var stompClient = null;

function sendMessage() {
    let jsonOb = {
        name: localStorage.getItem("name"),
        content: $("#message-value").val()
    };

    stompClient.send("/app/message", {}, JSON.stringify(jsonOb));

    // Clear the input field after sending the message
    $("#message-value").val('');
}

function connect() {
    let socket = new SockJS("/server1");

    stompClient = Stomp.over(socket);

    stompClient.connect({}, function(frame) {
        console.log("Connected : " + frame);

        $("#name-from").addClass('d-none');
        $("#chat-room").removeClass('d-none');

        // Subscribe to the topic and handle incoming messages
        stompClient.subscribe("/topic/return-to", function(response) {
            showMessage(JSON.parse(response.body));
        });
    });
}

function showMessage(message) {
    // Removed inline color styling
    $("#message-container-table").append(
        `<tr><td><b>${message.name} :</b> ${message.content}</td></tr>`
    );

    // Scroll directly to the bottom of the table container for smooth message flow
    var messageContainer = $("#message-container-table").closest('.table-responsive');
    messageContainer.scrollTop(messageContainer.prop("scrollHeight"));
}

$(document).ready((e) => {
    function login() {
        let name = $("#name-value").val();
        if (name.trim() !== "") {  // Check if the input is not empty
            localStorage.setItem("name", name);
            $("#name-title").html(`Welcome, <b>${name}</b>`);
            connect();
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
        if (e.key === "Enter" || e.keyCode === 13) {
            sendMessage();
        }
    });

    $("#logout").click(() => {
        localStorage.removeItem("name");
        if (stompClient !== null) {
            stompClient.disconnect();

            $("#name-from").removeClass('d-none');
            $("#chat-room").addClass('d-none');
            console.log("Disconnected:", stompClient);
        }
    });
});

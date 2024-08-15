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
    $("#message-container-table").append(
        `<tr><td style="color: #FFD700;"><b>${message.name} :</b> ${message.content}</td></tr>`
    );

    // Scroll to the bottom to ensure the latest message is visible
    var messageContainer = $("#message-container-table").parent();
    messageContainer.scrollTop(messageContainer[0].scrollHeight);
}

$(document).ready((e) => {
    function login() {
        let name = $("#name-value").val();
        if (name.trim() !== "") {  // Check if the input is not empty
            localStorage.setItem("name", name);
            $("#name-title").html(`Welcome , <b>${name}</b>`);
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
            console.log(stompClient);
        }
    });
});

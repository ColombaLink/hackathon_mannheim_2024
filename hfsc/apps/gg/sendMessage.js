let messages = [
    {
        "content": "Hi, I'm your AI assistant, here to help you find creative ways to minimize food waste. Just let me know which items need attention, and we'll craft some great deals together!",
        "role": "assistant"
    }

];

async function sendMessage() {
    /**
     * @typedef {import('@based/client').BasedClient} Client 
     * @type {Client}   
     */
    const client = window.client;

    console.log("message");
    var input = document.getElementById("userInput");
    var message = input.value.trim();
    if (message) {
        // Add user message to messages array
        messages.push({ role: 'user', content: message });

        // Clear input field
        input.value = "";

        // Call the backend and get the assistant's response
        let response = await client.call("sc:chat", { messages });

        // Add assistant message to messages array
        messages = response.messages

        // Update the chat body with filtered messages
        updateChatBody();

        // Simulate system response (if needed)
        setTimeout(function () {
            updateChatBody();
        }, 1000);
    }
}

function updateChatBody() {
    var chatBody = document.getElementById("chatBody");
    chatBody.innerHTML = ''; // Clear current chat

    // Filter out 'system' messages and show only 'user' and 'assistant' messages
    messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .forEach(m => {
            var messageDiv = document.createElement("div");
            messageDiv.classList.add("chat-message", m.role);
            messageDiv.textContent = m.content;
            chatBody.appendChild(messageDiv);
        });

    // Scroll to bottom of chat
    chatBody.scrollTop = chatBody.scrollHeight;
}


updateChatBody()
window.sendMessage = sendMessage;

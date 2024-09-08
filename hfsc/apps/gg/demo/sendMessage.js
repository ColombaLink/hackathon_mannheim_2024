let initialMessage = {
    "content": "<p>Hi, I'm your AI assistant, here to help you find creative ways to minimize food waste. Just let me know which items need attention, and we'll craft some great deals together!</p>",
    "role": "assistant"
}

let chatMessages = [
    {
        "role": "user",
        "content": "We have \"Croissants (6 pieces)\", \"Pain au Chocolat (2 pieces)\", and \"Baguettes (2 pieces)\" that are expiring soon. Can you give me some deals we can make from these items to attract customers?"
    },
    {
        "content": "<p>Absolutely! Here are a few ideas to attract customers:</p><ul><li><strong>Breakfast Bundle:</strong><br>Offer: 3 Croissants + 1 Pain au Chocolat<br>Price: Attractive discount for a perfect breakfast combo.</li><li><strong>French Delight Pack:</strong><br>Offer: 2 Baguettes + 2 Croissants<br>Price: Special price for a classic French experience.</li><li><strong>Sweet & Savory Duo:</strong><br>Offer: 1 Pain au Chocolat + 1 Baguette<br>Price: Discounted rate for a taste of sweet and savory.</li></ul><p>Consider adding a small coffee for an extra incentive. Let me know if you need more ideas!</p>",
        "role": "assistant"
    },
    {
        "role": "user",
        "content": "What sort of non-alcoholic beverages do you think would go well with these food items?"
    },
    {
        "content": "<p>Great question! Here are some non-alcoholic beverage options that pair well with these items:</p><ul><li><strong>Coffee or Espresso:</strong> Perfect for enjoying with croissants and pain au chocolat.</li><li><strong>Hot Chocolate:</strong> A warm and comforting option, especially with the sweet pastries.</li><li><strong>Fresh Orange Juice:</strong> Refreshing and adds a nice citrusy contrast.</li><li><strong>Herbal Tea:</strong> Light and aromatic, complements the subtle flavors of the pastries.</li></ul><p>Offering these as part of a combo can enhance the appeal!</p>",
        "role": "assistant"
    }
]

chatMessages = chatMessages.reverse()

let messages = [ initialMessage ]


async function sendMessage() {
    if(chatMessages.length <=0) return
    
    messages.push(chatMessages.pop())
    updateChatBody()
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
            messageDiv.innerHTML = m.content;
            chatBody.appendChild(messageDiv);
        });

    // Scroll to bottom of chat
    chatBody.scrollTop = chatBody.scrollHeight;
}

updateChatBody()
window.sendMessage = sendMessage;

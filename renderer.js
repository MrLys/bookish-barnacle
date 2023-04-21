const sendMessageButton = document.getElementById('send-message');
const messageInput = document.getElementById('input-message');
const messagesContainer = document.getElementById('messages-container');
const clearMessagesButton = document.getElementById('clear-messages'); // Get the clear button element
const darkThemeToggle = document.getElementById('darkThemeToggle');
const settingsButton = document.getElementById('settings-button');
const settingsDialog = document.getElementById('settings-dialog');
const settingsDialogClose = document.getElementById('settings-dialog-close');
const themeIcon = document.getElementById('theme-icon');
const showHistoryButton = document.getElementById("show-history");




// Load user's preference
const userPrefersDark = localStorage.getItem('userPrefersDark') === 'true';
darkThemeToggle.checked = userPrefersDark;
setTheme(userPrefersDark);

let messages = [];

function updateHistoryDialog(historyDialog) {
    const keys = Object.keys(messages).filter((key) => key.startsWith("auto-chat-"));

    if (keys.length === 0) {
        const noHistoryMessage = document.createElement('p');
        noHistoryMessage.innerText = 'No chat history found.';
        historyDialog.appendChild(noHistoryMessage);

    }
}

function appendMessage(message, isUser = true) {
    const formattedMessage = marked(message);
    const messageElement = document.createElement("div");
    const messageNameElement = document.createElement("span");

    messageNameElement.className = `${isUser ? "user" : "assistant"} message-name`;
    messageNameElement.innerText = isUser ? "You: " : "Assistant: ";
    messageElement.innerHTML = formattedMessage;
    messageElement.insertBefore(messageNameElement, messageElement.firstChild); // Insert the name before the message content

    role = isUser ? "user" : "assistant";
    messageElement.className = `${role} message-text`;

    messagesContainer.appendChild(messageElement);
    messages.push({ role: role, content: message });
    // If this is the first user message, set a chat storage name
    if (isUser && messages.length === 1) {
        let chatName = message.split(" ")[0];
        let index = 2;
        const storageKeyPrefix = 'auto-chat-';
        let storageKey = `${storageKeyPrefix}${chatName}`;

        // Check for duplicates
        while (localStorage.getItem(storageKey)) {
            storageKey = `${storageKeyPrefix}${chatName}-${index}`;
            index++;
        }

        localStorage.setItem(storageKey, JSON.stringify([]));
    }

    // Save the message to local storage
    const storageKey = `auto-chat-${messages[0].content.split(" ")[0]}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));

    document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightBlock(block);
    });
}

function showHistory() {
    // If a history dialog already exists, close and remove it
    const existingDialog = document.querySelector('.history-dialog');
    if (existingDialog) {
        existingDialog.remove();
        return;
    }

    const historyDialog = document.createElement("div");
    historyDialog.className = "history-dialog";
    updateHistoryDialog(historyDialog); // Update the call to updateHistoryDialog()

    const keys = Object.keys(localStorage).filter((key) => key.startsWith("auto-chat-"));

    if (keys.length !== 0) {
        keys.forEach((key) => {
            const chatName = key.substring(5);
            const chatItem = document.createElement("div");
            chatItem.className = "chat-item";
            chatItem.innerText = chatName;

            const restoreButton = document.createElement("button");
            restoreButton.innerText = "Restore";
            restoreButton.addEventListener("click", ((currentKey) => {
                return () => {
                    clearMessages();
                    messages = JSON.parse(localStorage.getItem(currentKey));
                    messages.forEach((message) => {
                        appendMessage(message.content, message.role === "user");
                    });
                    historyDialog.remove();
                };
            })(key));
            const deleteButton = document.createElement("button");
            deleteButton.innerText = "Delete";
            deleteButton.addEventListener("click", () => {
                localStorage.removeItem(key);
                chatItem.remove();
                updateHistoryDialog(historyDialog); // Update the call to updateHistoryDialog()
            });

            chatItem.appendChild(restoreButton);
            chatItem.appendChild(deleteButton);
            historyDialog.appendChild(chatItem);
        });
    }

    document.body.appendChild(historyDialog);
}
function setTheme(isDark) {
    const bodyElement = document.body;
    if (isDark) {
        // Enable dark theme
        const darkThemeStyles = document.createElement('link');
        darkThemeStyles.rel = 'stylesheet';
        darkThemeStyles.href = './dark-theme.css';
        darkThemeStyles.id = 'darkThemeStyles';
        document.head.appendChild(darkThemeStyles);
        bodyElement.classList.add('dark-theme'); // Add dark-theme class to body
        themeIcon.style.backgroundImage = "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-moon\"%3E%3Cpath d=\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\"%3E%3C/path%3E%3C/svg%3E')";
    } else {
        // Disable dark theme
        const darkThemeStyles = document.getElementById('darkThemeStyles');
        if (darkThemeStyles) {
            darkThemeStyles.remove();
        }
        bodyElement.classList.remove('dark-theme'); // Remove dark-theme class from body
        themeIcon.style.backgroundImage = "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-sun\"%3E%3Ccircle cx=\"12\" cy=\"12\" r=\"5\"%3E%3C/circle%3E%3Cline x1=\"12\" y1=\"1\" x2=\"12\" y2=\"3\"%3E%3C/line%3E%3Cline x1=\"12\" y1=\"21\" x2=\"12\" y2=\"23\"%3E%3C/line%3E%3Cline x1=\"4.22\" y1=\"4.22\" x2=\"5.64\" y2=\"5.64\"%3E%3C/line%3E%3Cline x1=\"18.36\" y1=\"18.36\" x2=\"19.78\" y2=\"19.78\"%3E%3C/line%3E%3Cline x1=\"1\" x2=\"3\" y1=\"12\" y2=\"12\"%3E%3C/line%3E%3Cline x1=\"21\" x2=\"23\" y1=\"12\" y2=\"12\"%3E%3C/line%3E%3Cline x1=\"4.22\" y1=\"19.78\" x2=\"5.64\" y2=\"18.36\"%3E%3C/line%3E%3Cline x1=\"18.36\" y1=\"5.64\" x2=\"19.78\" y2=\"4.22\"%3E%3C/line%3E%3C/svg%3E')";
    }
    // Save user's preference
    localStorage.setItem('userPrefersDark', isDark);
}
// Add a function to clear messages on the screen and in the messages variable
function clearMessages() {
    messagesContainer.innerHTML = ''; // Clear messages from the screen
    messages = []; // Clear messages from the variable
}

async function fetchGPT3Response() {
    const apiKey = window.config.OPENAI_API_KEY;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                "model": "gpt-4",
                "messages": messages,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error fetching GPT-4 response:', error);
        return 'Error: Unable to get a response from ChatGPT.';
    }
}

sendMessageButton.addEventListener('click', async () => {
    const message = messageInput.value.trim();

    if (message) {
        appendMessage(message); // Display user's message
        messageInput.value = '';

        const chatgptResponse = await fetchGPT3Response(message); // Fetch response from ChatGPT
        appendMessage(chatgptResponse, false); // Display ChatGPT response
    }
});

messageInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Enter key without Shift
        event.preventDefault();
        sendMessageButton.click();
        return;
    }
});

// Add event listener for the clear button
clearMessagesButton.addEventListener('click', () => {
    clearMessages();
});
//setTheme(userPrefersDark);

// Listen to toggle event
//darkThemeToggle.addEventListener('change', (event) => {
    //    setTheme(event.target.checked);
    //});
// Listen to toggle event
darkThemeToggle.addEventListener('change', (event) => {
    setTheme(event.target.checked);
});

// Show settings dialog
settingsButton.addEventListener('click', () => {
    settingsDialog.removeAttribute('hidden');
});

// Hide settings dialog when clicking on the close button (x)
settingsDialogClose.addEventListener('click', () => {
    settingsDialog.setAttribute('hidden', 'true');
});

// Hide settings dialog when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target == settingsDialog) {
        settingsDialog.setAttribute('hidden', 'true');
    }
});

showHistoryButton.addEventListener("click", () => {
    showHistory();
});

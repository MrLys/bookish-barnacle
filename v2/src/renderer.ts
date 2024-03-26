import { marked } from 'marked';
import hljs from 'highlight.js';
import { Message, config } from './globaltypes';
import fetchAnthropicResponse from './antropic';
import modelsData from './models.json';

declare global {
    interface Window {
        config: config
    }

}
const sendMessageButton = document.getElementById('send-message');
const messageInput = document.getElementById('input-message') as HTMLInputElement;
const messagesContainer = document.getElementById('messages-container');
const clearMessagesButton = document.getElementById('clear-messages'); // Get the clear button element
const darkThemeToggle = document.getElementById('darkThemeToggle') as HTMLInputElement;
const settingsButton = document.getElementById('settings-button');
const settingsDialog = document.getElementById('settings-dialog');
const settingsDialogClose = document.getElementById('settings-dialog-close');
const modelDropdown = document.getElementById('model-dropdown') as HTMLInputElement;
const themeIcon = document.getElementById('theme-icon');

document.addEventListener('DOMContentLoaded', () => {
    // The DOM is fully loaded
    populateModelOptions();    
    console.log("done populating dropdown");
});

function populateModelOptions() {
    const modelDropdown = document.getElementById('model-dropdown') as HTMLSelectElement;
    
    console.log(JSON.stringify(modelsData));
    const models  = modelsData.models; // Assuming the data structure is as shown in your example

    for (const [provider, value] of Object.entries(models)) {
        const providerModels = value;
        const providerGroup = document.createElement('optgroup');
        providerGroup.label = provider;

        for (const model of providerModels) {
            const option = document.createElement('option');
            option.value = model.model;
            option.text = `${model.name} - ${model.description}`;
            providerGroup.appendChild(option);
        }

        modelDropdown.appendChild(providerGroup);
    }
    modelDropdown!.value = 'claude-3-haiku-20240307'
}

// Load user's preference
const userPrefersDark = localStorage.getItem('userPrefersDark') === 'true';
darkThemeToggle!.checked = userPrefersDark;
setTheme(userPrefersDark);
let messages : Array<Message>= [];

function isPromise(value: any): value is Promise<string> {
  return value && typeof value.then === 'function';
}


function appendMessage(message : string, isUser = true) {
    const formattedMessage = marked.parse(message);
    const messageElement = document.createElement("div");
    const messageNameElement = document.createElement("span");

    messageNameElement.className = `${isUser ? "user" : "assistant"} message-name`;
    messageNameElement.innerText = isUser ? "You: " : "Assistant: ";
    if (isPromise(formattedMessage)) {
        formattedMessage.then((s) => {
            messageElement.innerHTML = s;
        });
    } else {
        messageElement.innerHTML = formattedMessage as string;
    }
    messageElement.insertBefore(messageNameElement, messageElement.firstChild); // Insert the name before the message content

    const role = isUser ? "user" : "assistant";
    messageElement.className = `${role} message-text`;

    const attachCopyIcon = (preElement : HTMLElement) => {
        const copyIconElement = document.createElement("span");

        // Add copy icon
        copyIconElement.className = "far fa-copy copy-icon"; // Font Awesome copy icon
        copyIconElement.style.display = "none"; // Add to hide the icon by default
        copyIconElement.addEventListener("click", () => {
            const codeSnippet = preElement.querySelector("code");
            const codeSnippetText = codeSnippet ? codeSnippet.innerText : "";

            navigator.clipboard.writeText(codeSnippetText).then(
                () => {
                    console.log("Code snippet copied to clipboard");
                },
                (err) => {
                    console.error("Error copying to clipboard", err);
                }
            );
        });
        preElement.classList.add("code-snippet-container");
        preElement.appendChild(copyIconElement); // Attach the icon to the 'pre' element
        copyIconElement.style.display = "inline";
    };

    const allPreElements = messageElement.querySelectorAll("pre");

    // Loop through all 'pre' elements and add the copy icon
    allPreElements.forEach((preElement) => {
        attachCopyIcon(preElement);
    });

    messagesContainer!.appendChild(messageElement);
    messages.push({ "role": role , 'content': message });

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
        hljs.highlightBlock(block as HTMLElement);
    });
}



function setTheme(isDark : boolean) {
    const bodyElement = document.body;
    if (isDark) {
        // Enable dark theme
        const darkThemeStyles = document.createElement('link');
        darkThemeStyles.rel = 'stylesheet';
        darkThemeStyles.href = './dark-theme.css';
        darkThemeStyles.id = 'darkThemeStyles';
        document.head.appendChild(darkThemeStyles);
        bodyElement.classList.add('dark-theme'); // Add dark-theme class to body
        themeIcon!.style.backgroundImage = "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-moon\"%3E%3Cpath d=\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\"%3E%3C/path%3E%3C/svg%3E')";
    } else {
        // Disable dark theme
        const darkThemeStyles = document.getElementById('darkThemeStyles');
        if (darkThemeStyles) {
            darkThemeStyles.remove();
        }
        bodyElement.classList.remove('dark-theme'); // Remove dark-theme class from body
        themeIcon!.style.backgroundImage = "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-sun\"%3E%3Ccircle cx=\"12\" cy=\"12\" r=\"5\"%3E%3C/circle%3E%3Cline x1=\"12\" y1=\"1\" x2=\"12\" y2=\"3\"%3E%3C/line%3E%3Cline x1=\"12\" y1=\"21\" x2=\"12\" y2=\"23\"%3E%3C/line%3E%3Cline x1=\"4.22\" y1=\"4.22\" x2=\"5.64\" y2=\"5.64\"%3E%3C/line%3E%3Cline x1=\"18.36\" y1=\"18.36\" x2=\"19.78\" y2=\"19.78\"%3E%3C/line%3E%3Cline x1=\"1\" x2=\"3\" y1=\"12\" y2=\"12\"%3E%3C/line%3E%3Cline x1=\"21\" x2=\"23\" y1=\"12\" y2=\"12\"%3E%3C/line%3E%3Cline x1=\"4.22\" y1=\"19.78\" x2=\"5.64\" y2=\"18.36\"%3E%3C/line%3E%3Cline x1=\"18.36\" y1=\"5.64\" x2=\"19.78\" y2=\"4.22\"%3E%3C/line%3E%3C/svg%3E')";
    }
    // Save user's preference
    localStorage.setItem('userPrefersDark', `${isDark}`);
}
// Add a function to clear messages on the screen and in the messages variable
function clearMessages() {
    messagesContainer!.innerHTML = ''; // Clear messages from the screen
    messages = []; // Clear messages from the variable
}

type GPTResponseChoice = {
    message: {
        content: string
    }
}

type GPTResponse = {
    choices: Array<GPTResponseChoice>
}


async function fetchGPT3Response() : Promise<string> {
    const apiKey = window.config.OPENAI_API_KEY;
    try {
        const response = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
                method: 'post',
                body: JSON.stringify({
                    "model": "gpt-4-1106-preview",
                    "messages": messages,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                }
            }
        );
        if (response.ok) {
            const res =  (await response.json()) as GPTResponse;
            return res.choices[0].message.content.trim();
        }
        return response.text();
    } catch (error) {
        console.error('Error fetching GPT-4 response:', error);
        return 'Error: Unable to get a response from ChatGPT.';
    }
}
let currentRole = 'user';  // Default role

let assistantChoice = 'claude-3-haiku-20240307' || modelDropdown!.value;
// Update the sendMessageButton listener with role support
sendMessageButton!.addEventListener('click', async () => {
    const message = messageInput!.value.trim();
    if (message) {
        const isFirstMessage = messages.length === 0;
        const selectedRole = 'user'; // Get the role for the first message
        appendMessage(message, selectedRole === 'user'); // Use a boolean for the 'isUser' parameter

        if (isFirstMessage) {
            currentRole = selectedRole; // Set the current role to the selected role
        }
        messageInput.value = '';
        const assistantReponse = await fetchFromAssistant();
        appendMessage(assistantReponse , false); // Display ChatGPT response
    }
});

// ... rest of your existing code

// Modify the settings dialog open button to account for currentRole
settingsButton!.addEventListener('click', () => {
    settingsDialog!.removeAttribute('hidden');
});

messageInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Enter key without Shift
        event.preventDefault();
        sendMessageButton!.click();
        return;
    }
});

// Add event listener for the clear button
clearMessagesButton!.addEventListener('click', () => {
    clearMessages();
});
//setTheme(userPrefersDark);

// Listen to toggle event
//darkThemeToggle.addEventListener('change', (event) => {
    //    setTheme(event.target.checked);
    //});
// Listen to toggle event
darkThemeToggle.addEventListener('change', (event :  Event) => {
    setTheme((event.target as HTMLInputElement).checked);
});

// Show settings dialog
settingsButton!.addEventListener('click', () => {
    settingsDialog!.removeAttribute('hidden');
});

// Hide settings dialog when clicking on the close button (x)
settingsDialogClose!.addEventListener('click', () => {
    settingsDialog!.setAttribute('hidden', 'true');
});

modelDropdown!.addEventListener('click', () => {
    console.log(modelDropdown!.value);
});

// Hide settings dialog when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target == settingsDialog) {
        settingsDialog!.setAttribute('hidden', 'true');
    }
});

function fetchFromAssistant() {
    if (GPTchosen()) {
        return fetchGPT3Response();
    } else {
        return fetchAnthropicResponse(modelDropdown!.value, messages);
    }
}

function GPTchosen() {
    return assistantChoice === 'GPT';
}


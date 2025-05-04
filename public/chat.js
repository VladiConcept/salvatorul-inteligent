const chatDiv = document.getElementById("chatDiv");
const backButton = document.getElementById("backBtn");

const answerBox = document.getElementById("answerBox");
const inputBox = document.getElementById("inputBox");
const submitBtn = document.getElementById("submitBtn");

let serverOnline = true;
let url = "";
let canType = true;

async() => {
    await getBackendUrl();
}

document.addEventListener("keydown", function(event) {
    if (event.key == "Enter") {
        submitBtn.click();
    }
});

submitBtn.onclick = function() {
    const userInput = inputBox.value.toLowerCase();

    if (!canType || userInput.trim() === "") return;

    canType = false;

    inputBox.readOnly = true;
    inputBox.placeholder = "Chatbot-ul se gandeste..."

    if (userInput.trim() === "") {
        return;
    }

    sendMessage(userInput);

    inputBox.value = "";
}

function addMsgElement(name, text) {
    const element = document.createElement("div");
    element.className = "message";
    element.innerHTML = "<u>" + name + "</u>:<br>" + text;
    answerBox.appendChild(element);

    return element;
}

// pt teste
function mockSendMessage(msg) {
    addMsgElement("You", msg);
    addMsgElement("Sistem", "Chatbot-ul nu este disponibil in acest moment.");

    canType = true;
}

addMsgElement("Bot", "Cu ce va pot ajuta?");

async function getBackendUrl() {
    try {
      const res = await fetch("http://localhost:3000/get-url");
      const data = await res.json();
      url = data.url;
      console.log("Backend URL is:", url);
    }
    catch (error) {
      console.error("Failed to fetch backend URL:", error);
    }
}

async function sendMessage(msg) {
    addMsgElement("You", msg);
    const botMsg = addMsgElement("Bot", "Se gandeste...");

    try {
        const res = await fetch(url + "/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg })
        });
    
        const data = await res.json();

        answerBox.removeChild(botMsg);
        addMsgElement("Bot", data.reply);
    }
    catch (error) {
        console.error("Failed to send message.");
    }

    answerBox.scrollTop = answerBox.scrollHeight;

    if (canType == false)
        canType = true;

    inputBox.placeholder = "Scrieti un mesaj...";
    inputBox.readOnly = false;
}
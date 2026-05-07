document.addEventListener('DOMContentLoaded', () => {
  const chatToggle = document.getElementById('chat-toggle');
  const chatWindow = document.getElementById('chat-window');
  const chatClose = document.getElementById('chat-close');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatMessages = document.getElementById('chat-messages');

  if (!chatToggle) return;

  let conversationHistory = [];
  const systemContext = "You are a helpful customer support AI for Safari Premium, an e-commerce store. Keep answers concise, polite, and strictly related to e-commerce, shopping, policies, and products. If asked something unrelated, politely decline.";

  chatToggle.addEventListener('click', () => {
    chatWindow.classList.add('active');
    checkApiKey();
  });

  chatClose.addEventListener('click', () => {
    chatWindow.classList.remove('active');
  });

  function checkApiKey() {
    if (!localStorage.getItem('gemini_api_key') && !document.getElementById('api-key-input')) {
      addMessage("Hi! I'm the Safari AI Assistant. To use my advanced AI features, please enter your Gemini API Key below.", 'bot', true);
      const inputWrapper = document.createElement('div');
      inputWrapper.style.margin = '10px 0';
      inputWrapper.innerHTML = `
        <input type="password" id="api-key-input" placeholder="Paste Gemini API Key..." style="width:100%; padding:8px; border-radius:4px; border:1px solid #ccc; font-size:12px; margin-bottom: 5px;">
        <button id="save-api-key" style="width:100%; padding:6px; background:var(--accent-primary); color:white; border:none; border-radius:4px; cursor:pointer;">Save Key</button>
      `;
      chatMessages.appendChild(inputWrapper);
      
      document.getElementById('save-api-key').addEventListener('click', () => {
        const key = document.getElementById('api-key-input').value.trim();
        if (key) {
          localStorage.setItem('gemini_api_key', key);
          inputWrapper.remove();
          addMessage("Key saved securely in your browser! How can I help you today?", 'bot');
        }
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  function addMessage(text, sender, skipSave = false) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    
    // Simple markdown to HTML for bold and line breaks
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>').replace(/\n/g, '<br>');
    msg.innerHTML = formattedText;
    
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (!skipSave && sender === 'user') {
      conversationHistory.push({ role: 'user', parts: [{ text }] });
    } else if (!skipSave && sender === 'bot') {
      conversationHistory.push({ role: 'model', parts: [{ text }] });
    }
  }

  function addTypingIndicator() {
    const msg = document.createElement('div');
    msg.className = `chat-msg bot`;
    msg.id = 'typing-indicator';
    msg.textContent = '...';
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  async function generateAIResponse(userText) {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      setTimeout(() => {
        removeTypingIndicator();
        // Fallback simulated response
        addMessage("I am currently in basic mode. Please provide an API key above for full AI capabilities. You asked about: " + userText, 'bot', true);
      }, 1000);
      return;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemContext }] },
            { role: 'model', parts: [{ text: "Understood. I will act as the Safari Premium support agent." }] },
            ...conversationHistory
          ]
        })
      });

      const data = await response.json();
      removeTypingIndicator();

      if (data.error) {
        addMessage(`Error: ${data.error.message}`, 'bot');
        localStorage.removeItem('gemini_api_key'); // clear invalid key
        checkApiKey();
        return;
      }

      if (data.candidates && data.candidates.length > 0) {
        const botResponse = data.candidates[0].content.parts[0].text;
        addMessage(botResponse, 'bot');
      } else {
        addMessage("Sorry, I couldn't understand that.", 'bot');
      }
    } catch (err) {
      removeTypingIndicator();
      addMessage("Failed to connect to AI service. Please check your connection.", 'bot', true);
    }
  }

  function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatInput.value = '';

    addTypingIndicator();
    generateAIResponse(text);
  }

  chatSend.addEventListener('click', handleSend);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
});

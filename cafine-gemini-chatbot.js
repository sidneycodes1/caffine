// ===================================================
// CAFINE — Gemini AI Caffeine Health Assistant
// Drop-in replacement for the original chatbot JS
// ===================================================

// ⚠️  REGENERATE YOUR KEY — old one was shared publicly
// Get a new one at: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = CONFIG.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// ===== CAFFEINE DATABASE (Nigerian + Global brands) =====
const DRINK_DATABASE = {
  // Nigerian / African Market
  "Predator Energy":     { caffeine: 160, serving: "500ml can" },
  "Bold Energy":         { caffeine: 80,  serving: "250ml can" },
  "Bullet Energy":       { caffeine: 80,  serving: "250ml can" },
  "Sting Energy":        { caffeine: 200, serving: "500ml can" },
  "Power Horse":         { caffeine: 80,  serving: "250ml can" },
  "Lucozade Energy":     { caffeine: 46,  serving: "380ml bottle" },
  "Nescafé Sachet":      { caffeine: 65,  serving: "1 sachet" },
  "Bournvita":           { caffeine: 12,  serving: "1 cup" },
  "Lipton Tea":          { caffeine: 40,  serving: "1 cup" },
  "Coca-Cola":           { caffeine: 34,  serving: "35cl bottle" },
  "Pepsi":               { caffeine: 38,  serving: "35cl bottle" },
  // Global
  "Red Bull":            { caffeine: 80,  serving: "250ml can" },
  "Monster Energy":      { caffeine: 160, serving: "500ml can" },
  "Rockstar Energy":     { caffeine: 160, serving: "500ml can" },
  "5-Hour Energy":       { caffeine: 200, serving: "57ml shot" },
  "Coffee (brewed)":     { caffeine: 95,  serving: "1 cup (240ml)" },
  "Espresso":            { caffeine: 63,  serving: "1 shot (30ml)" },
  "Green Tea":           { caffeine: 28,  serving: "1 cup (240ml)" },
  "Black Tea":           { caffeine: 47,  serving: "1 cup (240ml)" },
};

// ===== HEALTH THRESHOLDS =====
const HEALTH_THRESHOLDS = {
  low:      { max: 100,  label: "Low",       emoji: "😊", color: "#4CAF50" },
  moderate: { max: 200,  label: "Moderate",  emoji: "🚀", color: "#2196F3" },
  high:     { max: 400,  label: "High",      emoji: "⚠️", color: "#FF9800" },
  veryHigh: { max: Infinity, label: "Very High", emoji: "🚨", color: "#F44336" },
};

// ===== SYSTEM PROMPT FOR GEMINI =====
const SYSTEM_PROMPT = `You are CaféBot, a friendly and knowledgeable caffeine health assistant. 
Your ONLY job is to help users track their daily caffeine intake and give personalized health advice based on it.

You know this caffeine database (mg per serving):
${Object.entries(DRINK_DATABASE)
  .map(([name, data]) => `- ${name}: ${data.caffeine}mg per ${data.serving}`)
  .join("\n")}

Health thresholds:
- 0–100mg: Low — mild alertness, safe for most people
- 101–200mg: Moderate — peak cognitive performance zone
- 201–400mg: High — watch out for jitters, increased heart rate
- 401mg+: Very High — stop consuming, risk of palpitations, anxiety, sleep disruption

Your conversation flow (STRICTLY follow this order):
1. Greet the user warmly and ask if they've had any caffeinated drinks today (Yes/No)
2. If Yes: Ask which drink from your database they had. If they type something not in your database, politely tell them you don't have data for it and ask them to pick the closest match.
3. Ask how many servings/bottles/cans they had (accept numbers 1–10)
4. Ask what time they had it (morning, afternoon, evening, night — or how many hours ago)
5. Ask if they had any other caffeinated drinks today
6. If yes, repeat steps 2–4 for each additional drink
7. Once they say no more drinks, calculate total caffeine and give a detailed health assessment

Rules:
- ONLY talk about caffeine, energy drinks, and related health topics. Politely redirect if asked anything else.
- Be warm, conversational, and slightly witty — like a knowledgeable friend, not a doctor
- When giving health advice, be specific: mention the exact mg, the level, and what they might feel or should do
- If intake is High or Very High, give a clear warning about risks and what to do
- Never be preachy or lecture repeatedly — say it once, clearly
- Keep responses concise — 2–4 sentences max per message unless giving final results
- For final results, give a structured summary with total mg, level, drinks list, and clear recommendation
- Use emojis naturally but not excessively

Always respond in plain text only. No markdown, no bullet point symbols like *, no hashtags.`;

// ===== STATE =====
let conversationHistory = [];
let totalCaffeine = 0;
let drinksLogged = [];
let chatEnded = false;

// ===== DOM ELEMENTS =====
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const quickRepliesContainer = document.getElementById("quick-replies");

// ===================================================
// GEMINI API CALL
// ===================================================
async function askGemini(userMessage) {
  conversationHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const payload = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: conversationHistory,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    },
  };

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Gemini API error:", err);
      return "Sorry, I had trouble connecting. Please try again in a moment.";
    }

    const data = await response.json();
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I didn't catch that — could you rephrase?";

    conversationHistory.push({
      role: "model",
      parts: [{ text: botReply }],
    });

    return botReply;
  } catch (error) {
    console.error("Network error:", error);
    return "Network error — check your connection and try again.";
  }
}

// ===================================================
// UI FUNCTIONS (same class names as original)
// ===================================================

function addBotMessage(text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message bot";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.innerHTML = text.replace(/\n/g, "<br>");

  messageDiv.appendChild(bubble);
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

function addUserMessage(text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message user";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;

  messageDiv.appendChild(bubble);
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot";
  typingDiv.id = "typing-indicator";

  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.innerHTML =
    '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

  typingDiv.appendChild(indicator);
  chatMessages.appendChild(typingDiv);
  scrollToBottom();
}

function hideTypingIndicator() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

function showQuickReplies(options) {
  clearQuickReplies();
  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "quick-reply-btn";
    btn.textContent = option;
    btn.onclick = () => handleQuickReply(option);
    quickRepliesContainer.appendChild(btn);
  });
}

function clearQuickReplies() {
  quickRepliesContainer.innerHTML = "";
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===================================================
// SMART QUICK REPLY DETECTION
// Reads the bot reply and shows relevant quick replies
// ===================================================
function detectAndShowQuickReplies(botReply) {
  const lower = botReply.toLowerCase();

  // Opening yes/no
  if (
    (lower.includes("had any") || lower.includes("caffeinated drink") || lower.includes("had caffeine")) &&
    (lower.includes("today") || lower.includes("yes") || lower.includes("no"))
  ) {
    showQuickReplies(["Yes", "No"]);
    return;
  }

  // Drink selection
  if (
    lower.includes("which drink") ||
    lower.includes("what did you drink") ||
    lower.includes("what drink") ||
    lower.includes("choose a drink") ||
    lower.includes("pick a drink")
  ) {
    showQuickReplies([
      "Predator Energy",
      "Red Bull",
      "Bold Energy",
      "Sting Energy",
      "Nescafé Sachet",
      "Monster Energy",
      "Coca-Cola",
      "Lucozade Energy",
      "Coffee (brewed)",
      "Lipton Tea",
      "Other (type it)",
    ]);
    return;
  }

  // Servings
  if (
    lower.includes("how many") &&
    (lower.includes("serving") ||
      lower.includes("bottle") ||
      lower.includes("can") ||
      lower.includes("cup"))
  ) {
    showQuickReplies(["1", "2", "3", "4", "5"]);
    return;
  }

  // Time of consumption
  if (
    lower.includes("what time") ||
    lower.includes("when did you") ||
    lower.includes("how long ago") ||
    lower.includes("hours ago")
  ) {
    showQuickReplies([
      "Just now",
      "30 mins ago",
      "1 hour ago",
      "2 hours ago",
      "This morning",
      "This afternoon",
    ]);
    return;
  }

  // More drinks
  if (
    lower.includes("any other") ||
    lower.includes("anything else") ||
    lower.includes("another drink") ||
    lower.includes("more caffeine")
  ) {
    showQuickReplies(["Yes, add another", "No, show my results"]);
    return;
  }

  // End of conversation
  if (
    lower.includes("stay healthy") ||
    lower.includes("refresh") ||
    lower.includes("take care") ||
    lower.includes("goodbye") ||
    lower.includes("that's all")
  ) {
    chatEnded = true;
    userInput.disabled = true;
    sendBtn.disabled = true;
    userInput.placeholder = "Session ended. Refresh to start again.";
    clearQuickReplies();
    return;
  }

  // Default: no quick replies, let user type
  clearQuickReplies();
}

// ===================================================
// HANDLE USER INPUT
// ===================================================
async function handleUserMessage(message) {
  if (!message.trim() || chatEnded) return;

  addUserMessage(message);
  userInput.value = "";
  clearQuickReplies();

  // Disable input while waiting
  userInput.disabled = true;
  sendBtn.disabled = true;

  showTypingIndicator();
  const botReply = await askGemini(message);
  hideTypingIndicator();

  addBotMessage(botReply);
  detectAndShowQuickReplies(botReply);

  // Re-enable input
  if (!chatEnded) {
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

function handleQuickReply(option) {
  handleUserMessage(option);
}

// ===================================================
// EVENT LISTENERS
// ===================================================
sendBtn.addEventListener("click", () => {
  handleUserMessage(userInput.value.trim());
});

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleUserMessage(userInput.value.trim());
  }
});

// ===================================================
// INIT — Start conversation on load
// ===================================================
window.addEventListener("load", async () => {
  setTimeout(async () => {
    showTypingIndicator();
    const opening = await askGemini("START_CONVERSATION");
    hideTypingIndicator();
    addBotMessage(opening);
    detectAndShowQuickReplies(opening);
  }, 600);
});

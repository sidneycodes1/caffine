# ☕ Cafine — AI Caffeine Health Assistant

A static frontend web app that helps you track your daily caffeine intake using an AI-powered chat assistant. Built with vanilla HTML, CSS, and JavaScript — powered by the Gemini API.

---

## What it does

- Chats with you like a health-savvy friend
- Lets you select from 20 real caffeine drinks (Nigerian + global brands)
- Tracks multiple drinks per session with serving counts and timing
- Calculates your total caffeine intake in mg
- Gives you a personalized health assessment based on your intake level

**Drinks in the database include:**
Predator Energy, Bold Energy, Sting Energy, Bullet Energy, Red Bull, Monster Energy, Lucozade, Nescafé, Coca-Cola, Pepsi, Coffee, Espresso, Green Tea, Black Tea, and more.

---

## Health levels

| Intake | Level | What it means |
|---|---|---|
| 0 – 100mg | Low | Mild alertness, safe zone |
| 101 – 200mg | Moderate | Peak cognitive performance |
| 201 – 400mg | High | Watch for jitters, increased heart rate |
| 401mg+ | Very High | Stop consuming — health risk |

---

## Tech stack

- HTML / CSS / Vanilla JavaScript
- Gemini API (gemini-2.0-flash)
- No frameworks, no build tools, no backend

---

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/sidneycodes1/caffine.git
cd caffine
```

### 2. Set up your API key

Copy the example config file:

```bash
cp config.example.js config.js
```

Open `config.js` and replace the placeholder with your real Gemini API key:

```js
const CONFIG = {
  GEMINI_API_KEY: "your-actual-key-here"
};
```

Get a free key at: https://aistudio.google.com/app/apikey

### 3. Open the app

Just open `index.html` in your browser — no server needed.

---

## Project structure

```
caffine/
├── index.html                 # Main app entry point
├── cafine.css                 # All styles
├── cafine-gemini-chatbot.js   # AI chatbot logic
├── config.js                  # Your API key (gitignored)
├── config.example.js          # API key template (safe to commit)
├── .gitignore
├── cafin.img/                 # Image assets
└── README.md
```

---

## Important

`config.js` is intentionally excluded from this repository via `.gitignore` to keep your API key private. Never commit your real key to a public repo.

---

## Author

Built by Sidney — full-stack and Web3 developer.

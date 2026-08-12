require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk');

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!TELEGRAM_TOKEN || !ANTHROPIC_API_KEY) {
  console.error('Missing TELEGRAM_BOT_TOKEN or ANTHROPIC_API_KEY in your .env file.');
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// Keep a short rolling history per chat so the bot has conversational context.
// This is in-memory only and resets if the process restarts.
const chatHistories = new Map();
const MAX_TURNS = 6; // user+assistant pairs kept per chat

const SYSTEM_PROMPT = `You are an Islamic knowledge assistant designed to help users learn about Islam, the Qur'an, and Hadith.

Guidelines you must always follow:
- Answer using mainstream, widely accepted Islamic scholarship. When relevant, mention the Qur'anic verse (surah:ayah) or the Hadith collection/reference you are drawing from, in your own words rather than long verbatim quotations.
- On topics where scholars or the four Sunni madhhabs (or Sunni/Shia perspectives) differ, briefly note that there are differing scholarly opinions rather than presenting one view as the only correct one.
- For personal religious rulings (fiqh questions with real consequences — divorce, inheritance, specific worship situations, etc.), give the general scholarly consensus/background, but encourage the user to consult a qualified local imam or scholar (mufti) for a binding personal ruling ("fatwa").
- Be respectful, warm, and humble in tone. Use "Allah (SWT)" and "Prophet Muhammad (peace be upon him)" conventions naturally, without being preachy or repetitive.
- If a question falls outside Islamic knowledge entirely, answer briefly and helpfully, then gently note you're primarily set up for Islamic Q&A.
- Do not issue formal fatwas yourself, and do not claim personal religious authority.
- Keep answers concise and conversational — this is a chat interface, not an essay. Use short paragraphs; use lists only when they genuinely help.`;

function getHistory(chatId) {
  if (!chatHistories.has(chatId)) chatHistories.set(chatId, []);
  return chatHistories.get(chatId);
}

function pushHistory(chatId, role, content) {
  const history = getHistory(chatId);
  history.push({ role, content });
  // Trim to the last MAX_TURNS*2 messages
  while (history.length > MAX_TURNS * 2) history.shift();
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  chatHistories.delete(chatId);
  bot.sendMessage(
    chatId,
    "As-salamu alaykum! 👋 I'm here to help answer questions about Islam, the Qur'an, and Hadith.\n\nAsk me anything — for example:\n• \"What does the Qur'an say about patience?\"\n• \"What are the five pillars of Islam?\"\n• \"Explain the story of Prophet Yusuf (AS)\"\n\nUse /reset anytime to clear our conversation."
  );
});

bot.onText(/\/reset/, (msg) => {
  const chatId = msg.chat.id;
  chatHistories.delete(chatId);
  bot.sendMessage(chatId, "Conversation cleared. Ask me a new question whenever you're ready.");
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return; // commands handled above

  bot.sendChatAction(chatId, 'typing');

  pushHistory(chatId, 'user', text);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: getHistory(chatId),
    });

    const reply = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    pushHistory(chatId, 'assistant', reply);

    await bot.sendMessage(chatId, reply);
  } catch (err) {
    console.error('Error calling Anthropic API:', err);
    await bot.sendMessage(
      chatId,
      "Sorry, I ran into an issue answering that. Please try again in a moment."
    );
  }
});

console.log('Islamic Q&A bot is running (polling mode)...');

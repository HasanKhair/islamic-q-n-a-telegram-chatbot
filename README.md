# Islamic Q&A Telegram Bot

A Telegram bot that answers questions about Islam, the Qur'an, and Hadith, powered by the Claude API.

## What it does

- Answers Islamic knowledge questions in a respectful, scholarly-grounded tone
- References relevant Qur'anic verses and Hadith where appropriate
- Notes where scholarly opinions differ, instead of presenting one view as absolute
- For personal fiqh rulings, points users to a qualified local imam/scholar rather than issuing its own "fatwa"
- Remembers the last few messages in each chat for natural follow-up conversation
- `/start` — greets the user and explains what the bot can do
- `/reset` — clears the conversation history for that chat

## 1. Create your Telegram bot

1. Open Telegram and message **@BotFather**
2. Send `/newbot` and follow the prompts (choose a name and a username ending in `bot`)
3. BotFather will give you a **token** — copy it, you'll need it below

## 2. Get an Anthropic API key

1. Go to https://console.anthropic.com/settings/keys
2. Create a new API key and copy it

## 3. Set up the project

```bash
# unzip/copy this folder, then inside it:
npm install
cp .env.example .env
```

Open `.env` and paste in your two keys:

```
TELEGRAM_BOT_TOKEN=123456:ABC-your-real-token
ANTHROPIC_API_KEY=sk-ant-your-real-key
```

## 4. Run it

```bash
npm start
```

You should see:
```
Islamic Q&A bot is running (polling mode)...
```

Now open Telegram, find your bot by its username, and send `/start`.

## 5. Deploying so it runs 24/7

Running `npm start` on your own laptop only works while your laptop is on and connected. To keep the bot online all the time, deploy it to a small always-on server, for example:

- **Railway** (railway.app) — easiest, free tier available, just connect your repo and set the two env vars
- **Render** (render.com) — similar, background worker service
- A small **VPS** (e.g. DigitalOcean, Linode) running the script with `pm2` or inside a `screen`/`tmux` session

In all cases you just need to set `TELEGRAM_BOT_TOKEN` and `ANTHROPIC_API_KEY` as environment variables on the platform — don't commit your `.env` file to version control.

## Customizing the bot's behavior

Open `index.js` and edit the `SYSTEM_PROMPT` constant — that's where the bot's tone, scholarly guardrails, and behavior are defined. For example, you could:

- Add a preference for a specific madhhab (school of thought)
- Add support for Arabic-language questions/answers
- Restrict topics further, or expand into prayer times / daily reminders (would need an additional API like Aladhan for prayer times)

## Notes on accuracy

The bot is instructed to stick to mainstream scholarship and acknowledge differences of opinion, but like any AI system it can occasionally make mistakes. For matters with real personal or legal weight (marriage, divorce, inheritance, specific worship rulings), the bot is prompted to direct users to a qualified local scholar — consider reinforcing that in your own community guidelines if you share the bot publicly.

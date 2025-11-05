# 💬 ChatAI — Intelligent Conversations & Insights
**ChatAI** is a smart chat platform where you can talk with an AI, analyze your conversations, and uncover deep insights about your personality, emotions, and creativity — all in one elegant interface.

> 🚀 **Try it live:** [https://chat-i64logxzb-prakash113s-projects.vercel.app](https://chat-i64logxzb-prakash113s-projects.vercel.app)

---

## 🧠 What is ChatAI?

ChatAI is a **functional AI chat application** and an **assignment project** built using **two different tech stacks**:

![Main chat interface screenshot](https://raw.githubusercontent.com/PRAKASH113/ChatAI/main/public/home.png)

### AI Generated Insight Example
![Screenshot of AI generated insights](https://raw.githubusercontent.com/PRAKASH113/ChatAI/main/public/insight.png)

### Architecture Diagram
![System Architecture Diagram](https://raw.githubusercontent.com/PRAKASH113/ChatAI/main/public/architecture.png)
---

## ⚙️ Tech Stack Overview

### 🧩 **Stack 1 — Next.js Only (Vercel Deployment)**

This version is used for hosting on **Vercel**, which doesn’t support Python/Django servers.  
It uses **localStorage** to manage and persist all chat data directly in the browser.

- 🪶 **Frontend:** Next.js + TypeScript + TailwindCSS  
- 💾 **Storage:** Browser localStorage  
- ⚙️ **AI Integration:** Gemini API (can be swapped with OpenAI, Claude, LM Studio, etc.)

👉 **You can run this version instantly.**  
No extra setup or backend required — just clone and run the Next.js app.

#### **Quick Run (Stack 1)**

From the project root:

```bash
bun install
bun run dev
```
---

### 🐘 **Stack 2 — Full Assignment Stack (Django + PostgreSQL + Next.js)**

This version integrates a **Django REST Framework backend** with a **PostgreSQL database** for real data persistence.

- 🐍 **Backend:** Django + Django REST Framework  
- 🧠 **AI Integration:** Gemini / OpenAI / Claude / LM Studio  
- 🗄️ **Database:** PostgreSQL  
- ⚛️ **Frontend:** Next.js (React + TailwindCSS)  
- 🧰 **Storage:** Local file system for uploads/exports  

In this setup, chats and messages are stored in the PostgreSQL database instead of localStorage.  
Everything else — from chat analysis to theme toggling — stays the same.

---

### **API Used**
Google Gemini 2.5 flash

---
## ✨ Features

✅ **AI Chatting** — talk naturally with an AI powered by Gemini (or any integrated LLM)  
✅ **Chat Analysis** — automatically analyze your conversations for emotions, tone, and creativity  
✅ **Semantic Search** — find topics and patterns within your chat history  
✅ **Local Chat Storage** — (Next.js-only stack) all chats are saved locally on your device  
✅ **Download & Share** — export your chats in **JSON**, **Markdown**, or **PDF** formats  
✅ **Light / Dark Themes** — switch instantly between modern UI themes  
✅ **Insights Dashboard** — see emotional trends, creative patterns, and AI recommendations  
✅ **Animated UI** — smooth transitions and elegant minimal design using Framer Motion  

---

## 🔄 Switching Between Tech Stacks

If you want to shift from **Next.js-only** to the **Django + PostgreSQL stack**,  
just make a few simple changes — it’s already built into the utilities!


### 🧠 Modify these 3 files:

* `utils/NewChat.ts`
* `utils/Msg.ts`
* `utils/ChatUtils.ts`

👉 **Action Required:** In each of these files, they already include a **commented-out Django + PostgreSQL section**. Simply **comment out the localStorage code** and **uncomment** the PostgreSQL version. That’s it!

---

## 🛠️ Running the Backend (Django + PostgreSQL)

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run migrations:
    ```bash
    python manage.py migrate
    ```
4.  Start the Django server:
    ```bash
    python manage.py runserver
    ```
    By default, it runs at `http://127.0.0.1:8000`

---

## ⚙️ Running the Frontend (Next.js)

In another terminal, from the project root:

```bash
bun install
bun run dev
```

## 🧰 Environment Variables

Make sure to include the following in your `.env.local` file for both stacks:

```
# 🔐 API Keys
GEMINI_API_KEY=your_gemini_api_key

# 🐘 Django PostgreSQL Backend (only for Stack 2)
NEXT_PUBLIC_API_BASE=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
POSTGRES_DB=chatai_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```
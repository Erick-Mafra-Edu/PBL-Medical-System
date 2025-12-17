# 🎯 PBL Medical System - Quick Start Guide

## What is this?

A complete **Problem-Based Learning (PBL) study management system** for medical students with:

- 🤖 **AI-powered flashcard generation** (OpenAI GPT-4, Gemini)
- 📚 **Obsidian/Notion sync** for notes
- 🧠 **Spaced repetition** (SM2, FSRS algorithms)
- 💬 **RAG-powered Q&A** (ask questions about your notes)
- 📁 **Digital library** for PDFs and study materials

---

## 🚀 Get Started in 3 Steps

### 1. Prerequisites

- Docker & Docker Compose installed
- OpenAI API key (get one at https://platform.openai.com/api-keys)

### 2. Setup

```bash
# Clone the repo
git clone https://github.com/Erick-Mafra-Edu/PBL-Medical-System.git
cd PBL-Medical-System

# Copy environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-key-here
nano .env  # or use any text editor
```

### 3. Run

```bash
# Easy way (with script)
./start.sh

# Or manually
docker-compose up -d
```

That's it! Visit **http://localhost:3010** to start studying! 🎉

---

## 📱 What You Can Do

### Create Courses
Organize your studies by subject (Cardiology, Neurology, etc.)

### Generate Flashcards with AI
Upload your notes or paste content, and AI creates flashcards automatically

### Review with Spaced Repetition
Smart algorithm tells you when to review each card for optimal retention

### Sync Your Obsidian Vault
Keep your existing Obsidian notes in sync automatically

### Ask Questions
RAG-powered Q&A that answers based on your notes

---

## 📖 Learn More

- **[SETUP.md](docs/SETUP.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and architecture
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS
- **Backend:** Node.js, Express, Python, FastAPI
- **Database:** PostgreSQL, Redis, MinIO
- **AI:** OpenAI GPT-4, Google Gemini, LangChain
- **Infrastructure:** Docker, Docker Compose

---

## 📊 Project Status

✅ **COMPLETE** - Fully functional system ready for use!

- [x] API Gateway with authentication
- [x] Flashcard Engine (SM2, FSRS algorithms)
- [x] AI Service (OpenAI, Gemini, RAG)
- [x] Obsidian Sync
- [x] Next.js Frontend
- [x] Database schema
- [x] Docker orchestration
- [x] Documentation

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

## 💬 Support

- 📖 Check the [documentation](docs/)
- 🐛 Report [issues](https://github.com/Erick-Mafra-Edu/PBL-Medical-System/issues)
- 💡 Start a [discussion](https://github.com/Erick-Mafra-Edu/PBL-Medical-System/discussions)

---

**Made with ❤️ for medical students studying with PBL methodology**

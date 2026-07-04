# ⚡ NeuralFeed — AI-Powered Tech News Platform

> A full-stack, production-ready AI news aggregator that collects, classifies, and summarises technology articles in real time — powered by FastAPI, React, Three.js, and OpenRouter AI.

![NeuralFeed Hero](https://picsum.photos/seed/neuralmain/1200/400)

---

## ✨ Features

### 🏠 Curated Homepage
- **Featured Story** — hand-picked top article with a full-bleed hero card
- **Trending Now** — 6 priority articles highlighted by category
- **Latest News** — 8 most recent articles with sidebar
- **View All News** CTA leading to the full archive

### 📰 Full News Archive (`/news`)
- Real-time **search** across titles, summaries, and sources
- **Category filter** pills (AI, Cybersecurity, Robotics, Space, and more)
- **Sort** by Latest, Oldest, or Trending
- **Numbered pagination** (12 articles per page)
- URL-synced state — filters survive browser refresh

### 🗂️ Category Pages (`/category/:slug`)
- Dedicated page per category with emoji + description
- Independent sort controls and pagination
- Breadcrumb navigation

### ✨ On-Demand AI Summaries
- **✨ AI Summary** button on every article card and featured card
- Summaries generated via **OpenRouter AI** (Google Gemma by default)
- Cached locally — no repeated API calls
- **Typewriter animation** reveals the summary character by character
- Blinking cursor while typing; graceful error state with retry

### 🌍 3D Interactive Globe
- Real-time wireframe globe built with **Three.js / React Three Fiber**
- Animated data-flow particles and pulsing nodes
- Floating tech category labels
- Smooth continuous rotation with mouse-tilt

### 🎨 Premium Design
- Dark glassmorphic UI with a blue/purple palette
- Smooth Framer Motion page and card animations
- Fully responsive — desktop, tablet, and mobile
- Rotating typewriter tagline in the hero

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Framer Motion, React Three Fiber |
| **3D Graphics** | Three.js, `@react-three/drei` |
| **Routing** | React Router v6 |
| **Backend** | FastAPI, Uvicorn, Pydantic |
| **Database** | SQLite (via Python `sqlite3`) |
| **AI / LLM** | OpenRouter API (Google Gemma 4 31B) |
| **Feed Parsing** | feedparser, BeautifulSoup4 |
| **HTTP** | axios (frontend), httpx (backend) |

---

## 📁 Project Structure

```
AI-News-Agent/
├── api.py               # FastAPI app — all REST endpoints
├── database.py          # SQLite helpers (CRUD, filtered queries)
├── config.py            # API keys, model name, RSS feed URLs
├── agent.py             # RSS fetch + enrichment pipeline
├── requirements.txt     # Python dependencies
├── news.db              # SQLite database (auto-created)
│
└── frontend/
    ├── src/
    │   ├── App.jsx              # Router setup
    │   ├── api.js               # Axios API layer
    │   ├── pages/
    │   │   ├── Home.jsx / .css          # Curated homepage
    │   │   ├── News.jsx / .css          # Full archive
    │   │   └── CategoryPage.jsx / .css  # Per-category page
    │   └── components/
    │       ├── Navbar/
    │       ├── Hero/            # 3D Globe scene
    │       ├── ArticleCard/
    │       ├── FeaturedCard/
    │       ├── AISummary/       # Typewriter AI summary panel
    │       ├── Pagination/
    │       ├── SearchBar/
    │       └── Sidebar/
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.10 + |
| Node.js | 18 + |
| npm | 9 + |

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/AI-News-Agent.git
cd AI-News-Agent
```

### 2. Set up the Python backend

```bash
# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure your API key

Open `config.py` and add your **OpenRouter API key**:

```python
OPENROUTER_API_KEY = "sk-or-v1-YOUR_KEY_HERE"
OPENROUTER_MODEL   = "google/gemma-4-31b-it:free"   # free model
```

> Get a free API key at [openrouter.ai](https://openrouter.ai)

### 4. Fetch and enrich articles

```bash
# Scrape RSS feeds and classify/summarise articles (run once)
python agent.py
```

This populates `news.db` with articles, AI summaries, and categories.

### 5. Start the backend

```bash
uvicorn api:app --reload
# → http://127.0.0.1:8000
# → API docs at http://127.0.0.1:8000/docs
```

### 6. Install frontend dependencies

```bash
cd frontend
npm install
```

### 7. Start the frontend

```bash
npm run dev
# → http://localhost:5173
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/articles` | All articles (no params = full list) |
| `GET` | `/articles?category=AI&search=llm&sort=latest&limit=12&offset=0&paginate=true` | Filtered + paginated |
| `GET` | `/categories` | Category list with article counts |
| `POST` | `/articles/summary` | Get or generate AI summary `{ "title": "..." }` |

---

## ⚙️ Environment & Configuration

All configuration lives in **`config.py`**:

```python
OPENROUTER_API_KEY = "..."       # Required for AI summaries
OPENROUTER_MODEL   = "..."       # Any model on openrouter.ai
MAX_ARTICLES       = 5           # Articles fetched per RSS feed
FEEDS              = { ... }     # Dict of name → RSS URL
```

> **Never commit your API key.** Add `config.py` to `.gitignore` or use environment variables for production.

---

## 🔒 Keeping Your API Key Safe

Add this to your `.gitignore`:

```
config.py
venv/
news.db
```

Or use a `.env` file with `python-dotenv`:

```bash
pip install python-dotenv
```

```python
# config.py
from dotenv import load_dotenv
import os
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
```

```bash
# .env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

---

## 📸 Screenshots

| Homepage | News Archive | Category Page |
|---|---|---|
| Curated hero + sections | Full search & filter | Per-category articles |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push and open a Pull Request

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<div align="center">
  <strong>Built with ⚡ by NeuralFeed</strong><br/>
  Powered by FastAPI · React · Three.js · OpenRouter AI
</div>

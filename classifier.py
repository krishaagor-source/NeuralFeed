"""
classifier.py — Rule-based article categorisation.

Priority order: more specific categories before generic ones.
Each category has a weighted keyword list: first match wins.
"""

CATEGORY_RULES = [
    # ── Specific technologies / domains first ──────────────────────────────
    ("AI", [
        "artificial intelligence", "machine learning", "deep learning",
        "neural network", "large language model", "llm", "gpt", "chatgpt",
        "openai", "gemini", "anthropic", "claude", "mistral", "llama",
        "generative ai", "gen ai", "ai model", "foundation model",
        "transformer", "diffusion model", "stable diffusion", "midjourney",
        "text-to-image", "image generation", "agi", "reinforcement learning",
        "natural language processing", "nlp", "computer vision",
        "deepmind", "google ai", "microsoft ai", "nvidia ai",
        "copilot", "perplexity", "hugging face",
    ]),
    ("Cybersecurity", [
        "cybersecurity", "cyber security", "hacker", "hacking", "malware",
        "ransomware", "phishing", "data breach", "vulnerability", "exploit",
        "zero-day", "zero day", "cve", "patch", "firewall", "encryption",
        "ddos", "botnet", "trojan", "spyware", "security flaw",
        "identity theft", "social engineering", "infosec", "ciso",
        "penetration test", "pen test", "threat actor", "cyberattack",
    ]),
    ("Robotics", [
        "robot", "robotics", "autonomous vehicle", "self-driving", "drone",
        "quadruped", "humanoid robot", "boston dynamics", "spot robot",
        "industrial automation", "robotic arm", "uav", "lidar",
    ]),
    ("Space", [
        "nasa", "spacex", "space station", "iss", "rocket", "satellite",
        "mars mission", "moon landing", "orbit", "astronaut", "telescope",
        "james webb", "black hole", "exoplanet", "esa", "isro", "starship",
        "falcon", "launch vehicle",
    ]),
    ("Programming", [
        "python", "javascript", "typescript", "rust", "golang", "java",
        "kotlin", "swift", "c++", "c#", "programming", "coding", "developer",
        "software engineer", "open source", "github", "api", "framework",
        "library", "sdk", "devops", "docker", "kubernetes", "microservice",
        "react", "vue", "angular", "node.js", "backend", "frontend",
    ]),
    ("Startups", [
        "startup", "venture capital", "vc funding", "series a", "series b",
        "seed round", "y combinator", "techstars", "unicorn", "ipo",
        "acquisition", "funding round", "valuation", "pitch deck", "founder",
    ]),
    ("Apple", [
        "apple", "iphone", "ipad", "mac", "macbook", "ios", "macos",
        "wwdc", "tim cook", "app store", "vision pro", "airpods",
        "apple watch", "silicon chip", "m1", "m2", "m3", "m4",
    ]),
    ("Google", [
        "google", "alphabet", "android", "chrome", "chromebook",
        "google cloud", "google search", "youtube", "pixel phone",
        "sundar pichai", "google workspace",
    ]),
    ("Microsoft", [
        "microsoft", "windows", "azure", "xbox", "satya nadella",
        "office 365", "teams", "bing", "surface", ".net", "visual studio",
    ]),
    ("Business", [
        "business", "market", "stock market", "wall street", "revenue",
        "earnings", "quarterly results", "ceo", "merger", "acquisition",
        "layoffs", "workforce", "economy", "gdp", "inflation", "finance",
        "investment", "nasdaq", "s&p 500", "profit", "loss",
    ]),
    ("Science", [
        "science", "research", "study", "scientists", "discovery",
        "biology", "chemistry", "physics", "climate", "environment",
        "genomics", "dna", "crispr", "neuroscience", "quantum",
    ]),
]


def classify_article(text: str) -> str:
    """Return the best-matching category for the given text. Defaults to 'Other'."""
    if not text:
        return "Other"
    lower = text.lower()
    for category, keywords in CATEGORY_RULES:
        if any(kw in lower for kw in keywords):
            return category
    return "Other"
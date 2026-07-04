"""
summarizer.py — AI summary generation via OpenRouter REST API.

Uses a free model (Gemma 4) to produce a 2-3 sentence summary.
Falls back gracefully to a truncated plain-text excerpt if the
API call fails so the UI always has something to display.
"""

import json
import urllib.request
import urllib.error

from config import OPENROUTER_API_KEY, OPENROUTER_MODEL

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MAX_INPUT_CHARS = 3000   # avoid hitting token limits on free tier


def _call_openrouter(prompt: str) -> str:
    payload = json.dumps({
        "model": OPENROUTER_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 160,
        "temperature": 0.3,
    }).encode("utf-8")

    req = urllib.request.Request(
        OPENROUTER_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": "http://localhost:5176",
            "X-Title": "NeuralFeed",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data["choices"][0]["message"]["content"].strip()


def _fallback_summary(text: str) -> str:
    """Return a clean excerpt when the API is unavailable."""
    sentences = [s.strip() for s in text.replace("\n", " ").split(".") if len(s.strip()) > 30]
    excerpt = ". ".join(sentences[:3])
    return (excerpt[:300] + "…") if len(excerpt) > 300 else excerpt or "No summary available."


def generate_summary(text: str) -> str:
    """Generate a 2-3 sentence AI summary for a news article."""
    if not text or not text.strip():
        return "No content available."

    # Trim to avoid huge token usage on free tier
    truncated = text[:MAX_INPUT_CHARS]

    prompt = (
        "You are a professional tech news editor. "
        "Summarize the following article in exactly 2-3 clear, factual sentences. "
        "Do not use bullet points. Do not start with 'This article'. "
        "Write the summary directly without any preamble.\n\n"
        f"Article:\n{truncated}"
    )

    try:
        return _call_openrouter(prompt)
    except urllib.error.HTTPError as e:
        print(f"  ⚠  OpenRouter HTTP {e.code}: {e.reason}")
        return _fallback_summary(text)
    except Exception as e:
        print(f"  ⚠  Summary API error: {e}")
        return _fallback_summary(text)
"""
collector.py — RSS feed fetcher.

Fetches articles from a single feed URL, cleans them,
classifies them, generates an AI summary, and saves to the DB.
"""

import feedparser
from database import save_article
from cleaner import clean_text
from classifier import classify_article
from summarizer import generate_summary
from config import MAX_ARTICLES


def fetch_and_save(feed_url: str, source: str):
    """Fetch articles from an RSS feed and save them to the database."""
    print(f"\n📡  Fetching: {source}")

    feed = feedparser.parse(feed_url)
    saved = 0

    for entry in feed.entries[:MAX_ARTICLES]:
        title  = entry.get("title", "No Title")
        author = entry.get("author", "Unknown Author")
        link   = entry.get("link", "")
        published_date = entry.get("published", "")

        # ── Content extraction ───────────────────────────────────────────
        if "content" in entry:
            raw_content = entry.content[0].value
        else:
            raw_content = entry.get("summary", "")

        content = clean_text(raw_content)
        summary = clean_text(entry.get("summary", ""))

        # ── Classification ───────────────────────────────────────────────
        classify_text = f"{title}. {content or summary}"
        category = classify_article(classify_text)

        # ── AI Summary ───────────────────────────────────────────────────
        summarize_text = content if len(content) > 100 else summary
        ai_summary = generate_summary(summarize_text)

        # ── Persist ──────────────────────────────────────────────────────
        save_article(
            title,
            author,
            content,
            link,
            published_date,
            source,
            summary,
            ai_summary,
            category,
        )
        saved += 1

    print(f"   Processed {saved} article(s) from {source}.")
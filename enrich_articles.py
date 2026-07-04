"""
enrich_articles.py — Batch enrichment script.

Run once (or anytime new uncategorised articles appear) to:
  1. Re-classify every article using the improved rule-based classifier.
  2. Generate an AI summary for any article that still lacks one.

Usage:
    cd /Users/kashyapgor/Desktop/AI-News-Agent
    source venv/bin/activate
    python enrich_articles.py
"""

import time

from database import get_articles_needing_enrichment, update_article_enrichment
from classifier import classify_article
from summarizer import generate_summary


# ── Tunables ──────────────────────────────────────────────────────────────────
DELAY_BETWEEN_CALLS = 2.0   # seconds — stay within free-tier rate limits
# ─────────────────────────────────────────────────────────────────────────────


def enrich():
    articles = get_articles_needing_enrichment()
    total = len(articles)
    print(f"\n🔄  Found {total} article(s) that need enrichment.\n")

    if total == 0:
        print("✅  Nothing to do — all articles are already enriched.")
        return

    for i, article in enumerate(articles, 1):
        title   = article["title"]   or ""
        content = article["content"] or ""
        summary = article["summary"] or ""

        # Use the richest text available for classification
        text_for_classify = f"{title}. {content or summary}"

        # ── Step 1: Classify ─────────────────────────────────────────────
        category = classify_article(text_for_classify)

        # ── Step 2: Summarize ────────────────────────────────────────────
        text_for_summary = content if len(content) > 100 else summary
        print(f"[{i}/{total}] {title[:65]}…")
        print(f"         Category  : {category}")

        ai_summary = generate_summary(text_for_summary)
        print(f"         AI Summary: {ai_summary[:90]}…")

        # ── Step 3: Persist ──────────────────────────────────────────────
        update_article_enrichment(title, category, ai_summary)
        print(f"         ✓ Updated in DB\n")

        # Polite delay for free-tier rate limits
        if i < total:
            time.sleep(DELAY_BETWEEN_CALLS)

    print(f"\n✅  Done. {total} article(s) enriched.")


if __name__ == "__main__":
    enrich()

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import urllib.request
import urllib.error

from database import (
    get_all_articles,
    get_articles_filtered,
    get_article_by_title,
    save_article_ai_summary,
)
from config import OPENROUTER_API_KEY, OPENROUTER_MODEL

app = FastAPI(title="AI News Agent API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── helpers ────────────────────────────────────────────────────────────────────

def _row_to_dict(article) -> dict:
    return {
        "title":          article["title"],
        "author":         article["author"],
        "content":        article["content"],
        "link":           article["link"],
        "published_date": article["published_date"],
        "source":         article["source"],
        "summary":        article["summary"],
        "ai_summary":     article["ai_summary"],
        "category":       article["category"],
    }


def _call_openrouter(text: str) -> str | None:
    """Call OpenRouter to generate a 3-sentence AI summary. Returns None on failure."""
    prompt = (
        "Summarize this tech/news article in exactly 3 concise, factual sentences. "
        "Be direct and specific. Do not include headings or bullet points.\n\nArticle:\n"
        + text[:3000]
    )
    payload = json.dumps({
        "model":      OPENROUTER_MODEL,
        "messages":   [{"role": "user", "content": prompt}],
        "max_tokens": 200,
    }).encode()
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers={
            "Content-Type":  "application/json",
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer":  "http://localhost",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())["choices"][0]["message"]["content"].strip()
    except Exception:
        return None


# ── routes ─────────────────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "AI News Agent API v2", "docs": "/docs"}


@app.get("/articles")
def get_articles(
    category: str  = Query(default=None),
    search:   str  = Query(default=None),
    sort:     str  = Query(default="latest"),   # latest | oldest | trending
    limit:    int  = Query(default=12, ge=1, le=100),
    offset:   int  = Query(default=0, ge=0),
    paginate: bool = Query(default=False),       # if False → return plain list (backward-compat)
):
    """
    Flexible article listing.
    - No params → returns all articles (backward-compat with existing Home page).
    - paginate=true → returns { articles, total, limit, offset }.
    """
    if not paginate and category is None and search is None:
        # Backward-compatible path for Home page (already works)
        articles = get_all_articles()
        return [_row_to_dict(a) for a in articles]

    rows, total = get_articles_filtered(
        category=category,
        search=search,
        sort=sort,
        limit=limit,
        offset=offset,
    )
    result = [_row_to_dict(a) for a in rows]

    if paginate:
        return {"articles": result, "total": total, "limit": limit, "offset": offset}
    return result


@app.get("/categories")
def get_categories():
    """Return unique categories with article counts."""
    articles = get_all_articles()
    counts: dict[str, int] = {}
    for article in articles:
        cat = article["category"] or "Other"
        counts[cat] = counts.get(cat, 0) + 1
    return [
        {"name": name, "count": count}
        for name, count in sorted(counts.items(), key=lambda x: -x[1])
    ]


class SummaryRequest(BaseModel):
    title: str


@app.post("/articles/summary")
def get_or_generate_summary(req: SummaryRequest):
    """
    Return the existing AI summary for an article.
    If none exists yet, generate one via OpenRouter and persist it.
    """
    article = get_article_by_title(req.title)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")

    existing = (article["ai_summary"] or "").strip()
    if len(existing) > 30:
        return {"ai_summary": existing, "generated": False}

    # Need to generate
    source_text = (article["content"] or article["summary"] or "").strip()
    if len(source_text) < 30:
        raise HTTPException(status_code=422, detail="Article content too short to summarise")

    summary = _call_openrouter(source_text)
    if not summary:
        # Fallback: first 3 sentences of content
        sentences = [s.strip() for s in source_text.split(".") if len(s.strip()) > 20]
        summary = ". ".join(sentences[:3]).strip()
        if summary:
            summary += "."
        else:
            raise HTTPException(status_code=503, detail="Summary generation failed")

    save_article_ai_summary(req.title, summary)
    return {"ai_summary": summary, "generated": True}
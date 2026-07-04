import sqlite3

DB_PATH = "news.db"


def setup_database():
    """Create news.db and articles table if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS articles (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            title         TEXT UNIQUE,
            author        TEXT,
            content       TEXT,
            link          TEXT,
            published_date TEXT,
            source        TEXT,
            summary       TEXT,
            ai_summary    TEXT,
            category      TEXT DEFAULT 'Other'
        )
    """)
    conn.commit()
    conn.close()


def save_article(title, author, content, link, published_date, source,
                 summary, ai_summary, category="Other"):
    """Save a single article to the database."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute("""
            INSERT INTO articles
                (title, author, content, link, published_date, source,
                 summary, ai_summary, category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (title, author, content, link, published_date, source,
              summary, ai_summary, category))
        conn.commit()
        print(f"  ✓ Saved: {title[:70]}")
    except sqlite3.IntegrityError:
        print(f"  ⚠  Duplicate skipped: {title[:70]}")
    finally:
        conn.close()


def update_article_enrichment(title: str, category: str, ai_summary: str):
    """Update category and ai_summary for an existing article (used by enrich script)."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        UPDATE articles
           SET category   = ?,
               ai_summary = ?
         WHERE title = ?
    """, (category, ai_summary, title))
    conn.commit()
    conn.close()


def get_all_articles():
    """Retrieve all articles from the database, newest first."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("""
        SELECT title, author, content, link, published_date,
               source, summary, ai_summary, category
          FROM articles
         ORDER BY published_date DESC
    """)
    articles = c.fetchall()
    conn.close()
    return articles


def get_articles_needing_enrichment():
    """Return articles that are still categorised as 'Other' or have no ai_summary."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("""
        SELECT title, content, summary
          FROM articles
         WHERE category = 'Other'
            OR category IS NULL
            OR TRIM(ai_summary) = ''
            OR ai_summary IS NULL
         ORDER BY published_date DESC
    """)
    articles = c.fetchall()
    conn.close()
    return articles


def search_articles(keyword):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("""
        SELECT title, author, published_date, source, category, ai_summary
          FROM articles
         WHERE title   LIKE ?
            OR summary LIKE ?
            OR source  LIKE ?
    """, (f"%{keyword}%", f"%{keyword}%", f"%{keyword}%"))
    articles = c.fetchall()
    conn.close()
    return articles


def get_articles_filtered(category=None, search=None, sort="latest",
                          limit=12, offset=0):
    """Return paginated, filtered, sorted articles plus total count."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    where_clauses = []
    params: list = []

    if category and category.lower() != "all":
        where_clauses.append("LOWER(category) = LOWER(?)")
        params.append(category)

    if search and search.strip():
        where_clauses.append(
            "(title LIKE ? OR summary LIKE ? OR ai_summary LIKE ? OR source LIKE ?)"
        )
        q = f"%{search.strip()}%"
        params.extend([q, q, q, q])

    where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    order_sql = {
        "oldest":   "ORDER BY published_date ASC",
        "trending": "ORDER BY published_date DESC",   # simplified: latest = trending proxy
        "latest":   "ORDER BY published_date DESC",
    }.get(sort, "ORDER BY published_date DESC")

    # total count (for pagination)
    count_sql = f"SELECT COUNT(*) FROM articles {where_sql}"
    c.execute(count_sql, params)
    total = c.fetchone()[0]

    # actual page
    page_sql = f"""
        SELECT title, author, content, link, published_date,
               source, summary, ai_summary, category
          FROM articles
         {where_sql}
         {order_sql}
         LIMIT ? OFFSET ?
    """
    c.execute(page_sql, params + [limit, offset])
    rows = c.fetchall()
    conn.close()
    return rows, total


def get_article_by_title(title: str):
    """Return a single article row by exact title, or None."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute(
        "SELECT * FROM articles WHERE title = ? LIMIT 1",
        (title,),
    )
    row = c.fetchone()
    conn.close()
    return row


def save_article_ai_summary(title: str, ai_summary: str):
    """Persist an on-demand AI summary back to the DB."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "UPDATE articles SET ai_summary = ? WHERE title = ?",
        (ai_summary, title),
    )
    conn.commit()
    conn.close()
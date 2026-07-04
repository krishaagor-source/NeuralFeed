import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import AISummary from "./AISummary/AISummary";
import { generateArticleSummary } from "../api";
import "./ArticleCard.css";

/* ── Helpers ──────────────────────────────────────────────────────── */
function urlSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(hash) % 1000;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr.slice(0, 10);
  }
}

/* ── Component ─────────────────────────────────────────────────────── */
function ArticleCard({ article, index = 0 }) {
  const seed      = urlSeed(article.link || article.title || String(index));
  const imgUrl    = `https://picsum.photos/seed/${seed}/640/360`;
  const category  = article.category || "Other";
  const rawAI     = (article.ai_summary || "").trim();
  const rawPlain  = (article.summary   || "").trim();
  const previewSummary = rawAI || rawPlain;

  /* ── AI Summary state ─────────────────────────────────────────── */
  const [summaryOpen,   setSummaryOpen]   = useState(false);
  const [summaryStatus, setSummaryStatus] = useState("idle"); // idle|loading|ready|error
  const [summaryText,   setSummaryText]   = useState("");
  const cachedText = useRef(null);

  const openSummary = useCallback(async () => {
    // Toggle off
    if (summaryOpen) {
      setSummaryOpen(false);
      return;
    }

    setSummaryOpen(true);

    // Already cached — replay typewriter
    if (cachedText.current) {
      setSummaryText(cachedText.current);
      setSummaryStatus("ready");
      return;
    }

    // Already in article data — use it directly
    if (rawAI && rawAI.length > 30) {
      cachedText.current = rawAI;
      setSummaryText(rawAI);
      setSummaryStatus("ready");
      return;
    }

    // Must generate
    setSummaryStatus("loading");
    try {
      const data = await generateArticleSummary(article.title);
      cachedText.current = data.ai_summary;
      setSummaryText(data.ai_summary);
      setSummaryStatus("ready");
    } catch {
      setSummaryStatus("error");
    }
  }, [summaryOpen, rawAI, article.title]);

  const retry = useCallback(() => {
    setSummaryStatus("idle");
    cachedText.current = null;
    setSummaryText("");
    setSummaryOpen(false);
    // Re-open will trigger generation again
    setTimeout(() => openSummary(), 50);
  }, [openSummary]);

  return (
    <motion.article
      className="article-card"
      data-category={category}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
    >
      {/* Thumbnail */}
      <div className="article-card__img-wrap">
        <img className="article-card__img" src={imgUrl} alt={article.title} loading="lazy" />
        <div className="article-card__img-overlay" />
        <span className="article-card__category-badge" data-category={category}>
          {category}
        </span>
      </div>

      {/* Body */}
      <div className="article-card__body">
        <div className="article-card__meta">
          <span className="article-card__source">{article.source}</span>
          <span className="article-card__date">{formatDate(article.published_date)}</span>
        </div>

        <h2 className="article-card__title">{article.title}</h2>

        {previewSummary && (
          <p className="article-card__summary">
            {previewSummary.slice(0, 160)}
            {previewSummary.length > 160 ? "…" : ""}
          </p>
        )}

        {/* AI Summary expandable panel */}
        <AISummary
          open={summaryOpen}
          status={summaryStatus}
          text={summaryText}
          onRetry={retry}
        />

        {/* Actions row */}
        <div className="article-card__actions">
          {/* ✨ AI Summary button */}
          <button
            className={`article-card__ai-btn${summaryOpen ? " article-card__ai-btn--open" : ""}`}
            onClick={openSummary}
            aria-expanded={summaryOpen}
            aria-controls={`ai-summary-${seed}`}
            title={summaryOpen ? "Hide AI Summary" : "Show AI Summary"}
          >
            <span className="article-card__ai-btn-sparkle">✨</span>
            {summaryOpen ? "Hide Summary" : "AI Summary"}
          </button>

          {/* Read Article link */}
          <a
            className="article-card__btn"
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read Article
            <svg className="article-card__btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export default ArticleCard;
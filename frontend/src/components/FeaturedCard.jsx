import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import AISummary from "./AISummary/AISummary";
import { generateArticleSummary } from "../api";
import "./FeaturedCard.css";

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
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return dateStr.slice(0, 10);
  }
}

/* ── Component ─────────────────────────────────────────────────────── */
function FeaturedCard({ article }) {
  if (!article) return null;

  const seed     = urlSeed(article.link || article.title || "featured");
  const imgUrl   = `https://picsum.photos/seed/${seed + 500}/1200/600`;
  const category = article.category || "Other";
  const rawAI    = (article.ai_summary || "").trim();
  const summary  = rawAI || (article.summary || "").trim();

  /* ── AI Summary state ─────────────────────────────────────────── */
  const [summaryOpen,   setSummaryOpen]   = useState(false);
  const [summaryStatus, setSummaryStatus] = useState("idle");
  const [summaryText,   setSummaryText]   = useState("");
  const cachedText = useRef(null);

  const openSummary = useCallback(async () => {
    if (summaryOpen) { setSummaryOpen(false); return; }
    setSummaryOpen(true);

    if (cachedText.current) {
      setSummaryText(cachedText.current);
      setSummaryStatus("ready");
      return;
    }

    if (rawAI && rawAI.length > 30) {
      cachedText.current = rawAI;
      setSummaryText(rawAI);
      setSummaryStatus("ready");
      return;
    }

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
    setTimeout(() => openSummary(), 50);
  }, [openSummary]);

  return (
    <motion.article
      className="featured-card"
      data-category={category}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background image */}
      <div className="featured-card__bg">
        <img src={imgUrl} alt={article.title} loading="eager" />
        <div className="featured-card__gradient" />
      </div>

      {/* Content overlay */}
      <div className="featured-card__content">
        <div className="featured-card__header">
          <span className="featured-card__label">✦ Featured Story</span>
          <span className="featured-card__category" data-category={category}>{category}</span>
        </div>

        <h2 className="featured-card__title">{article.title}</h2>

        {summary && (
          <p className="featured-card__summary">
            {summary.slice(0, 220)}{summary.length > 220 ? "…" : ""}
          </p>
        )}

        {/* AI Summary panel */}
        <AISummary
          open={summaryOpen}
          status={summaryStatus}
          text={summaryText}
          onRetry={retry}
        />

        <div className="featured-card__footer">
          <div className="featured-card__byline">
            <span className="featured-card__source">{article.source}</span>
            <span className="featured-card__sep">·</span>
            <span className="featured-card__date">{formatDate(article.published_date)}</span>
          </div>

          <div className="featured-card__actions">
            {/* ✨ AI Summary button */}
            <button
              className={`featured-card__ai-btn${summaryOpen ? " featured-card__ai-btn--open" : ""}`}
              onClick={openSummary}
              aria-expanded={summaryOpen}
              title={summaryOpen ? "Hide AI Summary" : "Show AI Summary"}
            >
              ✨ {summaryOpen ? "Hide Summary" : "AI Summary"}
            </button>

            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="featured-card__btn"
            >
              Read Full Story
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default FeaturedCard;

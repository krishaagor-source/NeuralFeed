import { useEffect, useRef, useState } from "react";
import "./AISummary.css";

/* ─── Skeleton loader (3 pulsing lines) ─────────────────────────────── */
function AISummarySkeleton() {
  return (
    <div className="ai-summary__skeleton" aria-label="Generating summary…">
      <div className="ai-summary__skeleton-line ai-summary__skeleton-line--full" />
      <div className="ai-summary__skeleton-line ai-summary__skeleton-line--wide" />
      <div className="ai-summary__skeleton-line ai-summary__skeleton-line--med" />
    </div>
  );
}

/* ─── Typewriter text ───────────────────────────────────────────────── */
function TypewriterText({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState("");
  const [cursorOn, setCursorOn]   = useState(true);
  const [done, setDone]           = useState(false);
  const charRef = useRef(0);

  // Reset + replay whenever text changes
  useEffect(() => {
    charRef.current = 0;
    setDisplayed("");
    setDone(false);
    if (!text) return;

    const id = setInterval(() => {
      charRef.current += 1;
      setDisplayed(text.slice(0, charRef.current));
      if (charRef.current >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(id);
  }, [text, speed]);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorOn((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="ai-summary__typewriter">
      {displayed}
      {!done && (
        <span
          className="ai-summary__cursor"
          aria-hidden="true"
          style={{ opacity: cursorOn ? 1 : 0 }}
        >|</span>
      )}
      {done && (
        <span
          className="ai-summary__cursor ai-summary__cursor--done"
          aria-hidden="true"
          style={{ opacity: cursorOn ? 0.4 : 0 }}
        >|</span>
      )}
    </span>
  );
}

/* ─── Main AISummary component ──────────────────────────────────────── */
/**
 * Props:
 *  open       {boolean}  - whether the panel is expanded
 *  status     {string}   - 'idle' | 'loading' | 'ready' | 'error'
 *  text       {string}   - summary text (when status === 'ready')
 *  onRetry    {function} - called when user clicks Retry
 */
function AISummary({ open, status, text, onRetry }) {
  if (!open) return null;

  return (
    <div className="ai-summary" role="region" aria-label="AI Summary">
      <div className="ai-summary__header">
        <span className="ai-summary__sparkle">✨</span>
        <span className="ai-summary__label">AI Summary</span>
        {status === "ready" && (
          <span className="ai-summary__badge">Powered by Gemma</span>
        )}
      </div>

      {status === "loading" && <AISummarySkeleton />}

      {status === "error" && (
        <div className="ai-summary__error">
          <span className="ai-summary__error-icon">⚠</span>
          <span>Failed to generate summary.</span>
          <button className="ai-summary__retry-btn" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      {status === "ready" && text && (
        <p className="ai-summary__text">
          <TypewriterText text={text} />
        </p>
      )}
    </div>
  );
}

export default AISummary;

import { useState } from "react";
import { motion } from "framer-motion";
import "./Sidebar.css";

const CATEGORY_COLORS = {
  AI: "#6366f1",
  Programming: "#10b981",
  Cybersecurity: "#ef4444",
  Robotics: "#f59e0b",
  Space: "#06b6d4",
  Startups: "#8b5cf6",
  Business: "#f97316",
  Apple: "#e2e8f0",
  Google: "#3b82f6",
  Microsoft: "#0ea5e9",
  Science: "#84cc16",
  Other: "#64748b",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000 / 60);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function Sidebar({ articles }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Trending: take top 5 most recent
  const trending = articles.slice(0, 5);

  // Latest headlines: next 8
  const latest = articles.slice(5, 13);

  // Category counts
  const categoryCounts = articles.reduce((acc, a) => {
    const cat = a.category || "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const sortedCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <aside className="sidebar">

      {/* ── Trending Now ── */}
      <section className="sidebar__widget">
        <h3 className="sidebar__widget-title">
          <span className="sidebar__widget-icon">🔥</span>
          Trending Now
        </h3>
        <ol className="sidebar__trending">
          {trending.map((a, i) => (
            <motion.li
              key={i}
              className="sidebar__trending-item"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <span className="sidebar__trending-rank">{String(i + 1).padStart(2, "0")}</span>
              <div className="sidebar__trending-info">
                <a
                  href={a.link}
                  target="_blank"
                  rel="noreferrer"
                  className="sidebar__trending-title"
                >
                  {a.title}
                </a>
                <span className="sidebar__trending-source">{a.source}</span>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ── Categories ── */}
      <section className="sidebar__widget">
        <h3 className="sidebar__widget-title">
          <span className="sidebar__widget-icon">◈</span>
          Categories
        </h3>
        <div className="sidebar__categories">
          {sortedCategories.map(([cat, count]) => (
            <div
              key={cat}
              className="sidebar__cat-item"
              style={{ "--cat-color": CATEGORY_COLORS[cat] || "#64748b" }}
            >
              <span className="sidebar__cat-dot" />
              <span className="sidebar__cat-name">{cat}</span>
              <span className="sidebar__cat-count">{count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Latest Headlines ── */}
      <section className="sidebar__widget">
        <h3 className="sidebar__widget-title">
          <span className="sidebar__widget-icon">⚡</span>
          Latest Headlines
        </h3>
        <ul className="sidebar__headlines">
          {latest.map((a, i) => (
            <li key={i} className="sidebar__headline-item">
              <a
                href={a.link}
                target="_blank"
                rel="noreferrer"
                className="sidebar__headline-link"
              >
                {a.title}
              </a>
              <span className="sidebar__headline-time">{formatDate(a.published_date)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Newsletter ── */}
      <section className="sidebar__widget sidebar__newsletter">
        <div className="sidebar__newsletter-icon">✉️</div>
        <h3 className="sidebar__newsletter-title">Stay in the Loop</h3>
        <p className="sidebar__newsletter-sub">
          Get the top AI stories delivered to your inbox daily.
        </p>

        {subscribed ? (
          <motion.div
            className="sidebar__newsletter-success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            ✓ You're subscribed!
          </motion.div>
        ) : (
          <form className="sidebar__newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sidebar__newsletter-input"
              required
            />
            <button type="submit" className="sidebar__newsletter-btn">
              Subscribe
            </button>
          </form>
        )}
      </section>

    </aside>
  );
}

export default Sidebar;

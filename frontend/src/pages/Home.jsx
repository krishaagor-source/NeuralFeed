import { useEffect, useRef, useState, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchArticles } from "../api";
import Navbar from "../components/Navbar";
import FeaturedCard from "../components/FeaturedCard";
import ArticleCard from "../components/ArticleCard";
import Sidebar from "../components/Sidebar/Sidebar";
import "./Home.css";

// Lazy-load the heavy 3D scene
const HeroScene = lazy(() => import("../components/Hero/HeroScene"));

/* ── Rotating typewriter taglines ── */
const TAGLINES = [
  "Stay Ahead in AI",
  "Your Daily AI Intelligence",
  "Real-Time Tech News",
  "AI-Powered News, Curated for You",
  "Breaking AI & Cybersecurity Updates",
  "Explore Tomorrow's Technology Today",
  "Smarter News. Faster Insights.",
  "Stay Updated. Stay Intelligent.",
  "Where Innovation Meets Intelligence",
  "The Future of Tech, Delivered Daily",
];

function useTypewriter(texts, typeSpeed = 62, deleteSpeed = 34, pauseMs = 1900) {
  const [display, setCursor] = useState({ text: "", cursor: true });
  const state = useRef({ idx: 0, char: 0, phase: "typing" });
  const reduced = useRef(
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const cid = setInterval(() =>
      setCursor((s) => ({ ...s, cursor: !s.cursor })), 530);
    return () => clearInterval(cid);
  }, []);

  useEffect(() => {
    if (reduced.current) {
      setCursor({ text: texts[0], cursor: true });
      return;
    }
    let timer;
    const s = state.current;

    const tick = () => {
      const cur = texts[s.idx];
      if (s.phase === "typing") {
        if (s.char < cur.length) {
          s.char++;
          setCursor((prev) => ({ ...prev, text: cur.slice(0, s.char) }));
          timer = setTimeout(tick, typeSpeed);
        } else {
          s.phase = "pausing";
          timer = setTimeout(() => { s.phase = "deleting"; tick(); }, pauseMs);
        }
      } else if (s.phase === "deleting") {
        if (s.char > 0) {
          s.char--;
          setCursor((prev) => ({ ...prev, text: cur.slice(0, s.char) }));
          timer = setTimeout(tick, deleteSpeed);
        } else {
          s.idx = (s.idx + 1) % texts.length;
          s.phase = "typing";
          timer = setTimeout(tick, 220);
        }
      }
    };

    timer = setTimeout(tick, 700);
    return () => clearTimeout(timer);
  }, [texts, typeSpeed, deleteSpeed, pauseMs]);

  return display;
}

/* ── Stagger animation ── */
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

/* ── Section header component ── */
function SectionHeader({ title, icon, link, linkLabel = "View All" }) {
  return (
    <div className="home__section-header">
      <div className="home__section-title">
        {icon && <span className="home__section-icon">{icon}</span>}
        {title}
      </div>
      {link && (
        <Link to={link} className="home__section-link">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

/* ── Main Component ── */
function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { text: twText, cursor: twCursor } = useTypewriter(TAGLINES);

  useEffect(() => {
    fetchArticles()
      .then((data) => { setArticles(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  /* ── Curated sections ── */
  const featured  = articles[0] || null;
  // Trending: next 6 articles (prioritize non-"Other" categories)
  const trending  = useMemo(() => {
    const rest = articles.slice(1);
    const highlighted = rest.filter((a) => a.category && a.category !== "Other");
    const others = rest.filter((a) => !a.category || a.category === "Other");
    return [...highlighted, ...others].slice(0, 6);
  }, [articles]);
  // Latest: next 8 after trending pool
  const latest    = articles.slice(7, 15);
  const categories = useMemo(() =>
    [...new Set(articles.map((a) => a.category).filter(Boolean))].sort(),
  [articles]);

  return (
    <div className="home">
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="hero">
        {/* Left text */}
        <div className="hero__left">
          <motion.div
            className="hero__badge"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="hero__badge-dot" />
            Live AI News Feed
          </motion.div>

          <motion.h1
            className="hero__headline"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="hero__typewriter">{twText}</span>
            <span
              className="hero__cursor"
              aria-hidden="true"
              style={{ opacity: twCursor ? 1 : 0 }}
            >|</span>
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Daily AI, Programming, Robotics, Cybersecurity and Technology
            news from trusted sources — curated in real time.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="hero__cta-row"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/news" className="hero__cta-primary">
              View All News →
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="hero__stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="hero__stat">
              <span className="hero__stat-value">{articles.length}</span>
              <span className="hero__stat-label">Articles</span>
            </div>
            <div className="hero__stat-sep" />
            <div className="hero__stat">
              <span className="hero__stat-value">{categories.length}</span>
              <span className="hero__stat-label">Categories</span>
            </div>
            <div className="hero__stat-sep" />
            <div className="hero__stat">
              <span className="hero__stat-value">Live</span>
              <span className="hero__stat-label">Updates</span>
            </div>
          </motion.div>
        </div>

        {/* Right — 3D scene */}
        <motion.div
          className="hero__right"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Suspense
            fallback={
              <div className="hero__scene-fallback">
                <div className="hero__scene-fallback-pulse" />
              </div>
            }
          >
            <HeroScene />
          </Suspense>
        </motion.div>
      </section>

      {/* ── Loading / Error states ── */}
      {loading && (
        <div className="home__loading">
          <div className="home__spinner" />
          <p>Fetching latest AI news…</p>
        </div>
      )}
      {error && (
        <div className="home__error">
          <span>⚠️</span>
          <p>Could not connect to backend. Make sure FastAPI is running at <code>http://127.0.0.1:8000</code></p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── Featured Story ── */}
          {featured && (
            <section className="home__section home__section--featured">
              <div className="home__section-inner">
                <SectionHeader title="Featured Story" icon="⭐" />
                <FeaturedCard article={featured} />
              </div>
            </section>
          )}

          {/* ── Trending Now ── */}
          {trending.length > 0 && (
            <section className="home__section">
              <div className="home__section-inner">
                <SectionHeader
                  title="Trending Now"
                  icon="🔥"
                  link="/news?sort=trending"
                  linkLabel="More Trending"
                />
                <motion.div
                  className="home__grid home__grid--trending"
                  variants={gridVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-80px" }}
                >
                  {trending.map((article, i) => (
                    <ArticleCard key={article.link || i} article={article} index={i} />
                  ))}
                </motion.div>
              </div>
            </section>
          )}

          {/* ── Latest News + Sidebar ── */}
          {latest.length > 0 && (
            <div className="home__content">
              <main className="home__main">
                <SectionHeader
                  title="Latest News"
                  icon="📡"
                  link="/news"
                  linkLabel="All Articles"
                />
                <motion.div
                  className="home__grid"
                  variants={gridVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-80px" }}
                >
                  {latest.map((article, i) => (
                    <ArticleCard key={article.link || i} article={article} index={i} />
                  ))}
                </motion.div>

                {/* View All CTA */}
                <div className="home__view-all">
                  <Link to="/news" className="home__view-all-btn">
                    View All {articles.length} Articles →
                  </Link>
                </div>
              </main>

              {/* Sidebar */}
              {articles.length > 0 && <Sidebar articles={articles} />}
            </div>
          )}
        </>
      )}

      {/* ── Footer ── */}
      <footer className="home__footer">
        <div className="home__footer-inner">
          <span className="home__footer-logo">⚡ NeuralFeed</span>
          <span className="home__footer-copy">
            Powered by FastAPI · React · Three.js
          </span>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="home__footer-link"
          >
            API Docs ↗
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Home;
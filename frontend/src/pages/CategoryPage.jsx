import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchArticlesPaginated } from "../api";
import Navbar from "../components/Navbar";
import ArticleCard from "../components/ArticleCard";
import Pagination from "../components/Pagination/Pagination";
import "./CategoryPage.css";

const PAGE_SIZE = 12;

/* Map URL slug → display name and emoji */
const CATEGORY_META = {
  ai:                 { name: "AI",                 emoji: "🤖", desc: "Artificial intelligence, machine learning, and deep learning news." },
  cybersecurity:      { name: "Cybersecurity",       emoji: "🔒", desc: "Threats, vulnerabilities, breaches, and security research." },
  programming:        { name: "Programming",         emoji: "💻", desc: "Developer tools, languages, frameworks, and best practices." },
  robotics:           { name: "Robotics",             emoji: "🦾", desc: "Autonomous systems, drones, and robotic engineering advances." },
  space:              { name: "Space",                emoji: "🚀", desc: "Space exploration, satellites, and astronomy breakthroughs." },
  startups:           { name: "Startups",             emoji: "🚀", desc: "New ventures, funding rounds, and entrepreneurship stories." },
  business:           { name: "Business",             emoji: "📊", desc: "Tech industry news, mergers, acquisitions, and market moves." },
  science:            { name: "Science",              emoji: "🔬", desc: "Scientific research, discoveries, and breakthroughs." },
  "machine-learning": { name: "Machine Learning",    emoji: "🧠", desc: "Algorithms, models, and research in machine learning." },
  "cloud-computing":  { name: "Cloud Computing",     emoji: "☁️", desc: "Cloud platforms, infrastructure, and distributed systems." },
  "data-science":     { name: "Data Science",        emoji: "📈", desc: "Analytics, visualization, and data-driven insights." },
  "quantum-computing":{ name: "Quantum Computing",   emoji: "⚛️", desc: "Quantum algorithms, hardware, and research." },
  "space-technology": { name: "Space Technology",    emoji: "🛸", desc: "Satellites, rockets, and space tech innovations." },
};

function slugToCategory(slug) {
  const meta = CATEGORY_META[slug.toLowerCase()];
  if (meta) return meta.name;
  // Fallback: Title Case the slug
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const gridVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.05 } },
};

function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryName = slugToCategory(slug);
  const meta = CATEGORY_META[slug.toLowerCase()] || { emoji: "📰", desc: `Latest ${categoryName} news and updates.` };

  const initSort = searchParams.get("sort") || "latest";
  const initPage = parseInt(searchParams.get("page") || "1", 10);

  const [sort,    setSort]    = useState(initSort);
  const [page,    setPage]    = useState(initPage);
  const [articles, setArticles] = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  /* Sync URL */
  useEffect(() => {
    const params = {};
    if (sort !== "latest") params.sort = sort;
    if (page > 1)          params.page = String(page);
    setSearchParams(params, { replace: true });
  }, [sort, page, setSearchParams]);

  /* Reset page when slug changes */
  useEffect(() => {
    setPage(1);
    setSort("latest");
  }, [slug]);

  /* Fetch */
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchArticlesPaginated({
      category: categoryName,
      sort,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    })
      .then((data) => {
        setArticles(data.articles);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [categoryName, sort, page]);

  const handlePage = useCallback((p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="cat-page">
      <Navbar />

      {/* ── Category hero banner ── */}
      <header className="cat-page__header" data-category={categoryName}>
        <motion.div
          className="cat-page__header-inner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="cat-page__breadcrumb">
            <Link to="/" className="cat-page__breadcrumb-link">Home</Link>
            <span className="cat-page__breadcrumb-sep">/</span>
            <Link to="/news" className="cat-page__breadcrumb-link">News</Link>
            <span className="cat-page__breadcrumb-sep">/</span>
            <span className="cat-page__breadcrumb-current">{categoryName}</span>
          </div>

          <div className="cat-page__hero-row">
            <span className="cat-page__emoji">{meta.emoji}</span>
            <div>
              <h1 className="cat-page__title">{categoryName}</h1>
              <p className="cat-page__desc">{meta.desc}</p>
            </div>
          </div>

          {total > 0 && (
            <div className="cat-page__stats">
              <span className="cat-page__stat-badge">
                {total} article{total !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </motion.div>
      </header>

      {/* ── Sort controls ── */}
      <div className="cat-page__controls">
        <div className="cat-page__controls-inner">
          <span className="cat-page__controls-label">Sort:</span>
          {["latest", "oldest", "trending"].map((s) => (
            <button
              key={s}
              className={`cat-page__sort-pill${sort === s ? " cat-page__sort-pill--active" : ""}`}
              onClick={() => { setSort(s); setPage(1); }}
            >
              {s === "latest" ? "Latest" : s === "oldest" ? "Oldest" : "Trending"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <main className="cat-page__main">
        {loading && (
          <div className="cat-page__loading">
            <div className="cat-page__spinner" />
            <p>Loading {categoryName} articles…</p>
          </div>
        )}

        {!loading && error && (
          <div className="cat-page__error">
            <span>⚠️</span>
            <p>Failed to load: <code>{error}</code></p>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="cat-page__empty">
            <span className="cat-page__empty-icon">{meta.emoji}</span>
            <h3>No {categoryName} articles yet</h3>
            <p>Check back soon — new articles are added daily.</p>
            <Link to="/news" className="cat-page__all-link">Browse All News →</Link>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${slug}-${sort}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="cat-page__results-info">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} articles
              </div>

              <motion.div
                className="cat-page__grid"
                variants={gridVariants}
                initial="hidden"
                animate="show"
              >
                {articles.map((article, i) => (
                  <ArticleCard key={article.link || i} article={article} index={i} />
                ))}
              </motion.div>

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePage}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

export default CategoryPage;

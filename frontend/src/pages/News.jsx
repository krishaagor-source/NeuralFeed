import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchArticlesPaginated, fetchCategories } from "../api";
import Navbar from "../components/Navbar";
import ArticleCard from "../components/ArticleCard";
import FeaturedCard from "../components/FeaturedCard";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination/Pagination";
import "./News.css";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "latest",   label: "Latest First" },
  { value: "oldest",   label: "Oldest First" },
  { value: "trending", label: "Trending"      },
];

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

function News() {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ── State derived from URL params ── */
  const initCategory = searchParams.get("category") || "All";
  const initSearch   = searchParams.get("q")        || "";
  const initSort     = searchParams.get("sort")     || "latest";
  const initPage     = parseInt(searchParams.get("page") || "1", 10);

  const [category,   setCategory]   = useState(initCategory);
  const [search,     setSearch]     = useState(initSearch);
  const [sort,       setSort]       = useState(initSort);
  const [page,       setPage]       = useState(initPage);

  const [articles,   setArticles]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [categories, setCategories] = useState([]);

  /* Compute total pages */
  const totalPages = Math.ceil(total / PAGE_SIZE);

  /* ── Sync URL params ── */
  useEffect(() => {
    const params = {};
    if (category !== "All")  params.category = category;
    if (search.trim())        params.q        = search.trim();
    if (sort !== "latest")    params.sort     = sort;
    if (page > 1)             params.page     = String(page);
    setSearchParams(params, { replace: true });
  }, [category, search, sort, page, setSearchParams]);

  /* ── Fetch categories once ── */
  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.map((c) => c.name)))
      .catch(() => {});
  }, []);

  /* ── Fetch articles whenever filters change ── */
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchArticlesPaginated({
      category: category !== "All" ? category : null,
      search:   search.trim() || null,
      sort,
      limit:    PAGE_SIZE,
      offset:   (page - 1) * PAGE_SIZE,
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
  }, [category, search, sort, page]);

  /* ── Handlers ── */
  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleCategory = useCallback((cat) => {
    setCategory(cat);
    setPage(1);
  }, []);

  const handleSort = useCallback((val) => {
    setSort(val);
    setPage(1);
  }, []);

  const handlePage = useCallback((p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const allCategories = useMemo(() => ["All", ...categories], [categories]);

  /* Featured = first article on page 1 with no search/filter */
  const showFeatured = page === 1 && !search.trim() && category === "All" && !loading;
  const featured     = showFeatured && articles.length > 0 ? articles[0] : null;
  const gridArticles = featured ? articles.slice(1) : articles;

  return (
    <div className="news-page">
      <Navbar />

      {/* ── Page Header ── */}
      <header className="news-page__header">
        <motion.div
          className="news-page__header-inner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="news-page__breadcrumb">
            <span>NeuralFeed</span>
            <span className="news-page__breadcrumb-sep">/</span>
            <span className="news-page__breadcrumb-current">All News</span>
          </div>
          <h1 className="news-page__title">
            {category !== "All" ? category : "All News"}
          </h1>
          <p className="news-page__subtitle">
            {total > 0
              ? `${total} article${total !== 1 ? "s" : ""} across ${categories.length} categories`
              : "The latest technology, AI, and innovation stories"}
          </p>
        </motion.div>
      </header>

      {/* ── Controls bar ── */}
      <div className="news-page__controls">
        <div className="news-page__controls-inner">
          {/* Search */}
          <div className="news-page__search-wrap">
            <SearchBar value={search} onChange={handleSearch} />
          </div>

          {/* Sort */}
          <div className="news-page__sort-wrap">
            <label className="news-page__sort-label" htmlFor="news-sort">Sort:</label>
            <select
              id="news-sort"
              className="news-page__sort"
              value={sort}
              onChange={(e) => handleSort(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Category pills ── */}
      <div className="news-page__cats">
        <div className="news-page__cats-inner">
          {allCategories.map((cat) => (
            <button
              key={cat}
              className={`news-page__cat-pill${category === cat ? " news-page__cat-pill--active" : ""}`}
              onClick={() => handleCategory(cat)}
              data-category={cat !== "All" ? cat : undefined}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="news-page__main">

        {/* Loading */}
        {loading && (
          <div className="news-page__loading">
            <div className="news-page__spinner" />
            <p>Loading articles…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="news-page__error">
            <span>⚠️</span>
            <p>Could not load articles: <code>{error}</code></p>
            <button
              className="news-page__retry-btn"
              onClick={() => { setLoading(true); setError(null); }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && articles.length === 0 && (
          <div className="news-page__empty">
            <span className="news-page__empty-icon">🔍</span>
            <h3>No articles found</h3>
            <p>Try a different search term or category.</p>
            <button
              className="news-page__clear-btn"
              onClick={() => { setSearch(""); setCategory("All"); setPage(1); }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && articles.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${category}-${search}-${sort}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Featured card (page 1, no filter) */}
              {featured && (
                <div className="news-page__featured">
                  <FeaturedCard article={featured} />
                </div>
              )}

              {/* Results info */}
              <div className="news-page__results-info">
                <span className="news-page__count">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, total)} of {total} articles
                </span>
                {(search || category !== "All") && (
                  <button
                    className="news-page__clear-filters"
                    onClick={() => { setSearch(""); setCategory("All"); setPage(1); }}
                  >
                    ✕ Clear filters
                  </button>
                )}
              </div>

              {/* Grid */}
              <motion.div
                className="news-page__grid"
                variants={gridVariants}
                initial="hidden"
                animate="show"
              >
                {gridArticles.map((article, i) => (
                  <ArticleCard key={article.link || i} article={article} index={i} />
                ))}
              </motion.div>

              {/* Pagination */}
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

export default News;

import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Navbar.css";

const NAV_CATEGORIES = [
  "AI", "Cybersecurity", "Programming", "Robotics",
  "Space", "Startups", "Business", "Science",
];

function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [catDropOpen, setCatDropOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!catDropOpen) return;
    const fn = (e) => {
      if (!e.target.closest(".navbar__cat-menu")) setCatDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [catDropOpen]);

  const goCategory = (cat) => {
    navigate(`/category/${cat.toLowerCase().replace(/\s+/g, "-")}`);
    setCatDropOpen(false);
    setMenuOpen(false);
  };

  return (
    <motion.nav
      className={`navbar${scrolled ? " navbar--scrolled" : ""}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">⚡</span>
          <span className="navbar__logo-text">NeuralFeed</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar__links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `navbar__link${isActive ? " navbar__link--active" : ""}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/news"
            className={({ isActive }) =>
              `navbar__link${isActive ? " navbar__link--active" : ""}`
            }
          >
            News
          </NavLink>

          {/* Categories dropdown */}
          <div className="navbar__cat-menu">
            <button
              className={`navbar__link navbar__link--btn${catDropOpen ? " navbar__link--active" : ""}`}
              onClick={() => setCatDropOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={catDropOpen}
            >
              Categories
              <span className={`navbar__chevron${catDropOpen ? " navbar__chevron--open" : ""}`}>›</span>
            </button>

            <AnimatePresence>
              {catDropOpen && (
                <motion.div
                  className="navbar__dropdown"
                  initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                  animate={{ opacity: 1, y: 0,  scaleY: 1    }}
                  exit={{    opacity: 0, y: -8, scaleY: 0.95 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "top center" }}
                >
                  {NAV_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className="navbar__dropdown-item"
                      data-category={cat}
                      onClick={() => goCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right side */}
        <div className="navbar__right">
          <Link to="/news" className="navbar__view-all-btn">
            View All News
          </Link>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="navbar__api-badge"
          >
            API ↗
          </a>

          {/* Hamburger */}
          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger__line${menuOpen ? " hamburger__line--open" : ""}`} />
            <span className={`hamburger__line${menuOpen ? " hamburger__line--open" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/"
              className="navbar__mobile-item"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/news"
              className="navbar__mobile-item"
              onClick={() => setMenuOpen(false)}
            >
              News
            </Link>
            <div className="navbar__mobile-divider">Categories</div>
            {NAV_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="navbar__mobile-item navbar__mobile-item--cat"
                onClick={() => goCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;

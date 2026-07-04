import { motion } from "framer-motion";
import "./CategoryFilter.css";

const CATEGORY_ICONS = {
  All: "✦",
  AI: "🤖",
  Programming: "💻",
  Cybersecurity: "🛡️",
  Robotics: "🦾",
  Space: "🚀",
  Startups: "⚡",
  Business: "📈",
  Apple: "",
  Google: "🔍",
  Microsoft: "🪟",
  Science: "🔬",
  Other: "◈",
};

/* Preferred display order */
const CATEGORY_ORDER = [
  "AI","Programming","Cybersecurity","Robotics","Space",
  "Startups","Business","Apple","Google","Microsoft","Science","Other",
];

function CategoryFilter({ categories, activeCategory, onSelect, counts = {} }) {
  // Sort by preferred order; unknown categories fall at the end
  const sorted = [...categories].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const allCategories = ["All", ...sorted];
  const totalAll = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <div className="cat-filter">
      <div className="cat-filter__scroll">
        {allCategories.map((cat) => {
          const count = cat === "All" ? totalAll : (counts[cat] || 0);
          return (
            <motion.button
              key={cat}
              className={`cat-filter__pill${activeCategory === cat ? " cat-filter__pill--active" : ""}`}
              data-category={cat}
              onClick={() => onSelect(cat)}
              whileTap={{ scale: 0.95 }}
              title={`${count} article${count !== 1 ? "s" : ""}`}
            >
              <span className="cat-filter__icon">{CATEGORY_ICONS[cat] || "◈"}</span>
              {cat}
              {count > 0 && (
                <span className="cat-filter__count">{count}</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryFilter;

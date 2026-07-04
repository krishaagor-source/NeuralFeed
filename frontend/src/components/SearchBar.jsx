import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./SearchBar.css";

function SearchBar({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef();

  return (
    <motion.div
      className={`search-bar${focused ? " search-bar--focused" : ""}`}
      animate={{
        boxShadow: focused
          ? "0 0 0 2px rgba(99,102,241,0.5), 0 8px 32px rgba(0,0,0,0.4)"
          : "0 4px 16px rgba(0,0,0,0.3)",
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Search icon */}
      <svg className="search-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8" strokeWidth="2" />
        <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <input
        ref={inputRef}
        type="text"
        className="search-bar__input"
        placeholder="Search AI news, topics, sources..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
        spellCheck="false"
      />

      {/* Clear button */}
      <AnimatePresence>
        {value && (
          <motion.button
            className="search-bar__clear"
            onClick={() => { onChange(""); inputRef.current?.focus(); }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            aria-label="Clear search"
          >
            ✕
          </motion.button>
        )}
      </AnimatePresence>

      {/* Shortcut hint */}
      {!value && !focused && (
        <span className="search-bar__hint">⌘K</span>
      )}
    </motion.div>
  );
}

export default SearchBar;

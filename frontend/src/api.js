import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 15000,
});

/** Fetch all articles (backward-compat, used by Home curated sections). */
export const fetchArticles = () =>
  API.get("/articles").then((r) => r.data);

/** Fetch a paginated, filtered, sorted page of articles for the News page. */
export const fetchArticlesPaginated = ({
  category = null,
  search   = null,
  sort     = "latest",
  limit    = 12,
  offset   = 0,
} = {}) =>
  API.get("/articles", {
    params: { category, search, sort, limit, offset, paginate: true },
  }).then((r) => r.data); // { articles, total, limit, offset }

/** Fetch category list with counts. */
export const fetchCategories = () =>
  API.get("/categories").then((r) => r.data);

/**
 * Get or generate an AI summary for an article.
 * Returns { ai_summary: string, generated: boolean }.
 */
export const generateArticleSummary = (title) =>
  API.post("/articles/summary", { title }).then((r) => r.data);

export default API;
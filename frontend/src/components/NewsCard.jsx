import "./../styles/NewsCard.css";

function NewsCard({ article }) {
  return (
    <div className="news-card">

      <span className="category">
        {article.category}
      </span>

      <h2>{article.title}</h2>

      <p className="summary">
        {article.summary}
      </p>

      <div className="info">

        <span>{article.source}</span>

        <span>{article.published_date}</span>

      </div>

      <a
        href={article.link}
        target="_blank"
        rel="noreferrer"
        className="read-more"
      >
        Read Full Article →
      </a>

    </div>
  );
}

export default NewsCard;
import React from 'react';

const ArticleCard = ({ article, onClick }) => {
    return (
        <div className="card" onClick={() => onClick(article)}>
            <span className={`badge ${article.status}`}>
                {article.status === 'updated' ? 'AI Enhanced' : 'Original'}
            </span>
            <h2>{article.title}</h2>
            <div className="meta">
                Published: {new Date(article.created_at || Date.now()).toLocaleDateString()}
            </div>
            <button className="btn-card">Review Intelligence</button>
        </div>
    );
};

export default ArticleCard;

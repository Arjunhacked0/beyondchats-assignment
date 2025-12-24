import React, { useState } from 'react';

const ArticleModal = ({ article, onClose, onEnhance }) => {
    const [activeTab, setActiveTab] = useState(article.status === 'updated' ? 'updated' : 'original');

    if (!article) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ animation: 'fadeIn 0.3s' }}>
            <div className="modal-content modal-animate" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2>{article.title}</h2>
                        {article.status === 'original' && (
                            <button
                                onClick={onEnhance}
                                style={{
                                    background: 'var(--primary)',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '99px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                ✨ ENHANCE WITH AI
                            </button>
                        )}
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'original' ? 'active' : ''}`}
                            onClick={() => setActiveTab('original')}
                        >
                            Original Content
                        </button>
                        {article.status === 'updated' && (
                            <button
                                className={`tab ${activeTab === 'updated' ? 'active' : ''}`}
                                onClick={() => setActiveTab('updated')}
                            >
                                AI Enhanced Version
                            </button>
                        )}
                        {article.references && article.references.length > 0 && (
                            <button
                                className={`tab ${activeTab === 'references' ? 'active' : ''}`}
                                onClick={() => setActiveTab('references')}
                            >
                                References
                            </button>
                        )}
                    </div>

                    <div className="content-area">
                        {activeTab === 'original' && (
                            <div className="prose" dangerouslySetInnerHTML={{ __html: article.original_content }} />
                        )}
                        {activeTab === 'updated' && (
                            <div className="prose">
                                {/* Render newlines as breaks for simple markdown display */}
                                {article.updated_content.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        )}
                        {activeTab === 'references' && (
                            <div className="prose">
                                <h3>Sources Cited:</h3>
                                <ul>
                                    {article.references.map((ref, idx) => (
                                        <li key={idx}>
                                            <a href={ref.url} target="_blank" rel="noopener noreferrer" className="source-link">
                                                {ref.title || ref.url}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {activeTab === 'original' && !article.original_content && (
                            <p>No content available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleModal;

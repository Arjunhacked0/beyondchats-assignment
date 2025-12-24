import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ArticleCard from './components/ArticleCard';
import ArticleModal from './components/ArticleModal';

// Progress Modal Component (Moved outside to prevent re-rendering/flickering)
const ProgressModal = ({ percent, logs }) => (
  <div className="modal-overlay" style={{ animation: 'fadeIn 0.3s' }}>
    <div className="modal-content modal-animate" style={{ height: 'auto', maxHeight: '80vh', maxWidth: '600px', display: 'flex', flexDirection: 'column' }}>
      <div className="modal-header">
        <h2>🚀 Enhancing Article... {Math.round(percent)}%</h2>
      </div>
      <div className="modal-body" style={{ padding: '2rem', background: '#000', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Progress Bar Container */}
        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{
            width: `${percent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
            transition: 'width 0.2s ease'
          }}></div>
        </div>

        <div style={{
          fontFamily: 'monospace',
          color: '#00ff00',
          height: '300px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
          {percent < 100 && (
            <div className="loading-pulse" style={{ width: '15px', height: '15px', borderWidth: '2px', marginTop: '0.5rem' }} />
          )}
        </div>
      </div>
    </div>
  </div>
);

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [error, setError] = useState(null);
  // Import State
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming default Laravel API Port is 8000
      const res = await axios.get('http://localhost:8000/api/articles');
      // Handle Laravel pagination response structure if applicable (res.data.data)
      // or direct array (res.data)
      const data = res.data.data ? res.data.data : res.data;

      if (Array.isArray(data)) {
        setArticles(data);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error("Failed to fetch articles", error);
      setError("Could not connect to Backend API. Make sure Laravel is running on Port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importUrl) return;
    try {
      setImporting(true);
      await axios.post('http://localhost:8000/api/articles/import', { url: importUrl });
      setImportUrl('');
      fetchArticles();
    } catch (err) {
      alert('Failed to import URL');
    } finally {
      setImporting(false);
    }
  };

  const [progressLogs, setProgressLogs] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const handleEnhance = async (id) => {
    try {
      setShowProgress(true);
      setProgressLogs(['Initializing AI Pipeline...']);
      setProgressPercent(5);

      // Start SSE Listener
      const eventSource = new EventSource(`http://localhost:8000/api/enhance/progress/${id}`);

      const finish = () => {
        setProgressPercent(100);
        setTimeout(() => {
          if (eventSource.readyState !== EventSource.CLOSED) eventSource.close();
          fetchArticles();
          setShowProgress(false);
          setSelectedArticle(null);
        }, 800);
      };

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const msg = data.message;

        // Dynamic Reality-Based Progress
        if (msg.includes('Step 1') || msg.includes('Fetching')) setProgressPercent(10);
        if (msg.includes('Step 2') || msg.includes('Searching')) setProgressPercent(30);
        if (msg.includes('Found')) setProgressPercent(45);
        if (msg.includes('Step 3') || msg.includes('Scraping')) setProgressPercent(60);
        if (msg.includes('Step 4') || msg.includes('Sending')) setProgressPercent(80);
        if (msg.includes('Step 5') || msg.includes('Publishing')) setProgressPercent(95);

        if (msg === 'DONE' || msg.includes('Finished') || msg.includes('successfully updated')) {
          finish();
        } else {
          setProgressLogs(prev => [...prev, msg]);
        }
      };

      eventSource.onerror = (e) => {
        // If connection closes, assume done if we have logs, otherwise error
        // But usually onerror fires on close. Let's check state.
        if (eventSource.readyState === EventSource.CLOSED) {
          finish();
        }
      };

      // Trigger Backend
      await axios.post(`http://localhost:8000/api/enhance/${id}`);

    } catch (err) {
      alert('Failed to trigger enhancement');
      setShowProgress(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <>
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      <div className="container">
        <header className="header">
          <h1>Beyond<span>Chats</span></h1>
          <p>Next-Gen Content Intelligence Engine</p>
        </header>

        {/* IMPORT SECTION */}
        <div className="import-section" style={{ maxWidth: '600px', margin: '0 auto 3rem', display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Paste Article URL to Import..."
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.3)',
              color: 'white'
            }}
          />
          <button
            onClick={handleImport}
            disabled={importing}
            className="refresh-btn"
            style={{ whiteSpace: 'nowrap' }}
          >
            {importing ? 'Importing...' : '+ Import'}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginTop: '-2rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
          💡 <b>Tip:</b> After importing or enhancing via Link, click <span style={{ color: '#8b5cf6', cursor: 'pointer' }} onClick={fetchArticles}>Refresh Feed</span> if changes don't appear instantly.
        </p>

        <div className="actions">
          <div onClick={fetchArticles} className="refresh-btn">
            Refresh Feed
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="loading-pulse"></div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ff4d4d' }}>
            <h2>{error}</h2>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <h2>No content in the neural network.</h2>
            <p>Initialize scraping sequence.</p>
          </div>
        ) : (
          <div className="grid">
            {articles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={setSelectedArticle}
              />
            ))}
          </div>
        )}

        {selectedArticle && (
          <ArticleModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onEnhance={() => handleEnhance(selectedArticle.id)}
          />
        )}

        {showProgress && <ProgressModal percent={progressPercent} logs={progressLogs} />}
      </div>
    </>
  );
}

export default App;

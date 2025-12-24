const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json());

// Check if server is running
app.get('/', (req, res) => {
    res.send('Backend API is Running! Go to frontend at http://localhost:5173');
});

// In-memory DB
let articles = [
    {
        id: 1,
        title: "Simulation: AI in Healthcare",
        slug: "simulation-ai-healthcare",
        original_content: "<p>This is a simulated article about AI in healthcare. It discusses the pros and cons.</p>",
        updated_content: null,
        source_url: "https://beyondchats.com/blogs/ai-in-healthcare",
        status: "original",
        references: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

// Routes
app.get('/api/articles', (req, res) => {
    res.json({ data: articles });
});

app.get('/api/articles/latest', (req, res) => {
    const latest = articles[articles.length - 1];
    if (latest) res.json(latest);
    else res.status(404).json({ message: 'No articles' });
});

app.get('/api/articles/:id', (req, res) => {
    const article = articles.find(a => a.id == req.params.id);
    if (article) res.json(article);
    else res.status(404).json({ message: 'Not found' });
});

app.put('/api/articles/:id', (req, res) => {
    const idx = articles.findIndex(a => a.id == req.params.id);
    if (idx !== -1) {
        articles[idx] = { ...articles[idx], ...req.body, updated_at: new Date().toISOString() };
        res.json(articles[idx]);
    } else {
        res.status(404).json({ message: 'Not found' });
    }
});

app.get('/api/scrape-trigger', (req, res) => {
    // Simulate scraping
    const newArticle = {
        id: articles.length + 1,
        title: "New Scraped Article " + (articles.length + 1),
        slug: "new-scraped-" + (articles.length + 1),
        original_content: "<p>This is a newly scraped article content.</p>",
        source_url: "https://beyondchats.com/blogs/example",
        status: "original",
        references: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    articles.push(newArticle);
    res.json({ message: "Scrape completed", count: 1, data: [newArticle] });
});

app.listen(PORT, () => {
    console.log(`Mock Laravel Server running on http://localhost:${PORT}`);
});

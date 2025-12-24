const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json());

// MySQL Connection Pool
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: process.env.DB_PASSWORD || 'ADVindiancoder@860964',
    database: 'LMS',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Helper to format article for frontend
const formatArticle = (row) => ({
    ...row,
    id: row.id,
    references: row.references_json // Map JSON column to 'references' key
});

// --- ROUTES ---

// 1. Get All Articles
app.get('/api/articles', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
        res.json({ data: rows.map(formatArticle) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Get Latest Article (for Pipeline)
app.get('/api/articles/latest', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM articles WHERE status = "original" ORDER BY id DESC LIMIT 1');
        if (rows.length > 0) {
            res.json(formatArticle(rows[0]));
        } else {
            // If no original left, allow re-processing the latest one
            const [anyRows] = await pool.query('SELECT * FROM articles ORDER BY id DESC LIMIT 1');
            if (anyRows.length > 0) res.json(formatArticle(anyRows[0]));
            else res.status(404).json({ message: 'No articles found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Get Single Article
app.get('/api/articles/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
        if (rows.length > 0) res.json(formatArticle(rows[0]));
        else res.status(404).json({ message: 'Not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Update Article (Pipeline calls this)
app.put('/api/articles/:id', async (req, res) => {
    try {
        const { updated_content, status, references } = req.body;
        const refJson = JSON.stringify(references || []);

        await pool.query(
            'UPDATE articles SET updated_content = ?, status = ?, references_json = ? WHERE id = ?',
            [updated_content, status, refJson, req.params.id]
        );

        // Fetch updated
        const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
        res.json(formatArticle(rows[0]));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 5. Trigger Scrape (Seeds DB with "Old" data for assignment)
app.get('/api/scrape-trigger', async (req, res) => {
    // In a real Laravel app, this would use the ScraperService.
    // Here we simulate scraping by inserting data into MySQL.

    const seedArticles = [
        {
            title: "Future of Quantum Computing",
            slug: "quantum-computing-" + Date.now(),
            source_url: "https://beyondchats.com/blogs/quantum",
            original_content: "<p>Quantum computers use qubits. They are faster than supercomputers.</p>"
        },
        {
            title: "Blockchain Beyond Crypto",
            slug: "blockchain-beyond-" + Date.now(),
            source_url: "https://beyondchats.com/blogs/blockchain",
            original_content: "<p>Blockchain can be used for supply chain transparency and voting systems.</p>"
        },
        {
            title: "5G Technology Impact",
            slug: "5g-impact-" + Date.now(),
            source_url: "https://beyondchats.com/blogs/5g",
            original_content: "<p>5G brings low latency and high speed internet.</p>"
        },
        {
            title: "Cybersecurity in 2026",
            slug: "cybersecurity-2026-" + Date.now(),
            source_url: "https://beyondchats.com/blogs/cybersec",
            original_content: "<p>With AI hackers, cybersecurity needs AI defenders.</p>"
        },
        {
            title: "Remote Work Trends",
            slug: "remote-work-" + Date.now(),
            source_url: "https://beyondchats.com/blogs/remote-work",
            original_content: "<p>Remote work is staying. Digital nomad lifestyle is growing.</p>"
        },
        {
            title: "Electric Vehicles Revolution",
            slug: "ev-revolution-" + Date.now(),
            source_url: "https://beyondchats.com/blogs/ev",
            original_content: "<p>Battery tech is improving. EV range anxiety is reducing.</p>"
        },
        {
            title: "Space Tourism",
            slug: "space-tourism-" + Date.now(),
            source_url: "https://beyondchats.com/blogs/space",
            original_content: "<p>SpaceX and Blue Origin are making space accessible.</p>"
        },
        {
            title: "Metaverse: Hype or Reality?",
            slug: "metaverse-" + Date.now(),
            source_url: "https://beyondchats.com/blogs/metaverse",
            original_content: "<p>VR and AR are merging to create digital worlds.</p>"
        },
        {
            title: "Sustainable Energy Solutions",
            slug: "sustainable-energy-" + Date.now(),
            source_url: "https://beyondchats.com/blogs/energy",
            original_content: "<p>Solar and wind power are now cheaper than coal.</p>"
        },
        {
            title: "CRISPR and Gene Editing",
            slug: "crispr-" + Date.now(),
            source_url: "https://beyondchats.com/blogs/crispr",
            original_content: "<p>Gene editing can cure genetic diseases.</p>"
        }
    ];

    try {
        for (const art of seedArticles) {
            await pool.query(
                `INSERT INTO articles (title, slug, original_content, source_url, status) 
                 VALUES (?, ?, ?, ?, 'original')`,
                [art.title, art.slug, art.original_content, art.source_url]
            );
        }
        res.json({ message: "Scraped mock data into MySQL successfully.", count: seedArticles.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Root
app.get('/', (req, res) => {
    res.send('REAL Node+MySQL Backend is Running!');
});

// --- NEW FEATURES ---

const { spawn } = require('child_process');
const axios = require('axios');
const cheerio = require('cheerio');

// 6. Trigger Enhancement Pipeline for specific ID
app.post('/api/enhance/:id', (req, res) => {
    const articleId = req.params.id;
    console.log(`[Backend] Triggering AI Pipeline for Article ID: ${articleId}`);

    // Ack immediately
    res.json({ message: 'Enhancement Pipeline Triggered. Check back in 30 seconds.' });

    // Run in background using spawn for streaming output
    // Set CWD to the pipeline directory so it finds the correct .env file
    const path = require('path');
    const pipelineDir = path.resolve(__dirname, '../node-llm-pipeline');

    console.log(`[Backend] Spawning pipeline in: ${pipelineDir}`);

    const pipelineProcess = spawn('node', ['index.js', articleId], {
        cwd: pipelineDir,
        shell: true
    });

    pipelineProcess.stdout.on('data', (data) => {
        const line = data.toString().trim();
        console.log(`[Pipeline]: ${line}`);
        broadcastProgress(articleId, line);
    });

    pipelineProcess.stderr.on('data', (data) => {
        const line = data.toString().trim();
        console.error(`[Pipeline Error]: ${line}`);
        broadcastProgress(articleId, `[Error] ${line}`);
    });

    pipelineProcess.on('close', (code) => {
        console.log(`[Pipeline] Finished with code ${code}`);
        broadcastProgress(articleId, "DONE");
    });
});

// SSE for Real-time Progress
const clients = {}; // { articleId: [res, res, ...] }

app.get('/api/enhance/progress/:id', (req, res) => {
    const id = req.params.id;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!clients[id]) clients[id] = [];
    clients[id].push(res);

    req.on('close', () => {
        clients[id] = clients[id].filter(client => client !== res);
    });
});

function broadcastProgress(id, message) {
    if (clients[id]) {
        clients[id].forEach(client => {
            client.write(`data: ${JSON.stringify({ message })}\n\n`);
        });
    }
}

// 7. Import New Article from URL
app.post('/api/articles/import', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        console.log(`[Backend] Importing from URL: ${url}`);

        // Basic Metadata Scrape
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);

        const title = $('title').text().trim() || 'Untitled Imported Article';
        // Basic scraping for body
        let content = $('article, main, .content').text().trim();
        if (!content || content.length < 100) content = $('p').text().trim();

        // Save to DB
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

        const [result] = await pool.query(
            `INSERT INTO articles (title, slug, original_content, source_url, status) 
             VALUES (?, ?, ?, ?, 'original')`,
            [title, slug.substring(0, 200), content.substring(0, 5000), url] // Truncate for safety
        );

        // Fetch back
        const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [result.insertId]);
        res.json({ message: 'Article Imported', data: formatArticle(rows[0]) });

    } catch (error) {
        console.error('Import Failed:', error.message);
        res.status(500).json({ error: 'Failed to import article. URL might be blocked or invalid.' });
    }
});

app.listen(PORT, () => {
    console.log(`REAL Backend Server (MySQL) running on http://localhost:${PORT}`);
});

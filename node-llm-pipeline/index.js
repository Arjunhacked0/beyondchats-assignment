require('dotenv').config();
const axios = require('axios');
const { searchGoogle } = require('./googleSearch');
const { scrapeContent } = require('./scraper');
const { rewriteArticle } = require('./llm');
const { publishUpdatedContent } = require('./publishArticle');

const API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api';

async function runPipeline() {
    console.log('================================================');
    console.log('       BEYONDCHATS ARTICLE REWRITER PIPELINE    ');
    console.log('================================================');

    // 1. Fetch article (Specific ID or Latest)
    let article;
    const specificId = process.argv[2]; // Get ID from command line arg

    try {
        if (specificId) {
            console.log(`[Step 1] Fetching specific article ID: ${specificId}...`);
            const res = await axios.get(`${API_URL}/articles/${specificId}`);
            article = res.data;
        } else {
            console.log('[Step 1] Fetching latest article from Laravel...');
            const res = await axios.get(`${API_URL}/articles/latest`);
            article = res.data;
        }

        if (!article || !article.id) {
            console.error('[Error] No articles found via API. Did you run the Laravel scraper first?');
            return;
        }
        console.log(` > Target: "${article.title}" (ID: ${article.id})`);

    } catch (error) {
        console.error(`[Error] Failed to connect to Laravel at ${API_URL}: ${error.message}`);
        return;
    }

    // 2. Search Google
    console.log('\n[Step 2] Searching Google for related blogs...');
    const searchResults = await searchGoogle(article.title);

    if (searchResults.length === 0) {
        console.warn('[Warning] No results found. Pipeline stopping.');
        return;
    }

    // 3. Scrape External Content
    console.log('\n[Step 3] Scraping content from top results...');
    const contextArticles = [];

    for (const res of searchResults) {
        const content = await scrapeContent(res.link);
        if (content && content.length > 200) {
            contextArticles.push({
                title: res.title,
                link: res.link,
                content: content
            });
            console.log(` > Scraped: ${res.title} (${content.length} chars)`);
        } else {
            console.log(` > Skipped: ${res.title} (content too short or failed)`);
        }
    }

    if (contextArticles.length === 0) {
        console.warn('[Warning] Insufficient external context scraped. Pipeline stopping.');
        return;
    }

    // 4. LLM Rewrite
    console.log('\n[Step 4] Sending to LLM for rewriting...');
    const updatedContent = await rewriteArticle(article.title, article.original_content, contextArticles);

    if (!updatedContent) {
        console.warn('[Warning] LLM failed to generate content. Pipeline stopping.');
        return;
    }

    // 5. Publish
    console.log('\n[Step 5] Publishing updated content back to API...');
    const references = contextArticles.map(a => ({ title: a.title, url: a.link }));

    await publishUpdatedContent(article.id, updatedContent, references);

    console.log('\n================================================');
    console.log('           PIPELINE FINISHED SUCCESS            ');
    console.log('================================================');
}

runPipeline();

const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api';

async function publishUpdatedContent(articleId, newContent, referencesData) {
    try {
        console.log(`[Publish] Updatng article ID: ${articleId}`);

        await axios.put(`${API_URL}/articles/${articleId}`, {
            updated_content: newContent,
            status: 'updated',
            references: referencesData
        });

        console.log(`[Publish] Article ${articleId} successfully updated.`);
        return true;
    } catch (error) {
        console.error('[Publish] Error publishing to Laravel:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Make sure Laravel backend is running on ' + API_URL);
        }
        return false;
    }
}

module.exports = { publishUpdatedContent };

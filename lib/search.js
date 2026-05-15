'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { iterateVaultFiles } = require('./tags');

async function extractQuery(req, url) {
    const query = url.searchParams.get('query');
    if (query !== null) return query;
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) return '';
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    if (!chunks.length) return '';
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    return data.query || data.q || data.term || '';
}

function relativeVaultPath(root, file) {
    return path.relative(root, file).split(path.sep).join('/');
}

function buildPreview(text, query, width = 180) {
    if (!query) return undefined;
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(query);
    if (index < 0) return undefined;
    const start = Math.max(0, index - Math.floor(width / 2));
    const end = Math.min(text.length, index + Math.floor(width / 2));
    return text.slice(start, end).replace(/\s+/g, ' ').trim().slice(0, width);
}

async function handleSearch(config, req, res, url, { sendJson }) {
    const query = (await extractQuery(req, url)).trim().replace(/^#/, '').toLowerCase();
    const results = [];
    for await (const file of iterateVaultFiles(config.vault)) {
        if (!file.toLowerCase().endsWith('.md')) continue;
        const text = await fs.readFile(file, 'utf8');
        const relative = relativeVaultPath(config.vault, file);
        const lowerText = text.toLowerCase();
        const lowerRelative = relative.toLowerCase();
        if (!query || lowerText.includes(query) || lowerRelative.includes(query)) {
            results.push({
                filename: relative,
                score: 1 + (query && lowerRelative.includes(query) ? 0.5 : 0),
                match_type: 'fulltext',
                preview: buildPreview(text, query),
            });
        }
    }
    results.sort((a, b) => b.score - a.score || a.filename.localeCompare(b.filename));
    sendJson(res, 200, results);
}

module.exports = {
    extractQuery,
    relativeVaultPath,
    buildPreview,
    handleSearch,
};

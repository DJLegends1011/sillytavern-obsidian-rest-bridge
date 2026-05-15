'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

function addTag(tags, raw) {
    const tag = String(raw || '').trim().replace(/^['"]|['"]$/g, '').replace(/^#/, '').toLowerCase();
    if (tag) tags.push(tag);
}

function collectTagsFromText(text) {
    const tags = [];
    const frontmatter = text.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatter) {
        const yaml = frontmatter[1];
        for (const inline of yaml.matchAll(/^tags:\s*\[([^\]]*)\]/gim)) {
            for (const part of inline[1].split(',')) addTag(tags, part);
        }
        const block = yaml.match(/^tags:\s*\n((?:\s*-\s*[^\n]+\n?)+)/im);
        if (block) {
            for (const line of block[1].split(/\r?\n/)) {
                const item = line.match(/^\s*-\s*(.+)$/);
                if (item) addTag(tags, item[1]);
            }
        }
    }
    for (const match of text.matchAll(/(?<![\w/])#([A-Za-z0-9_/-]+)/g)) addTag(tags, match[1]);
    return tags;
}

async function* iterateVaultFiles(root) {
    const entries = await fs.readdir(root, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === '.obsidian') continue;
        const fullPath = path.join(root, entry.name);
        if (entry.isDirectory()) yield* iterateVaultFiles(fullPath);
        if (entry.isFile()) yield fullPath;
    }
}

async function handleTags(config, res, { sendJson }) {
    const counts = new Map();
    for await (const file of iterateVaultFiles(config.vault)) {
        if (!file.toLowerCase().endsWith('.md')) continue;
        const text = await fs.readFile(file, 'utf8');
        for (const tag of collectTagsFromText(text)) counts.set(tag, (counts.get(tag) || 0) + 1);
    }
    const tags = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => ({ name, count }));
    sendJson(res, 200, { tags });
}

module.exports = {
    addTag,
    collectTagsFromText,
    iterateVaultFiles,
    handleTags,
};

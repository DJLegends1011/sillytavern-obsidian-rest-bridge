'use strict';

const fs = require('node:fs/promises');
const fss = require('node:fs');
const path = require('node:path');

const MAX_BODY_BYTES = 50 * 1024 * 1024;

async function handleVault(config, req, res, url, { sendText, sendJson, sendEmpty, defaultFieldDefinitions }) {
    const vaultPath = decodeVaultRequestPath(url.pathname);
    const fullPath = resolveVaultPath(config.vault, vaultPath);

    if (req.method === 'GET' || req.method === 'HEAD') {
        if (vaultPath === 'DeepLore/field-definitions.yaml' && config.fallbackFields && !(await exists(fullPath))) {
            sendText(res, 200, defaultFieldDefinitions, 'text/yaml; charset=utf-8', req.method === 'HEAD');
            return;
        }

        const stat = await statOrNull(fullPath);
        if (!stat) {
            sendJson(res, 404, { error: 'Not found' });
            return;
        }
        if (stat.isDirectory()) {
            if (req.method === 'HEAD') {
                sendEmpty(res, 200);
                return;
            }
            sendJson(res, 200, { files: await listDir(fullPath, vaultPath === '', config) });
            return;
        }
        if (stat.isFile()) {
            if (req.method === 'HEAD') {
                sendEmpty(res, 200);
                return;
            }
            await sendFile(res, fullPath);
            return;
        }
        sendJson(res, 404, { error: 'Not found' });
        return;
    }

    if (req.method === 'PUT' || req.method === 'POST' || req.method === 'PATCH') {
        const body = await readBody(req);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, body);
        sendEmpty(res, 204);
        return;
    }

    if (req.method === 'DELETE') {
        const stat = await statOrNull(fullPath);
        if (!stat) {
            sendJson(res, 404, { error: 'Not found' });
            return;
        }
        if (stat.isFile()) {
            await fs.unlink(fullPath);
            sendEmpty(res, 204);
            return;
        }
        if (stat.isDirectory()) {
            try {
                await fs.rmdir(fullPath);
                sendEmpty(res, 204);
            } catch {
                sendJson(res, 409, { ok: false, error: 'Directory not empty.' });
            }
            return;
        }
    }

    sendJson(res, 405, { error: 'Method not allowed' });
}

function decodeVaultRequestPath(pathname) {
    let encoded = pathname === '/vault' ? '' : pathname.slice('/vault/'.length);
    encoded = encoded.replace(/^\/+|\/+$/g, '');
    return decodeURIComponent(encoded).replace(/\\/g, '/');
}

function resolveVaultPath(vaultRoot, vaultPath) {
    const root = path.resolve(vaultRoot);
    const fullPath = path.resolve(root, vaultPath);
    if (fullPath !== root && !fullPath.startsWith(root + path.sep)) {
        throw httpError(403, 'Forbidden');
    }
    return fullPath;
}

async function listDir(fullPath, isRoot, config) {
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    return entries
        .filter(entry => !(isRoot && config.hideRootDotfiles && entry.name.startsWith('.')))
        .sort((a, b) => {
            if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        })
        .map(entry => entry.name + (entry.isDirectory() ? '/' : ''));
}

async function sendFile(res, fullPath) {
    res.writeHead(200, { 'Content-Type': contentTypeForFile(fullPath) });
    await new Promise((resolve, reject) => {
        const stream = fss.createReadStream(fullPath);
        stream.once('error', reject);
        res.once('error', reject);
        res.once('finish', resolve);
        stream.pipe(res);
    });
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        req.on('data', chunk => {
            size += chunk.length;
            if (size > MAX_BODY_BYTES) {
                reject(httpError(413, 'Request body too large'));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

async function exists(file) {
    return !!(await statOrNull(file));
}

async function statOrNull(file) {
    try {
        return await fs.stat(file);
    } catch {
        return null;
    }
}

function contentTypeForFile(file) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.md') return 'text/markdown; charset=utf-8';
    if (ext === '.yaml' || ext === '.yml') return 'text/yaml; charset=utf-8';
    if (ext === '.json') return 'application/json; charset=utf-8';
    if (ext === '.txt') return 'text/plain; charset=utf-8';
    return 'application/octet-stream';
}

function httpError(statusCode, message) {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}

module.exports = {
    handleVault,
    decodeVaultRequestPath,
    resolveVaultPath,
    listDir,
    sendFile,
    readBody,
    exists,
    statOrNull,
};

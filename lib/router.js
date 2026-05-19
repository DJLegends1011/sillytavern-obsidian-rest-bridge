'use strict';

const { setCorsHeaders, sendJson, sendUnsupported } = require('./respond');

const ROUTE_MATRIX = {
    supported: {
        'GET /': 'supported',
        'GET /vault/': 'supported',
        'GET /vault/{path}': 'supported',
        'PUT /vault/{path}': 'supported',
        'POST /vault/{path}': 'supported',
        'PATCH /vault/{path}': 'supported',
        'DELETE /vault/{path}': 'supported',
        'GET /tags/': 'supported',
        'POST /search/simple/': 'supported',
        'GET /commands/': 'supported',
    },
    unsupported: {
        'GET /active/': 'unsupported',
        'GET /periodic/...': 'unsupported',
        'POST /open/{path}': 'unsupported',
        'POST /commands/{commandId}': 'unsupported',
    },
    intentionallyDifferent: {
        'POST /search/': 'intentionally different',
    },
};

function isUnsupportedObsidianRoute(pathname) {
    return pathname === '/active' ||
        pathname === '/active/' ||
        pathname.startsWith('/periodic/') ||
        pathname.startsWith('/open/');
}

function createRouter(handlers) {
    return async function handle(req, res) {
        try {
            await route(handlers, req, res);
        } catch (err) {
            if (res.headersSent) {
                res.destroy();
                return;
            }
            const status = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
            if (status >= 500) {
                console.warn('[mobile-obsidian-rest] request failed:', err?.message || err);
            }
            sendJson(res, status, { error: err?.message || 'Internal server error' });
        }
    };
}

async function route(handlers, req, res) {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url || '/', 'http://127.0.0.1');

    if (req.method === 'GET' && url.pathname === '/') {
        await handlers.handleRoot(req, res);
        return;
    }
    if (req.method === 'GET' && url.pathname === '/healthz') {
        await handlers.handleHealth(req, res);
        return;
    }

    if (isUnsupportedObsidianRoute(url.pathname)) {
        sendUnsupported(res, url.pathname);
        return;
    }

    handlers.requireAuth(req);

    if (url.pathname === '/commands/' || url.pathname === '/commands') {
        if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' });
            return;
        }
        sendJson(res, 200, []);
        return;
    }

    if (url.pathname.startsWith('/commands/')) {
        sendUnsupported(res, url.pathname);
        return;
    }

    return handlers.handleAuthenticated(url, req, res);
}

module.exports = {
    createRouter,
    isUnsupportedObsidianRoute,
    ROUTE_MATRIX,
};

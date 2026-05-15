'use strict';

const { setCorsHeaders, sendJson, sendUnsupported } = require('./respond');

function isUnsupportedObsidianRoute(pathname) {
    return pathname === '/active' ||
        pathname === '/active/' ||
        pathname.startsWith('/periodic/') ||
        pathname.startsWith('/open/');
}

function createRouter(handlers) {
    return async function handle(req, res) {
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
    };
}

module.exports = {
    createRouter,
    isUnsupportedObsidianRoute,
};

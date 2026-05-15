'use strict';

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH,HEAD');
    res.setHeader('Cache-Control', 'no-store');
}

function sendJson(res, status, payload) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
}

function sendText(res, status, text, contentType = 'text/plain; charset=utf-8', headOnly = false) {
    res.writeHead(status, { 'Content-Type': contentType });
    res.end(headOnly ? undefined : text);
}

function sendEmpty(res, status) {
    res.writeHead(status);
    res.end();
}

function sendUnsupported(res, route) {
    sendJson(res, 501, {
        ok: false,
        error: `Route ${route} is unsupported in Termux bridge mode.`,
    });
}

module.exports = {
    setCorsHeaders,
    sendJson,
    sendText,
    sendEmpty,
    sendUnsupported,
};

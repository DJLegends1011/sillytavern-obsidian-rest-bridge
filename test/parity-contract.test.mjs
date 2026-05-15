import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { makeVault, startServer, request } from './helpers.mjs';

test('GET / reports authenticated false without a bearer token', async (t) => {
    const vault = await makeVault();
    t.after(() => fs.rm(vault, { recursive: true, force: true }));

    const { server, baseUrl } = await startServer(vault);
    t.after(() => server.close());

    const response = await fetch(`${baseUrl}/`);

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.authenticated, false);
});

test('GET / reports authenticated true with a bearer token', async (t) => {
    const vault = await makeVault();
    t.after(() => fs.rm(vault, { recursive: true, force: true }));

    const { server, baseUrl } = await startServer(vault);
    t.after(() => server.close());

    const response = await request(baseUrl, '/');

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.authenticated, true);
});

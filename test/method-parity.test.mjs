import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { makeVault, startServer, request } from './helpers.mjs';

test('POST /tags/ returns 405', async (t) => {
    const vault = await makeVault();
    t.after(() => fs.rm(vault, { recursive: true, force: true }));
    const { server, baseUrl } = await startServer(vault);
    t.after(() => new Promise(resolve => server.close(resolve)));

    const response = await request(baseUrl, '/tags/', { method: 'POST' });
    assert.equal(response.status, 405);
});

for (const pathname of ['/search/', '/search/simple/']) {
    test(`GET ${pathname} returns 405`, async (t) => {
        const vault = await makeVault();
        t.after(() => fs.rm(vault, { recursive: true, force: true }));
        const { server, baseUrl } = await startServer(vault);
        t.after(() => new Promise(resolve => server.close(resolve)));

        const response = await request(baseUrl, pathname, { method: 'GET' });
        assert.equal(response.status, 405);
    });
}

test('POST /search/ accepts JSON query bodies', async (t) => {
    const vault = await makeVault();
    await fs.mkdir(`${vault}/Lore`, { recursive: true });
    await fs.writeFile(`${vault}/Lore/Mimic Mode.md`, '# Mimic Mode\n');
    t.after(() => fs.rm(vault, { recursive: true, force: true }));
    const { server, baseUrl } = await startServer(vault);
    t.after(() => new Promise(resolve => server.close(resolve)));

    const response = await request(baseUrl, '/search/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Mimic' }),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body[0].filename, 'Lore/Mimic Mode.md');
});

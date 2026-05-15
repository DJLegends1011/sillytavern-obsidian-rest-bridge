import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { makeVault, startServer, request } from './helpers.mjs';

for (const pathname of ['/active/', '/periodic/daily/', '/open/Test.md']) {
    test(`unsupported Obsidian runtime route ${pathname} returns 501`, async (t) => {
        const vault = await makeVault();
        t.after(() => fs.rm(vault, { recursive: true, force: true }));
        const { server, baseUrl } = await startServer(vault);
        t.after(() => new Promise(resolve => server.close(resolve)));

        const response = await request(baseUrl, pathname, { method: 'GET' });
        assert.equal(response.status, 501);
        const body = await response.json();
        assert.equal(body.ok, false);
        assert.match(body.error, /unsupported in Termux bridge mode/i);
    });
}

test('unsupported command execution returns 501 with bridge-specific message', async (t) => {
    const vault = await makeVault();
    t.after(() => fs.rm(vault, { recursive: true, force: true }));
    const { server, baseUrl } = await startServer(vault);
    t.after(() => new Promise(resolve => server.close(resolve)));

    const response = await request(baseUrl, '/commands/workspace%3Aopen', { method: 'POST' });
    assert.equal(response.status, 501);
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.match(body.error, /unsupported in Termux bridge mode/i);
});

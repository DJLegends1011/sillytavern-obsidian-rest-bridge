import test from 'node:test';
import assert from 'node:assert/strict';
import { makeVault, startServer } from './helpers.mjs';

test('missing or wrong API key returns a clean 401 instead of crashing', async () => {
    const vault = await makeVault();
    const { server, baseUrl } = await startServer(vault);
    try {
        const noKey = await fetch(`${baseUrl}/tags/`);
        assert.equal(noKey.status, 401);
        assert.deepEqual(await noKey.json(), { error: 'Unauthorized' });

        const wrongKey = await fetch(`${baseUrl}/vault/`, {
            headers: { Authorization: 'Bearer not-the-secret' },
        });
        assert.equal(wrongKey.status, 401);
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
});

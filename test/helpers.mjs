import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import plugin from '../index.js';

export async function makeVault() {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'obsidian-rest-bridge-'));
    await fs.mkdir(path.join(root, 'DeepLore'), { recursive: true });
    await fs.writeFile(path.join(root, 'DeepLore', 'field-definitions.yaml'), 'fields: []\n');
    return root;
}

export async function startServer(vault) {
    const server = await plugin._private.startCompatibilityServer({
        vault,
        apiKey: 'secret',
        host: '127.0.0.1',
        port: 0,
        fallbackFields: true,
        hideRootDotfiles: true,
        debug: false,
    });
    const address = server.address();
    return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

export async function request(baseUrl, pathname, options = {}) {
    return fetch(`${baseUrl}${pathname}`, {
        ...options,
        headers: {
            Authorization: 'Bearer secret',
            ...(options.headers || {}),
        },
    });
}

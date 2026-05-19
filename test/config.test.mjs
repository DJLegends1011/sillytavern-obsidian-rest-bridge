import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getLegacyApiKeyLogMethod, loadConfigFile, readConfig, shouldStartWithApiKey } from '../lib/config.js';

test('readConfig prefers canonical standalone env names', () => {
    const config = readConfig({
        OBSIDIAN_REST_BRIDGE_VAULT: '/vault/new',
        OBSIDIAN_REST_BRIDGE_API_KEY: 'new-key',
        OBSIDIAN_REST_BRIDGE_HOST: '0.0.0.0',
        OBSIDIAN_REST_BRIDGE_PORT: '28123',
        OBSIDIAN_VAULT: '/vault/legacy',
        OBSIDIAN_API_KEY: 'legacy-key',
    });

    assert.equal(config.vault, '/vault/new');
    assert.equal(config.apiKey, 'new-key');
    assert.equal(config.host, '0.0.0.0');
    assert.equal(config.port, 28123);
});

test('readConfig falls back to legacy aliases for DLE migration', () => {
    const config = readConfig({
        OBSIDIAN_VAULT: '/vault/legacy',
        OBSIDIAN_API_KEY: 'legacy-key',
        OBSIDIAN_API_HOST: '127.0.0.1',
        OBSIDIAN_API_PORT: '27123',
        OBSIDIAN_API_FALLBACK_FIELDS: '0',
        OBSIDIAN_API_HIDE_ROOT_DOTFILES: '0',
        OBSIDIAN_API_DEBUG: '1',
    });

    assert.equal(config.vault, '/vault/legacy');
    assert.equal(config.apiKey, 'legacy-key');
    assert.equal(config.host, '127.0.0.1');
    assert.equal(config.port, 27123);
    assert.equal(config.fallbackFields, false);
    assert.equal(config.hideRootDotfiles, false);
    assert.equal(config.debug, true);
});

test('environment variables override config file values', () => {
    const config = readConfig(
        { OBSIDIAN_VAULT: '/env/vault' },
        { vault: '/file/vault', apiKey: 'file-key' },
    );

    assert.equal(config.vault, '/env/vault');
    assert.equal(config.apiKey, 'file-key');
});

test('config file values are used when env names are absent', () => {
    const config = readConfig({}, {
        vault: '/file/vault',
        apiKey: 'file-key',
        host: '0.0.0.0',
        port: 28999,
        fallbackFields: false,
        hideRootDotfiles: false,
        debug: true,
    });

    assert.equal(config.vault, '/file/vault');
    assert.equal(config.apiKey, 'file-key');
    assert.equal(config.host, '0.0.0.0');
    assert.equal(config.port, 28999);
    assert.equal(config.fallbackFields, false);
    assert.equal(config.hideRootDotfiles, false);
    assert.equal(config.debug, true);
});

test('readConfig with no file argument behaves as before (defaults)', () => {
    const config = readConfig({});

    assert.equal(config.vault, '');
    assert.equal(config.apiKey, '');
    assert.equal(config.host, '127.0.0.1');
    assert.equal(config.port, 27123);
    assert.equal(config.fallbackFields, true);
    assert.equal(config.hideRootDotfiles, true);
    assert.equal(config.debug, false);
});

test('loadConfigFile tolerates a missing file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orb-cfg-'));
    assert.deepEqual(loadConfigFile(dir), {});
    fs.rmSync(dir, { recursive: true, force: true });
});

test('loadConfigFile tolerates invalid JSON', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orb-cfg-'));
    fs.writeFileSync(path.join(dir, 'config.json'), '{ not valid json');
    assert.deepEqual(loadConfigFile(dir), {});
    fs.rmSync(dir, { recursive: true, force: true });
});

test('loadConfigFile reads a valid config file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orb-cfg-'));
    fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify({ vault: '/v', apiKey: 'k' }));
    assert.deepEqual(loadConfigFile(dir), { vault: '/v', apiKey: 'k' });
    fs.rmSync(dir, { recursive: true, force: true });
});

test('shouldStartWithApiKey requires a non-empty string', () => {
    assert.equal(shouldStartWithApiKey('token'), true);
    assert.equal(shouldStartWithApiKey(''), false);
    assert.equal(shouldStartWithApiKey(null), false);
});

test('legacy default api key is informational on loopback hosts', () => {
    assert.equal(getLegacyApiKeyLogMethod({ apiKey: '12345', host: '127.0.0.1' }), 'log');
    assert.equal(getLegacyApiKeyLogMethod({ apiKey: '12345', host: 'localhost' }), 'log');
    assert.equal(getLegacyApiKeyLogMethod({ apiKey: '12345', host: '::1' }), 'log');
});

test('legacy default api key stays a warning on non-loopback hosts', () => {
    assert.equal(getLegacyApiKeyLogMethod({ apiKey: '12345', host: '0.0.0.0' }), 'warn');
    assert.equal(getLegacyApiKeyLogMethod({ apiKey: '12345', host: '192.168.1.20' }), 'warn');
    assert.equal(getLegacyApiKeyLogMethod({ apiKey: 'not-default', host: '127.0.0.1' }), null);
});

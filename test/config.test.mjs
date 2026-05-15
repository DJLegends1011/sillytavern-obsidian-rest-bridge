import test from 'node:test';
import assert from 'node:assert/strict';
import { readConfig, shouldStartWithApiKey } from '../lib/config.js';

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

test('shouldStartWithApiKey requires a non-empty string', () => {
    assert.equal(shouldStartWithApiKey('token'), true);
    assert.equal(shouldStartWithApiKey(''), false);
    assert.equal(shouldStartWithApiKey(null), false);
});

'use strict';

const DEFAULT_PORT = 27123;
const DEFAULT_HOST = '127.0.0.1';
const LEGACY_DEFAULT_API_KEY = '12345';

function pick(env, names, fallback = '') {
    for (const name of names) {
        if (Object.prototype.hasOwnProperty.call(env, name) && env[name] !== '') {
            return env[name];
        }
    }
    return fallback;
}

function readConfig(env = process.env) {
    const vault = pick(env, ['OBSIDIAN_REST_BRIDGE_VAULT', 'OBSIDIAN_VAULT', 'DLE_MOBILE_OBSIDIAN_VAULT'], '');
    const apiKey = pick(env, ['OBSIDIAN_REST_BRIDGE_API_KEY', 'OBSIDIAN_API_KEY', 'DLE_MOBILE_OBSIDIAN_API_KEY'], '');
    const host = pick(env, ['OBSIDIAN_REST_BRIDGE_HOST', 'OBSIDIAN_API_HOST', 'DLE_MOBILE_OBSIDIAN_API_HOST'], DEFAULT_HOST);
    const port = Number(pick(env, ['OBSIDIAN_REST_BRIDGE_PORT', 'OBSIDIAN_API_PORT', 'DLE_MOBILE_OBSIDIAN_API_PORT'], String(DEFAULT_PORT)));
    const fallbackFields = pick(env, ['OBSIDIAN_REST_BRIDGE_FALLBACK_FIELDS', 'OBSIDIAN_API_FALLBACK_FIELDS'], '1') !== '0';
    const hideRootDotfiles = pick(env, ['OBSIDIAN_REST_BRIDGE_HIDE_ROOT_DOTFILES', 'OBSIDIAN_API_HIDE_ROOT_DOTFILES'], '1') !== '0';
    const debug = pick(env, ['OBSIDIAN_REST_BRIDGE_DEBUG', 'OBSIDIAN_API_DEBUG', 'DLE_MOBILE_OBSIDIAN_DEBUG'], '0') === '1';

    return { vault, apiKey, host, port, fallbackFields, hideRootDotfiles, debug };
}

function shouldStartWithApiKey(apiKey) {
    return typeof apiKey === 'string' && apiKey.length > 0;
}

function isLoopbackHost(host) {
    const normalized = String(host || '').trim().toLowerCase();
    return normalized === '127.0.0.1' || normalized === 'localhost' || normalized === '::1';
}

function getLegacyApiKeyLogMethod(config) {
    if (config?.apiKey !== LEGACY_DEFAULT_API_KEY) {
        return null;
    }
    return isLoopbackHost(config.host) ? 'log' : 'warn';
}

module.exports = {
    DEFAULT_PORT,
    DEFAULT_HOST,
    LEGACY_DEFAULT_API_KEY,
    getLegacyApiKeyLogMethod,
    isLoopbackHost,
    readConfig,
    shouldStartWithApiKey,
};

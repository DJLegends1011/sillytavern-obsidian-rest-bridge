'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_PORT = 27123;
const DEFAULT_HOST = '127.0.0.1';
const LEGACY_DEFAULT_API_KEY = '12345';
const CONFIG_FILE_NAME = 'config.json';

function pick(env, names, fallback = '') {
    for (const name of names) {
        if (Object.prototype.hasOwnProperty.call(env, name) && env[name] !== '') {
            return env[name];
        }
    }
    return fallback;
}

function loadConfigFile(rootDir = path.join(__dirname, '..')) {
    const filePath = path.join(rootDir, CONFIG_FILE_NAME);
    let raw;
    try {
        raw = fs.readFileSync(filePath, 'utf8');
    } catch {
        return {};
    }
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        console.warn(`[mobile-obsidian-rest] ${CONFIG_FILE_NAME} is invalid JSON; ignoring it.`);
        return {};
    }
}

const ENV_UNSET = Symbol('env-unset');

// Precedence per setting: environment variable -> config.json -> built-in default.
function resolve(env, names, fileConfig, fileKey, fallback) {
    const fromEnv = pick(env, names, ENV_UNSET);
    if (fromEnv !== ENV_UNSET) {
        return fromEnv;
    }
    const fromFile = fileConfig[fileKey];
    if (fromFile !== undefined && fromFile !== '') {
        return fromFile;
    }
    return fallback;
}

function isTruthyFlag(value, defaultValue) {
    if (value === undefined) return defaultValue;
    if (typeof value === 'boolean') return value;
    return String(value) !== '0' && String(value).toLowerCase() !== 'false';
}

function isDebugFlag(value) {
    if (value === undefined) return false;
    if (typeof value === 'boolean') return value;
    return String(value) === '1' || String(value).toLowerCase() === 'true';
}

function readConfig(env = process.env, fileConfig = {}) {
    const vault = resolve(env, ['OBSIDIAN_REST_BRIDGE_VAULT', 'OBSIDIAN_VAULT', 'DLE_MOBILE_OBSIDIAN_VAULT'], fileConfig, 'vault', '');
    const apiKey = resolve(env, ['OBSIDIAN_REST_BRIDGE_API_KEY', 'OBSIDIAN_API_KEY', 'DLE_MOBILE_OBSIDIAN_API_KEY'], fileConfig, 'apiKey', '');
    const host = resolve(env, ['OBSIDIAN_REST_BRIDGE_HOST', 'OBSIDIAN_API_HOST', 'DLE_MOBILE_OBSIDIAN_API_HOST'], fileConfig, 'host', DEFAULT_HOST);
    const port = Number(resolve(env, ['OBSIDIAN_REST_BRIDGE_PORT', 'OBSIDIAN_API_PORT', 'DLE_MOBILE_OBSIDIAN_API_PORT'], fileConfig, 'port', DEFAULT_PORT));
    const fallbackFields = isTruthyFlag(resolve(env, ['OBSIDIAN_REST_BRIDGE_FALLBACK_FIELDS', 'OBSIDIAN_API_FALLBACK_FIELDS'], fileConfig, 'fallbackFields', undefined), true);
    const hideRootDotfiles = isTruthyFlag(resolve(env, ['OBSIDIAN_REST_BRIDGE_HIDE_ROOT_DOTFILES', 'OBSIDIAN_API_HIDE_ROOT_DOTFILES'], fileConfig, 'hideRootDotfiles', undefined), true);
    const debug = isDebugFlag(resolve(env, ['OBSIDIAN_REST_BRIDGE_DEBUG', 'OBSIDIAN_API_DEBUG', 'DLE_MOBILE_OBSIDIAN_DEBUG'], fileConfig, 'debug', undefined));

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
    CONFIG_FILE_NAME,
    getLegacyApiKeyLogMethod,
    isLoopbackHost,
    loadConfigFile,
    readConfig,
    shouldStartWithApiKey,
};

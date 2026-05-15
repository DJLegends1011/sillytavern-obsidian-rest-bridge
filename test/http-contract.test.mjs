import test from 'node:test';
import assert from 'node:assert/strict';
import plugin from '../index.js';

test('exports SillyTavern server plugin hooks', () => {
    assert.equal(typeof plugin.init, 'function');
    assert.equal(typeof plugin.exit, 'function');
    assert.equal(plugin.info?.id, 'obsidian-rest-bridge');
});

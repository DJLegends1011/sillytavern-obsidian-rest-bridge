import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUTE_MATRIX } from '../lib/router.js';

test('route matrix captures supported, unsupported, and intentionally different routes', () => {
    assert.equal(ROUTE_MATRIX.supported['GET /vault/{path}'], 'supported');
    assert.equal(ROUTE_MATRIX.supported['POST /search/simple/'], 'supported');
    assert.equal(ROUTE_MATRIX.unsupported['GET /active/'], 'unsupported');
    assert.equal(ROUTE_MATRIX.unsupported['POST /commands/{commandId}'], 'unsupported');
    assert.equal(ROUTE_MATRIX.intentionallyDifferent['POST /search/'], 'intentionally different');
});

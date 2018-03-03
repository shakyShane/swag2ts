const {readFileSync} = require('fs');
const assert = require('assert');
const stub1 = require('../fixtures/mini');
const {createDefs} = require('../');

describe("namespace generation", function() {
    it('works ', function() {
        const miniExpected = readFileSync('./tests/expected/mini.ts', 'utf8');
        const actual = createDefs(stub1);
        assert.equal(actual, miniExpected);
    });
});

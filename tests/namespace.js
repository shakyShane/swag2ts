
const {readFileSync} = require('fs');
const assert = require('assert');
const stub1 = require('../fixtures/mini');
const {createSplitDefs} = require('../');

describe("namespace generation", function() {
    it('works as multi-file', function() {
        const miniExpected = readFileSync('./tests/expected/mini-separate-defs.ts', 'utf8');
        const miniDefs = readFileSync('./tests/expected/Definitions.ts', 'utf8');
        const actual = createSplitDefs(stub1);
        const {modules, definitions} = actual;

        assert.equal(modules.length, 1);

        assert.equal(modules[0].displayName, 'AcmeManageBasketAddToBasketV1AddProductPut.ts');
        assert.equal(modules[0].content, miniExpected);

        assert.equal(definitions[0].displayName, 'Definitions.ts');
        assert.equal(definitions[0].content, miniDefs);
    });
});

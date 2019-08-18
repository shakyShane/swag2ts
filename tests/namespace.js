
const {readFileSync} = require('fs');
const assert = require('assert');
const stub1 = require('../fixtures/mini');
const stub2 = require('../fixtures/mini2');
const stub3 = require('../fixtures/missing-200-return');
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
    it('works as multi-file (with array as response)', function() {
        const miniExpected = readFileSync('./tests/expected/mini-separate-defs2.ts', 'utf8');
        const miniDefs = readFileSync('./tests/expected/Definitions.ts', 'utf8');
        const actual = createSplitDefs(stub2);
        const {modules, definitions} = actual;

        assert.equal(modules.length, 1);

        assert.equal(modules[0].displayName, 'AcmeManageBasketAddToBasketV1AddProductPut.ts');
        assert.equal(modules[0].content, miniExpected);

        assert.equal(definitions[0].displayName, 'Definitions.ts');
        assert.equal(definitions[0].content, miniDefs);
    });
    it('works with no 200 response', function() {
        const miniExpected = readFileSync('./tests/expected/void-200.ts', 'utf8');
        const actual = createSplitDefs(stub3);
        const {modules} = actual;

        assert.equal(modules[0].content, miniExpected);
    });
});

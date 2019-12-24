const json = require('./fixtures/swagger-01');
const ts = require("typescript");
const {writeFileSync} = require('fs');
const {join} = require('path');
// const json = require('./fixtures/large');
const swagger = require('./');
const {
    createConst,
    createDefs,
    createInterface,
    createStatement,
    printNamespace,
    printMany,
    createSplitDefs,
    createNamedImport
} = swagger;
// const ts = require('typescript');


const defs = createSplitDefs(json);
// console.log(json);
// console.log(defs.modules.length);
const paths = [];
const output = defs.modules.forEach(x => {
    console.log(x.item.hasRespKeys);
})

// console.log(output);

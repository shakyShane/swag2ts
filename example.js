// const json = require('./fixtures/swagger-01');
const json = require('./fixtures/large');
const swagger = require('./');
const {createConst, createDefs, createInterface, createStatement, printNamespace, printMany} = swagger;
// const ts = require('typescript');
console.log(createDefs(json));

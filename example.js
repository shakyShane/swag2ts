// const json = require('./fixtures/swagger-01');
const json = require('/Users/shakyshane/sites/jh/selco-m2/swagger.json');
const swagger = require('./');
const {createConst, createDefs, createInterface, createStatement, printNamespace, printMany} = swagger;
// const ts = require('typescript');
console.log(createDefs(json));

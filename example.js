// const json = require('./fixtures/swagger-01');
const ts = require("typescript");
const {writeFileSync} = require('fs');
const {join} = require('path');
const json = require('./fixtures/mini');
const swagger = require('./');
const {createConst, createDefs, createInterface, createStatement, printNamespace, printMany, createSplitDefs} = swagger;
// const ts = require('typescript');

// const res = createSplitDefs(json, {importPath: "../Defs", defName: "Defs"});
// res.modules.concat(res.definitions).forEach(x => {
//     console.log(x.content);
//     // writeFileSync(join('swagger', x.displayName), x.content);
// });

// const result = ts.createSourceFile("module", "", ts.ScriptTarget.ES2016);
// const printer = ts.createPrinter({
//     newLine: ts.NewLineKind.LineFeed,
// });
//
// const tsInput = `
// import {Definitions} from './Definitions';
// export namespace SelcoManageBasketAddToBasketV1Put {
//     export type Response = Definitions.Shane
// }
// `;
//
//
// let sourceFile = ts.createSourceFile('json.ts', tsInput, ts.ScriptTarget.Latest, /*setParentNodes */ true);
//
// const im = ts.createImportDeclaration();
// const importSepcIden = ts.createIdentifier('Definitions');
// const importSe = ts.createImportSpecifier(undefined, importSepcIden);
// const namedId = ts.createNamedImports([importSe]);
//
// const clause = ts.createImportClause();
// clause.namedBindings = namedId;
//
// im.importClause = clause;
// im.moduleSpecifier = ts.createLiteral('./Definitions');
//
// // console.log(im);
//
// console.log(printer.printNode(ts.EmitHint.Unspecified, im, result));

// const json = require('./fixtures/swagger-01');
const ts = require("typescript");
const {writeFileSync} = require('fs');
const {join} = require('path');
const json = require('./fixtures/large');
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

const ajaxMethods = {
    "GET": "getJSON",
    "PUT": "putJSON",
    "POST": "postJSON",
    "DELETE": "deleteJSON",
};
function getExecute(item) {
    const ajaxMethod = ajaxMethods[item.variables.method];
    return ts.createFunctionDeclaration(
        undefined,
        ts.createNodeArray([ts.createToken(ts.SyntaxKind.ExportKeyword)]),
        undefined,
        'execute',
        undefined,
        [
            item.hasPathParams && ts.createParameter(undefined, undefined, undefined,
                ts.createIdentifier('pathParams'), undefined,
                ts.createTypeReferenceNode(
                    ts.createIdentifier('PathParams'), undefined
                ), undefined,
            ),
            item.hasBody && ts.createParameter(undefined, undefined, undefined,
                ts.createIdentifier('body'), undefined,
                ts.createTypeReferenceNode(
                    ts.createIdentifier('Body'), undefined
                ), undefined,
            ),
            ts.createParameter(undefined, undefined, undefined,
                ts.createIdentifier('effects'), undefined,
                ts.createTypeReferenceNode(
                    ts.createIdentifier('IEffectExtras'), undefined
                ), undefined,
            )
        ].filter(Boolean),
        ts.createTypeReferenceNode(
            ts.createIdentifier('Observable'),
            [
                ts.createTypeReferenceNode(
                    ts.createIdentifier('Response200'),
                    undefined
                )
            ]
        ),
        ts.createBlock(
            [
                ts.createReturn(
                    ts.createCall(
                        ts.createPropertyAccess(
                            ts.createIdentifier('effects'),
                            ts.createIdentifier(ajaxMethod)
                        ),
                        undefined,
                        [
                            ts.createCall(
                                ts.createPropertyAccess(
                                    ts.createIdentifier('effects'),
                                    ts.createIdentifier('apiUrl')
                                ),
                                undefined,
                                [
                                    ts.createIdentifier('path'),
                                    item.hasPathParams && ts.createIdentifier('pathParams')
                                ].filter(Boolean)
                            ),
                            item.hasBody
                                ? ts.createIdentifier('body')
                                : undefined
                        ]
                    )
                )
            ],
            true
        )
    );
}

const res = createSplitDefs(json, {
    imports: [
        createNamedImport('IEffectExtras', '../types'),
        createNamedImport('Observable', 'rxjs/Observable'),
    ],
    after: getExecute
});
res.modules.concat(res.definitions).forEach(x => {
    console.log('----');
    console.log(x.displayName);
    console.log('----');
    console.log(x.content);
});
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

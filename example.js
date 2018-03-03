const json = require('./fixtures/swagger-01');
const swagger = require('./');
const {createConst, createDefs, createInterface, createStatement, printNamespace, printMany} = swagger;
const ts = require('typescript');

console.log(createDefs(json));

const constLines =
    [
        createConst('PutPath', '/path'),
        createConst('PutPath2', '/path2'),
    ];
// const node2 = createConst('PutPath2', '/path2');
// const pathVar = ts.createVariableDeclarationList(
//     [node],
//     ts.NodeFlags.Const,
// );
// const pathVar2 = ts.createVariableDeclarationList(
//     [node2],
//     ts.NodeFlags.Const,
// );
//
// const exportkeyword = ts.createToken(ts.SyntaxKind.ExportKeyword);
//
// const pathStatement = ts.createVariableStatement(
//     [exportkeyword],
//     [pathVar],
// );
const item = constLines.map(item => createStatement(item));
const moduleMembers = [
    ...item,
    createInterface('IPutBody')
];

const out = printMany([["First", moduleMembers], ["Second", moduleMembers]]);

// console.log(out);

const tsInput = `
export namespace SelcoManageBasketAddToBasketV1Put {
    export const path = '/V1/baskets/mine/add';
    export const operationId = 'selcoManageBasketAddToBasketV1AddProductPut';
    export interface Payload {
        productId: number
        qty: number
        purchaseType: string
    }
}
export namespace SelcoManageBasketAddToBasketV2Post {}
`;


let sourceFile = ts.createSourceFile('json.ts', tsInput, ts.ScriptTarget.Latest, /*setParentNodes */ true);
// console.log(sourceFile);

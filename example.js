const json = require('./fixtures/swagger-01');
const {createConst, createInterface, createStatement, printNamespace, printMany} = require('./');
const ts = require('typescript');

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

console.log(out);

const tsInput = `
export namespace SelcoManageBasketAddToBasketV1 {
    export const PutPath = '/V1/baskets/mine/add';
    export const PutOperationId = 'selcoManageBasketAddToBasketV1AddProductPut';
    export interface IPutBody {
        productId: number
        qty: number
        purchaseType: string
    }
}
export namespace SelcoManageBasketAddToBasketV2 {}
`;


let sourceFile = ts.createSourceFile('json.ts', tsInput, ts.ScriptTarget.Latest, /*setParentNodes */ true);
// console.log(sourceFile);

import * as ts from "typescript";
import {parse, SwaggerInput} from "./parser";
import {printMany, printNamespace} from "./printer";

export function createDefs(json: SwaggerInput): string {
    const parsed = parse(json);
    const printed = printMany(parsed.modules.concat(parsed.definitions));
    return printed;
}

export function createConst(name: string, value: string): ts.VariableDeclaration {
    const node = ts.createNode(ts.SyntaxKind.VariableDeclaration) as ts.VariableDeclaration;
    node.flags = 0;
    node.name = ts.createIdentifier(name);
    node.initializer = ts.createLiteral(value);
    return node;
}

export function createInterface(name: string, members = []) {

    const item = ts.createNode(ts.SyntaxKind.InterfaceDeclaration) as ts.InterfaceDeclaration;
    item.name = ts.createIdentifier(name);
    item.members = ts.createNodeArray(members, false);
    item.modifiers = ts.createNodeArray([ts.createToken(ts.SyntaxKind.ExportKeyword)]);

    return item;
}

export function createConstList(itemArray) {
    return itemArray.map((item) => {
        return ts.createVariableDeclarationList(
            [item],
            ts.NodeFlags.Const,
        );
    });
}

export function createStatement(item): ts.Node {
    const exportkeyword = ts.createToken(ts.SyntaxKind.ExportKeyword);
    const pathVar = ts.createVariableDeclarationList(
        [item],
        ts.NodeFlags.Const,
    );
    return ts.createVariableStatement(
        [exportkeyword],
        (pathVar as any),
    );
}

export function createModule(name: string, statements = []) {
    return ts.createModuleDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createIdentifier(name),
        ts.createModuleBlock(statements),
        ts.NodeFlags.Namespace,
    );
}

export {printNamespace, printMany, parse};

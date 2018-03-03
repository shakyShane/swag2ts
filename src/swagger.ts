import * as ts from 'typescript';
import {printNamespace, printMany} from './printer';
import {parse, SwaggerInput} from './parser';

export function createDefs(json: SwaggerInput): string {
    const parsed = parse(json);
    const printed = printMany(parsed);
    return printed;
}

export function createConst(name: string, value: string): ts.VariableDeclaration {
    const node = <ts.VariableDeclaration>ts.createNode(ts.SyntaxKind.VariableDeclaration);
    node.flags = 0;
    node.name = ts.createIdentifier(name);
    node.initializer = ts.createLiteral(value);
    return node;
}

export function createInterface(name: string, members = []) {

    const item = <ts.InterfaceDeclaration>ts.createNode(ts.SyntaxKind.InterfaceDeclaration);
    item.name = ts.createIdentifier(name);
    item.members = ts.createNodeArray(members, false);
    item.modifiers = ts.createNodeArray([ts.createToken(ts.SyntaxKind.ExportKeyword)]);

    return item;
}

export function createConstList(itemArray) {
    return itemArray.map(item => {
        return ts.createVariableDeclarationList(
            [item],
            ts.NodeFlags.Const,
        );
    })
}

export function createStatement (item): ts.Node {
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
        ts.NodeFlags.Namespace
    );
}

export {printNamespace, printMany, parse};


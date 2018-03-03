import * as ts from 'typescript';
import {createModule} from "./swagger";
import {Statement} from "typescript";
import {Block} from "./parser";

export function printNamespace(name: string, statements) {
    const result = ts.createSourceFile('module', '', ts.ScriptTarget.ES2016);
    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed
    });
    const ns = createModule(name, statements);
    return printer.printNode(ts.EmitHint.Unspecified, ns, result);
}

export function printMany(items: Block[]) {
    const result = ts.createSourceFile('module', '', ts.ScriptTarget.ES2016);
    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed
    });
    (result as any).statements = items.map(({displayName, statements}) => {
        return createModule(displayName, statements);
    });
    return printer.printFile(result);
}

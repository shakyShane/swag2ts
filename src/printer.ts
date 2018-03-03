import * as ts from 'typescript';
import {createModule} from "./swagger";
import {Statement} from "typescript";

export function printNamespace(name: string, statements) {
    const result = ts.createSourceFile('module', '', ts.ScriptTarget.ES2016);
    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed
    });
    const ns = createModule(name, statements);
    return printer.printNode(ts.EmitHint.Unspecified, ns, result);
}

export function printMany(items: Array<[string, Statement[]]>) {
    const result = ts.createSourceFile('module', '', ts.ScriptTarget.ES2016);
    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed
    });
    (result as any).statements = items.map(([name, members]) => {
        return createModule(name, members);
    });
    return printer.printFile(result);
}

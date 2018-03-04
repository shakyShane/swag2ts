import * as ts from "typescript";
import {Statement} from "typescript";
import {ImportDeclaration} from "typescript";
import {Block} from "./parser";
import {createModule} from "./swagger";

export function printNamespace(name: string, statements) {
    const result = ts.createSourceFile("module", "", ts.ScriptTarget.ES2016);
    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });
    const ns = createModule(name, statements);
    return printer.printNode(ts.EmitHint.Unspecified, ns, result);
}

export function printMany(items: Block[], imports?: ImportDeclaration) {
    const result = ts.createSourceFile("module", "", ts.ScriptTarget.ES2016);
    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });
    const modules = items.map(({displayName, statements}) => {
        return createModule(displayName, statements);
    });

    const combinedItems = [
        imports,
        ...modules,
    ].filter(Boolean);

    (result as any).statements = combinedItems;

    return printer.printFile(result);
}

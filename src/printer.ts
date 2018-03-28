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

export function printMany(items: Block[], imports: ImportDeclaration[] = [], after = []) {
    const result = ts.createSourceFile("module", "", ts.ScriptTarget.ES2016);
    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });

    const modules = items.reduce((acc, {displayName, statements}) => {
        return acc.concat(statements);
    }, []);

    const combinedItems = [
        ...imports,
        ...modules,
        ...after,
    ].filter(Boolean);

    (result as any).statements = combinedItems;

    return printer.printFile(result);
}

import * as ts from "typescript";
import {ImportDeclaration, Statement} from "typescript";
import {parse, SwaggerInput} from "./parser";
import {printMany, printNamespace} from "./printer";

export enum OutputTypes {
    Single = "single",
    Multi = "multi",
}

export interface Options {
    outputType?: OutputTypes;
    importPath?: string;
    defName?: string;
    outDir?: string;
    imports?: ImportDeclaration[];
    after?(item: any): any;
}

// defaults
const defaults = {
    defName: "Definitions",
    importPath: "./Definitions",
    imports: [],
    outDir: "swagger",
    outputType: OutputTypes.Single,
};

export function getOptions(input) {
    return {
        ...defaults,
        ...input,
    };
}

export function createDefs(json: SwaggerInput, options = {}): string {

    const merged = getOptions(options);
    const parsed = parse(json, merged);
    const printed = printMany(parsed.modules.concat(parsed.definitions));
    return printed;
}

export interface SplitDefsOutputItem {
    displayName: string;
    content: string;
    statements: Statement[];
}

export interface SplitDefsOutput {
    modules: SplitDefsOutputItem[];
    definitions: SplitDefsOutputItem[];
}

export function createSplitDefs(json: SwaggerInput, options = {}): SplitDefsOutput {
    const merged = getOptions(options);
    const parsed = parse(json, merged);
    const {modules, definitions} = parsed;

    const moduleFiles = modules.map((item) => {
        return {
            content: printMany(
                [item],
                [
                    createNamespaceImport(merged),
                    ...merged.imports,
                ],
                merged.after && merged.after(item),
            ),
            displayName: `${item.displayName}.ts`,
            statements: item.statements,
        };
    });

    const definitionFiles = definitions.map((item) => {
        return {
            content: printMany([item]),
            displayName: `${item.displayName}.ts`,
            statements: item.statements,
        };
    });

    return {
        definitions: definitionFiles,
        modules: moduleFiles,
    };
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
    );
}

export function createNamespaceImport(options: Options): ImportDeclaration {
    const im = ts.createImportDeclaration(undefined, undefined, undefined);
    const clause = ts.createImportClause(
        undefined,
        ts.createNamespaceImport(ts.createIdentifier("Definitions")),
    );

    im.importClause = clause;
    im.moduleSpecifier = ts.createLiteral(options.importPath);

    return im;
}

export function createNamedImport(name: string, path: string): ImportDeclaration {
    const im = ts.createImportDeclaration(undefined, undefined, undefined);
    const identifier = ts.createIdentifier(name);
    const importSe = ts.createImportSpecifier(undefined, identifier);
    const namedId = ts.createNamedImports([importSe]);

    const clause = ts.createImportClause(undefined, undefined);
    clause.namedBindings = namedId;

    im.importClause = clause;
    im.moduleSpecifier = ts.createLiteral(path);

    return im;
}

export {printNamespace, printMany, parse};

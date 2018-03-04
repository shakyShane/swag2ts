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
}

// defaults
const defaults = {
    defName: "Definitions",
    importPath: "./Definitions",
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
            content: printMany([item], createImport(merged)),
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
        ts.NodeFlags.Namespace,
    );
}

export function createImport(options: Options): ImportDeclaration {
    const im = ts.createImportDeclaration(undefined, undefined, undefined);
    const identifier = ts.createIdentifier(options.defName);
    const importSe = ts.createImportSpecifier(undefined, identifier);
    const namedId = ts.createNamedImports([importSe]);

    const clause = ts.createImportClause(undefined, undefined);
    clause.namedBindings = namedId;

    im.importClause = clause;
    im.moduleSpecifier = ts.createLiteral(options.importPath);

    return im;
}

export {printNamespace, printMany, parse};

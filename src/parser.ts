import * as ts from 'typescript';
import {createConst, createInterface, createModule, createStatement} from "./swagger";
import {Statement} from "typescript";

export const kindMap = {
    [ts.SyntaxKind.NullKeyword]: ts.SyntaxKind.NullKeyword,
    [ts.SyntaxKind.StringLiteral]: ts.SyntaxKind.StringKeyword,
    [ts.SyntaxKind.FirstLiteralToken]: ts.SyntaxKind.NumberKeyword,
    [ts.SyntaxKind.TrueKeyword]: ts.SyntaxKind.BooleanKeyword,
    [ts.SyntaxKind.FalseKeyword]: ts.SyntaxKind.BooleanKeyword,
    [ts.SyntaxKind.NumericLiteral]: ts.SyntaxKind.NumberKeyword,
};

export interface Block {
    displayName: string
    statements: Statement[]
}

export interface ParseOutput {
    modules: Block[],
    definitions: Block[]
}

export function parse(json: SwaggerInput): ParseOutput {
    const parsed = Object
        .keys(json.paths)
        .map(key => ({key, current: json.paths[key]}))
        .reduce((acc, {key, current}) => {
            return acc.concat(Object
                .keys(current)
                .map((methodType: MethodKeys) => {
                    const item: MethodItem = current[methodType];
                    const name = item.tags[0];
                    const bodyItems = (item.parameters||[])
                        .map(x => {
                            if (x.in === 'body') {
                                return x.schema;
                            }
                        })
                        .filter(Boolean);

                    const bodyMembers = getParamsFromObject(bodyItems);
                    const pathItems = (item.parameters||[])
                        .map(x => {
                            if (x.in === 'path') {
                                return x;
                            }
                        })
                        .filter(Boolean);

                    return {
                        displayName: upper(name) + upper(methodType),
                        method: methodType,
                        body: createInterface('Body', bodyMembers),
                        pathParams: getPathMembers(pathItems),
                        responses: getResponses(item.responses),
                        variables: {
                            method: methodType.toUpperCase(),
                            path: key,
                            description: item.description,
                            operationId: item.operationId,
                        }
                    }
                }));
        }, []);


    const modules = parsed.map((item): Block => {
        const vars = Object
            .keys(item.variables)
            .map(key => [key, item.variables[key]])
            .map(([name, value]) => {
                return createStatement(createConst(name, value));
            });

        const responses = item.responses;
        const responseUnion = getResponseUnion(responses);

        const body = (item.body.members.length > 0) ? item.body : null;
        const pathParms = (item.pathParams.members.length > 0) ? item.pathParams : null;
        const statements = [...vars, pathParms, body, responseUnion, ...responses].filter(Boolean);

        return {
            displayName: item.displayName,
            statements
        };
    });


    // console.log(json.definitions);
    const definitions = Object
        .keys(json.definitions)
        .map((key) => {
            const name = dashToStartCase(key);
            const members = getParamsFromObject([<any>json.definitions[key]]);
            const int = createInterface(name, members);
            return int;
        });

    return {
        modules,
        definitions: [{
            displayName: 'Definitions',
            statements: definitions
        }]
    }
}

export function dashToStartCase(string) {
    return string.split('-').map(x => upper(x)).join('')
}

export function upper(string) {
    return string[0].toUpperCase() + string.slice(1);
}


export function getPathMembers(items: PathParam[]) {
    const members = items.map(item => {
        return resolveItem(item.name, item, [item.name]);
    });
    const inter = createInterface('PathParams', members);
    return inter;
}

export function getResponseUnion(responses) {
    const node: any = ts.createNode(ts.SyntaxKind.TypeAliasDeclaration);
    node.modifiers = [ts.createToken(ts.SyntaxKind.ExportKeyword)];
    node.name = ts.createIdentifier('Response');
    node.type = ts.createUnionOrIntersectionTypeNode(
        ts.SyntaxKind.UnionType,
        responses.map(resp => ts.createTypeReferenceNode(resp.name.escapedText, undefined))
    );
    return node;
}

export function getResponses(responses: { [K in ResponseCode ]: IResponsesItem}) {
    return Object.keys(responses).map(code => {
        const current = responses[code];
        const schema: IDefinitionsItemProperties = current.schema;
        const typeName = `Response${code === 'default' ? 'Default' : code}`;
        if (schema['$ref']) {
            const dashRefName = interfaceNameFromRef(schema['$ref']);
            const node : any = ts.createNode(ts.SyntaxKind.TypeAliasDeclaration);
            node.modifiers = [ts.createToken(ts.SyntaxKind.ExportKeyword)];
            return getDefinitionReference(node, typeName, dashRefName);
        } else {
            return resolveFromTopLevelSchema(typeName, schema);
        }
    }).filter(Boolean);
}

function getDefinitionReference(node, name, refName) {
    const leftName = ts.createIdentifier('Definitions');
    node.type = ts.createTypeReferenceNode(refName, undefined);
    node.type.typeName = ts.createQualifiedName(leftName, refName);
    node.name = ts.createIdentifier(name);
    return node;
}

export function resolveFromTopLevelSchema(name, input: IResponsesSchema) {
    if (input['$ref']) {
        return;
    }
    const node : any = ts.createNode(ts.SyntaxKind.TypeAliasDeclaration);
    node.modifiers = [ts.createToken(ts.SyntaxKind.ExportKeyword)];
    node.name = ts.createIdentifier(name);
    switch(input.type) {
        case "string": {
            node.type = ts.createTypeReferenceNode("string", undefined);
            return node;
        }
        case "integer":
        case "number": {
            node.type = ts.createTypeReferenceNode("number", undefined);
            return node;
        }
        case "boolean": {
            node.type = ts.createTypeReferenceNode("boolean", undefined);
            return node;
        }
    }
}

export function getParamsFromObject(schemas: ISchemaObject[]) {
    return schemas.reduce((acc, schema) => {
        const {required, properties, type} = schema;
        const members = Object.keys((properties || {})).map((propertyName: string) => {
            const current: IDefinitionsItemProperties = properties[propertyName];
            return resolveItem(propertyName, current, required);
        });
        return acc.concat(members);
    }, []).filter(Boolean);
}

export function resolveItem(propertyName, current, required = []) {
    if ((current as any)['$ref']) {
        const value = current['$ref'];
        const item = namedProp(propertyName, required.indexOf(propertyName) === -1);
        const refName = interfaceNameFromRef(value);
        return getDefinitionReference(item, propertyName, refName);
    }
    if (current.type) {
        switch(current.type) {
            case "string": {
                const item = namedProp(propertyName, required.indexOf(propertyName) === -1);
                item.type = ts.createNode(ts.SyntaxKind.StringKeyword);
                return item;
            }
            case "number":
            case "integer": {
                const item = namedProp(propertyName, required.indexOf(propertyName) === -1);
                item.type = ts.createNode(ts.SyntaxKind.NumberKeyword);
                return item;
            }
            case "boolean": {
                const item = namedProp(propertyName, required.indexOf(propertyName) === -1);
                item.type = ts.createNode(ts.SyntaxKind.BooleanKeyword);
                return item;
            }
            case "array": {
                const item = namedProp(propertyName, required.indexOf(propertyName) === -1);
                if (current.items['$ref']) {
                    const arrayRef = current.items['$ref'];
                    const refName = interfaceNameFromRef(arrayRef);
                    return getDefinitionReference(item, propertyName, refName);
                }
                const arrayType: any = getLiteralType(current.items.type);
                item.type = ts.createArrayTypeNode(arrayType);
                return item;
            }
        }
    }
}

export function getLiteralType(type: TypeKey) {
    switch(type) {
        case "string": {
            return ts.createNode(ts.SyntaxKind.StringKeyword)
        }
        case "boolean": {
            return ts.createNode(ts.SyntaxKind.BooleanKeyword)
        }
        case "integer":
        case "number": {
            return ts.createNode(ts.SyntaxKind.NumberKeyword)
        }
    }
}

export function interfaceNameFromRef(ref: string): string {
    const [refName] = ref.split('/').slice(-1);
    return dashToStartCase(refName);
}

export function namedProp(name: string, optional = false) {

    const prop: any = ts.createNode(ts.SyntaxKind.PropertySignature);
    prop.name = ts.createIdentifier(name);

    if (optional) {
        prop.questionToken = ts.createNode(ts.SyntaxKind.QuestionToken);
    }

    return prop;
}


export interface SwaggerInput {
    paths: { [urlPath: string]: PathsItem }
    definitions: { [name: string]: DefinitionsItem }
}

export type MethodKeys = "put" | "post" | "get" | "delete";
export type ResponseCode = "200" | "401" | "default";
export type PathsItem = { [K in MethodKeys ]: MethodItem }

export interface MethodItem {
    tags: string[];
    description: string;
    operationId: string;
    parameters: IParametersItem[];
    responses: { [K in ResponseCode ]: IResponsesItem};
}
export interface SchemaParam {
    name: string;
    'in': "body";
    schema: ISchemaObject;

}
export interface PathParam {
    name: string;
    'in': "path";
    type: TypeKey;
    required: boolean
    description?: string
}
export type IParametersItem = SchemaParam | PathParam;

export interface ISchemaObject {
    required: string[];
    properties: IProperties;
    description?: string;
    type: "object";
}

export interface IProperties {
    [propertyName: string]: IDefinitionsItemProperties
}

export type IResponsesSchema = {
    $ref: string
    type?: TypeKey
} | IDefinitionsItemProperties;

export interface IResponsesItem {
    description: string;
    schema: IResponsesSchema;
}

export type PropDefs = { [index: string]: IDefinitionsItemProperties };

export interface DefinitionsItem {
    type: "object";
    properties?: PropDefs;
    required?: string[];
}

export type TypeKey = "string" | "object" | "boolean" | "number" | "integer" | "array";

export type IDefinitionsItemProperties = {
    type: "object";
    description?: string;
    properties?: PropDefs;
} | {
    type: "boolean";
    description?: string;
} | {
    type: "string";
    description?: string;
} | {
    type: "integer";
    description?: string;
} | {
    type: "number";
    description?: string;
} | {
    type: "array"
    description?: string;
    items: IDefinitionsItemProperties
}

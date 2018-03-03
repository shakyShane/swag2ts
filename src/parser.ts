import * as ts from 'typescript';
import {createConst, createInterface, createModule, createStatement} from "./swagger";

export const kindMap = {
    [ts.SyntaxKind.NullKeyword]: ts.SyntaxKind.NullKeyword,
    [ts.SyntaxKind.StringLiteral]: ts.SyntaxKind.StringKeyword,
    [ts.SyntaxKind.FirstLiteralToken]: ts.SyntaxKind.NumberKeyword,
    [ts.SyntaxKind.TrueKeyword]: ts.SyntaxKind.BooleanKeyword,
    [ts.SyntaxKind.FalseKeyword]: ts.SyntaxKind.BooleanKeyword,
    [ts.SyntaxKind.NumericLiteral]: ts.SyntaxKind.NumberKeyword,
};

export function parse(json: SwaggerInput) {
    const parsed = Object
        .keys(json.paths)
        .map(key => ({key, current: json.paths[key]}))
        .reduce((acc, {key, current}) => {
            return acc.concat(Object
                .keys(current)
                .map((methodType: MethodKeys) => {
                    const item: MethodItem = current[methodType];
                    const name = item.tags[0];
                    const bodyMembers = getParams(item.parameters.filter(x => x.in === 'body').map(x => x.schema));
                    return {
                        displayName: upper(name) + upper(methodType),
                        method: methodType,
                        body: createInterface('Body', bodyMembers),
                        variables: {
                            path: key,
                            description: item.description,
                            operationId: item.operationId,
                        }
                    }
                }));
        }, []);


    const modules = parsed.map(item => {
        const vars = Object
            .keys(item.variables)
            .map(key => [key, item.variables[key]])
            .map(([name, value]) => {
                return createStatement(createConst(name, value));
            });

        const statements = [...vars, item.body];
        return [item.displayName, statements];
    });

    return modules;
}

export function upper(string) {
    return string[0].toUpperCase() + string.slice(1);
}

export function getParams(schemas: ISchema[]) {
    return schemas.reduce((acc, schema) => {
        const {required, properties, type} = schema;
        const members = Object.keys(properties).map((propertyName: string) => {
            const current: IDefinitionsItemProperties = properties[propertyName];
            if ((current as any)['$ref']) {
                const value = current['$ref'];
                const item = namedProp(propertyName, required.indexOf(propertyName) === -1);
                item.type = ts.createTypeReferenceNode(interfaceNameFromRef(value), undefined);
                return item;
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
                            item.type = ts.createTypeReferenceNode(interfaceNameFromRef(arrayRef), undefined);
                            return item;
                        }
                        const arrayType: any = getLiteralType(current.items.type);
                        item.type = ts.createArrayTypeNode(arrayType);
                        return item;
                    }
                }
            }
        });
        return acc.concat(members);
    }, []).filter(Boolean);
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
    return "Shane";
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

export interface IParametersItem {
    name: string;
    'in': string;
    schema: ISchema;
}

export interface ISchema {
    required: string[];
    properties: IProperties;
    type: "object";
}

export interface IProperties {
    [propertyName: string]: IDefinitionsItemProperties
}

export interface IResponsesSchema {
    $ref: string
}

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

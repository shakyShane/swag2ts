export function parse(json: SwaggerInput) {

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
    [propertyName: string]: {
        type: "string" | "integer" | "number" | "boolean"
    };
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
} | {
    $ref: string,
    description?: string;
}

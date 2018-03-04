import { Definitions } from "./Definitions";
export namespace AcmeManageBasketAddToBasketV1AddProductPut {
    export const description = "";
    export const method = "PUT";
    export const operationId = "acmeManageBasketAddToBasketV1AddProductPut";
    export const path = "/V1/baskets/mine/add";
    export interface PathParams {
        cartId: string;
        itemId: number;
    }
    export interface Body {
        productId: number;
        qty: number;
        purchaseType: string;
        user?: Definitions.AcmeCatalogProductPurchaseOptionInterface;
        stale?: boolean;
        pets: string[];
        petsWithRef?: Definitions.AcmeCatalogProductPurchaseOptionInterface[];
    }
    export type Response = Response200 | Response201 | Response202 | Response401 | ResponseDefault | ResponseOther;
    export type Response200 = string;
    export type Response201 = number;
    export type Response202 = boolean;
    export type Response401 = Definitions.AcmeCatalogProductPurchaseOptionInterface;
    export type ResponseDefault = Definitions.AcmeCatalogProductPurchaseOptionResponse;
    export type ResponseOther = Definitions.AcmeCatalogProductPurchaseOptionResponse[];
}

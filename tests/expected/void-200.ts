import * as Definitions from "./Definitions";
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
export type Response = Response200 | Response400 | Response401 | Response402;
export type Response200 = void;
export type Response400 = boolean[];
export type Response401 = number[];
export type Response402 = number[];

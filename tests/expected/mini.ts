export namespace AcmeManageBasketAddToBasketV1Put {
    export const method = "PUT";
    export const path = "/V1/baskets/mine/add";
    export const description = "";
    export const operationId = "acmeManageBasketAddToBasketV1AddProductPut";
    export interface Body {
        productId: number;
        qty: number;
        purchaseType: string;
        user?: Definitions.AcmeCatalogProductPurchaseOptionInterface;
        stale?: boolean;
        pets: string[];
        petsWithRef?: Definitions.AcmeCatalogProductPurchaseOptionInterface;
    }
    export type Response200 = string;
    export type Response201 = number;
    export type Response202 = boolean;
    export type Response401 = Definitions.AcmeCatalogProductPurchaseOptionResponse;
    export type ResponseDefault = Definitions.AcmeCatalogProductPurchaseOptionResponse;
}

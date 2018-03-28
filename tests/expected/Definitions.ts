export interface AcmeCatalogProductPurchaseOptionInterface {
    type: string;
    available: boolean;
    in_stock: boolean;
}
export interface AcmeCatalogProductPurchaseOptionResponse {
    status: string;
    localRef?: RefToRef;
    here: RefToRef[];
}
export interface RefToRef {
    name?: string;
}

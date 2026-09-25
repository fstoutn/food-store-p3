import type { ICartItem } from "../../../types/ICart.js";
export declare function getCart(): ICartItem[];
export declare function saveCart(items: ICartItem[]): void;
export declare function addToCart(product: ICartItem["product"], quantity: number): void;
export declare function getCartItemCount(): number;
export declare function clearCart(): void;
//# sourceMappingURL=cart.d.ts.map
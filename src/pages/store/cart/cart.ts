import type { ICartItem } from "../../../types/ICart.js";

const CART_KEY = "food_store_cart";

export function getCart(): ICartItem[] {
const cart = localStorage.getItem(CART_KEY);

if (!cart) {
    return [];
}

try {
    return JSON.parse(cart) as ICartItem[];
} catch {
    localStorage.removeItem(CART_KEY);
    return [];
}

}

export function saveCart(items: ICartItem[]): void {
localStorage.setItem(
CART_KEY,
JSON.stringify(items)
);
}

export function addToCart(
product: ICartItem["product"],
quantity: number
): void {
const cart = getCart();

const existingItem = cart.find(
    (item) => item.product.id === product.id
);

if (existingItem) {
    existingItem.quantity += quantity;
} else {
    cart.push({
        product,
        quantity
    });
}

saveCart(cart);

}

export function getCartItemCount(): number {
return getCart().reduce(
(total, item) =>
total + item.quantity,
0
);
}

export function clearCart(): void {
localStorage.removeItem(CART_KEY);
}

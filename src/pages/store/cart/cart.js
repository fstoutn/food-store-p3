const CART_KEY = "food_store_cart";
export function getCart() {
    const cart = localStorage.getItem(CART_KEY);
    if (!cart) {
        return [];
    }
    try {
        return JSON.parse(cart);
    }
    catch {
        localStorage.removeItem(CART_KEY);
        return [];
    }
}
export function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
}
export function addToCart(product, quantity) {
    const cart = getCart();
    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
        existingItem.quantity += quantity;
    }
    else {
        cart.push({
            product,
            quantity
        });
    }
    saveCart(cart);
}
export function getCartItemCount() {
    return getCart().reduce((total, item) => total + item.quantity, 0);
}
export function clearCart() {
    localStorage.removeItem(CART_KEY);
}
//# sourceMappingURL=cart.js.map
import { requireRole } from "../../../utils/auth.js";
const CART_KEY = "food_store_cart";
const SHIPPING_COST = 500;
const user = requireRole("cliente");
const cartItems = document.querySelector("#cart-items");
const cartBadge = document.querySelector("#cart-badge");
const cartItemCount = document.querySelector("#cart-item-count");
const cartSubtotal = document.querySelector("#cart-subtotal");
const cartShipping = document.querySelector("#cart-shipping");
const cartTotal = document.querySelector("#cart-total");
const cartMessage = document.querySelector("#cart-message");
function formatPrice(value) {
    return `$${value.toFixed(2)}`;
}
function showMessage(message) {
    if (cartMessage) {
        cartMessage.textContent = message;
    }
}
function clearMessage() {
    if (cartMessage) {
        cartMessage.textContent = "";
    }
}
function updateSummary(items) {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.product.precio * item.quantity, 0);
    const shipping = items.length > 0 ? SHIPPING_COST : 0;
    if (cartBadge) {
        cartBadge.textContent = count.toString();
    }
    if (cartItemCount) {
        cartItemCount.textContent = `${count} producto${count === 1 ? "" : "s"}`;
    }
    if (cartSubtotal) {
        cartSubtotal.textContent = formatPrice(subtotal);
    }
    if (cartShipping) {
        cartShipping.textContent = formatPrice(shipping);
    }
    if (cartTotal) {
        cartTotal.textContent = formatPrice(subtotal + shipping);
    }
}
function renderCart() {
    const items = getCart();
    updateSummary(items);
    if (!cartItems) {
        return;
    }
    if (items.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <h2>Tu carrito está vacío</h2>
                <p>Agregá productos desde la tienda para comenzar tu pedido.</p>
                <a class="btn-primary empty-cart-link" href="../home/home.html">Ir a la tienda</a>
            </div>
        `;
        return;
    }
    cartItems.innerHTML = items.map((item) => `
        <article class="cart-item">
            <img class="cart-item-image" src="${item.product.imagenUrl}" alt="${item.product.nombre}">
            <div class="cart-item-info">
                <h2>${item.product.nombre}</h2>
                <p class="cart-item-unit-price">${formatPrice(item.product.precio)} por unidad</p>
                <div class="cart-item-actions">
                    <div class="cart-quantity-control">
                        <button type="button" data-action="decrease" data-id="${item.product.id}" aria-label="Disminuir cantidad">−</button>
                        <span>${item.quantity}</span>
                        <button type="button" data-action="increase" data-id="${item.product.id}" aria-label="Aumentar cantidad">+</button>
                    </div>
                    <button class="remove-item" type="button" data-action="remove" data-id="${item.product.id}">Eliminar</button>
                </div>
            </div>
            <strong class="cart-item-total">${formatPrice(item.product.precio * item.quantity)}</strong>
        </article>
    `).join("");
}
function changeQuantity(productId, change) {
    const items = getCart();
    const item = items.find((cartItem) => cartItem.product.id === productId);
    if (!item) {
        return;
    }
    const nextQuantity = item.quantity + change;
    if (nextQuantity > item.product.stock) {
        showMessage(`El stock máximo de ${item.product.nombre} es ${item.product.stock}.`);
        return;
    }
    if (nextQuantity <= 0) {
        saveCart(items.filter((cartItem) => cartItem.product.id !== productId));
    }
    else {
        item.quantity = nextQuantity;
        saveCart(items);
    }
    clearMessage();
    renderCart();
}
const userName = document.querySelector("#user-name");
if (userName) {
    userName.textContent = user.name;
}
document.querySelector("#back-to-store")?.addEventListener("click", () => {
    window.location.href = "../home/home.html";
});
cartItems?.addEventListener("click", (event) => {
    const target = event.target;
    const action = target.dataset.action;
    const productId = Number(target.dataset.id);
    if (!action || !productId) {
        return;
    }
    if (action === "remove") {
        saveCart(getCart().filter((item) => item.product.id !== productId));
        renderCart();
    }
    else if (action === "increase") {
        changeQuantity(productId, 1);
    }
    else if (action === "decrease") {
        changeQuantity(productId, -1);
    }
});
document.querySelector("#clear-cart")?.addEventListener("click", () => {
    if (getCart().length > 0 && window.confirm("¿Querés vaciar el carrito?")) {
        clearCart();
        renderCart();
    }
});
renderCart();
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
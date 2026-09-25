import type { ICartItem } from "../../../types/ICart.js";
import { apiRequest } from "../../../utils/api.js";
import { requireRole } from "../../../utils/auth.js";

const CART_KEY = "food_store_cart";
const ORDERS_KEY = "food_store_orders";
const SHIPPING_COST = 500;

const user = requireRole("cliente");
const cartItems = document.querySelector<HTMLElement>("#cart-items");
const cartBadge = document.querySelector<HTMLElement>("#cart-badge");
const cartItemCount = document.querySelector<HTMLElement>("#cart-item-count");
const cartSubtotal = document.querySelector<HTMLElement>("#cart-subtotal");
const cartShipping = document.querySelector<HTMLElement>("#cart-shipping");
const cartTotal = document.querySelector<HTMLElement>("#cart-total");
const cartMessage = document.querySelector<HTMLElement>("#cart-message");
const clearCartButton = document.querySelector<HTMLButtonElement>("#clear-cart");
const checkoutButton = document.querySelector<HTMLButtonElement>("#checkout-button");
const checkoutModal = document.querySelector<HTMLDivElement>("#checkout-modal");
const checkoutForm = document.querySelector<HTMLFormElement>("#checkout-form");
const checkoutMessage = document.querySelector<HTMLElement>("#checkout-message");

interface CheckoutData {
    telefono: string;
    direccion: string;
    metodoPago: string;
    notas: string;
}

function formatPrice(value: number): string {
    return `$${value.toFixed(2)}`;
}

function showMessage(message: string): void {
    if (cartMessage) {
        cartMessage.classList.remove("cart-success");
        cartMessage.textContent = message;
    }
}

function clearMessage(): void {
    if (cartMessage) {
        cartMessage.classList.remove("cart-success");
        cartMessage.textContent = "";
    }
}

function updateSummary(items: ICartItem[]): void {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce(
        (total, item) => total + item.product.precio * item.quantity,
        0
    );
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
    if (checkoutButton) {
        checkoutButton.disabled = items.length === 0;
    }
    if (clearCartButton) {
        clearCartButton.hidden = items.length === 0;
    }
}

function renderCart(): void {
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

function changeQuantity(productId: number, change: number): void {
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
    } else {
        item.quantity = nextQuantity;
        saveCart(items);
    }

    clearMessage();
    renderCart();
}

const userName = document.querySelector<HTMLSpanElement>("#user-name");

if (userName) {
    userName.textContent = user.name;
}
document.querySelector<HTMLButtonElement>("#back-to-store")?.addEventListener("click", () => {
    window.location.href = "../home/home.html";
});

cartItems?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    const productId = Number(target.dataset.id);

    if (!action || !productId) {
        return;
    }

    if (action === "remove") {
        saveCart(getCart().filter((item) => item.product.id !== productId));
        renderCart();
    } else if (action === "increase") {
        changeQuantity(productId, 1);
    } else if (action === "decrease") {
        changeQuantity(productId, -1);
    }
});

document.querySelector<HTMLButtonElement>("#clear-cart")?.addEventListener("click", () => {
    if (getCart().length > 0 && window.confirm("¿Querés vaciar el carrito?")) {
        clearCart();
        renderCart();
    }
});

function openCheckout(): void {
    if (getCart().length === 0 || !checkoutModal) {
        return;
    }

    if (checkoutMessage) {
        checkoutMessage.textContent = "";
    }
    checkoutModal.hidden = false;
}

function closeCheckout(): void {
    if (checkoutModal) {
        checkoutModal.hidden = true;
    }
}

function readCheckoutData(): CheckoutData {
    const formData = new FormData(checkoutForm!);

    return {
        telefono: String(formData.get("phone") ?? "").trim(),
        direccion: String(formData.get("address") ?? "").trim(),
        metodoPago: String(formData.get("payment-method") ?? ""),
        notas: String(formData.get("notes") ?? "").trim()
    };
}

function saveLocalOrder(data: CheckoutData, items: ICartItem[]): void {
    const subtotal = items.reduce(
        (total, item) => total + item.product.precio * item.quantity,
        0
    );
    const storedOrders = localStorage.getItem(ORDERS_KEY);
    const orders = storedOrders
        ? JSON.parse(storedOrders) as unknown[]
        : [];

    orders.unshift({
        id: `local-${Date.now()}`,
        clienteId: user.id,
        fecha: new Date().toISOString(),
        estado: "pending",
        items,
        telefono: data.telefono,
        direccion: data.direccion,
        metodoPago: data.metodoPago,
        notas: data.notas,
        subtotal,
        costoEnvio: SHIPPING_COST,
        total: subtotal + SHIPPING_COST
    });

    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

async function submitOrder(data: CheckoutData): Promise<void> {
    const items = getCart();
    const subtotal = items.reduce(
        (total, item) => total + item.product.precio * item.quantity,
        0
    );
    const payload = {
        clienteId: user.id,
        telefono: data.telefono,
        direccion: data.direccion,
        metodoPago: data.metodoPago,
        notas: data.notas,
        items: items.map((item) => ({
            productoId: item.product.id,
            cantidad: item.quantity
        })),
        subtotal,
        costoEnvio: SHIPPING_COST,
        total: subtotal + SHIPPING_COST
    };

    try {
        await apiRequest("/pedidos", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.warn("No hay backend de pedidos, guardando el pedido localmente.", error);
        saveLocalOrder(data, items);
    }

    clearCart();
    closeCheckout();
    renderCart();
    showMessage("Pedido confirmado. El carrito fue vaciado correctamente.");
    if (cartMessage) {
        cartMessage.classList.add("cart-success");
    }
}

checkoutButton?.addEventListener("click", openCheckout);
document.querySelector<HTMLButtonElement>("#close-checkout")?.addEventListener("click", closeCheckout);
checkoutModal?.addEventListener("click", (event) => {
    if (event.target === checkoutModal) {
        closeCheckout();
    }
});

checkoutForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = readCheckoutData();

    if (!data.telefono || !data.direccion || !data.metodoPago) {
        if (checkoutMessage) {
            checkoutMessage.textContent = "Completá teléfono, dirección y método de pago.";
        }
        return;
    }

    if (checkoutMessage) {
        checkoutMessage.textContent = "Procesando pedido...";
    }
    await submitOrder(data);
});

renderCart();

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

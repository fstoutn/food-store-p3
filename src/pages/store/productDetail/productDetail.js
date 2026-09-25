import { apiRequest } from "../../../utils/api.js";
import { requireRole } from "../../../utils/auth.js";
import { addToCart, getCartItemCount } from "../cart/cart.js";
requireRole("cliente");
const productImage = document.querySelector("#product-image");
const productName = document.querySelector("#product-name");
const productDescription = document.querySelector("#product-description");
const productPrice = document.querySelector("#product-price");
const productStock = document.querySelector("#product-stock");
const productStatus = document.querySelector("#product-status");
const quantityInput = document.querySelector("#quantity");
const decreaseButton = document.querySelector("#decrease-quantity");
const increaseButton = document.querySelector("#increase-quantity");
const addButton = document.querySelector("#add-to-cart");
const detailError = document.querySelector("#detail-error");
const confirmation = document.querySelector("#cart-confirmation");
const backButton = document.querySelector("#back-button");
const cartButton = document.querySelector("#cart-button");
const cartBadge = document.querySelector("#cart-badge");
let product = null;
const fallbackProducts = [
    {
        id: 1,
        nombre: "Hamburguesa Clásica",
        descripcion: "Carne, queso y vegetales en pan brioche.",
        precio: 1800,
        stock: 8,
        activo: true,
        imagenUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
        categoria: {
            id: 1,
            nombre: "Comidas",
            descripcion: "Platos principales",
            imagenUrl: ""
        }
    },
    {
        id: 2,
        nombre: "Empanadas de Carne",
        descripcion: "Empanadas caseras rellenas con carne picada.",
        precio: 950,
        stock: 12,
        activo: true,
        imagenUrl: "https://comidasparaguayas.com/assets/images/empanada-de-carne_800x534.webp",
        categoria: {
            id: 1,
            nombre: "Comidas",
            descripcion: "Platos principales",
            imagenUrl: ""
        }
    },
    {
        id: 3,
        nombre: "Limonada Fresh",
        descripcion: "Refrescante bebida con limón y menta.",
        precio: 600,
        stock: 15,
        activo: true,
        imagenUrl: "https://acdn-us.mitiendanube.com/stores/001/071/578/products/limonada-menta-y-jengibre-2-5bd65ef9136235048a17762796324309-640-0.webp",
        categoria: {
            id: 2,
            nombre: "Bebidas",
            descripcion: "Bebidas frías y calientes",
            imagenUrl: ""
        }
    },
    {
        id: 4,
        nombre: "Donas",
        descripcion: "Donas de chocolate con chispas de colores.",
        precio: 1200,
        stock: 5,
        activo: true,
        imagenUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80",
        categoria: {
            id: 3,
            nombre: "Postres",
            descripcion: "Postres y dulces",
            imagenUrl: ""
        }
    }
];
function updateCartBadge() {
    if (cartBadge) {
        cartBadge.textContent =
            getCartItemCount().toString();
    }
}
function showError(message) {
    if (detailError) {
        detailError.textContent = message;
    }
}
function clearError() {
    if (detailError) {
        detailError.textContent = "";
    }
}
function updateQuantity(value) {
    if (!quantityInput || !product) {
        return;
    }
    const quantity = Math.max(1, Math.min(value, product.stock));
    quantityInput.value = quantity.toString();
}
async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const productId = Number(params.get("id"));
    if (!productId) {
        showError("No se especificó un producto.");
        return;
    }
    try {
        product = await apiRequest(`/productos/${productId}`);
        console.log("Producto recibido:", product);
        renderProduct();
    }
    catch (error) {
        console.warn("No se pudo cargar el producto desde la API. Usando datos de prueba.", error);
        product =
            fallbackProducts.find((item) => item.id === productId) ?? null;
        if (!product) {
            showError("No se encontró el producto solicitado.");
            return;
        }
        renderProduct();
    }
}
function renderProduct() {
    if (!product) {
        return;
    }
    if (productImage) {
        productImage.src = product.imagenUrl;
        productImage.alt = product.nombre;
        productImage.onerror = () => {
            productImage.src =
                "https://via.placeholder.com/700x500?text=Sin+imagen";
        };
    }
    if (productName) {
        productName.textContent = product.nombre;
    }
    if (productDescription) {
        productDescription.textContent =
            product.descripcion;
    }
    if (productPrice) {
        productPrice.textContent =
            `$${product.precio.toFixed(2)}`;
    }
    const available = product.activo && product.stock > 0;
    if (productStatus) {
        productStatus.textContent =
            available
                ? "Disponible"
                : "No disponible";
        productStatus.className =
            `product-status ${available
                ? "available"
                : "unavailable"}`;
    }
    if (productStock) {
        productStock.textContent =
            product.stock > 0
                ? `Stock disponible: ${product.stock}`
                : "Sin stock";
    }
    if (quantityInput) {
        quantityInput.max =
            product.stock.toString();
        quantityInput.disabled =
            !available;
    }
    if (decreaseButton) {
        decreaseButton.disabled =
            !available;
    }
    if (increaseButton) {
        increaseButton.disabled =
            !available;
    }
    if (addButton) {
        addButton.disabled =
            !available;
    }
}
decreaseButton?.addEventListener("click", () => {
    if (!quantityInput) {
        return;
    }
    updateQuantity(Number(quantityInput.value) - 1);
});
increaseButton?.addEventListener("click", () => {
    if (!quantityInput) {
        return;
    }
    updateQuantity(Number(quantityInput.value) + 1);
});
quantityInput?.addEventListener("change", () => {
    if (!quantityInput || !product) {
        return;
    }
    const value = Number(quantityInput.value);
    if (!Number.isInteger(value) ||
        value < 1 ||
        value > product.stock) {
        showError(`La cantidad debe estar entre 1 y ${product.stock}.`);
        updateQuantity(1);
        return;
    }
    clearError();
});
addButton?.addEventListener("click", () => {
    if (!product || !quantityInput) {
        return;
    }
    clearError();
    const quantity = Number(quantityInput.value);
    if (!product.activo ||
        product.stock <= 0) {
        showError("Este producto no está disponible.");
        return;
    }
    if (!Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > product.stock) {
        showError(`La cantidad debe estar entre 1 y ${product.stock}.`);
        return;
    }
    addToCart(product, quantity);
    updateCartBadge();
    if (confirmation) {
        confirmation.textContent =
            "Producto agregado al carrito.";
    }
});
backButton?.addEventListener("click", () => {
    window.location.href =
        "../home/home.html";
});
cartButton?.addEventListener("click", () => {
    window.location.href =
        "../cart/cart.html";
});
updateCartBadge();
await loadProduct();
//# sourceMappingURL=productDetail.js.map
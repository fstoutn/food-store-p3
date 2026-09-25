import { apiRequest, saveSession } from "../../../utils/api.js";
import { logout, requireRole } from "../../../utils/auth.js";
const hardcodedClient = {
    id: 99,
    name: "Cliente Demo",
    email: "cliente@demo.com",
    role: "cliente",
};
saveSession(hardcodedClient);
const user = requireRole("cliente");
const userName = document.querySelector("#user-name");
const logoutButton = document.querySelector("#logout-button");
const productGrid = document.querySelector("#product-grid");
const productCount = document.querySelector("#product-count");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const categoryList = document.querySelector(".category-list");
const sidebar = document.querySelector("#sidebar");
const sidebarToggle = document.querySelector("#sidebar-toggle");
const fallbackCategories = [
    { id: 1, nombre: "Comidas", descripcion: "Platos principales", imagenUrl: "" },
    { id: 2, nombre: "Bebidas", descripcion: "Bebidas frías y calientes", imagenUrl: "" },
    { id: 3, nombre: "Postres", descripcion: "Postres y dulces", imagenUrl: "" }
];
const fallbackProducts = [
    {
        id: 1,
        nombre: "Hamburguesa Clásica",
        descripcion: "Carne, queso y vegetales en pan brioche.",
        precio: 1800,
        stock: 8,
        activo: true,
        imagenUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
        categoria: { id: 1, nombre: "Comidas", descripcion: "Platos principales", imagenUrl: "" }
    },
    {
        id: 2,
        nombre: "Empanadas de Carne",
        descripcion: "Empanadas caseras rellenas con carne picada.",
        precio: 950,
        stock: 12,
        activo: true,
        imagenUrl: "https://comidasparaguayas.com/assets/images/empanada-de-carne_800x534.webp",
        categoria: { id: 1, nombre: "Comidas", descripcion: "Platos principales", imagenUrl: "" }
    },
    {
        id: 3,
        nombre: "Limonada Fresh",
        descripcion: "Refrescante bebida con limón y menta.",
        precio: 600,
        stock: 15,
        activo: true,
        imagenUrl: "https://acdn-us.mitiendanube.com/stores/001/071/578/products/limonada-menta-y-jengibre-2-5bd65ef9136235048a17762796324309-640-0.webp",
        categoria: { id: 2, nombre: "Bebidas", descripcion: "Bebidas frías y calientes", imagenUrl: "" }
    },
    {
        id: 4,
        nombre: "Donas",
        descripcion: "Donas de chocolate con chispas de colores.",
        precio: 1200,
        stock: 5,
        activo: true,
        imagenUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80",
        categoria: { id: 3, nombre: "Postres", descripcion: "Postres y dulces", imagenUrl: "" }
    }
];
let products = [];
let categories = [];
let selectedCategory = null;
let searchText = "";
if (userName) {
    userName.textContent = user.name;
}
logoutButton?.addEventListener("click", () => {
    logout();
});
sidebarToggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
});
async function loadCategories() {
    try {
        categories = await apiRequest("/categorias");
        renderCategories();
    }
    catch (error) {
        console.warn("No hay backend de categorías, usando datos de prueba.", error);
        categories = fallbackCategories;
        renderCategories();
    }
}
async function loadProducts() {
    try {
        products = await apiRequest("/productos");
        renderProducts();
    }
    catch (error) {
        console.warn("No hay backend de productos, usando datos de prueba.", error);
        products = fallbackProducts;
        renderProducts();
    }
}
function renderCategories() {
    if (!categoryList) {
        return;
    }
    categoryList.innerHTML = "";
    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.className =
        selectedCategory === null ? "category-item active" : "category-item";
    allButton.textContent = "Todas";
    allButton.addEventListener("click", () => {
        selectedCategory = null;
        renderCategories();
        renderProducts();
    });
    categoryList.appendChild(allButton);
    categories.forEach((category) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className =
            selectedCategory === category.id ? "category-item active" : "category-item";
        button.textContent = category.nombre;
        button.addEventListener("click", () => {
            selectedCategory = category.id;
            renderCategories();
            renderProducts();
        });
        categoryList.appendChild(button);
    });
}
function getFilteredProducts() {
    let filteredProducts = [...products];
    if (selectedCategory !== null) {
        filteredProducts = filteredProducts.filter((product) => product.categoria.id === selectedCategory);
    }
    if (searchText) {
        filteredProducts = filteredProducts.filter((product) => product.nombre.toLowerCase().includes(searchText));
    }
    return filteredProducts;
}
function sortProducts(productList) {
    const sortValue = sortSelect?.value ?? "default";
    return [...productList].sort((a, b) => {
        switch (sortValue) {
            case "name-asc":
                return a.nombre.localeCompare(b.nombre);
            case "name-desc":
                return b.nombre.localeCompare(a.nombre);
            case "price-asc":
                return a.precio - b.precio;
            case "price-desc":
                return b.precio - a.precio;
            default:
                return 0;
        }
    });
}
function renderProducts() {
    if (!productGrid) {
        return;
    }
    const filteredProducts = sortProducts(getFilteredProducts());
    if (productCount) {
        productCount.textContent = `${filteredProducts.length} producto${filteredProducts.length !== 1 ? "s" : ""}`;
    }
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="empty-products">
                <h2>No se encontraron productos</h2>
                <p>Probá con otra búsqueda o categoría.</p>
            </div>
        `;
        return;
    }
    productGrid.innerHTML = "";
    filteredProducts.forEach((product) => {
        const card = document.createElement("article");
        card.className = "product-card";
        const image = product.imagenUrl
            ? product.imagenUrl
            : "https://via.placeholder.com/400x300?text=Sin+imagen";
        const statusClass = product.activo && product.stock > 0 ? "available" : "unavailable";
        const statusText = product.activo && product.stock > 0 ? "Disponible" : "No disponible";
        card.innerHTML = `
            <img
                src="${image}"
                alt="${product.nombre}"
                class="product-image"
            >

            <div class="product-info">
                <h3 class="product-name">${product.nombre}</h3>

                <p class="product-description">
                    ${product.descripcion}
                </p>

                <p class="product-price">
                    $${product.precio.toFixed(2)}
                </p>

                <span class="product-status ${statusClass}">
                    ${statusText}
                </span>
            </div>
        `;
        card.addEventListener("click", () => {
            window.location.href = `../productDetail/productDetail.html?id=${product.id}`;
        });
        productGrid.appendChild(card);
    });
}
searchInput?.addEventListener("input", () => {
    searchText = searchInput.value.trim().toLowerCase();
    renderProducts();
});
sortSelect?.addEventListener("change", () => {
    renderProducts();
});
await Promise.all([loadCategories(), loadProducts()]);
//# sourceMappingURL=home.js.map
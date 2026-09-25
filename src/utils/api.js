const SESSION_KEY = "food_store_user";
const API_BASE_URL = "";
export async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {})
        },
        ...options
    });
    if (!response.ok) {
        let message = "La solicitud falló.";
        try {
            const errorBody = await response.json();
            message = errorBody?.message ?? message;
        }
        catch {
            const text = await response.text();
            if (text) {
                message = text;
            }
        }
        throw new Error(message);
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
        return (await response.json());
    }
    return (await response.text());
}
export function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
export function getSession() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) {
        return null;
    }
    try {
        return JSON.parse(session);
    }
    catch {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
}
export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}
export function isAuthenticated() {
    return getSession() !== null;
}
export function isAdmin() {
    return getSession()?.role === "admin";
}
export function isClient() {
    return getSession()?.role === "cliente";
}
export function requireAuth() {
    const session = getSession();
    if (!session) {
        window.location.href = "/src/pages/auth/login/login.html";
        throw new Error("Usuario no autenticado.");
    }
    return session;
}
export function requireRole(role) {
    const session = requireAuth();
    if (session.role !== role) {
        if (session.role === "admin") {
            window.location.href = "/src/pages/admin/adminHome/adminHome.html";
        }
        else {
            window.location.href = "/src/pages/store/home/home.html";
        }
        throw new Error("Usuario sin permisos.");
    }
    return session;
}
export function logout() {
    clearSession();
    window.location.href = "/src/pages/auth/login/login.html";
}
//# sourceMappingURL=api.js.map
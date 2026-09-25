export interface UserSession {
    name: string;
    email: string;
    id: number;
    role: "admin" | "cliente";
}

const SESSION_KEY = "food_store_user";
const API_BASE_URL = "";

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
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
        } catch {
            const text = await response.text();
            if (text) {
                message = text;
            }
        }

        throw new Error(message);
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
}

export function saveSession(user: UserSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): UserSession | null {
    const session = localStorage.getItem(SESSION_KEY);

    if (!session) {
        return null;
    }

    try {
        return JSON.parse(session) as UserSession;
    } catch {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
}

export function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
    return getSession() !== null;
}

export function isAdmin(): boolean {
    return getSession()?.role === "admin";
}

export function isClient(): boolean {
    return getSession()?.role === "cliente";
}

export function requireAuth(): UserSession {
    const session = getSession();

    if (!session) {
        window.location.href = "/src/pages/auth/login/login.html";
        throw new Error("Usuario no autenticado.");
    }

    return session;
}

export function requireRole(role: "admin" | "cliente"): UserSession {
    const session = requireAuth();

    if (session.role !== role) {
        if (session.role === "admin") {
            window.location.href = "/src/pages/admin/adminHome/adminHome.html";
        } else {
            window.location.href = "/src/pages/store/home/home.html";
        }

        throw new Error("Usuario sin permisos.");
    }

    return session;
}

export function logout(): void {
    clearSession();
    window.location.href = "/src/pages/auth/login/login.html";
}
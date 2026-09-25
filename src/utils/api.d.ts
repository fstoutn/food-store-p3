export interface UserSession {
    name: string;
    email: string;
    id: number;
    role: "admin" | "cliente";
}
export declare function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T>;
export declare function saveSession(user: UserSession): void;
export declare function getSession(): UserSession | null;
export declare function clearSession(): void;
export declare function isAuthenticated(): boolean;
export declare function isAdmin(): boolean;
export declare function isClient(): boolean;
export declare function requireAuth(): UserSession;
export declare function requireRole(role: "admin" | "cliente"): UserSession;
export declare function logout(): void;
//# sourceMappingURL=api.d.ts.map
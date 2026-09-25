import { apiRequest, saveSession, type UserSession } from "../../../utils/api.js";

const loginForm = document.querySelector<HTMLFormElement>("#login-form");
const loginError = document.querySelector<HTMLParagraphElement>("#login-error");

loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = document.querySelector<HTMLInputElement>("#email");
    const passwordInput = document.querySelector<HTMLInputElement>("#password");

    if (!emailInput || !passwordInput || !loginError) {
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    loginError.textContent = "";

    if (!email || !password) {
        loginError.textContent = "Todos los campos son obligatorios.";
        return;
    }

    try {
        const user = await apiRequest<UserSession>("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email,
                password
            })
        });

        saveSession(user);

        if (user.role === "admin") {
            window.location.href = "../../../admin/adminHome/adminHome.html";
        } else {
            window.location.href = "../../../store/home/home.html";
        }
    } catch (error) {
        loginError.textContent =
            error instanceof Error
                ? error.message
                : "No se pudo iniciar sesión.";
    }
});
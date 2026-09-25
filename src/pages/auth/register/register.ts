import { apiRequest, saveSession, type UserSession } from "../../../utils/api.js";

const registerForm =
    document.querySelector<HTMLFormElement>("#register-form");

const registerError =
    document.querySelector<HTMLParagraphElement>("#register-error");

registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameInput = document.querySelector<HTMLInputElement>("#name");
    const emailInput = document.querySelector<HTMLInputElement>("#email");
    const passwordInput = document.querySelector<HTMLInputElement>("#password");
    const confirmPasswordInput =
        document.querySelector<HTMLInputElement>("#confirm-password");

    if (
        !nameInput ||
        !emailInput ||
        !passwordInput ||
        !confirmPasswordInput ||
        !registerError
    ) {
        return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    registerError.textContent = "";

    if (!name || !email || !password || !confirmPassword) {
        registerError.textContent = "Todos los campos son obligatorios.";
        return;
    }

    if (password.length < 6) {
        registerError.textContent =
            "La contraseña debe tener al menos 6 caracteres.";
        return;
    }

    if (password !== confirmPassword) {
        registerError.textContent = "Las contraseñas no coinciden.";
        return;
    }

    try {
        const user = await apiRequest<UserSession>("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name,
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
        registerError.textContent =
            error instanceof Error
                ? error.message
                : "No se pudo completar el registro.";
    }
});
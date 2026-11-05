import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbLj9WflRM_dY6uQ0nWfiBVPMmxpNL1jQ",
  authDomain: "tendencias-mercado-del-jeans.firebaseapp.com",
  projectId: "tendencias-mercado-del-jeans",
  storageBucket: "tendencias-mercado-del-jeans.firebasestorage.app",
  messagingSenderId: "857359418020",
  appId: "1:857359418020:web:c543eac2d613cb0e981c31",
  measurementId: "G-SDJ8HZFX5S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const authView = document.querySelector("#auth-view");
const appView = document.querySelector("#app-view");
const form = document.querySelector("#auth-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const message = document.querySelector("#message");
const submitButton = document.querySelector("#submit-button");
const formTitle = document.querySelector("#form-title");
const formSubtitle = document.querySelector("#form-subtitle");
const switchCopy = document.querySelector("#switch-copy");
const forgotButton = document.querySelector("#forgot-button");
const switchModeButton = document.querySelector("#switch-mode");
const togglePasswordButton = document.querySelector("#toggle-password");

let isRegisterMode = false;

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = type === "success" ? "message success" : "message";
}

function friendlyError(error) {
  const errors = {
    "auth/email-already-in-use": "Este correo ya tiene una cuenta. Inicia sesión.",
    "auth/invalid-email": "El correo electrónico no tiene un formato válido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-disabled": "Esta cuenta está deshabilitada.",
    "auth/too-many-requests": "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
    "auth/network-request-failed": "No fue posible conectar. Revisa tu conexión a internet."
  };
  return errors[error.code] || "Ocurrió un error. Verifica los datos e inténtalo nuevamente.";
}

function updateMode() {
  formTitle.textContent = isRegisterMode ? "Crear cuenta" : "Iniciar sesión";
  formSubtitle.textContent = isRegisterMode
    ? "Regístrate para acceder a la plataforma."
    : "Ingresa tus datos para continuar.";
  submitButton.innerHTML = isRegisterMode
    ? 'Crear cuenta <span>→</span>'
    : 'Iniciar sesión <span>→</span>';
  switchCopy.innerHTML = isRegisterMode
    ? '¿Ya tienes una cuenta? <button type="button" class="text-button" id="switch-mode">Iniciar sesión</button>'
    : '¿Aún no tienes una cuenta? <button type="button" class="text-button" id="switch-mode">Crear cuenta</button>';
  document.querySelector("#switch-mode").addEventListener("click", toggleMode);
  passwordInput.autocomplete = isRegisterMode ? "new-password" : "current-password";
  forgotButton.hidden = isRegisterMode;
  showMessage("");
}

function toggleMode() {
  isRegisterMode = !isRegisterMode;
  updateMode();
}

switchModeButton.addEventListener("click", toggleMode);
togglePasswordButton.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  togglePasswordButton.textContent = showing ? "Mostrar" : "Ocultar";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  submitButton.disabled = true;
  showMessage("");

  try {
    if (isRegisterMode) {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    showMessage(friendlyError(error));
  } finally {
    submitButton.disabled = false;
  }
});

forgotButton.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) {
    showMessage("Escribe tu correo electrónico para enviarte el enlace de recuperación.");
    emailInput.focus();
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    showMessage("Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.", "success");
  } catch (error) {
    showMessage(friendlyError(error));
  }
});

document.querySelector("#logout-button").addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch {
    document.querySelector("#dashboard-message").textContent = "No fue posible cerrar la sesión. Inténtalo de nuevo.";
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    authView.hidden = true;
    appView.hidden = false;
    document.querySelector("#user-email").textContent = user.email || "Usuario";
    document.querySelector("#avatar").textContent = (user.email || "U").charAt(0).toUpperCase();
  } else {
    appView.hidden = true;
    authView.hidden = false;
    form.reset();
    isRegisterMode = false;
    updateMode();
  }
});

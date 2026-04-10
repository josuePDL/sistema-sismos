// Tus credenciales configuradas
const SUPABASE_URL = 'https://bjpweoougxzlbnvxkmgk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHdlb291Z3h6bGJudnhrbWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjg2OTAsImV4cCI6MjA5MTQwNDY5MH0.dFuAXWK2H8loRs3Ormcphm1maGfbFm-hT_SkEaMyi1s';

// Accedemos a la función de creación correctamente según la versión del CDN
const { createClient } = window.supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const loginForm = document.getElementById('loginForm');
const alertPlaceholder = document.getElementById('alertPlaceholder');
const loginBtn = document.getElementById('loginBtn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Verificando...';

    try {
        // Intentar el inicio de sesión
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            mostrarAlerta(error.message, 'danger');
            loginBtn.disabled = false;
            loginBtn.innerText = 'Entrar al Dashboard';
        } else {
            mostrarAlerta('¡Éxito! Redirigiendo...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
    } catch (err) {
        console.error("Error inesperado:", err);
        mostrarAlerta("Error de conexión con el servidor", "danger");
        loginBtn.disabled = false;
        loginBtn.innerText = 'Entrar al Dashboard';
    }
});

function mostrarAlerta(mensaje, tipo) {
    alertPlaceholder.innerHTML = `
        <div class="alert alert-${tipo} mt-3 py-2 small" role="alert">
            ${mensaje}
        </div>
    `;
}
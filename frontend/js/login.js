document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    const API_BASE = location.port === '8080' ? '' : 'http://localhost:8080';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (email === '' || password === '') {
            errorMessage.textContent = 'Por favor, completa todos los campos.';
            errorMessage.style.display = 'block';
            return;
        }

        errorMessage.style.display = 'none';

        try {
            const respuesta = await fetch(`${API_BASE}/api/usuarios/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!respuesta.ok) {
                errorMessage.textContent = 'Credenciales inválidas. Verifica tu correo y contraseña.';
                errorMessage.style.display = 'block';
                return;
            }

            const usuario = await respuesta.json();
            localStorage.setItem('userId', usuario.id);
            localStorage.setItem('userName', usuario.nombre);
            localStorage.setItem('userEmail', usuario.email);

            window.location.href = 'index.html';
        } catch (error) {
            errorMessage.textContent = 'No se pudo conectar con el servidor. Intenta nuevamente.';
            errorMessage.style.display = 'block';
        }
    });
});

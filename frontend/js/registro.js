document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');

    const API_BASE = location.port === '8080' ? '' : 'http://localhost:8080';

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (fullname === '' || email === '' || password === '') {
            errorMessage.textContent = 'Por favor, completa todos los campos.';
            errorMessage.style.display = 'block';
            return;
        }

        errorMessage.style.display = 'none';

        try {
            const respuesta = await fetch(`${API_BASE}/api/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: fullname,
                    email: email,
                    password: password,
                    rol: 'CLIENTE'
                })
            });

            if (respuesta.status === 409) {
                errorMessage.textContent = 'Ese correo ya está registrado. Inicia sesión.';
                errorMessage.style.display = 'block';
                return;
            }

            if (!respuesta.ok) {
                errorMessage.textContent = 'No se pudo completar el registro. Intenta nuevamente.';
                errorMessage.style.display = 'block';
                return;
            }

            window.location.href = 'iniciar-sesion.html';
        } catch (error) {
            errorMessage.textContent = 'No se pudo conectar con el servidor. Intenta nuevamente.';
            errorMessage.style.display = 'block';
        }
    });
});

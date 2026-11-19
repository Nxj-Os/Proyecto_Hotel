document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const Session = window.HotelSession;
    const API_BASE = Session ? Session.apiBase : '';

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

        if (password.length < 6) {
            errorMessage.textContent = 'La contraseña debe tener al menos 6 caracteres.';
            errorMessage.style.display = 'block';
            return;
        }

        errorMessage.style.display = 'none';

        const boton = registerForm.querySelector('button[type="submit"]');
        if (boton) {
            boton.disabled = true;
            boton.textContent = 'Creando cuenta...';
        }

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

            const usuario = await respuesta.json();

            if (Session && Session.saveUser) {
                Session.saveUser(usuario, true);
            } else {
                localStorage.setItem('hotelUser', JSON.stringify(usuario));
            }

            window.location.href = 'perfil.html';
        } catch (error) {
            errorMessage.textContent = 'No se pudo conectar con el servidor. Intenta nuevamente.';
            errorMessage.style.display = 'block';
        } finally {
            if (boton) {
                boton.disabled = false;
                boton.textContent = 'Registrarse';
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const Session = window.HotelSession;
    const API_BASE = Session ? Session.apiBase : 'http://localhost:8080';

    function guardarSesion(usuario, recordar) {
        if (Session && Session.saveUser) {
            Session.saveUser(usuario, recordar);
            return;
        }
        try {
            const data = JSON.stringify(usuario);
            if (recordar) {
                localStorage.setItem('hotelUser', data);
            } else {
                sessionStorage.setItem('hotelUser', data);
            }
        } catch (error) {
            localStorage.setItem('hotelUser', JSON.stringify(usuario));
        }
    }

    function destino() {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        if (redirect && !/^https?:/i.test(redirect) && !redirect.includes('://')) {
            return redirect;
        }
        return 'perfil.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const remember = loginForm.querySelector('input[name="remember"]');

        if (email === '' || password === '') {
            errorMessage.textContent = 'Por favor, completa todos los campos.';
            errorMessage.style.display = 'block';
            return;
        }

        errorMessage.style.display = 'none';

        const boton = loginForm.querySelector('button[type="submit"]');
        if (boton) {
            boton.disabled = true;
            boton.textContent = 'Ingresando...';
        }

        try {
            const respuesta = await fetch(`${API_BASE}/api/usuarios/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!respuesta.ok) {
                errorMessage.textContent = respuesta.status === 401
                    ? 'Credenciales inválidas. Verifica tu correo y contraseña.'
                    : 'No se pudo iniciar sesión. Intenta nuevamente.';
                errorMessage.style.display = 'block';
                return;
            }

            const usuario = await respuesta.json();

            guardarSesion(usuario, remember ? remember.checked : false);

            window.location.href = destino();
        } catch (error) {
            errorMessage.textContent = 'No se pudo conectar con el servidor. Intenta nuevamente.';
            errorMessage.style.display = 'block';
        } finally {
            if (boton) {
                boton.disabled = false;
                boton.textContent = 'Ingresar';
            }
        }
    });
});

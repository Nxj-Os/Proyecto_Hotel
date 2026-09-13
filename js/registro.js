document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (fullname === '' || email === '' || password === '') {
            errorMessage.textContent = 'Por favor, completa todos los campos.';
            errorMessage.style.display = 'block';
            return;
        }

        // Guardar credenciales de forma local
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);
        localStorage.setItem('userName', fullname);

        errorMessage.style.display = 'none';

        // Redirigir directamente al Login tras registrarse
        window.location.href = 'iniciar-sesion.html';
    });
});


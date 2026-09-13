document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Validación simple de campos no vacíos
        if (email === '' || password === '') {
            errorMessage.textContent = 'Por favor, completa todos los campos.';
            errorMessage.style.display = 'block';
            return;
        }

        // Simulación de acceso correcto
        errorMessage.style.display = 'none';
        
        // Redirección a la página principal del proyecto
        window.location.href = 'inicio.html';
    });
});
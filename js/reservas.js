document.addEventListener('DOMContentLoaded', () => {
    const habitaciones = {
        'suite-presidencial': {
            nombre: 'Suite Presidencial',
            precio: 400,
            imagen: 'img/habitaciones/suite-presidencial.jpg'
        },
        'habitacion-deluxe': {
            nombre: 'Habitación Deluxe',
            precio: 250,
            imagen: 'img/habitaciones/habitacion-deluxe.jpg'
        },
        'suite-junior': {
            nombre: 'Suite Junior',
            precio: 180,
            imagen: 'img/habitaciones/suite-junior.jpg'
        },
        'habitacion-estandar': {
            nombre: 'Habitación Estándar',
            precio: 120,
            imagen: 'img/habitaciones/habitacion-estandar.jpg'
        }
    };

    const params = new URLSearchParams(window.location.search);
    const habitacionKey = params.get('habitacion') || 'suite-presidencial';
    const habitacion = habitaciones[habitacionKey] || habitaciones['suite-presidencial'];

    const resumenImagen = document.getElementById('resumenImagen');
    const resumenNombre = document.getElementById('resumenNombre');
    const resumenPrecioNoche = document.getElementById('resumenPrecioNoche');
    const resumenNoches = document.getElementById('resumenNoches');
    const resumenTarifa = document.getElementById('resumenTarifa');
    const resumenTotal = document.getElementById('resumenTotal');
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const form = document.getElementById('reservaForm');

    function actualizarResumen() {
        if (resumenImagen) resumenImagen.src = habitacion.imagen;
        if (resumenNombre) resumenNombre.textContent = habitacion.nombre;
        if (resumenPrecioNoche) resumenPrecioNoche.textContent = `$${habitacion.precio} / noche`;
        if (resumenTarifa) resumenTarifa.textContent = `$${habitacion.precio.toFixed(2)} USD`;
    }

    function calcularNoches() {
        if (!checkinInput.value || !checkoutInput.value) return 0;
        const checkin = new Date(checkinInput.value);
        const checkout = new Date(checkoutInput.value);
        const diff = checkout - checkin;
        return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
    }

    function actualizarTotal() {
        const noches = calcularNoches();
        const total = noches * habitacion.precio;
        if (resumenNoches) resumenNoches.textContent = `${noches} noche${noches !== 1 ? 's' : ''}`;
        if (resumenTotal) resumenTotal.textContent = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function establecerFechasMinimas() {
        const hoy = new Date().toISOString().split('T')[0];
        if (checkinInput) checkinInput.min = hoy;
        if (checkoutInput) checkoutInput.min = hoy;
    }

    if (checkinInput) {
        checkinInput.addEventListener('change', () => {
            if (checkinInput.value) {
                const siguienteDia = new Date(checkinInput.value);
                siguienteDia.setDate(siguienteDia.getDate() + 1);
                if (checkoutInput) checkoutInput.min = siguienteDia.toISOString().split('T')[0];
                if (checkoutInput.value && new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
                    checkoutInput.value = '';
                }
            }
            actualizarTotal();
        });
    }

    if (checkoutInput) {
        checkoutInput.addEventListener('change', actualizarTotal);
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre');
            const email = document.getElementById('email');
            const telefono = document.getElementById('telefono');
            const checkin = document.getElementById('checkin');
            const checkout = document.getElementById('checkout');

            let valido = true;

            [nombre, email, telefono, checkin, checkout].forEach(campo => {
                if (campo) campo.style.borderColor = '';
            });

            if (!checkin.value || !checkout.value) {
                valido = false;
                if (checkin) checkin.style.borderColor = '#e74c3c';
                if (checkout) checkout.style.borderColor = '#e74c3c';
            }

            if (!nombre.value.trim()) {
                valido = false;
                nombre.style.borderColor = '#e74c3c';
            }

            if (!email.value.trim() || !email.value.includes('@')) {
                valido = false;
                email.style.borderColor = '#e74c3c';
            }

            if (!telefono.value.trim()) {
                valido = false;
                telefono.style.borderColor = '#e74c3c';
            }

            if (calcularNoches() <= 0) {
                valido = false;
                if (checkin) checkin.style.borderColor = '#e74c3c';
                if (checkout) checkout.style.borderColor = '#e74c3c';
            }

            if (valido) {
                alert(`Reserva confirmada para ${habitacion.nombre}\n\nCheck-in: ${checkin.value}\nCheck-out: ${checkout.value}\nTotal: ${resumenTotal.textContent}`);
            }
        });
    }

    const hamburger = document.querySelector('.nav__hamburger');
    const menu = document.querySelector('.nav__menu');
    const navLinks = document.querySelectorAll('.nav__link');

    if (hamburger && menu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('nav__hamburger--activo');
            menu.classList.toggle('nav__menu--activo');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('nav__hamburger--activo');
                menu.classList.remove('nav__menu--activo');
            });
        });
    }

    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(26, 26, 46, 0.97)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.backgroundColor = 'var(--color-oscuro)';
            header.style.boxShadow = 'none';
        }
    });

    establecerFechasMinimas();
    actualizarResumen();
    actualizarTotal();
});

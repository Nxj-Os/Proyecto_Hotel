document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = location.port === '8080' ? '' : 'http://localhost:8080';

    const nombres = {
        'suite-presidencial': 'Suite Presidencial',
        'habitacion-deluxe': 'Habitación Deluxe',
        'suite-junior': 'Suite Junior',
        'habitacion-estandar': 'Habitación Estándar'
    };

    function nombreDesdeTipo(tipo) {
        if (nombres[tipo]) return nombres[tipo];
        return tipo
            .split('-')
            .map(p => p.charAt(0).toUpperCase() + p.slice(1))
            .join(' ');
    }

    const resumenImagen = document.getElementById('resumenImagen');
    const resumenNombre = document.getElementById('resumenNombre');
    const resumenPrecioNoche = document.getElementById('resumenPrecioNoche');
    const resumenNoches = document.getElementById('resumenNoches');
    const resumenTarifa = document.getElementById('resumenTarifa');
    const resumenTotal = document.getElementById('resumenTotal');
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const form = document.getElementById('reservaForm');

    let catalogo = {};
    let habitacion = null;

    function actualizarResumen() {
        if (!habitacion) return;
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
        if (!habitacion) return;
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

    async function cargarHabitaciones() {
        const respuesta = await fetch(`${API_BASE}/api/habitaciones`);
        if (!respuesta.ok) throw new Error('No se pudieron cargar las habitaciones');
        const habitaciones = await respuesta.json();

        catalogo = {};
        habitaciones.forEach(h => {
            catalogo[h.tipo] = {
                id: h.id,
                nombre: nombreDesdeTipo(h.tipo),
                precio: h.precio,
                imagen: `img/habitaciones/${h.tipo}.jpg`
            };
        });

        const params = new URLSearchParams(window.location.search);
        const habitacionKey = params.get('habitacion');
        habitacion = catalogo[habitacionKey]
            || catalogo[Object.keys(catalogo)[0]]
            || null;

        actualizarResumen();
        actualizarTotal();
    }

    async function obtenerOCrearUsuario(nombre, email, telefono) {
        const userId = localStorage.getItem('userId');
        if (userId) return Number(userId);

        const busqueda = await fetch(`${API_BASE}/api/usuarios/email/${encodeURIComponent(email)}`);
        if (busqueda.ok) {
            const usuario = await busqueda.json();
            return usuario.id;
        }

        const creacion = await fetch(`${API_BASE}/api/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nombre,
                email: email,
                password: telefono || 'invitado',
                rol: 'CLIENTE'
            })
        });

        if (creacion.status === 409) {
            const reintento = await fetch(`${API_BASE}/api/usuarios/email/${encodeURIComponent(email)}`);
            if (reintento.ok) return (await reintento.json()).id;
        }

        if (!creacion.ok) throw new Error('No se pudo registrar al huésped');
        return (await creacion.json()).id;
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
        form.addEventListener('submit', async (e) => {
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

            if (!valido) return;

            if (!habitacion) {
                alert('No hay habitaciones disponibles en este momento.');
                return;
            }

            const boton = document.querySelector('.reservar__btn-confirmar');
            if (boton) {
                boton.disabled = true;
                boton.textContent = 'Confirmando...';
            }

            try {
                const usuarioId = await obtenerOCrearUsuario(
                    nombre.value.trim(),
                    email.value.trim(),
                    telefono.value.trim()
                );

                const respuesta = await fetch(`${API_BASE}/api/reservas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuario: { id: usuarioId },
                        habitacion: { id: habitacion.id },
                        fechaInicio: checkin.value,
                        fechaFin: checkout.value,
                        estado: 'CONFIRMADA'
                    })
                });

                if (!respuesta.ok) throw new Error('No se pudo crear la reserva');

                alert(`Reserva confirmada para ${habitacion.nombre}\n\nCheck-in: ${checkin.value}\nCheck-out: ${checkout.value}\nTotal: ${resumenTotal.textContent}`);
                form.reset();
                actualizarTotal();
            } catch (error) {
                alert('Ocurrió un error al procesar tu reserva. Intenta nuevamente.');
            } finally {
                if (boton) {
                    boton.disabled = false;
                    boton.textContent = 'Confirmar Reserva';
                }
            }
        });
    }

    establecerFechasMinimas();
    cargarHabitaciones().catch(() => {
        alert('No se pudieron cargar las habitaciones. Verifica que el servidor esté en ejecución.');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const Session = window.HotelSession;
    const API_BASE = Session ? Session.apiBase : '';
    const usuarioSesion = Session ? Session.getUser() : null;

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

    function prellenarHuesped() {
        if (!usuarioSesion) return;

        const nombre = document.getElementById('nombre');
        const email = document.getElementById('email');
        const telefono = document.getElementById('telefono');

        if (nombre) {
            nombre.value = usuarioSesion.nombre || '';
            nombre.readOnly = true;
        }
        if (email) {
            email.value = usuarioSesion.email || '';
            email.readOnly = true;
        }
        if (telefono) {
            telefono.required = false;
            telefono.placeholder = 'Opcional';
        }
    }

    function habitacionesDisponibles(lista) {
        return lista.filter(h => h.disponible !== false);
    }

    function actualizarResumen() {
        if (!habitacion) return;
        if (resumenImagen) resumenImagen.src = habitacion.imagen;
        if (resumenNombre) resumenNombre.textContent = habitacion.nombre;
        if (resumenPrecioNoche) resumenPrecioNoche.textContent = `S/ ${habitacion.precio} / noche`;
        if (resumenTarifa) resumenTarifa.textContent = `S/ ${habitacion.precio.toFixed(2)}`;
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
        if (resumenTotal) resumenTotal.textContent = `S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function establecerFechasMinimas() {
        const hoy = new Date().toISOString().split('T')[0];
        if (checkinInput) checkinInput.min = hoy;
        if (checkoutInput) checkoutInput.min = hoy;
    }

    async function cargarHabitaciones() {
        const respuesta = await fetch(`${API_BASE}/api/habitaciones`);
        if (!respuesta.ok) throw new Error('No se pudieron cargar las habitaciones');
        const habitaciones = habitacionesDisponibles(await respuesta.json());

        catalogo = {};
        habitaciones.forEach(h => {
            catalogo[h.tipo] = {
                id: h.id,
                nombre: nombreDesdeTipo(h.tipo),
                precio: Number(h.precio),
                imagen: `img/habitaciones/${h.tipo}.jpg`
            };
        });

        const params = new URLSearchParams(window.location.search);
        const habitacionKey = params.get('habitacion');
        habitacion = catalogo[habitacionKey]
            || catalogo[Object.keys(catalogo)[0]]
            || null;

        const boton = document.querySelector('.reservar__btn-confirmar');
        if (!habitacion && boton) {
            boton.disabled = true;
            boton.textContent = 'Sin disponibilidad';
        }

        actualizarResumen();
        actualizarTotal();
    }

    async function obtenerOCrearUsuario(nombre, email, telefono) {
        if (usuarioSesion && usuarioSesion.id) return usuarioSesion.id;

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

            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (!checkin.value || !checkout.value || new Date(checkin.value) < hoy) {
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

            if (!usuarioSesion && !telefono.value.trim()) {
                valido = false;
                telefono.style.borderColor = '#e74c3c';
            }

            if (calcularNoches() <= 0) {
                valido = false;
                if (checkin) checkin.style.borderColor = '#e74c3c';
                if (checkout) checkout.style.borderColor = '#e74c3c';
            }

            if (!valido) {
                alert('Revisa los campos marcados en rojo. La fecha de check-in no puede ser anterior a hoy.');
                return;
            }

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

                if (usuarioSesion) {
                    window.location.href = 'perfil.html';
                    return;
                }

                form.reset();
                prellenarHuesped();
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
    prellenarHuesped();
    cargarHabitaciones().catch(() => {
        alert('No se pudieron cargar las habitaciones. Verifica que el servidor esté en ejecución.');
    });
});

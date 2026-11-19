document.addEventListener('DOMContentLoaded', () => {
    const Session = window.HotelSession;
    const API_BASE = Session ? Session.apiBase : '';
    const escape = Session ? Session.escapeHtml : (v) => String(v == null ? '' : v);

    let usuario = Session ? Session.getUser() : null;
    if (!usuario) {
        try {
            const raw = localStorage.getItem('hotelUser') || sessionStorage.getItem('hotelUser');
            usuario = raw ? JSON.parse(raw) : null;
        } catch (error) {
            usuario = null;
        }
    }

    if (!usuario || !usuario.id) {
        window.location.href = 'iniciar-sesion.html?redirect=perfil.html';
        return;
    }

    const nombres = {
        'suite-presidencial': 'Suite Presidencial',
        'habitacion-deluxe': 'Habitación Deluxe',
        'suite-junior': 'Suite Junior',
        'habitacion-estandar': 'Habitación Estándar'
    };

    const elAvatar = document.getElementById('perfilAvatar');
    const elNombre = document.getElementById('perfilNombre');
    const elRol = document.getElementById('perfilRol');
    const elEmail = document.getElementById('perfilEmail');
    const elId = document.getElementById('perfilId');
    const elTotal = document.getElementById('perfilTotalReservas');
    const elLista = document.getElementById('perfilReservas');
    const elVacio = document.getElementById('perfilVacio');
    const elMensaje = document.getElementById('perfilMensaje');

    function nombreDesdeTipo(tipo) {
        if (nombres[tipo]) return nombres[tipo];
        return String(tipo || 'Habitación')
            .split('-')
            .map(p => p.charAt(0).toUpperCase() + p.slice(1))
            .join(' ');
    }

    function iniciales(nombre) {
        const partes = String(nombre || '').trim().split(/\s+/).filter(Boolean);
        if (!partes.length) return '--';
        return (partes[0].charAt(0) + (partes[1] ? partes[1].charAt(0) : '')).toUpperCase();
    }

    function formatearFecha(valor) {
        if (!valor) return '--';
        const fecha = new Date(`${valor}T00:00:00`);
        if (Number.isNaN(fecha.getTime())) return escape(valor);
        return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function calcularNoches(inicio, fin) {
        const a = new Date(`${inicio}T00:00:00`);
        const b = new Date(`${fin}T00:00:00`);
        if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
        return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
    }

    function claseEstado(estado) {
        const valor = String(estado || '').toUpperCase();
        if (valor === 'CONFIRMADA') return 'confirmada';
        if (valor === 'CANCELADA') return 'cancelada';
        if (valor === 'PENDIENTE') return 'pendiente';
        return 'otra';
    }

    function renderUsuario(datos) {
        const nombre = datos.nombre || 'Huésped';
        if (elAvatar) elAvatar.textContent = iniciales(nombre);
        if (elNombre) elNombre.textContent = nombre;
        if (elEmail) elEmail.textContent = datos.email || '--';
        if (elId) elId.textContent = datos.id != null ? `#${datos.id}` : '--';
        if (elRol) elRol.textContent = datos.rol || 'CLIENTE';
    }

    function renderReservas(reservas) {
        if (elTotal) elTotal.textContent = reservas.length;

        if (!reservas.length) {
            if (elLista) elLista.innerHTML = '';
            if (elVacio) elVacio.hidden = false;
            return;
        }

        if (elVacio) elVacio.hidden = true;

        const ordenadas = reservas.slice().sort((a, b) => {
            return String(b.fechaInicio || '').localeCompare(String(a.fechaInicio || ''));
        });

        if (elLista) {
            elLista.innerHTML = ordenadas.map(reserva => {
                const hab = reserva.habitacion || {};
                const tipo = hab.tipo || '';
                const noches = calcularNoches(reserva.fechaInicio, reserva.fechaFin);
                const precio = Number(hab.precio || 0);
                const total = precio * noches;
                const estado = String(reserva.estado || 'SIN ESTADO').toUpperCase();

                return ''
                    + '<article class="reserva-card">'
                    + '  <div class="reserva-card__imagen" style="background-image:url(\'img/habitaciones/' + encodeURIComponent(tipo) + '.jpg\')"></div>'
                    + '  <div class="reserva-card__cuerpo">'
                    + '    <div class="reserva-card__cabecera">'
                    + '      <h3 class="reserva-card__titulo">' + escape(nombreDesdeTipo(tipo)) + '</h3>'
                    + '      <span class="reserva-card__estado reserva-card__estado--' + claseEstado(estado) + '">' + escape(estado) + '</span>'
                    + '    </div>'
                    + '    <p class="reserva-card__hab">Habitación ' + escape(hab.numero || '--') + ' · Reserva #' + escape(reserva.id) + '</p>'
                    + '    <div class="reserva-card__fechas">'
                    + '      <div><span>Check-in</span><strong>' + formatearFecha(reserva.fechaInicio) + '</strong></div>'
                    + '      <div><span>Check-out</span><strong>' + formatearFecha(reserva.fechaFin) + '</strong></div>'
                    + '      <div><span>Noches</span><strong>' + noches + '</strong></div>'
                    + '    </div>'
                    + '  </div>'
                    + '  <div class="reserva-card__total">'
                    + '    <span>Total</span>'
                    + '    <strong>S/ ' + total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</strong>'
                    + '  </div>'
                    + '</article>';
            }).join('');
        }
    }

    async function cargarPerfil() {
        try {
            const respuesta = await fetch(`${API_BASE}/api/usuarios/${usuario.id}`);
            if (respuesta.status === 404) {
                if (Session) Session.clear();
                window.location.href = 'iniciar-sesion.html?redirect=perfil.html';
                return;
            }
            if (!respuesta.ok) throw new Error('No se pudo cargar el perfil');
            renderUsuario(await respuesta.json());
        } catch (error) {
            renderUsuario(usuario);
            if (elMensaje) {
                elMensaje.hidden = false;
                elMensaje.textContent = 'No se pudieron actualizar tus datos, mostrando la información guardada.';
                elMensaje.classList.add('perfil__mensaje--aviso');
            }
        }
    }

    async function cargarReservas() {
        try {
            const respuesta = await fetch(`${API_BASE}/api/reservas/usuario/${usuario.id}`);
            if (!respuesta.ok) throw new Error('No se pudieron cargar las reservas');
            renderReservas(await respuesta.json());
        } catch (error) {
            if (elMensaje) {
                elMensaje.hidden = false;
                elMensaje.textContent = 'No se pudieron cargar tus reservas. Verifica que el servidor esté en ejecución.';
                elMensaje.classList.add('perfil__mensaje--error');
            }
        }
    }

    renderUsuario(usuario);
    cargarPerfil();
    cargarReservas();
});

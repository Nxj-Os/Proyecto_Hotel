document.addEventListener('DOMContentLoaded', () => {
    function sesionRespaldo() {
        return {
            getUser: function () {
                try {
                    const raw = localStorage.getItem('hotelUser') || sessionStorage.getItem('hotelUser');
                    if (raw) return JSON.parse(raw);
                    const id = localStorage.getItem('userId');
                    if (id) {
                        return {
                            id: Number(id),
                            nombre: localStorage.getItem('userName') || '',
                            email: localStorage.getItem('userEmail') || '',
                            rol: 'CLIENTE'
                        };
                    }
                } catch (error) {
                    return null;
                }
                return null;
            },
            logout: function () {
                try {
                    localStorage.removeItem('hotelUser');
                    sessionStorage.removeItem('hotelUser');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userEmail');
                } catch (error) {
                    /* almacenamiento no disponible */
                }
            },
            escapeHtml: function (value) {
                return String(value == null ? '' : value)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            }
        };
    }

    const Session = window.HotelSession || sesionRespaldo();
    const hamburger = document.querySelector('.nav__hamburger');
    const menu = document.querySelector('.nav__menu');
    const navLinks = document.querySelectorAll('.nav__link');

    function iconoCuenta() {
        return '<svg class="nav__cuenta-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
            + '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>'
            + '<circle cx="12" cy="7" r="4"/></svg>';
    }

    function renderCuenta() {
        if (!Session) return;

        const usuario = Session.getUser();
        const acciones = document.querySelector('.nav__acciones');
        const escape = Session.escapeHtml;

        document.querySelectorAll('.nav__item--cuenta').forEach(el => el.remove());

        if (usuario) {
            const nombre = escape(usuario.nombre || 'Mi Perfil');

            if (acciones) {
                acciones.innerHTML = ''
                    + '<a href="perfil.html" class="nav__cuenta nav__cuenta--usuario">'
                    + iconoCuenta()
                    + '<span>' + nombre + '</span></a>'
                    + '<button type="button" class="nav__btn-salir" data-logout>Cerrar sesión</button>';
            }

            if (menu) {
                menu.insertAdjacentHTML('beforeend', ''
                    + '<li class="nav__item nav__item--cuenta"><a href="perfil.html" class="nav__link">Mi Perfil</a></li>'
                    + '<li class="nav__item nav__item--cuenta"><a href="#" class="nav__link" data-logout>Cerrar sesión</a></li>');
            }

            const cta = document.querySelector('.cta-registro');
            if (cta) {
                const titulo = cta.querySelector('.cta-registro__titulo');
                const texto = cta.querySelector('.cta-registro__texto');
                const botones = cta.querySelector('.cta-registro__botones');

                if (titulo) titulo.textContent = 'Hola, ' + (usuario.nombre || 'huésped');
                if (texto) texto.textContent = 'Ya eres parte del Club Eclipse. Revisa tus reservas o planifica tu próxima estadía.';
                if (botones) {
                    botones.innerHTML = ''
                        + '<a href="perfil.html" class="hero__btn">VER MI PERFIL</a>'
                        + '<a href="reservar.html" class="cta-registro__btn-secundario">Hacer una reserva</a>';
                }
            }
        } else {
            if (menu) {
                menu.insertAdjacentHTML('beforeend', ''
                    + '<li class="nav__item nav__item--cuenta"><a href="perfil.html" class="nav__link">Mi Cuenta</a></li>');
            }
        }
    }

    renderCuenta();

    document.addEventListener('click', (event) => {
        const logout = event.target.closest('[data-logout]');
        if (logout && Session) {
            event.preventDefault();
            Session.logout();
            window.location.href = 'index.html';
        }
    });

    if (hamburger && menu) {
        let overlay = document.querySelector('.nav__overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.classList.add('nav__overlay');
            document.body.appendChild(overlay);
        }

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('nav__hamburger--activo');
            menu.classList.toggle('nav__menu--activo');
            overlay.classList.toggle('nav__overlay--activo');
        });

        overlay.addEventListener('click', () => {
            hamburger.classList.remove('nav__hamburger--activo');
            menu.classList.remove('nav__menu--activo');
            overlay.classList.remove('nav__overlay--activo');
        });

        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('nav__hamburger--activo');
                menu.classList.remove('nav__menu--activo');
                overlay.classList.remove('nav__overlay--activo');
            });
        });
    }

    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.backgroundColor = 'rgba(26, 26, 46, 0.97)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
            } else {
                header.style.backgroundColor = 'var(--color-oscuro)';
                header.style.boxShadow = 'none';
            }
        });
    }
});

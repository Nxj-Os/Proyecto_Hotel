(function () {
    const STORAGE_KEY = 'hotelUser';
    const esLocal = location.protocol === 'file:' ||
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1';
    const API_BASE = esLocal && location.port !== '8080' ? 'http://localhost:8080' : '';

    function readRaw() {
        try {
            return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
        } catch (error) {
            return null;
        }
    }

    function getUser() {
        const raw = readRaw();
        if (raw) {
            try {
                return JSON.parse(raw);
            } catch (error) {
                return null;
            }
        }

        try {
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
    }

    function saveUser(usuario, recordar) {
        clear();
        const data = JSON.stringify(usuario || {});
        try {
            if (recordar) {
                localStorage.setItem(STORAGE_KEY, data);
            } else {
                sessionStorage.setItem(STORAGE_KEY, data);
            }
        } catch (error) {
            localStorage.setItem(STORAGE_KEY, data);
        }
    }

    function clear() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            /* almacenamiento no disponible */
        }
    }

    function isLoggedIn() {
        return !!getUser();
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    window.HotelSession = {
        apiBase: API_BASE,
        getUser: getUser,
        saveUser: saveUser,
        clear: clear,
        logout: clear,
        isLoggedIn: isLoggedIn,
        escapeHtml: escapeHtml
    };
})();

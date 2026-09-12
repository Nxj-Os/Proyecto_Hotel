document.addEventListener('DOMContentLoaded', () => {
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

    // Header scroll effect
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
});

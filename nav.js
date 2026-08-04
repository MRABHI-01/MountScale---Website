(() => {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navCenter');
  const scrim  = document.getElementById('navScrim');
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove('is-open');
    scrim && scrim.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  const openMenu = () => {
    menu.classList.add('is-open');
    scrim && scrim.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  toggle.addEventListener('click', () => {
    menu.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  scrim && scrim.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
})();
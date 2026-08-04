/* =========================================================
   MountScale — Pricing page interactions
   Self-contained (no GSAP/Three.js dependency) so this page
   stays lightweight on its own.
   ========================================================= */

/* ---------------- Loader ---------------- */
// window.addEventListener('load', () => {
//   const loader = document.getElementById('loader');
//   if (loader){
//     loader.style.transition = 'opacity .5s ease';
//     setTimeout(() => {
//       loader.style.opacity = '0';
//       setTimeout(() => { loader.style.display = 'none'; }, 500);
//     }, 250);
//   }
// });

/* ---------------- Navbar scroll behavior ---------------- */
const navbar = document.getElementById('navbar');
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 40);
  if (y > lastY && y > 140) navbar.classList.add('hide');
  else navbar.classList.remove('hide');
  lastY = y;
}, { passive:true });

/* ---------------- Scroll reveal for .reveal elements ---------------- */
const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting){
      const el = entry.target;
      setTimeout(() => {
        el.style.transition = 'opacity .8s cubic-bezier(.16,.84,.44,1), transform .8s cubic-bezier(.16,.84,.44,1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, (i % 4) * 90);
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.15 });
revealItems.forEach(el => revealObserver.observe(el));
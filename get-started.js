/* =========================================================
   MountScale — Get Started page interactions
   Self-contained (no GSAP/Three.js dependency), mirrors the
   pattern used in pricing.js.
   ========================================================= */

/* ---------------- Loader ---------------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader){
    loader.style.transition = 'opacity .5s ease';
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => { loader.style.display = 'none'; }, 500);
    }, 250);
  }
});

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

/* ---------------- Form submit ---------------- */
const gsForm = document.getElementById('gsForm');
const gsSubmitBtn = document.getElementById('gsSubmitBtn');

if (gsForm){
  gsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!gsForm.checkValidity()){
      gsForm.reportValidity();
      return;
    }

    gsSubmitBtn.disabled = true;
    gsSubmitBtn.textContent = 'Sending...';

    fetch('https://formspree.io/f/xpqvvryn', {   // ← paste your real endpoint here
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(gsForm)
    })
      .then((res) => {
        if (res.ok) {
          gsForm.classList.add('submitted');
        } else {
          gsSubmitBtn.disabled = false;
          gsSubmitBtn.textContent = 'Submit Request';
          alert('Something went wrong — please try again or email us directly.');
        }
      })
      .catch(() => {
        gsSubmitBtn.disabled = false;
        gsSubmitBtn.textContent = 'Submit Request';
        alert('Something went wrong — please try again or email us directly.');
      });
  });
}
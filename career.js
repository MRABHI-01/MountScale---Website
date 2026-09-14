/* =========================================================
   MountScale — Career page interactions
   Self-contained (no GSAP/Three.js dependency), mirrors the
   pattern used in pricing.js / get-started.js.
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

/* ---------------- Careers application form ---------------- */
// Submits to FormSubmit.co over AJAX so the applicant stays on the page.
// No backend of our own: FormSubmit relays the POST straight to
// contact@mountscale.in. Note — the very first submission after this
// form goes live triggers a one-time confirmation email to that inbox;
// someone needs to click the confirmation link once before submissions
// start arriving automatically.
document.addEventListener('DOMContentLoaded', () => {
  const careersForm = document.getElementById('careersForm');
  if (!careersForm) return;

  const submitBtn = document.getElementById('careerSubmitBtn');
  const submitLabel = submitBtn ? submitBtn.querySelector('.career-submit-label') : null;
  const statusEl = document.getElementById('careerFormStatus');
  const defaultLabel = submitLabel ? submitLabel.textContent : 'Submit application';

  careersForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;

    submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Sending…';
    if (statusEl) { statusEl.textContent = ''; statusEl.removeAttribute('data-state'); }

    const formData = new FormData(careersForm);
    const ajaxAction = careersForm.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');

    fetch(ajaxAction, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then(() => {
        if (statusEl) {
          statusEl.textContent = "Thanks — your application is on its way. We'll be in touch if it's a fit.";
          statusEl.setAttribute('data-state', 'success');
        }
        careersForm.reset();
      })
      .catch(() => {
        if (statusEl) {
          statusEl.textContent = "Something went wrong sending that. Please email us directly at contact@mountscale.in.";
          statusEl.setAttribute('data-state', 'error');
        }
      })
      .finally(() => {
        submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = defaultLabel;
      });
  });
});
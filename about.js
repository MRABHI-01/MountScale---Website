// MountScale — About page interactions

document.addEventListener('DOMContentLoaded', () => {
  // Loader — index.css has no rule to hide #loader (no .loaded state),
  // so we remove it outright rather than toggle an unknown class.
  const loader = document.getElementById('loader');
  const clearLoader = () => { if (loader) loader.remove(); };
  window.addEventListener('load', () => setTimeout(clearLoader, 200));
  setTimeout(clearLoader, 1200); // hard fallback, never leaves it stuck

  // Scroll reveal — index.css only defines the hidden state
  // (.reveal{opacity:0;transform:translateY(40px);}) with no transition
  // or "revealed" class, so we drive the animation directly here.
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.transition = 'opacity .8s var(--ease), transform .8s var(--ease)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => observer.observe(el));

  // Fallback: if IntersectionObserver isn't available, just show everything
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
  }

  // Our Foundation — Identity / Mission / Vision stacked-card interaction
  const foundationStack = document.getElementById('foundationStack');
  if (foundationStack) {
    const cards = foundationStack.querySelectorAll('.foundation-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        if (card.classList.contains('is-active')) return;
        cards.forEach((c) => {
          c.classList.remove('is-active');
          c.setAttribute('aria-expanded', 'false');
        });
        card.classList.add('is-active');
        card.setAttribute('aria-expanded', 'true');
      });
    });
  }

  // Sticky nav shadow on scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 12);
  });

  // ---------------- Continuous, gapless hero video loop ----------------
  // Belt-and-braces on top of the native `loop` attribute: some mobile
  // browsers pause autoplaying video on tab switch / backgrounding, or
  // silently fail the first autoplay attempt, so we keep nudging it
  // back to playing rather than trusting a single play() call.
  const aboutVideo = document.querySelector('.about-video');
  if (aboutVideo) {
    const tryPlay = () => {
      const playPromise = aboutVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay blocked — retry shortly, browsers usually allow it
          // once the video is confirmed muted + inline.
          setTimeout(tryPlay, 400);
        });
      }
    };

    aboutVideo.muted = true;
    aboutVideo.setAttribute('playsinline', '');
    tryPlay();

    // Some browsers occasionally stall right at the loop boundary —
    // if playback ever pauses unexpectedly, resume it immediately.
    aboutVideo.addEventListener('pause', () => {
      if (!document.hidden) tryPlay();
    });
    aboutVideo.addEventListener('ended', tryPlay);
    aboutVideo.addEventListener('stalled', tryPlay);
    aboutVideo.addEventListener('waiting', tryPlay);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) tryPlay();
    });
  }

  // ---------------- Careers application form ----------------
  // Submits to FormSubmit.co over AJAX so the applicant stays on the page.
  // No backend of our own: FormSubmit relays the POST straight to
  // contact@mountscale.in. Note — the very first submission after this
  // form goes live triggers a one-time confirmation email to that inbox;
  // someone needs to click the confirmation link once before submissions
  // start arriving automatically.
  const careersForm = document.getElementById('careersForm');
  if (careersForm) {
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
  }
});
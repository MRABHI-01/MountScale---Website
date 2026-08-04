(() => {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const bar = loader.querySelector('.loader-track span');
  const label = loader.querySelector('.loader-progress');
  const card = loader.querySelector('.loader-card');
  const minDuration = 1000;
  const failsafeDuration = 15000;
  const startedAt = performance.now();
  let finished = false;

  const setProgress = (value) => {
    const rounded = Math.round(value);
    (card || loader).style.setProperty('--loader-progress', `${rounded}%`);
    if (bar) bar.style.width = `${rounded}%`;
    if (label) label.textContent = `${rounded}%`;
  };

  const progressLoop = () => {
    if (finished) return;
    const elapsed = performance.now() - startedAt;
    setProgress(Math.min(90, 12 + (elapsed / 1050) * 76));
    requestAnimationFrame(progressLoop);
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    setProgress(100);
    const remaining = Math.max(0, minDuration - (performance.now() - startedAt));
    window.setTimeout(() => {
      loader.classList.add('is-finished');
      window.setTimeout(() => {
        loader.remove();
        window.dispatchEvent(new Event('mountscale:loaded'));
      }, 620);
    }, remaining);
  };

  setProgress(12);
  requestAnimationFrame(progressLoop);
  window.addEventListener('load', finish, { once:true });
  window.addEventListener('DOMContentLoaded', () => window.setTimeout(finish, 350), { once:true });
  if (document.readyState !== 'loading') window.setTimeout(finish, 350);
  window.setTimeout(finish, failsafeDuration);
})();
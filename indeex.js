/* =========================================================
   MountScale — Cinematic Automotive CRM Experience
   ========================================================= */

gsap.registerPlugin(ScrollTrigger);

/* ---------------- Seamless hero video loop (crossfade, gapless & self-healing) ---------------- */
(function seamlessVideoLoop(){
  const vA = document.querySelector('.hero-video-a');
  const vB = document.querySelector('.hero-video-b');
  if (!vA || !vB) return;

  const FADE = 0.6; // seconds of crossfade — raise to 1s+ if the cut still shows

  // Floor safety net: both videos carry native `loop` (set in HTML, reinforced
  // here) so the browser itself guarantees continuous playback even if the
  // crossfade logic below is ever late (tab backgrounded, main thread busy,
  // etc). Worst case without the crossfade landing perfectly you'd see the
  // video's own native loop point instead of our blended one — never a
  // pause, freeze, or black frame.
  [vA, vB].forEach(v => { v.loop = true; v.muted = true; });

  let active = vA, standby = vB, switching = false;

  function safePlay(v){
    const p = v.play();
    if (p && p.catch) p.catch(() => {
      // Autoplay was blocked — retry on first user interaction.
      const retry = () => { v.play().catch(()=>{}); document.removeEventListener('pointerdown', retry); };
      document.addEventListener('pointerdown', retry, { once:true });
    });
  }

  // If the browser ever pauses either video for a reason outside our control
  // (backgrounded tab resuming, focus changes, etc.), resume immediately so
  // playback never visibly stalls.
  [vA, vB].forEach(v => {
    v.addEventListener('pause', () => {
      if (!document.hidden) safePlay(v);
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { safePlay(active); safePlay(standby); }
  });

  safePlay(active);
  gsap.set(standby, { opacity: 0 });

  function doCrossfade(){
    if (switching) return;
    switching = true;
    standby.currentTime = 0;
    safePlay(standby);
    gsap.to(active,  { opacity:0, duration:FADE, ease:'sine.inOut' });
    gsap.to(standby, { opacity:1, duration:FADE, ease:'sine.inOut', onComplete:() => {
      // Don't pause the outgoing video — leave it running (native loop keeps
      // it warm/gapless) rather than stopping it, which avoids any decode
      // hiccup the next time it becomes the standby.
      [active, standby] = [standby, active];
      switching = false;
    }});
  }

  // Poll via rAF for precise timing; a timeupdate fallback covers any tab
  // where rAF gets throttled but the media clock keeps advancing.
  function loopTick(){
    requestAnimationFrame(loopTick);
    if (!active.duration || switching) return;
    if (active.currentTime >= active.duration - FADE) doCrossfade();
  }
  requestAnimationFrame(loopTick);

  active.addEventListener('timeupdate', () => {
    if (!switching && active.duration && active.currentTime >= active.duration - FADE) doCrossfade();
  });
})();

/* ---------------- Loader ---------------- */
window.addEventListener('load', () => {
  gsap.to('#loader', {
    opacity: 0, duration: 0.7, delay: 0.4, ease: 'power2.out',
    onComplete: () => { document.getElementById('loader').style.display = 'none'; runPageLoadSequence(); }
  });
});
// safety fallback
setTimeout(() => {
  const l = document.getElementById('loader');
  if (l && l.style.display !== 'none') { l.style.display = 'none'; runPageLoadSequence(); }
}, 2500);

let pageLoadRan = false;
function runPageLoadSequence(){
  if (pageLoadRan) return; pageLoadRan = true;

  const tl = gsap.timeline({defaults:{ease:'power3.out'}});
  tl.to('.eyebrow.reveal', {opacity:1, y:0, duration:0.7})
    .to('h1.hero-headline.reveal', {opacity:1, y:0, duration:0.9}, '-=0.45')
    .to('.car-stage.reveal', {opacity:1, y:0, duration:1}, '-=0.6')
    .to('.hero-sub.reveal', {opacity:1, y:0, duration:0.7}, '-=0.7')
    .to('.hero-ctas.reveal', {opacity:1, y:0, duration:0.6}, '-=0.5')
    .to('.hero-quotes.reveal', {opacity:1, y:0, duration:0.6}, '-=0.4');

  // stagger the floating CRM cards in with a slight scale + blur reveal
  gsap.to('.float-card', {
    opacity:1,
    duration:1.1,
    stagger:0.09,
    ease:'power2.out',
    delay:0.5,
    onStart:startFloatLoop
  });
}

/* ---------------- Navbar scroll behavior ---------------- */
const navbar = document.getElementById('navbar');
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 40);
  if (y > lastY && y > 140) navbar.classList.add('hide');
  else navbar.classList.remove('hide');
  lastY = y;
}, {passive:true});

/* ---------------- Hero quote rotator ---------------- */
(function quoteRotator(){
  const quotes = document.querySelectorAll('#quotes span');
  if (!quotes.length) return;
  let i = 0;
  setInterval(() => {
    quotes[i].classList.remove('active');
    i = (i + 1) % quotes.length;
    quotes[i].classList.add('active');
  }, 3400);
})();

/* ---------------- Floating CRM cards: idle float + mouse parallax ---------------- */
function startFloatLoop(){
  document.querySelectorAll('.float-card').forEach((card, idx) => {
    gsap.to(card, {
      y: '+=14',
      duration: 2.6 + (idx % 4) * 0.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: idx * 0.15
    });
  });
}

const heroEl = document.querySelector('.hero');
let mx = 0, my = 0;
heroEl.addEventListener('mousemove', (e) => {
  const r = heroEl.getBoundingClientRect();
  mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
  my = ((e.clientY - r.top) / r.height - 0.5) * 2;
});
gsap.ticker.add(() => {
  document.querySelectorAll('.float-card').forEach(card => {
    const depth = parseFloat(card.dataset.depth || 0.5);
    gsap.set(card, { x: mx * 14 * depth, rotateZ: mx * 1.5 * depth });
  });

  // subtle mouse-driven parallax across the mountain layers (depth = distance)
  // gsap.set('.hero-mountains.far',  { x: mx * 8,  y: my * 3 });
  // gsap.set('.hero-mountains.mid',  { x: mx * 16, y: my * 5 });
  // gsap.set('.hero-mountains.near', { x: mx * 26, y: my * 8 });
  // gsap.set('.hero-sun', { x: `calc(-50% + ${mx * 10}px)` });
});

/* =========================================================
   THREE.JS — Centerpiece: Automation Hub
   A glowing core that every workflow (leads, chat, inventory,
   service, finance) automatically routes into — visualizing
   automation converging into one intelligent platform.
   ========================================================= */
(function automationHubScene(){
  const canvas = document.getElementById('car-canvas');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1.6, 11);

  function resize(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const key = new THREE.DirectionalLight(0x2563EB, 1.1);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x60A5FA, 0.9);
  rim.position.set(-6, 3, -4);
  scene.add(rim);

  const hub = new THREE.Group();

  // --- Core: the "automation engine" everything routes into ---
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0x2563EB, metalness: 0.4, roughness: 0.2,
    emissive: 0x2563EB, emissiveIntensity: 0.55,
    clearcoat: 1, clearcoatRoughness: 0.1, transparent:true, opacity:0.92
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 2), coreMat);
  hub.add(core);

  // Wireframe shell around the core (structure / intelligence)
  const wireMat = new THREE.MeshBasicMaterial({color:0x60A5FA, wireframe:true, transparent:true, opacity:0.35});
  const wireShell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.42, 1), wireMat);
  hub.add(wireShell);

  // Soft glow halo behind core
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1.9, 32, 32),
    new THREE.MeshBasicMaterial({color:0x60A5FA, transparent:true, opacity:0.08})
  );
  hub.add(halo);

  // --- Orbit rings: automated workflows in constant motion ---
  const ringMat = new THREE.MeshBasicMaterial({color:0x60A5FA, transparent:true, opacity:0.35});
  const ringGeoms = [
    {r:3.1, tube:0.012, tiltX: 1.15, tiltZ: 0.15},
    {r:3.75, tube:0.012, tiltX: 0.35, tiltZ: -0.35},
    {r:2.55, tube:0.012, tiltX: -0.5, tiltZ: 0.6}
  ];
  const rings = ringGeoms.map(cfg => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(cfg.r, cfg.tube, 8, 96), ringMat);
    ring.rotation.x = cfg.tiltX;
    ring.rotation.z = cfg.tiltZ;
    hub.add(ring);
    return {mesh: ring, cfg};
  });

  // --- Module nodes: leads, chat, inventory, service, finance, analytics ---
  const nodeColors = [0x2563EB, 0x60A5FA, 0x1e3a8a, 0x3b82f6, 0x93c5fd, 0x2563EB];
  const nodeMat = (c) => new THREE.MeshPhysicalMaterial({color:c, emissive:c, emissiveIntensity:0.5, metalness:0.3, roughness:0.3});
  const nodes = [];
  const NODE_COUNT = 6;
  for (let i=0;i<NODE_COUNT;i++){
    const ringInfo = rings[i % rings.length];
    const angle = (i / NODE_COUNT) * Math.PI * 2;
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), nodeMat(nodeColors[i % nodeColors.length]));
    hub.add(node);
    nodes.push({mesh: node, ring: ringInfo, angle, speed: 0.25 + (i%3)*0.08});
  }

  // --- Pulses: small glowing dots that travel from nodes into the core ---
  const pulseMat = new THREE.MeshBasicMaterial({color:0xffffff});
  const pulses = [];
  for (let i=0;i<NODE_COUNT;i++){
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), pulseMat);
    hub.add(pulse);
    pulses.push({mesh: pulse, node: nodes[i], progress: Math.random(), speed: 0.3 + Math.random()*0.25});
  }

  hub.rotation.x = 0.15;
  hub.scale.set(0.85, 0.85, 0.85);
  scene.add(hub);

  // Soft ground glow disc beneath the hub
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 48),
    new THREE.MeshBasicMaterial({color:0x60A5FA, transparent:true, opacity:0.1})
  );
  glow.rotation.x = -Math.PI/2;
  glow.position.y = -1.9;
  scene.add(glow);

  const tmpVec = new THREE.Vector3();
  let clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    core.rotation.y = t * 0.35;
    core.rotation.x = t * 0.18;
    wireShell.rotation.y = -t * 0.22;
    core.scale.setScalar(1 + Math.sin(t*1.4) * 0.035);
    halo.scale.setScalar(1 + Math.sin(t*1.1) * 0.06);

    rings.forEach((r, i) => {
      r.mesh.rotation.z += 0.0025 * (i%2===0 ? 1 : -1);
    });

    nodes.forEach(n => {
      const a = n.angle + t * n.speed;
      const r = n.ring.cfg.r;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      // apply ring tilt
      tmpVec.set(x, 0, z);
      tmpVec.applyEuler(new THREE.Euler(n.ring.cfg.tiltX, 0, n.ring.cfg.tiltZ));
      n.mesh.position.copy(tmpVec);
      n._pos = tmpVec.clone();
    });

    pulses.forEach(p => {
      p.progress += 0.008 * p.speed;
      if (p.progress > 1) p.progress = 0;
      const start = p.node._pos || new THREE.Vector3();
      p.mesh.position.lerpVectors(start, new THREE.Vector3(0,0,0), p.progress);
      p.mesh.material.opacity = 1 - p.progress * 0.5;
    });

    hub.position.y = Math.sin(t * 0.7) * 0.12;
    hub.rotation.y = 0.0 + Math.sin(t*0.2)*0.15 + mx*0.1;
    hub.rotation.x = 0.15 + my * 0.06;

    renderer.render(scene, camera);
  }
  animate();
})();

/* =========================================================
   GSAP ScrollTrigger — section reveals, hero parallax exit,
   product cards, dashboard KPI counters + chart bars
   ========================================================= */

// Hero cinematic exit: gentle scale + blur + fade as user scrolls past
gsap.to('.hero-inner', {
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  y: 120, opacity: 0.15, scale: 0.94, ease: 'none'
});
gsap.to('.hero-video, .hero-video-overlay', {
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  y: 60, opacity: 0.35, ease: 'none'
});
// NOTE: floating CRM cards intentionally have NO scroll-linked opacity tween here.
// They are positioned inside .hero, so they scroll away naturally with the section.
// (A scrubbed opacity fade previously caused them to flicker/disappear unpredictably.)

// Section head reveals
gsap.utils.toArray('.section-head, .engine-content, .engine-visual, .cta-section').forEach(el => {
  gsap.to(el, {
    scrollTrigger: { trigger: el, start: 'top 82%' },
    opacity: 1, y: 0, duration: 0.9, ease: 'power3.out'
  });
});

// Product cards staggered reveal
gsap.to('.product-card', {
  scrollTrigger: { trigger: '.products-grid', start: 'top 80%' },
  opacity: 1, y: 0, duration: 0.9, stagger: 0.18, ease: 'power3.out'
});

// Workflow steps staggered reveal (per row)
gsap.utils.toArray('.flow-row').forEach(row => {
  gsap.to(row.querySelectorAll('.flow-step'), {
    scrollTrigger: { trigger: row, start: 'top 85%' },
    opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out'
  });
});

/* ---------------- Workflow slider (steps 1-4 / 5-8, arrow-driven) ---------------- */
(function workflowSlider(){
  const track = document.getElementById('flowTrack');
  const prevBtn = document.getElementById('flowPrev');
  const nextBtn = document.getElementById('flowNext');
  const dots = [document.getElementById('flowDot0'), document.getElementById('flowDot1')];
  if (!track || !prevBtn || !nextBtn) return;

  const pages = track.querySelectorAll('.flow-row').length; // 2
  let current = 0;

  function render(){
    track.style.transform = `translateX(-${current * (100 / pages)}%)`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === pages - 1;
    dots.forEach((d, i) => { if (d) d.classList.toggle('active', i === current); });
  }

  function goTo(index){
    current = Math.max(0, Math.min(pages - 1, index));
    render();
  }

  nextBtn.addEventListener('click', () => goTo(current + 1));
  prevBtn.addEventListener('click', () => goTo(current - 1));
  dots.forEach((d, i) => d && d.addEventListener('click', () => goTo(i)));

  render();
})();

// Engine section: mountain peak badges float in, root items stagger up
gsap.set('.peak-badge', {opacity: 0, x: 24});
gsap.to('.peak-badge', {
  scrollTrigger: { trigger: '.engine-sky', start: 'top 80%' },
  opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out'
});
gsap.set('.mountain-svg path', {opacity: 0, transformOrigin: 'bottom'});
gsap.fromTo('.mountain-svg path', {scaleY: 0.85, opacity: 0}, {
  scrollTrigger: { trigger: '.engine-sky', start: 'top 78%' },
  scaleY: 1, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out'
});
gsap.set('.root-item', {opacity: 0, y: 16});
gsap.to('.root-item', {
  scrollTrigger: { trigger: '.engine-roots', start: 'top 85%' },
  opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out'
});

// KPI counters
document.querySelectorAll('[data-count]').forEach(el => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      const obj = {val: 0};
      gsap.to(obj, {
        val: target, duration: 1.8, ease: 'power2.out',
        onUpdate: () => el.textContent = Math.floor(obj.val).toLocaleString() + suffix
      });
    }
  });
});

// Footer fade-up
gsap.to('footer .footer-inner > *', {
  scrollTrigger: { trigger: 'footer', start: 'top 90%' },
  opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out'
});
gsap.set('footer .footer-inner > *', {opacity: 0, y: 24});
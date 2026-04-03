/* ════════════════════════════════════════════
   AUTOPARTS MX — Carrusel
   Archivo: carousel.js
════════════════════════════════════════════ */

let carIdx   = 0;
const TOTAL  = 5;
let carTimer = null;

/* ── Inicializa dots y arranca autoplay ── */
function initCarousel() {
  const dotsEl = document.getElementById('carDots');
  dotsEl.innerHTML = '';

  for (let i = 0; i < TOTAL; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => {
      resetAutoplay();
      goTo(i);
    });
    dotsEl.appendChild(d);
  }

  goTo(0);
  startAutoplay();
}

/* ── Navega a un slide específico ── */
function goTo(idx) {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots   = document.querySelectorAll('.dot');

  // Quitar estado activo del slide actual
  slides[carIdx].classList.remove('active');
  dots[carIdx].classList.remove('active');

  // Actualizar índice con wrap infinito
  carIdx = (idx + TOTAL) % TOTAL;

  // Aplicar estado activo al nuevo slide
  slides[carIdx].classList.add('active');
  dots[carIdx].classList.add('active');

  // Mover el track
  document.getElementById('carTrack').style.transform =
    `translateX(-${carIdx * 100}%)`;

  // Actualizar contador "1 / 5"
  document.getElementById('carCurrent').textContent = carIdx + 1;

  // GA event
  gaEvent('carousel_slide', { slide_number: carIdx + 1 });
}

/* ── Botones anterior / siguiente ── */
function carMove(dir) {
  resetAutoplay();
  goTo(carIdx + dir);
}

/* ── Autoplay cada 5 segundos ── */
function startAutoplay() {
  carTimer = setInterval(() => goTo(carIdx + 1), 5000);
}

function resetAutoplay() {
  clearInterval(carTimer);
  startAutoplay();
}

/* ── Soporte teclado (flechas izquierda/derecha) ── */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  carMove(-1);
  if (e.key === 'ArrowRight') carMove(1);
});

/* ── Soporte touch / swipe ── */
(function initSwipe(){
  let startX = 0;
  const track = document.getElementById('carTrack');
  if (!track) return;

  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      resetAutoplay();
      carMove(diff > 0 ? 1 : -1);
    }
  }, { passive: true });
})();

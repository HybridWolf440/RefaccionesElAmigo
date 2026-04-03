/* ════════════════════════════════════════════
   AUTOPARTS MX — Autenticación
   Archivo: auth.js
   (Incluido en login.html e index.html)
════════════════════════════════════════════ */

// Usuarios válidos (demo — en producción usa un backend real)
const USERS = {
  admin: '1234',
  demo:  'demo123'
};

const SESSION_KEY = 'autoparts_user';

/* ── Inicia sesión y redirige a index.html ── */
function handleLogin() {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value;
  const err  = document.getElementById('login-error');

  if (USERS[user] && USERS[user] === pass) {
    err.style.display = 'none';
    sessionStorage.setItem(SESSION_KEY, user);
    gaEvent('login', { method: 'credentials', user });
    window.location.href = 'index.html';
  } else {
    err.style.display = 'block';
    document.getElementById('password').value = '';
    gaEvent('login_failed');
  }
}

/* ── Cierra sesión y regresa a login.html ── */
function handleLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  gaEvent('logout');
  window.location.href = 'login.html';
}

/* ── Protege páginas que requieren sesión ── */
function requireAuth() {
  if (!sessionStorage.getItem(SESSION_KEY)) {
    window.location.href = 'login.html';
  }
}

/* ── Helper Google Analytics ── */
function gaEvent(name, params = {}) {
  if (typeof gtag !== 'undefined') gtag('event', name, params);
}

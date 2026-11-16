'use strict';

/* ================= Tema ================= */
function applyTheme(){
  const t = state.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', t);
}
const toggleTheme = () => {
  state.theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  save(); applyTheme(); render();
};
$('themeBtn').onclick = toggleTheme; $('themeTop').onclick = toggleTheme;


const giorni = ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
const mesi   = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];

let currentMode = localStorage.getItem('clk_mode') || 'digital';
let fmt         = localStorage.getItem('clk_fmt')  || '24';

const dPanel    = document.getElementById('digital-panel');
const aPanel    = document.getElementById('analog-panel');
const dTime     = document.getElementById('d-time');
const dAmpm     = document.getElementById('d-ampm');
const dDate     = document.getElementById('d-date');
const aDate     = document.getElementById('a-date');
const aAmpmDisp = document.getElementById('a-ampm-disp');
const aAmpmSvg  = document.getElementById('a-ampm-svg');
const tabDig    = document.getElementById('tab-digital');
const tabAna    = document.getElementById('tab-analog');
const pill12    = document.getElementById('pill-12');
const pill24    = document.getElementById('pill-24');

function pad(n){ return String(n).padStart(2,'0'); }

function savePrefs(){
  localStorage.setItem('clk_mode', currentMode);
  localStorage.setItem('clk_fmt',  fmt);
}

// Ruota una lancetta attorno al centro (100,100)
function rotate(id, deg){
  const el = document.getElementById(id);
  if(!el) return;
  el.setAttribute('transform', `rotate(${deg},100,100)`);
}

// Costruisce tacche e numeri del quadrante analogico
function buildTicks(){
  const g = document.getElementById('ticks-g');
  if(!g) return;
  g.innerHTML = '';
  const is24  = fmt === '24';
  const total = is24 ? 24 : 12;
  const lblR  = is24 ? 66 : 73;

  // Tacche minuti
  for(let i = 0; i < 60; i++){
    const rad    = ((i / 60) * 360 - 90) * (Math.PI / 180);
    const isMaj  = i % (is24 ? 1 : 5) === 0;
    const innerR = isMaj ? 80 : 85;
    const line   = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', 100 + innerR * Math.cos(rad));
    line.setAttribute('y1', 100 + innerR * Math.sin(rad));
    line.setAttribute('x2', 100 + 88 * Math.cos(rad));
    line.setAttribute('y2', 100 + 88 * Math.sin(rad));
    line.setAttribute('stroke',       isMaj ? '#7c3aed' : 'rgba(255,255,255,0.18)');
    line.setAttribute('stroke-width', isMaj ? '2.5' : '1');
    line.setAttribute('stroke-linecap','round');
    g.appendChild(line);
  }

  // Numeri ore
  for(let h = 0; h < total; h++){
    const rad = ((h / total) * 360 - 90) * (Math.PI / 180);
    const lbl = is24 ? pad(h) : (h === 0 ? 12 : h);
    const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('x', 100 + lblR * Math.cos(rad));
    txt.setAttribute('y', 100 + lblR * Math.sin(rad));
    txt.setAttribute('text-anchor','middle');
    txt.setAttribute('dominant-baseline','central');
    txt.setAttribute('font-size',   is24 ? '6.5' : '11');
    txt.setAttribute('font-weight', '500');
    txt.setAttribute('fill',        is24 ? '#c4b5fd' : '#ffffff');
    txt.setAttribute('font-family', "'DM Mono', monospace");
    txt.textContent = lbl;
    g.appendChild(txt);
  }
}

function updateClock(){
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  const dateStr = `${giorni[now.getDay()]} ${pad(now.getDate())} ${mesi[now.getMonth()]} ${now.getFullYear()}`;

  // Digitale
  let timeStr = '', ampm = '';
  if(fmt === '24'){
    timeStr = `${pad(h)}:${pad(m)}:${pad(s)}`;
  } else {
    ampm    = h >= 12 ? 'PM' : 'AM';
    timeStr = `${pad(h % 12 || 12)}:${pad(m)}:${pad(s)}`;
  }
  dTime.textContent = timeStr;
  dAmpm.textContent = ampm || '\u00A0';
  dDate.textContent = dateStr;

  // Gradi lancette
  const secDeg  = s * 6;
  const minDeg  = m * 6 + s * 0.1;
  const hourDeg = fmt === '24'
    ? ((h * 60 + m) / (24 * 60)) * 360
    : (h % 12) * 30 + m * 0.5;

  rotate('hour-h',   hourDeg);
  rotate('min-h',    minDeg);
  rotate('sec-h',    secDeg);
  rotate('sec-tail', secDeg);

  // Analogico data e AM/PM
  aDate.textContent = dateStr;
  const ap = fmt === '12' ? (h >= 12 ? 'PM' : 'AM') : '';
  if(aAmpmSvg)  aAmpmSvg.textContent  = ap;
  if(aAmpmDisp) aAmpmDisp.textContent = ap || '\u00A0';
}

function applyUI(){
  const isDig = currentMode === 'digital';

  dPanel.classList.toggle('active', isDig);
  aPanel.classList.toggle('active', !isDig);

  tabDig.classList.toggle('active', isDig);
  tabAna.classList.toggle('active', !isDig);

  pill12.classList.toggle('active', fmt === '12');
  pill24.classList.toggle('active', fmt === '24');
}

window.switchMode = function(m){
  currentMode = m;
  savePrefs();
  applyUI();
  if(currentMode === 'analog'){ buildTicks(); }
  updateClock();
};

window.setFmt = function(f){
  fmt = f;
  savePrefs();
  applyUI();
  if(currentMode === 'analog'){ buildTicks(); }
  updateClock();
};

// Avvio
buildTicks();
applyUI();
updateClock();
setInterval(updateClock, 1000);

// Previeni pull-to-refresh su mobile
let startY = 0;
document.addEventListener('touchstart', e => { startY = e.touches[0].pageY; }, { passive: false });
document.addEventListener('touchmove',  e => {
  if(window.scrollY === 0 && e.touches[0].pageY > startY) e.preventDefault();
}, { passive: false });
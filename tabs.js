const tablist = document.querySelector('[role="tablist"]');
const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

// ── BARRA DE PROGRESSO ──
const progressSteps = document.getElementById('progress-steps');
const progressLabel = document.getElementById('progress-label');

function buildProgressDots() {
  tabs.forEach((tab, i) => {
    const dot = document.createElement('button');
    dot.className = 'progress-dot' + (i === 0 ? ' active' : '');
    dot.title = tab.textContent.trim();
    dot.addEventListener('click', () => activateTab(tabs[i]));
    progressSteps.appendChild(dot);
  });
}

function updateProgress(activeIndex) {
  document.querySelectorAll('.progress-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === activeIndex);
  });
  progressLabel.textContent = `${activeIndex + 1} / ${tabs.length}`;
}

// ── TEMPORIZADOR DE SLIDE ──
let timerInterval = null;
let timerSeconds = 0;
const timerDisplay = document.getElementById('timer-display');

function startTimer() {
  timerSeconds = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerSeconds++;
    const m = Math.floor(timerSeconds / 60);
    const s = String(timerSeconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = 0;
  if (timerDisplay) timerDisplay.textContent = '0:00';
}

// ── MODO APRESENTAÇÃO ──
function togglePresentation() {
  const btn = document.getElementById('btn-present');
  document.body.classList.toggle('presentation-mode');
  const isOn = document.body.classList.contains('presentation-mode');
  btn.textContent = isOn ? '✕ Sair' : '⛶ Apresentar';
  isOn ? startTimer() : stopTimer();
}

function navigateTab(dir) {
  const current = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
  const next = current + dir;
  if (next >= 0 && next < tabs.length) activateTab(tabs[next], true);
}

function addIdeaIcons() {
  const icons = {
    'panel-estudo': {
      className: 'idea-icon--case',
      paths: ['M13 4a9 9 0 1 0 0 18a9 9 0 0 0 0-18Z', 'm20 20 8 8']
    },
    'panel-construtivismo': {
      className: 'idea-icon--constructivism',
      paths: ['M3 20h10v8H3z', 'M19 20h10v8H19z', 'M11 8h10v8H11z']
    },
    'panel-piaget': {
      className: 'idea-icon--piaget',
      paths: ['M8 10 14 15M24 10 18 15M9 23l5-5m9 5-5-5'],
      circles: [[7, 9], [25, 9], [8, 24], [24, 24], [16, 16]]
    },
    'panel-vygotsky': {
      className: 'idea-icon--vygotsky',
      paths: ['M3 4h17v13h-8l-6 5v-5H3z', 'M13 13h16v11h-6l-5 5v-5h-5z']
    },
    'panel-solucao': {
      className: 'idea-icon--practice',
      paths: ['M5 27 7 20 21 6l6 6-14 14-8 1Z', 'm18 9 6 6', 'm7 20 5 6']
    },
    'panel-conclusao': {
      className: 'idea-icon--conclusion',
      paths: ['M16 3a13 13 0 1 0 0 26a13 13 0 0 0 0-26Z', 'm9 16 5 5 9-10']
    }
  };

  document.querySelectorAll('.card-header h2').forEach((heading) => {
    if (heading.querySelector('.idea-icon')) return;
    const panel = heading.closest('[role="tabpanel"]');
    const iconData = icons[panel.id];
    if (!iconData) return;

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.classList.add('idea-icon', iconData.className);
    icon.setAttribute('viewBox', '0 0 32 32');
    icon.setAttribute('aria-hidden', 'true');
    icon.setAttribute('focusable', 'false');

    iconData.paths.forEach((pathData) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      icon.append(path);
    });

    (iconData.circles || []).forEach(([cx, cy]) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', 2);
      icon.append(circle);
    });

    heading.append(document.createTextNode(' '), icon);
  });
}

function activateTab(activeTab, moveFocus = false) {
  const activeIndex = tabs.indexOf(activeTab);
  tabs.forEach((tab) => {
    const isActive = tab === activeTab;
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
    panel.hidden = !isActive;
  });
  updateProgress(activeIndex);
  document.title = `ABC dos 5 – ${activeTab.textContent.trim()}`;
  if (timerInterval) startTimer();
  if (moveFocus) activeTab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));

  tab.addEventListener('keydown', (event) => {
    let nextIndex;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex === undefined) return;

    event.preventDefault();
    activateTab(tabs[nextIndex], true);
  });
});

buildProgressDots();
addIdeaIcons();

// Expor funções globalmente para os onclick do HTML
window.navigateTab = navigateTab;
window.togglePresentation = togglePresentation;
window.toggleMusic = window.toggleMusic;

// Navegar com teclado no modo apresentação
document.addEventListener('keydown', (e) => {
  if (!document.body.classList.contains('presentation-mode')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigateTab(1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   navigateTab(-1);
});

// Paralaxe 3D no logo de fundo
const bgLogo = document.getElementById('bg-logo');
if (bgLogo) {
  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx; // -1 a 1
    const dy = (e.clientY - cy) / cy;
    const rotY =  dx * 18;
    const rotX = -dy * 12;
    const tx   =  dx * 24;
    const ty   =  dy * 16;
    bgLogo.style.transform =
      `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
    bgLogo.querySelector('img').style.transform =
      `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.08)`;
  });
}
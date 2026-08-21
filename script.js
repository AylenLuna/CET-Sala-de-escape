// CONSTANTES Y CONFIGURACIÓN INICIAL DE TIEMPO
const DEFAULT_TIME = 20 * 60; // 20 minutos

let timeRemaining = localStorage.getItem("pumm_timer") !== null 
  ? parseInt(localStorage.getItem("pumm_timer")) 
  : DEFAULT_TIME;

let isTimerRunning = localStorage.getItem("pumm_timer_running") === "true";

// Bucle principal del reloj
setInterval(() => {
  if (isTimerRunning && timeRemaining > 0) {
    timeRemaining--;
    localStorage.setItem("pumm_timer", timeRemaining);
    updateTimerDisplay();
    checkTriggerEvents();
  } else if (isTimerRunning && timeRemaining === 0) {
    // Si el tiempo llega a 0, pausamos y mostramos pantalla de Timeout
    isTimerRunning = false;
    localStorage.setItem("pumm_timer_running", "false");
    updateTimerDisplay();
    triggerTimeoutScreen();
  }
}, 1000);

function updateTimerDisplay() {
  const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
  const s = (timeRemaining % 60).toString().padStart(2, '0');
  
  const timerElem = document.getElementById("timer");
  if (timerElem) timerElem.textContent = `${m}:${s}`;
  
  const statusBadge = document.getElementById("timer-status");
  const playBtn = document.getElementById("play-pause-btn");

  if (isTimerRunning) {
    if (statusBadge) {
      statusBadge.textContent = "▶ EN MARCHA";
      statusBadge.className = "status-badge running";
    }
    if (playBtn) {
      playBtn.textContent = "⏸ PAUSAR";
      playBtn.className = "admin-btn play-btn paused";
    }
  } else {
    if (statusBadge) {
      statusBadge.textContent = "⏸ PAUSADO";
      statusBadge.className = "status-badge";
    }
    if (playBtn) {
      playBtn.textContent = "▶ INICIAR";
      playBtn.className = "admin-btn play-btn";
    }
  }
}

/* ==========================================
   PANEL ADMIN & PERSISTENCIA (SÓLO SE CIERRA CON 'X')
========================================== */
function openAdminWithPass() {
  const adminPanel = document.getElementById("admin-panel");
  if (adminPanel.classList.contains("open")) {
    toggleAdminPanel();
    return;
  }

  // Si ya estaba autenticado previamente en la sesión, no vuelve a pedir clave
  if (localStorage.getItem("admin_authenticated") === "true") {
    adminPanel.classList.add("open");
    return;
  }

  const pass = prompt("CLAVE DE EMBAJADORA CET:");
  if (pass === "REINICIO-CET") {
    localStorage.setItem("admin_authenticated", "true");
    adminPanel.classList.add("open");
  } else if (pass !== null) {
    alert("Clave incorrecta.");
  }
}

function toggleAdminPanel() {
  document.getElementById("admin-panel").classList.toggle("open");
}

function toggleTimer() {
  isTimerRunning = !isTimerRunning;
  localStorage.setItem("pumm_timer_running", isTimerRunning);
  updateTimerDisplay();
}

function setCustomTime() {
  const mins = parseInt(document.getElementById("custom-minutes").value);
  if (!isNaN(mins) && mins >= 0) {
    timeRemaining = mins * 60;
    localStorage.setItem("pumm_timer", timeRemaining);
    updateTimerDisplay();
  }
}

function executeFullReset() {
  if (confirm("¿Seguro que querés reiniciar toda la sala para el siguiente grupo?")) {
    localStorage.clear();
    location.reload();
  }
}

/* ==========================================
   ATAJOS DE TESTEO (SALTO ENTRE FASES)
========================================== */
function jumpToPhase(target) {
  // Ocultar todas las pantallas y desactivar pasitos del stepper
  document.querySelectorAll('.challenge-screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));

  if (typeof target === 'number') {
    const screen = document.getElementById(`screen-${target}`);
    const step = document.getElementById(`step-${target}`);
    if (screen) screen.classList.add('active');
    if (step) step.classList.add('active');
  } else if (target === 'success') {
    document.getElementById("screen-success").classList.add("active");
  } else if (target === 'timeout') {
    document.getElementById("screen-timeout").classList.add("active");
  }
}

/* ==========================================
   TRIGGER DE POPUPS Y EVENTOS DE TIEMPO
========================================== */
function checkTriggerEvents() {
  // 5 min transcurridos (quedan 15 min -> 900s)
  if (timeRemaining === 15 * 60 && !localStorage.getItem("popup_1_triggered")) {
    triggerAllyModal(1);
  }
  // 10 min transcurridos (quedan 10 min -> 600s)
  if (timeRemaining === 10 * 60 && !localStorage.getItem("popup_2_triggered")) {
    triggerAllyModal(2);
  }
  // 15 min transcurridos (quedan 5 min -> 300s)
  if (timeRemaining === 5 * 60 && !localStorage.getItem("popup_3_triggered")) {
    triggerAllyModal(3);
  }
}

let currentGameId = 1;
function triggerAllyModal(gameId) {
  currentGameId = gameId;
  localStorage.setItem(`popup_${gameId}_triggered`, "true");
  
  const modal = document.getElementById("ally-modal");
  if (modal) modal.classList.add("active");
}

function goToGame() {
  const modal = document.getElementById("ally-modal");
  if (modal) modal.classList.remove("active");
  window.location.href = `games.html?game=${currentGameId}`;
}

function triggerTimeoutScreen() {
  document.querySelectorAll('.challenge-screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById("screen-timeout").classList.add("active");
}

/* ==========================================
   INICIALIZACIÓN Y LÓGICA DE FASES
========================================== */
window.addEventListener("DOMContentLoaded", () => {
  updateTimerDisplay();
  renderHints();

  // Si el panel admin estaba abierto antes de recargar, mantenerlo abierto
  if (localStorage.getItem("admin_drawer_open") === "true") {
    document.getElementById("admin-panel").classList.add("open");
  }
});

function renderHints() {
  const hintsContainer = document.getElementById("hints-container");
  const unlockedHints = JSON.parse(localStorage.getItem("unlocked_hints") || "[]");

  if (!hintsContainer) return;

  if (unlockedHints.length > 0) {
    hintsContainer.innerHTML = "";
    unlockedHints.forEach((hintText, index) => {
      const card = document.createElement("div");
      card.className = "hint-card";
      card.innerHTML = `<strong>PISTA ${index + 1}:</strong> ${hintText}`;
      hintsContainer.appendChild(card);
    });
  } else {
    hintsContainer.innerHTML = '<p class="no-hints">Aún no han desbloqueado pistas de ayuda.</p>';
  }
}

function checkCode(phase, code) {
  const inputElem = document.getElementById(`code-${phase}`);
  const errorMsg = document.getElementById(`error-${phase}`);
  if (!inputElem) return;

  const userVal = inputElem.value.trim().toUpperCase();

  if (userVal === code.toUpperCase()) {
    if (errorMsg) errorMsg.textContent = "";
    document.getElementById(`screen-${phase}`).classList.remove("active");
    document.getElementById(`step-${phase}`).classList.remove("active");
    
    if (phase < 4) {
      document.getElementById(`screen-${phase + 1}`).classList.add("active");
      document.getElementById(`step-${phase + 1}`).classList.add("active");
    } else {
      document.getElementById("screen-success").classList.add("active");
    }
  } else {
    if (errorMsg) errorMsg.textContent = "❌ CÓDIGO INCORRECTO. REVISEN LAS PISTAS Y LA SALA.";
  }
}
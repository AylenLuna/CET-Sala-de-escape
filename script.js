// ==========================================
// CONFIGURACIÓN INICIAL Y CLAVES
// ==========================================
const DEFAULT_TIME = 20 * 60; // 20 minutos por defecto

const correctAnswers = {
  1: "ID_8032",
  2: "1AM11G", 
  3: "UPDATE_SIN_TEST",
  4: "83157264"
};

const phaseHints = {
  1: "Alguien de la guardia cometió un error grave e intentó ocultar las evidencias. Solo una mente lógica puede revelar el código de acceso entre el desorden.",
  2: "Recuerden la regla de oro del centro: cuando la red falla, lo físico es el único refugio seguro. Un buen diagnóstico requiere filtrar la información irrelevante.",
  3: "Cualquier cambio sin probar pone en riesgo la estabilidad del servidor. Busquen en el registro la acción no verificada que alteró el sistema.",
  4: "Identificar el error no basta: para reparar el daño hay que seguir el protocolo correcto."
};

// ==========================================
// LECTURA INICIAL DE LOCALSTORAGE (PERSISTENCIA)
// ==========================================
let currentPhase = parseInt(localStorage.getItem("pumm_current_phase")) || 1;
let totalSeconds = localStorage.getItem("pumm_timer") !== null 
  ? parseInt(localStorage.getItem("pumm_timer"), 10) 
  : DEFAULT_TIME;

let isTimerRunning = localStorage.getItem("pumm_timer_running") === "true";

let phaseHintsUnlocked = JSON.parse(localStorage.getItem("pumm_hints")) || {
  1: false,
  2: false,
  3: false,
  4: false
};

let timerInterval = null;

// ==========================================
// INICIALIZACIÓN DE PÁGINA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  setupGuionInputs();
  renderHints();
  jumpToPhase(currentPhase, false); // Mostrar pantalla guardada sin reescribir
  updateTimerDisplay();

  // Si arrancó la primera vez o si ya estaba en marcha, iniciar el bucle
  if (localStorage.getItem("pumm_timer_running") === null) {
    startTimer(); // Primera ejecución del programa
  } else if (isTimerRunning) {
    resumeTimerInterval();
  }
});

function saveStateToLocalStorage() {
  localStorage.setItem("pumm_current_phase", currentPhase);
  localStorage.setItem("pumm_timer", totalSeconds);
  localStorage.setItem("pumm_timer_running", isTimerRunning);
  localStorage.setItem("pumm_hints", JSON.stringify(phaseHintsUnlocked));
}

// ==========================================
// TEMPORIZADOR
// ==========================================
function updateTimerDisplay() {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timerEl = document.getElementById("timer");
  if (timerEl) {
    timerEl.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  const playBtn = document.getElementById("play-pause-btn");
  const statusBadge = document.getElementById("timer-status");

  if (isTimerRunning) {
    if (playBtn) {
      playBtn.textContent = "⏸ PAUSAR";
      playBtn.classList.add("paused");
    }
    if (statusBadge) {
      statusBadge.textContent = "▶ EN EJECUCIÓN";
      statusBadge.classList.add("running");
    }
  } else {
    if (playBtn) {
      playBtn.textContent = "▶ INICIAR";
      playBtn.classList.remove("paused");
    }
    if (statusBadge) {
      statusBadge.textContent = "⏸ PAUSADO";
      statusBadge.classList.remove("running");
    }
  }
}

function startTimer() {
  isTimerRunning = true;
  saveStateToLocalStorage();
  updateTimerDisplay();
  resumeTimerInterval();
}

function resumeTimerInterval() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (isTimerRunning && totalSeconds > 0) {
      totalSeconds--;
      saveStateToLocalStorage();
      updateTimerDisplay();
    } else if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      isTimerRunning = false;
      jumpToPhase("timeout");
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  saveStateToLocalStorage();
  updateTimerDisplay();
}

function toggleTimer() {
  if (isTimerRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function setCustomTime() {
  const customInput = document.getElementById("custom-minutes");
  if (customInput && customInput.value) {
    const mins = parseInt(customInput.value, 10);
    if (!isNaN(mins) && mins >= 0) {
      totalSeconds = mins * 60;
      saveStateToLocalStorage();
      updateTimerDisplay();
    }
  }
}

// ==========================================
// NAVEGACIÓN Y FASES
// ==========================================
function jumpToPhase(phase, save = true) {
  document.querySelectorAll(".challenge-screen").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".dt-stepper .step").forEach(st => st.classList.remove("active"));

  if (typeof phase === "number") {
    currentPhase = phase;
    const targetScreen = document.getElementById(`screen-${phase}`);
    const targetStep = document.getElementById(`step-${phase}`);

    if (targetScreen) targetScreen.classList.add("active");
    if (targetStep) targetStep.classList.add("active");

    updateHintButtonState();
  } else if (phase === "success" || phase === "timeout") {
    currentPhase = phase;
    pauseTimer();
    const targetScreen = document.getElementById(`screen-${phase}`);
    if (targetScreen) targetScreen.classList.add("active");

    const btnPista = document.getElementById("request-hint-btn");
    if (btnPista) {
      btnPista.disabled = true;
      btnPista.innerText = "SISTEMA FINALIZADO";
    }
  }

  if (save) {
    saveStateToLocalStorage();
  }
}

// ==========================================
// VALIDACIONES DE CÓDIGO
// ==========================================
function checkCode(phase, expectedCode) {
  const inputEl = document.getElementById(`code-${phase}`);
  const errorEl = document.getElementById(`error-${phase}`);

  if (!inputEl || !errorEl) return;

  const userCode = inputEl.value.trim().toUpperCase();

  if (userCode === expectedCode) {
    errorEl.textContent = "";
    if (phase < 4) {
      jumpToPhase(phase + 1);
    } else {
      jumpToPhase("success");
    }
  } else {
    errorEl.textContent = "❌ CÓDIGO INCORRECTO. INTENTE NUEVAMENTE.";
  }
}

function checkGuionesCode() {
  const casillas = document.querySelectorAll(".guion-input");
  const errorEl = document.getElementById("error-2");

  let userCode = "";
  casillas.forEach(c => {
    userCode += c.value.trim().toUpperCase();
  });

  if (userCode === correctAnswers[2]) {
    errorEl.textContent = "";
    jumpToPhase(3);
  } else {
    errorEl.textContent = "❌ CÓDIGO INCORRECTO. VERIFIQUE LAS RESPUESTAS.";
  }
}

function setupGuionInputs() {
  const casillas = document.querySelectorAll(".guion-input");
  casillas.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      if (e.target.value.length === 1 && index < casillas.length - 1) {
        casillas[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        casillas[index - 1].focus();
      }
    });
  });
}

// ==========================================
// PISTAS Y POPUPS
// ==========================================
function requestPhaseHint() {
  if (typeof currentPhase !== "number") return;

  if (phaseHintsUnlocked[currentPhase]) {
    alert("⚠️ Ya han solicitado la pista correspondiente a esta fase.");
    return;
  }

  openAllyModal();
}

function openAllyModal() {
  const modal = document.getElementById("ally-modal");
  if (modal) modal.classList.add("active");
}

function closeAllyModal() {
  const modal = document.getElementById("ally-modal");
  if (modal) modal.classList.remove("active");
}

function goToGame() {
  closeAllyModal();
  
  // Selecciona al azar un juego entre el 1, 2 y 3
  const randomGame = Math.floor(Math.random() * 3) + 1;
  
  // Redirige al juego guardando la fase actual
  window.location.href = `games.html?game=${randomGame}&phase=${currentPhase}`;
}

function renderHints() {
  const container = document.getElementById("hints-container");
  if (!container) return;

  const unlockedPhases = Object.keys(phaseHintsUnlocked).filter(p => phaseHintsUnlocked[p]);

  if (unlockedPhases.length === 0) {
    container.innerHTML = `<p class="no-hints">Aún no han desbloqueado pistas de ayuda.</p>`;
    return;
  }

  let html = "";
  unlockedPhases.forEach(p => {
    html += `
      <div class="hint-card">
        <strong>FASE 0${p}:</strong><br>
        ${phaseHints[p]}
      </div>
    `;
  });

  container.innerHTML = html;
}

function updateHintButtonState() {
  const btnPista = document.getElementById("request-hint-btn");
  if (!btnPista) return;

  if (typeof currentPhase !== "number") {
    btnPista.disabled = true;
    btnPista.innerText = "SISTEMA FINALIZADO";
    return;
  }

  if (phaseHintsUnlocked[currentPhase]) {
    btnPista.disabled = true;
    btnPista.innerText = "✓ PISTA OBTENIDA";
  } else {
    btnPista.disabled = false;
    btnPista.innerText = "💡 PEDIR PISTA";
  }
}

// ==========================================
// CONTROL ADMINISTRATIVO
// ==========================================
function toggleAdminPanel() {
  const panel = document.getElementById("admin-panel");
  if (panel) panel.classList.toggle("open");
}

function openAdminWithPass() {
  const pass = prompt("Ingrese la clave de Administradora CET:");
  if (pass === "REINICIO-CET") {
    toggleAdminPanel();
  } else if (pass !== null) {
    alert("❌ Clave incorrecta.");
  }
}

function executeFullReset() {
  if (confirm("¿Está segura de reiniciar toda la sala para el siguiente grupo?")) {
    clearInterval(timerInterval);
    localStorage.clear(); //
    location.reload(); //[cite: 16]
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupGuionInputs();
  renderHints();
  jumpToPhase(currentPhase, false); // Mostrar pantalla guardada sin reescribir
  updateTimerDisplay();

  // 🔴 ASEGURAR QUE SE REANUDE EL CRONÓMETRO SI NO ESTÁ EN FASE FINAL
  if (currentPhase !== "success" && currentPhase !== "timeout") {
    isTimerRunning = true;
    startTimer();
  }
});
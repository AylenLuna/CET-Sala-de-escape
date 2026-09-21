/* ==========================================
   JUEGO 1: CABLES 
========================================== */
let selectedWire = null;
let connections = {};

const colorNamesEs = {
  red: 'ROJO',
  green: 'VERDE',
  blue: 'AZUL'
};

function initCablesGame() {
  const wires = document.querySelectorAll('.wire-item');
  const ports = document.querySelectorAll('.port-item');

  wires.forEach(wire => {
    wire.addEventListener('click', () => {
      wires.forEach(w => w.classList.remove('active-selection'));
      wire.classList.add('active-selection');
      selectedWire = wire.getAttribute('data-color');
    });
  });

  ports.forEach(port => {
    port.addEventListener('click', () => {
      if (selectedWire) {
        const portColor = port.getAttribute('data-color');
        connections[selectedWire] = portColor;
        
        port.querySelector('.status').textContent = `CONECTADO (${colorNamesEs[selectedWire]})`;
        port.classList.add('connected');
        
        wires.forEach(w => w.classList.remove('active-selection'));
        selectedWire = null;
      }
    });
  });
}

function validateCables() {
  const isCorrect = connections['red'] === 'red' && 
                    connections['green'] === 'green' && 
                    connections['blue'] === 'blue';

  if (isCorrect) {
    completeMinigame();
  } else {
    showError("❌ Conexión incorrecta. Sincronizá cada cable con su puerto de canal correspondiente.");
  }
}

/* ==========================================
   JUEGO 2: ANOMALÍAS BINARIAS (OCULTAS)
========================================== */
let totalAnomalies = 0;

function initBinaryGame() {
  const grid = document.getElementById('binary-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const anomalies = ['#', '$', '@', 'X', '8', '&', '%', 'Z'];
  totalAnomalies = 0;

  for (let i = 0; i < 30; i++) {
    const bit = document.createElement('div');
    bit.className = 'bit-cell';
    
    if (Math.random() < 0.25 && totalAnomalies < 6) {
      bit.textContent = anomalies[Math.floor(Math.random() * anomalies.length)];
      bit.dataset.isAnomaly = "true";
      totalAnomalies++;
      
      bit.addEventListener('click', () => {
        if (bit.dataset.isAnomaly === "true") {
          bit.textContent = Math.random() < 0.5 ? '0' : '1';
          bit.dataset.isAnomaly = "false";
          bit.classList.add('repaired');
          totalAnomalies--;
          updateAnomalyCounter();
        }
      });
    } else {
      bit.textContent = Math.random() < 0.5 ? '0' : '1';
    }
    
    grid.appendChild(bit);
  }

  if (totalAnomalies < 3) {
    initBinaryGame();
  } else {
    updateAnomalyCounter();
  }
}

function updateAnomalyCounter() {
  const countElem = document.getElementById('anomaly-count');
  if (countElem) {
    countElem.textContent = totalAnomalies;
  }
}

function validateBinary() {
  if (totalAnomalies === 0) {
    completeMinigame();
  } else {
    showError(`❌ Aún quedan ${totalAnomalies} anomalías detectadas en el sistema.`);
  }
}

/* ==========================================
   JUEGO 3: ORDENAR SECUENCIA (1-2-3-4)
========================================== */
let sequenceState = [3, 1, 4, 2];
let selectedBlockIndex = null;

function initSequenceGame() {
  renderSequence();
}

function renderSequence() {
  const grid = document.getElementById('sequence-grid');
  if (!grid) return;
  grid.innerHTML = '';

  sequenceState.forEach((num, index) => {
    const block = document.createElement('div');
    block.className = 'seq-block';
    if (selectedBlockIndex === index) block.classList.add('selected');
    block.textContent = `MÓDULO 0${num}`;

    block.addEventListener('click', () => {
      if (selectedBlockIndex === null) {
        selectedBlockIndex = index;
      } else {
        let temp = sequenceState[selectedBlockIndex];
        sequenceState[selectedBlockIndex] = sequenceState[index];
        sequenceState[index] = temp;
        selectedBlockIndex = null;
      }
      renderSequence();
    });

    grid.appendChild(block);
  });
}

function validateSequence() {
  const isOrdered = sequenceState.every((val, index) => val === index + 1);

  if (isOrdered) {
    completeMinigame();
  } else {
    showError("❌ La secuencia no está correctamente ordenada (debe quedar MÓDULO 01 a MÓDULO 04).");
  }
}

/* ==========================================
   MÉTODOS AUXILIARES Y PISTAS SEGÚN FASE
========================================== */
const phaseHintsText = {
  1: "Alguien de la guardia cometió un error grave e intentó ocultar las evidencias. Solo una mente lógica puede revelar el código de acceso entre el desorden.",
  2: "Recuerden la regla de oro del centro: cuando la red falla, lo físico es el único refugio seguro. Un buen diagnóstico requiere filtrar la información irrelevante.",
  3: "Cualquier cambio sin probar pone en riesgo la estabilidad del servidor. Busquen en el registro la acción no verificada que alteró el sistema.",
  4: "Identificar el error no basta: para reparar el daño hay que seguir el protocolo correcto."
};

function showError(msg) {
  const errBox = document.getElementById('game-error-msg');
  if (!errBox) return;
  errBox.textContent = msg;
  errBox.style.animation = 'none';
  errBox.offsetHeight;
  errBox.style.animation = 'shake 0.3s ease';
}

function completeMinigame() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPhase = parseInt(urlParams.get('phase')) || 1;

  let hints = JSON.parse(localStorage.getItem("pumm_hints") || "{}");
  hints[currentPhase] = true;
  localStorage.setItem("pumm_hints", JSON.stringify(hints));

  // 🔴 FORZAR A QUE EL CRONÓMETRO SIGA CORRIENDO AL REGRESAR
  localStorage.setItem("pumm_timer_running", "true");

  window.location.href = "index.html";
}

/* ==========================================
   INICIALIZADOR DE JUEGOS SEGÚN LA URL
========================================== */
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('game') || '1';

  const titleElem = document.getElementById('game-title');
  const instructionElem = document.getElementById('game-instruction');

  const gameCables = document.getElementById('game-cables');
  const gameBinary = document.getElementById('game-binary');
  const gameSequence = document.getElementById('game-sequence');

  if (gameCables) gameCables.style.display = 'none';
  if (gameBinary) gameBinary.style.display = 'none';
  if (gameSequence) gameSequence.style.display = 'none';

  if (gameId === '1' && gameCables) {
    titleElem.textContent = '🔌 DESAFÍO 01: CONEXIÓN DE CABLES';
    instructionElem.textContent = 'Seleccioná un cable y luego hacé clic en su puerto correspondiente para conectarlo.';
    gameCables.style.display = 'block';
    initCablesGame();
  } else if (gameId === '2' && gameBinary) {
    titleElem.textContent = '👾 DESAFÍO 02: ANOMALÍAS EN MEMORIA';
    instructionElem.textContent = 'Encontrá y corregí los caracteres extraños dentro de la grilla binaria para reparar el módulo.';
    gameBinary.style.display = 'block';
    initBinaryGame();
  } else if (gameId === '3' && gameSequence) {
    titleElem.textContent = '🧩 DESAFÍO 03: SECUENCIA DE MÓDULOS';
    instructionElem.textContent = 'Ordená los módulos del 01 al 04 haciendo clic en dos bloques para intercambiar sus posiciones.';
    gameSequence.style.display = 'block';
    initSequenceGame();
  }
});
// Leer cuál juego se solicitó desde la URL
const urlParams = new URLSearchParams(window.location.search);
const requestedGame = urlParams.get('game');

const gamesMap = {
  '1': 'cables',
  '2': 'binary',
  '3': 'sequence'
};

const gamesList = ['cables', 'binary', 'sequence'];
let activeGame = gamesMap[requestedGame] || gamesList[Math.floor(Math.random() * gamesList.length)];

// Al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  setupGame(activeGame);
});

function setupGame(gameType) {
  const cableElem = document.getElementById('game-cables');
  const binaryElem = document.getElementById('game-binary');
  const seqElem = document.getElementById('game-sequence');

  if (cableElem) cableElem.style.display = 'none';
  if (binaryElem) binaryElem.style.display = 'none';
  if (seqElem) seqElem.style.display = 'none';

  if (gameType === 'cables') {
    if (cableElem) cableElem.style.display = 'block';
    document.getElementById('game-title').textContent = '🔌 CONEXIÓN DE HARDWARE';
    document.getElementById('game-instruction').textContent = 'Conectá cada cable con su puerto correspondiente haciendo clic en el cable y luego en el puerto.';
    initCablesGame();
  } else if (gameType === 'binary') {
    if (binaryElem) binaryElem.style.display = 'block';
    document.getElementById('game-title').textContent = '👾 DEPURACIÓN DE MEMORIA BINARIA';
    document.getElementById('game-instruction').textContent = 'Detectamos sectores corruptos en el código. Hacé clic en los símbolos extraños para reparar los bits.';
    initBinaryGame();
  } else if (gameType === 'sequence') {
    if (seqElem) seqElem.style.display = 'block';
    document.getElementById('game-title').textContent = '🧩 ALINEACIÓN DE SECUENCIA';
    document.getElementById('game-instruction').textContent = 'Ordená los módulos del 1 al 4 haciendo clic sobre dos bloques para intercambiar sus posiciones.';
    initSequenceGame();
  }
}

/* ==========================================
   JUEGO 1: CABLES INTERACTIVOS
========================================== */
let selectedWire = null;
let connections = {};

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
        
        port.querySelector('.status').textContent = `CONECTADO (${selectedWire.toUpperCase()})`;
        port.classList.add('connected');
        
        wires.forEach(w => w.classList.remove('active-selection'));
        selectedWire = null;
      }
    });
  });
}

function validateCables() {
  const isCorrect = connections['red'] === 'red' && 
                    connections['blue'] === 'blue' && 
                    connections['green'] === 'green';

  if (isCorrect) {
    completeMinigame("PISTA REVELADA: Miren con la lupa la credencial del equipo técnico, el ID tiene detalles impresos en rojo.");
  } else {
    showError("❌ Las conexiones son incorrectas. Asegurate de conectar cada cable a su puerto correcto.");
  }
}

/* ==========================================
   JUEGO 2: ANOMALÍAS BINARIAS
========================================== */
let totalAnomalies = 0;

function initBinaryGame() {
  const grid = document.getElementById('binary-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const anomalies = ['#', '$', '@', 'X', '8', '&', '%'];
  totalAnomalies = 0;

  for (let i = 0; i < 30; i++) {
    const bit = document.createElement('div');
    bit.className = 'bit-cell';
    
    if (Math.random() < 0.25 && totalAnomalies < 6) {
      bit.textContent = anomalies[Math.floor(Math.random() * anomalies.length)];
      bit.classList.add('anomaly');
      totalAnomalies++;
      
      bit.addEventListener('click', () => {
        if (bit.classList.contains('anomaly')) {
          bit.textContent = Math.random() < 0.5 ? '0' : '1';
          bit.classList.remove('anomaly');
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
  const cnt = document.getElementById('anomaly-count');
  if (cnt) cnt.textContent = totalAnomalies;
}

function validateBinary() {
  if (totalAnomalies === 0) {
    completeMinigame("PISTA REVELADA: El servidor afectado está parpadeando en la interfaz central. Su código termina en _CORE.");
  } else {
    showError(`❌ Todavía quedan ${totalAnomalies} anomalías sin corregir en el panel.`);
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
    completeMinigame("PISTA REVELADA: La acción no autorizada fue ejecutada a las 14:32 y tiene la etiqueta UPDATE_UNVERIFIED.");
  } else {
    showError("❌ La secuencia no está correctamente ordenada (debe quedar MÓDULO 01 a MÓDULO 04).");
  }
}

/* ==========================================
   MÉTODOS AUXILIARES
========================================== */
function showError(msg) {
  const errBox = document.getElementById('game-error-msg');
  if (!errBox) return;
  errBox.textContent = msg;
  errBox.style.animation = 'none';
  errBox.offsetHeight;
  errBox.style.animation = 'shake 0.3s ease';
}

function completeMinigame(hintText) {
  let hints = JSON.parse(localStorage.getItem("unlocked_hints") || "[]");
  if (!hints.includes(hintText)) {
    hints.push(hintText);
    localStorage.setItem("unlocked_hints", JSON.stringify(hints));
  }
  window.location.href = "index.html";
}
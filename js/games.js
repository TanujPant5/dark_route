/* ========================================
   ASTRA - Stress Relief Games
   Calming Space-Themed Mini-Games
   ======================================== */

// -------------------- 
// Translation Helper
// -------------------- 
// Safely calls the global getText function from translations.js
function t(key, defaultText) {
    if (typeof getText === 'function') {
        return getText(key) || defaultText;
    }
    return defaultText;
}

// -------------------- 
// Game State
// -------------------- 
let currentGame = null;
let gameInterval = null;
let gameTimer = null;
let gameStartTime = null;

// Star Catcher Game State
let starCatcherState = {
    score: 0,
    timeLeft: 60,
    isPlaying: false,
    stars: [],
    level: 1,
    combo: 0,
    maxCombo: 0
};

// Breathing Exercise State
let breathingState = {
    isActive: false,
    phase: 'inhale', // inhale, hold, exhale
    cyclesCompleted: 0,
    totalCycles: 5,
    currentTime: 0
};

// Constellation Game State
let constellationState = {
    score: 0,
    isPlaying: false,
    currentConstellation: null,
    connectedStars: [],
    level: 1
};

// -------------------- 
// DOM Elements
// -------------------- 
const gameContainer = document.getElementById('gameContainer');
const gameScore = document.getElementById('gameScore');
const gameTimer_el = document.getElementById('gameTimer');
const gameMessage = document.getElementById('gameMessage');
const startGameBtn = document.getElementById('startGameBtn');
const breathingCircle = document.getElementById('breathingCircle');
const breathingText = document.getElementById('breathingText');
const breathingProgress = document.getElementById('breathingProgress');

// -------------------- 
// Initialize Games Page
// -------------------- 
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Games page initialized');
    
    // Check URL hash for specific game
    const hash = window.location.hash;
    if (hash === '#breathing') {
        switchGame('breathing');
    }
});

// -------------------- 
// Switch Between Games
// -------------------- 
function switchGame(gameType) {
    // Stop any current game
    stopCurrentGame();
    
    // Update tab UI
    const tabs = document.querySelectorAll('[data-game-tab]');
    tabs.forEach(tab => {
        tab.classList.remove('active', 'bg-white/10', 'border-cyan-500');
        tab.classList.add('border-transparent');
        if (tab.dataset.gameTab === gameType) {
            tab.classList.add('active', 'bg-white/10', 'border-cyan-500');
            tab.classList.remove('border-transparent');
        }
    });
    
    // Show/hide game containers
    const gameContainers = document.querySelectorAll('[data-game-container]');
    gameContainers.forEach(container => {
        if (container.dataset.gameContainer === gameType) {
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    });
    
    currentGame = gameType;
}

// -------------------- 
// Stop Current Game
// -------------------- 
function stopCurrentGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    // Reset states
    starCatcherState.isPlaying = false;
    breathingState.isActive = false;
    constellationState.isPlaying = false;
}

// ========================================
// STAR CATCHER GAME
// ========================================

function startStarCatcher() {
    // Reset state
    starCatcherState = {
        score: 0,
        timeLeft: 60,
        isPlaying: true,
        stars: [],
        level: 1,
        combo: 0,
        maxCombo: 0
    };
    
    gameStartTime = new Date();
    
    // Update UI
    updateStarCatcherUI();
    
    // Hide start button, show game
    const startScreen = document.getElementById('starCatcherStart');
    const gameArea = document.getElementById('starCatcherGame');
    const gameOverScreen = document.getElementById('starCatcherGameOver');
    
    if (startScreen) startScreen.classList.add('hidden');
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
    if (gameArea) gameArea.classList.remove('hidden');
    
    // Clear existing stars
    const container = document.getElementById('starField');
    if (container) container.innerHTML = '';
    
    // Start spawning stars
    gameInterval = setInterval(spawnStar, 1500);
    
    // Start timer
    gameTimer = setInterval(() => {
        starCatcherState.timeLeft--;
        updateStarCatcherUI();
        
        // Increase difficulty over time
        if (starCatcherState.timeLeft === 45) {
            starCatcherState.level = 2;
            clearInterval(gameInterval);
            gameInterval = setInterval(spawnStar, 1200);
        } else if (starCatcherState.timeLeft === 30) {
            starCatcherState.level = 3;
            clearInterval(gameInterval);
            gameInterval = setInterval(spawnStar, 900);
        } else if (starCatcherState.timeLeft === 15) {
            starCatcherState.level = 4;
            clearInterval(gameInterval);
            gameInterval = setInterval(spawnStar, 700);
        }
        
        if (starCatcherState.timeLeft <= 0) {
            endStarCatcher();
        }
    }, 1000);
    
    // Spawn initial stars
    for (let i = 0; i < 3; i++) {
        setTimeout(() => spawnStar(), i * 300);
    }
}

function spawnStar() {
    if (!starCatcherState.isPlaying) return;
    
    const container = document.getElementById('starField');
    if (!container) return;
    
    const star = document.createElement('div');
    star.className = 'game-star';
    
    // Random position
    const maxX = container.offsetWidth - 40;
    const maxY = container.offsetHeight - 40;
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    
    // Random star type (different colors and points)
    const starTypes = [
        { color: 'cyan', points: 10, glow: 'rgba(34, 211, 238, 0.8)' },
        { color: 'purple', points: 20, glow: 'rgba(168, 85, 247, 0.8)' },
        { color: 'pink', points: 30, glow: 'rgba(236, 72, 153, 0.8)' },
        { color: 'gold', points: 50, glow: 'rgba(250, 204, 21, 0.8)' }
    ];
    
    // Higher level = more chance for rare stars
    const rand = Math.random();
    let starType;
    if (rand < 0.5) {
        starType = starTypes[0]; // cyan - common
    } else if (rand < 0.75) {
        starType = starTypes[1]; // purple - uncommon
    } else if (rand < 0.9) {
        starType = starTypes[2]; // pink - rare
    } else {
        starType = starTypes[3]; // gold - legendary
    }
    
    star.style.background = `radial-gradient(circle, ${starType.glow} 0%, transparent 70%)`;
    star.dataset.points = starType.points;
    star.dataset.color = starType.color;
    
    // Size variation
    const size = 20 + Math.random() * 15;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    
    // Click handler
    star.addEventListener('click', () => catchStar(star, starType.points));
    
    container.appendChild(star);
    
    // Remove star after timeout (missed)
    const lifespan = 3000 - (starCatcherState.level * 400);
    setTimeout(() => {
        if (star.parentNode && !star.classList.contains('caught')) {
            star.classList.add('missed');
            starCatcherState.combo = 0; // Reset combo on miss
            updateStarCatcherUI();
            setTimeout(() => {
                if (star.parentNode) star.remove();
            }, 300);
        }
    }, Math.max(lifespan, 1500));
}

function catchStar(star, points) {
    if (star.classList.contains('caught')) return;
    
    star.classList.add('caught');
    
    // Calculate points with combo bonus
    starCatcherState.combo++;
    const comboMultiplier = 1 + (Math.min(starCatcherState.combo, 10) * 0.1);
    const finalPoints = Math.round(points * comboMultiplier);
    
    starCatcherState.score += finalPoints;
    starCatcherState.maxCombo = Math.max(starCatcherState.maxCombo, starCatcherState.combo);
    
    // Show points popup
    showPointsPopup(star, finalPoints, starCatcherState.combo);
    
    // Update UI
    updateStarCatcherUI();
    
    // Play catch sound
    playStarCatchSound();
    
    // Remove star
    setTimeout(() => {
        if (star.parentNode) star.remove();
    }, 300);
}

function showPointsPopup(star, points, combo) {
    const popup = document.createElement('div');
    popup.className = 'points-popup';
    popup.style.left = star.style.left;
    popup.style.top = star.style.top;
    popup.innerHTML = `+${points}${combo > 1 ? `<span class="combo">x${combo}</span>` : ''}`;
    
    const container = document.getElementById('starField');
    if (container) {
        container.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }
}

function updateStarCatcherUI() {
    const scoreEl = document.getElementById('starScore');
    const timeEl = document.getElementById('starTime');
    const comboEl = document.getElementById('starCombo');
    const levelEl = document.getElementById('starLevel');
    
    if (scoreEl) scoreEl.textContent = starCatcherState.score;
    if (timeEl) timeEl.textContent = starCatcherState.timeLeft;
    if (comboEl) {
        comboEl.textContent = `x${starCatcherState.combo}`;
        if (starCatcherState.combo >= 5) {
            comboEl.classList.add('text-yellow-400', 'animate-pulse');
        } else {
            comboEl.classList.remove('text-yellow-400', 'animate-pulse');
        }
    }
    if (levelEl) levelEl.textContent = starCatcherState.level;
}

function endStarCatcher() {
    starCatcherState.isPlaying = false;
    
    // Clear intervals
    clearInterval(gameInterval);
    clearInterval(gameTimer);
    
    // Calculate play duration
    const duration = Math.round((new Date() - gameStartTime) / 1000);
    
    // Log to Firebase
    logGameActivity('star_catcher', duration, starCatcherState.score);
    
    // Show game over screen
    const gameArea = document.getElementById('starCatcherGame');
    const gameOverScreen = document.getElementById('starCatcherGameOver');
    const finalScore = document.getElementById('finalScore');
    const maxComboDisplay = document.getElementById('maxComboDisplay');
    
    if (gameArea) gameArea.classList.add('hidden');
    if (gameOverScreen) gameOverScreen.classList.remove('hidden');
    if (finalScore) finalScore.textContent = starCatcherState.score;
    if (maxComboDisplay) maxComboDisplay.textContent = starCatcherState.maxCombo;
    
    // Determine message based on score
    const messageEl = document.getElementById('gameOverMessage');
    if (messageEl) {
        if (starCatcherState.score >= 500) {
            messageEl.textContent = t('star_msg_stellar', "🌟 Stellar Performance! You're a true star catcher!");
        } else if (starCatcherState.score >= 300) {
            messageEl.textContent = t('star_msg_great', "✨ Great job! The cosmos is proud of you!");
        } else if (starCatcherState.score >= 150) {
            messageEl.textContent = t('star_msg_good', "⭐ Good effort! Keep reaching for the stars!");
        } else {
            messageEl.textContent = t('star_msg_nice', "💫 Nice try! Every astronaut starts somewhere!");
        }
    }
    
    // Show toast
    const scoreMsg = t('toast_score_msg', 'You scored {score} points').replace('{score}', starCatcherState.score);
    showToast('success', t('toast_game_complete', 'Game Complete!'), scoreMsg);
}

function resetStarCatcher() {
    const startScreen = document.getElementById('starCatcherStart');
    const gameOverScreen = document.getElementById('starCatcherGameOver');
    
    if (startScreen) startScreen.classList.remove('hidden');
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
}

function playStarCatchSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Pleasant chime sound
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.1);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        // Audio not available
    }
}

// ========================================
// BREATHING EXERCISE
// ========================================

const BREATHING_PHASES = {
    inhale: { duration: 4, next: 'hold', textKey: 'breath_phase_in', defaultText: 'Breathe In...', color: 'from-cyan-500 to-blue-600' },
    hold: { duration: 4, next: 'exhale', textKey: 'breath_phase_hold', defaultText: 'Hold...', color: 'from-blue-600 to-purple-600' },
    exhale: { duration: 6, next: 'rest', textKey: 'breath_phase_out', defaultText: 'Breathe Out...', color: 'from-purple-600 to-pink-600' },
    rest: { duration: 2, next: 'inhale', textKey: 'breath_phase_rest', defaultText: 'Rest...', color: 'from-pink-600 to-cyan-500' }
};

function startBreathingExercise() {
    // Reset state
    breathingState = {
        isActive: true,
        phase: 'inhale',
        cyclesCompleted: 0,
        totalCycles: 5,
        currentTime: 0
    };
    
    gameStartTime = new Date();
    
    // Update UI
    const startScreen = document.getElementById('breathingStart');
    const exerciseScreen = document.getElementById('breathingExercise');
    const completeScreen = document.getElementById('breathingComplete');
    
    if (startScreen) startScreen.classList.add('hidden');
    if (completeScreen) completeScreen.classList.add('hidden');
    if (exerciseScreen) exerciseScreen.classList.remove('hidden');
    
    // Start the breathing cycle
    runBreathingPhase();
}

function runBreathingPhase() {
    if (!breathingState.isActive) return;
    
    const phase = BREATHING_PHASES[breathingState.phase];
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingPhaseText');
    const cycleCounter = document.getElementById('breathingCycleCounter');
    const progressBar = document.getElementById('breathingProgressBar');
    
    // Update text with translation
    if (text) text.textContent = t(phase.textKey, phase.defaultText);
    
    // Update cycle counter with translation
    if (cycleCounter) {
        const cycleText = t('breath_cycle_count', 'Cycle {current} of {total}')
            .replace('{current}', breathingState.cyclesCompleted + 1)
            .replace('{total}', breathingState.totalCycles);
        cycleCounter.textContent = cycleText;
    }
    
    // Update circle animation
    if (circle) {
        circle.className = `breathing-circle bg-gradient-to-br ${phase.color}`;
        
        // Scale animation based on phase
        if (breathingState.phase === 'inhale') {
            circle.style.transform = 'scale(1)';
            circle.style.transition = `transform ${phase.duration}s ease-in-out`;
        } else if (breathingState.phase === 'exhale') {
            circle.style.transform = 'scale(0.6)';
            circle.style.transition = `transform ${phase.duration}s ease-in-out`;
        } else if (breathingState.phase === 'hold') {
            circle.style.transform = 'scale(1)';
            circle.style.transition = 'none';
        } else {
            circle.style.transform = 'scale(0.6)';
            circle.style.transition = 'none';
        }
    }
    
    // Countdown timer for this phase
    let timeLeft = phase.duration;
    const phaseTimer = document.getElementById('breathingTimer');
    if (phaseTimer) phaseTimer.textContent = timeLeft;
    
    // Update progress bar
    updateBreathingProgress();
    
    const countdown = setInterval(() => {
        timeLeft--;
        if (phaseTimer) phaseTimer.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            
            // Move to next phase
            breathingState.phase = phase.next;
            
            // Check if cycle complete
            if (breathingState.phase === 'inhale') {
                breathingState.cyclesCompleted++;
                
                if (breathingState.cyclesCompleted >= breathingState.totalCycles) {
                    completeBreathingExercise();
                    return;
                }
            }
            
            // Continue to next phase
            runBreathingPhase();
        }
    }, 1000);
    
    // Store interval reference for cleanup
    gameInterval = countdown;
}

function updateBreathingProgress() {
    const progressBar = document.getElementById('breathingProgressBar');
    if (progressBar) {
        const progress = (breathingState.cyclesCompleted / breathingState.totalCycles) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

function completeBreathingExercise() {
    breathingState.isActive = false;
    
    // Calculate duration
    const duration = Math.round((new Date() - gameStartTime) / 1000);
    
    // Log to Firebase
    logGameActivity('breathing_exercise', duration, breathingState.totalCycles);
    
    // Update UI
    const exerciseScreen = document.getElementById('breathingExercise');
    const completeScreen = document.getElementById('breathingComplete');
    
    if (exerciseScreen) exerciseScreen.classList.add('hidden');
    if (completeScreen) completeScreen.classList.remove('hidden');
    
    // Update stats
    const durationDisplay = document.getElementById('breathingDuration');
    const cyclesDisplay = document.getElementById('breathingCyclesCompleted');
    
    if (durationDisplay) durationDisplay.textContent = formatDuration(duration);
    if (cyclesDisplay) cyclesDisplay.textContent = breathingState.totalCycles;
    
    // Show toast
    showToast('success', t('toast_well_done', 'Well Done!'), t('toast_breath_complete', 'Breathing exercise complete. Feel more relaxed?'));
}

function stopBreathingExercise() {
    breathingState.isActive = false;
    
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    
    // Reset UI
    const startScreen = document.getElementById('breathingStart');
    const exerciseScreen = document.getElementById('breathingExercise');
    
    if (startScreen) startScreen.classList.remove('hidden');
    if (exerciseScreen) exerciseScreen.classList.add('hidden');
}

function resetBreathing() {
    const startScreen = document.getElementById('breathingStart');
    const completeScreen = document.getElementById('breathingComplete');
    
    if (startScreen) startScreen.classList.remove('hidden');
    if (completeScreen) completeScreen.classList.add('hidden');
}

function setBreathingCycles(cycles) {
    breathingState.totalCycles = cycles;
    
    // Update buttons UI
    const buttons = document.querySelectorAll('[data-cycles]');
    buttons.forEach(btn => {
        btn.classList.remove('bg-cyan-500/30', 'border-cyan-500');
        btn.classList.add('border-white/20');
        if (parseInt(btn.dataset.cycles) === cycles) {
            btn.classList.add('bg-cyan-500/30', 'border-cyan-500');
            btn.classList.remove('border-white/20');
        }
    });
}

// ========================================
// CONSTELLATION CONNECT GAME
// ========================================

const CONSTELLATIONS = [
    {
        name: 'Orion',
        stars: [
            { x: 50, y: 20 },
            { x: 40, y: 35 },
            { x: 60, y: 35 },
            { x: 35, y: 50 },
            { x: 50, y: 50 },
            { x: 65, y: 50 },
            { x: 45, y: 70 },
            { x: 55, y: 70 }
        ],
        connections: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [5, 7]]
    },
    {
        name: 'Big Dipper',
        stars: [
            { x: 20, y: 30 },
            { x: 35, y: 25 },
            { x: 50, y: 30 },
            { x: 65, y: 35 },
            { x: 75, y: 50 },
            { x: 70, y: 65 },
            { x: 55, y: 60 }
        ],
        connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]]
    },
    {
        name: 'Cassiopeia',
        stars: [
            { x: 20, y: 40 },
            { x: 35, y: 55 },
            { x: 50, y: 45 },
            { x: 65, y: 55 },
            { x: 80, y: 40 }
        ],
        connections: [[0, 1], [1, 2], [2, 3], [3, 4]]
    }
];

function startConstellationGame() {
    constellationState = {
        score: 0,
        isPlaying: true,
        currentConstellation: null,
        connectedStars: [],
        currentConnections: [],
        level: 1,
        selectedStar: null
    };
    
    gameStartTime = new Date();
    
    // Update UI
    const startScreen = document.getElementById('constellationStart');
    const gameScreen = document.getElementById('constellationGame');
    
    if (startScreen) startScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');
    
    // Load first constellation
    loadConstellation(0);
}

function loadConstellation(index) {
    if (index >= CONSTELLATIONS.length) {
        completeConstellationGame();
        return;
    }
    
    constellationState.currentConstellation = CONSTELLATIONS[index];
    constellationState.connectedStars = [];
    constellationState.currentConnections = [];
    constellationState.selectedStar = null;
    
    const container = document.getElementById('constellationField');
    const nameDisplay = document.getElementById('constellationName');
    const progressDisplay = document.getElementById('constellationProgress');
    
    if (container) {
        container.innerHTML = '';
        
        // Create SVG for lines
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'constellationLines';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        container.appendChild(svg);
        
        // Create stars
        constellationState.currentConstellation.stars.forEach((star, i) => {
            const starEl = document.createElement('div');
            starEl.className = 'constellation-star';
            starEl.style.left = `${star.x}%`;
            starEl.style.top = `${star.y}%`;
            starEl.dataset.index = i;
            starEl.addEventListener('click', () => selectConstellationStar(i));
            container.appendChild(starEl);
        });
    }
    
    if (nameDisplay) {
        const connectText = t('const_connect', 'Connect: {name}').replace('{name}', constellationState.currentConstellation.name);
        nameDisplay.textContent = connectText;
    }
    if (progressDisplay) progressDisplay.textContent = `${index + 1} / ${CONSTELLATIONS.length}`;
}

function selectConstellationStar(index) {
    if (!constellationState.isPlaying) return;
    
    const stars = document.querySelectorAll('.constellation-star');
    
    if (constellationState.selectedStar === null) {
        // First star selection
        constellationState.selectedStar = index;
        stars[index].classList.add('selected');
    } else if (constellationState.selectedStar === index) {
        // Deselect
        stars[index].classList.remove('selected');
        constellationState.selectedStar = null;
    } else {
        // Try to connect
        const connection = [
            Math.min(constellationState.selectedStar, index),
            Math.max(constellationState.selectedStar, index)
        ];
        
        // Check if valid connection
        const isValid = constellationState.currentConstellation.connections.some(
            c => c[0] === connection[0] && c[1] === connection[1]
        );
        
        const alreadyConnected = constellationState.currentConnections.some(
            c => c[0] === connection[0] && c[1] === connection[1]
        );
        
        if (isValid && !alreadyConnected) {
            // Valid connection
            constellationState.currentConnections.push(connection);
            constellationState.score += 50;
            drawConnection(constellationState.selectedStar, index, true);
            playStarCatchSound();
            
            // Check if constellation complete
            if (constellationState.currentConnections.length === constellationState.currentConstellation.connections.length) {
                constellationState.score += 100; // Bonus for completing
                setTimeout(() => {
                    const currentIndex = CONSTELLATIONS.indexOf(constellationState.currentConstellation);
                    loadConstellation(currentIndex + 1);
                }, 1000);
            }
        } else if (!isValid) {
            // Invalid connection - show error
            drawConnection(constellationState.selectedStar, index, false);
            constellationState.score = Math.max(0, constellationState.score - 10);
        }
        
        // Deselect
        stars[constellationState.selectedStar].classList.remove('selected');
        constellationState.selectedStar = null;
        
        // Update score display
        updateConstellationUI();
    }
}

function drawConnection(star1Index, star2Index, isValid) {
    const container = document.getElementById('constellationField');
    const svg = document.getElementById('constellationLines');
    if (!container || !svg) return;
    
    const stars = constellationState.currentConstellation.stars;
    const rect = container.getBoundingClientRect();
    
    const x1 = (stars[star1Index].x / 100) * rect.width;
    const y1 = (stars[star1Index].y / 100) * rect.height;
    const x2 = (stars[star2Index].x / 100) * rect.width;
    const y2 = (stars[star2Index].y / 100) * rect.height;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', isValid ? '#22d3ee' : '#ef4444');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-linecap', 'round');
    
    if (isValid) {
        line.style.filter = 'drop-shadow(0 0 5px #22d3ee)';
    } else {
        // Remove invalid line after animation
        line.style.opacity = '1';
        setTimeout(() => {
            line.style.transition = 'opacity 0.5s';
            line.style.opacity = '0';
            setTimeout(() => line.remove(), 500);
        }, 300);
    }
    
    svg.appendChild(line);
}

function updateConstellationUI() {
    const scoreDisplay = document.getElementById('constellationScore');
    if (scoreDisplay) scoreDisplay.textContent = constellationState.score;
}

function completeConstellationGame() {
    constellationState.isPlaying = false;
    
    const duration = Math.round((new Date() - gameStartTime) / 1000);
    
    // Log to Firebase
    logGameActivity('constellation_connect', duration, constellationState.score);
    
    // Show complete screen
    const gameScreen = document.getElementById('constellationGame');
    const completeScreen = document.getElementById('constellationComplete');
    const finalScore = document.getElementById('constellationFinalScore');
    
    if (gameScreen) gameScreen.classList.add('hidden');
    if (completeScreen) completeScreen.classList.remove('hidden');
    if (finalScore) finalScore.textContent = constellationState.score;
    
    const scoreMsg = t('toast_score_msg', 'You scored {score} points').replace('{score}', constellationState.score);
    showToast('success', t('toast_const_master', 'Constellation Master!'), scoreMsg);
}

function resetConstellationGame() {
    const startScreen = document.getElementById('constellationStart');
    const completeScreen = document.getElementById('constellationComplete');
    
    if (startScreen) startScreen.classList.remove('hidden');
    if (completeScreen) completeScreen.classList.add('hidden');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ========================================
// EXPORT FUNCTIONS
// ========================================
window.switchGame = switchGame;
window.startStarCatcher = startStarCatcher;
window.resetStarCatcher = resetStarCatcher;
window.startBreathingExercise = startBreathingExercise;
window.stopBreathingExercise = stopBreathingExercise;
window.resetBreathing = resetBreathing;
window.setBreathingCycles = setBreathingCycles;
window.startConstellationGame = startConstellationGame;
window.resetConstellationGame = resetConstellationGame;
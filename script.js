
 // ======================================
 // TYPEVERSE - TYPING CHALLENGE GAME
 // Complete Updated JavaScript
 // ======================================

const gameArea = document.querySelector(".game-selection");
const hero = document.querySelector(".hero");
const bottomNote = document.querySelector(".bottom-note");

// ---------- GAME STATE ----------

let gameTimer = null;
let nextTargetTimer = null;
let gameRunning = false;
let activeMode = "bubbles";

let difficulty = "Easy";
let timeLeft = 60;

// Bubbles state
let bubbleScore = 0;
let misses = 0;
let bubbleSpeed = 9;
const MAX_MISSES = 6;

// KeyMagnet state
let keyScore = 0;
let selectedKeySet = "Home Row";

let keyStats = {
    correct: 0,
    incorrect: 0,
    responseTime: 0,
    attempts: 0
};

let targetStartedAt = 0;

const keySets = {
    "Home Row": ["A", "S", "D", "F", "J", "K", "L"],
    "Left Hand": ["A", "S", "D", "F"],
    "Right Hand": ["J", "K", "L"],
    "All Letters": "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
};

// ---------- COMMON HELPERS ----------

function clearGameTimers() {
    clearInterval(gameTimer);
    clearTimeout(nextTargetTimer);

    gameTimer = null;
    nextTargetTimer = null;
}

function stopGame() {
    gameRunning = false;
    clearGameTimers();
}

function setDifficulty() {
    if (difficulty === "Easy") {
        timeLeft = 60;
        bubbleSpeed = 9;
    } else if (difficulty === "Medium") {
        timeLeft = 45;
        bubbleSpeed = 7;
    } else {
        timeLeft = 30;
        bubbleSpeed = 5;
    }
}

function resetCurrentGame() {
    if (activeMode === "bubbles") {
        bubbleScore = 0;
        misses = 0;
    } else {
        keyScore = 0;
        keyStats = {
            correct: 0,
            incorrect: 0,
            responseTime: 0,
            attempts: 0
        };
        targetStartedAt = 0;
    }
}

function startTimer(updateFunction, endFunction) {
    clearInterval(gameTimer);

    gameTimer = setInterval(() => {
        if (!gameRunning) return;

        timeLeft--;
        updateFunction();

        if (timeLeft <= 0) {
            endFunction();
        }
    }, 1000);
}

// ======================================
// HOME SCREEN
// ======================================

function goHome() {
    stopGame();
    activeMode = "bubbles";

    hero.innerHTML = `
        <p class="eyebrow">YOUR KEYBOARD. YOUR POWER.</p>
        <h1>Ready, Set,<br><span>Type!</span></h1>
        <p class="intro">
            Sharpen your typing skills, catch letters
            and become a keyboard master.
        </p>
    `;

    gameArea.innerHTML = `
        <article class="game-card">
            <div class="game-icon">◉</div>
            <p class="mode-label">MODE 01</p>
            <h2>Bubbles</h2>
            <p>
                Catch the floating letters before they escape.
                Test your speed and letter recognition.
            </p>
            <button onclick="selectGame('bubbles')">
                Play Bubbles <span>→</span>
            </button>
        </article>

        <article class="game-card featured">
            <div class="game-icon">⌨</div>
            <p class="mode-label">MODE 02</p>
            <h2>KeyMagnet</h2>
            <p>
                Hit the correct keys, build your accuracy
                and master your keyboard precision.
            </p>
            <button onclick="selectGame('keymagnet')">
                Play KeyMagnet <span>→</span>
            </button>
        </article>
    `;

    bottomNote.innerHTML =
        "<span>✦</span> Practice makes progress. Let's play!";
}

// ======================================
// GAME SELECTION
// ======================================

function selectGame(mode) {
    stopGame();

    if (mode === "bubbles") {
        showBubblesSetup();
    } else if (mode === "keymagnet") {
        showKeyMagnetSetup();
    }
}

// ======================================
// MODE A: BUBBLES
// ======================================

function showBubblesSetup() {
    stopGame();
    activeMode = "bubbles";

    hero.innerHTML = `
        <p class="eyebrow">MODE 01</p>
        <h1>Bubbles <span>Challenge</span></h1>
        <p class="intro">
            Catch the floating letters. Don't let them escape!
        </p>
    `;

    gameArea.innerHTML = `
        <article class="game-card setup-card">
            <h2>Choose Difficulty</h2>

            <label for="difficulty">Difficulty Level</label>
            <select id="difficulty">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
            </select>

            <button onclick="startBubbles()">
                Start Game →
            </button>

            <button class="secondary-btn" onclick="goHome()">
                ← Home
            </button>
        </article>
    `;

    bottomNote.textContent = "Catch letters. Beat your score!";
}

function startBubbles() {
    stopGame();
    activeMode = "bubbles";

    const difficultySelect = document.getElementById("difficulty");

    if (difficultySelect) {
        difficulty = difficultySelect.value;
    }

    setDifficulty();
    resetCurrentGame();
    gameRunning = true;

    hero.innerHTML = `
        <p class="eyebrow">CATCH THE LETTERS</p>
        <h1>Bubble <span>Arena</span></h1>
        <p class="intro">
            Type the matching letter to catch it!
        </p>
    `;

    gameArea.innerHTML = `
        <div class="game-board">
            <div class="stats">
                <div class="stat">
                    <small>SCORE</small>
                    <h2 id="score">0</h2>
                </div>

                <div class="stat">
                    <small>MISSES</small>
                    <h2 id="misses">0/6</h2>
                </div>

                <div class="stat">
                    <small>TIME</small>
                    <h2 id="timer">${timeLeft}s</h2>
                </div>
            </div>

            <div id="bubbleField" class="bubble-field"></div>

            <p class="game-message" id="message" aria-live="polite">
                Type a matching letter!
            </p>

            <p class="game-message">
                Difficulty: ${difficulty}
            </p>

            <div class="game-controls">
                <button onclick="startBubbles()">↻ Restart Game</button>
                <button class="secondary-btn" onclick="goHome()">
                    ← Home
                </button>
            </div>
        </div>
    `;

    createBubbles();

    startTimer(
        () => {
            const timer = document.getElementById("timer");
            if (timer) timer.textContent = timeLeft + "s";
        },
        () => endBubbles("Time is up!")
    );
}

function createBubbles() {
    const field = document.getElementById("bubbleField");
    if (!field) return;

    field.innerHTML = "";

    for (let i = 0; i < 5; i++) {
        addBubble();
    }
}

function addBubble() {
    if (!gameRunning || activeMode !== "bubbles") return;

    const field = document.getElementById("bubbleField");
    if (!field) return;

    if (field.querySelectorAll(".bubble").length >= 5) return;

    const letters = "ASDFJKLQWERTYUIOPZXCVBNM";
    const bubble = document.createElement("div");

    bubble.className = "bubble";
    bubble.textContent =
        letters[Math.floor(Math.random() * letters.length)];

    bubble.style.left = (5 + Math.random() * 75) + "%";
    bubble.style.animationDuration = bubbleSpeed + "s";

    bubble.addEventListener("animationend", () => {
        if (!gameRunning || activeMode !== "bubbles") return;
        if (!bubble.isConnected) return;

        bubble.remove();
        misses++;

        const missesDisplay = document.getElementById("misses");
        if (missesDisplay) {
            missesDisplay.textContent = misses + "/6";
        }

        showMessage("Bubble missed!", false);

        if (misses >= MAX_MISSES) {
            endBubbles("Miss limit reached!");
            return;
        }

        addBubble();
    });

    field.appendChild(bubble);
}

function handleBubbleKey(key) {
    if (!gameRunning || activeMode !== "bubbles") return;

    const bubbles = [
        ...document.querySelectorAll("#bubbleField .bubble")
    ];

    const matched = bubbles.find(
        bubble => bubble.textContent === key
    );

    if (matched) {
        matched.remove();
        bubbleScore += 10;

        const scoreDisplay = document.getElementById("score");
        if (scoreDisplay) {
            scoreDisplay.textContent = bubbleScore;
        }

        showMessage("Correct! +10 points", true);
        addBubble();
    } else {
        bubbleScore = Math.max(0, bubbleScore - 2);

        const scoreDisplay = document.getElementById("score");
        if (scoreDisplay) {
            scoreDisplay.textContent = bubbleScore;
        }

        showMessage("Wrong key! -2 points", false);
    }
}

function showMessage(text, correct) {
    const message = document.getElementById("message");
    if (!message) return;

    message.textContent = text;
    message.style.color = correct ? "#bda0ff" : "#ff858e";
}

function endBubbles(reason) {
    if (!gameRunning || activeMode !== "bubbles") return;

    stopGame();

    const finalScore = bubbleScore;
    const finalMisses = misses;
    const finalDifficulty = difficulty;
    const finalTime = timeLeft;

    hero.innerHTML = `
        <p class="eyebrow">SESSION COMPLETE</p>
        <h1>Game <span>Over!</span></h1>
        <p class="intro">${reason}</p>
    `;

    gameArea.innerHTML = `
        <article class="game-card result-card">
            <div class="game-icon">✦</div>
            <p class="mode-label">BUBBLES RESULTS</p>
            <h2>${finalScore} Points</h2>
            <p>Misses: ${finalMisses}/6</p>
            <p>Difficulty: ${finalDifficulty}</p>
            <p>Time remaining: ${finalTime}s</p>

            <button onclick="showBubblesSetup()">
                Play Again →
            </button>

            <button class="secondary-btn" onclick="goHome()">
                ← Home
            </button>
        </article>
    `;
}

// ======================================
// MODE B: KEYMAGNET
// ======================================

function showKeyMagnetSetup() {
    stopGame();
    activeMode = "keymagnet";

    hero.innerHTML = `
        <p class="eyebrow">MODE 02</p>
        <h1>Key<span>Magnet</span></h1>
        <p class="intro">
            Hit the right key. Master your precision!
        </p>
    `;

    gameArea.innerHTML = `
        <article class="game-card setup-card">
            <h2>Keyboard Precision</h2>

            <label for="keyDifficulty">Difficulty</label>
            <select id="keyDifficulty">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
            </select>

            <label for="keySet">Practice Key Set</label>
            <select id="keySet">
                <option>Home Row</option>
                <option>Left Hand</option>
                <option>Right Hand</option>
                <option>All Letters</option>
            </select>

            <button onclick="startKeyMagnet()">
                Start Challenge →
            </button>

            <button class="secondary-btn" onclick="goHome()">
                ← Home
            </button>
        </article>
    `;

    bottomNote.textContent = "Focus. Type. Improve.";
}

function startKeyMagnet() {
    stopGame();
    activeMode = "keymagnet";

    const keyDifficultySelect =
        document.getElementById("keyDifficulty");

    const keySetSelect =
        document.getElementById("keySet");

    if (keyDifficultySelect) {
        difficulty = keyDifficultySelect.value;
    }

    if (keySetSelect) {
        selectedKeySet = keySetSelect.value;
    }

    setDifficulty();
    resetCurrentGame();
    gameRunning = true;

    hero.innerHTML = `
        <p class="eyebrow">MODE 02</p>
        <h1>Key<span>Magnet</span></h1>
        <p class="intro">Find and press the target key!</p>
    `;

    gameArea.innerHTML = `
        <div class="game-board">
            <div class="stats">
                <div class="stat">
                    <small>SCORE</small>
                    <h2 id="kmScore">0</h2>
                </div>

                <div class="stat">
                    <small>CORRECT</small>
                    <h2 id="kmCorrect">0</h2>
                </div>

                <div class="stat">
                    <small>TIME</small>
                    <h2 id="kmTimer">${timeLeft}s</h2>
                </div>
            </div>

            <div class="target-panel">
                <p class="mode-label">YOUR TARGET KEY</p>
                <h1 id="targetKey">A</h1>
                <p id="kmMessage" aria-live="polite">
                    Press the matching key
                </p>
            </div>

            <div class="keyboard-panel" id="keyboardPanel"></div>

            <div class="km-stats">
                <span>Incorrect: <b id="kmIncorrect">0</b></span>
                <span>Accuracy: <b id="kmAccuracy">0%</b></span>
                <span>Avg. response: <b id="kmResponse">0 ms</b></span>
            </div>

            <p class="game-message">
                Difficulty: ${difficulty} |
                Key Set: ${selectedKeySet}
            </p>

            <p class="game-message">
                Complete 20 correct targets to win!
            </p>

            <div class="game-controls">
                <button onclick="startKeyMagnet()">↻ Restart Game</button>
                <button class="secondary-btn" onclick="goHome()">
                    ← Home
                </button>
            </div>
        </div>
    `;

    renderKeyboard();
    nextTarget();

    startTimer(
        () => {
            const timer = document.getElementById("kmTimer");
            if (timer) timer.textContent = timeLeft + "s";
        },
        () => endKeyMagnet("Time is up!")
    );
}

function renderKeyboard() {
    const panel = document.getElementById("keyboardPanel");
    if (!panel) return;

    panel.innerHTML = "";

    const keys = keySets[selectedKeySet];

    keys.forEach(key => {
        const button = document.createElement("div");

        button.className = "keyboard-key";
        button.id = "key-" + key;
        button.textContent = key;

        panel.appendChild(button);
    });
}

function nextTarget() {
    if (!gameRunning || activeMode !== "keymagnet") return;

    const keys = keySets[selectedKeySet];
    const target = keys[Math.floor(Math.random() * keys.length)];

    const targetElement = document.getElementById("targetKey");
    if (!targetElement) return;

    targetElement.textContent = target;

    document.querySelectorAll(".keyboard-key").forEach(element => {
        element.classList.remove(
            "target-active",
            "key-correct",
            "key-wrong"
        );
    });

    const activeKey = document.getElementById("key-" + target);
    if (activeKey) {
        activeKey.classList.add("target-active");
    }

    targetStartedAt = performance.now();
}

function handleKeyMagnet(key) {
    if (!gameRunning || activeMode !== "keymagnet") return;

    const targetElement = document.getElementById("targetKey");
    if (!targetElement) return;

    const target = targetElement.textContent;
    const elapsed = performance.now() - targetStartedAt;
    const pressedKey = document.getElementById("key-" + key);

    keyStats.attempts++;

    if (key === target) {
        keyStats.correct++;
        keyStats.responseTime += elapsed;

        const points =
            difficulty === "Easy" ? 10 :
            difficulty === "Medium" ? 15 : 20;

        keyScore += points;

        if (pressedKey) {
            pressedKey.classList.add("key-correct");
        }

        const message = document.getElementById("kmMessage");
        if (message) {
            message.textContent = `Correct! +${points} points`;
            message.style.color = "#54d9a2";
        }

        updateKeyStats();

        if (keyStats.correct >= 20) {
            endKeyMagnet(
                "Challenge completed! You reached 20 correct keys!"
            );
            return;
        }

        clearTimeout(nextTargetTimer);

        nextTargetTimer = setTimeout(() => {
            nextTargetTimer = null;

            if (gameRunning && activeMode === "keymagnet") {
                nextTarget();
            }
        }, 250);

    } else {
        keyStats.incorrect++;

        if (pressedKey) {
            pressedKey.classList.add("key-wrong");

            setTimeout(() => {
                if (pressedKey.isConnected) {
                    pressedKey.classList.remove("key-wrong");
                }
            }, 300);
        }

        const message = document.getElementById("kmMessage");
        if (message) {
            message.textContent = "Wrong key! Try again.";
            message.style.color = "#ff858e";
        }

        updateKeyStats();
    }
}

function updateKeyStats() {
    const scoreDisplay = document.getElementById("kmScore");
    const correctDisplay = document.getElementById("kmCorrect");
    const incorrectDisplay = document.getElementById("kmIncorrect");
    const accuracyDisplay = document.getElementById("kmAccuracy");
    const responseDisplay = document.getElementById("kmResponse");

    if (scoreDisplay) scoreDisplay.textContent = keyScore;
    if (correctDisplay) correctDisplay.textContent = keyStats.correct;
    if (incorrectDisplay) incorrectDisplay.textContent = keyStats.incorrect;

    const accuracy = keyStats.attempts
        ? Math.round(keyStats.correct / keyStats.attempts * 100)
        : 0;

    const average = keyStats.correct
        ? Math.round(keyStats.responseTime / keyStats.correct)
        : 0;

    if (accuracyDisplay) {
        accuracyDisplay.textContent = accuracy + "%";
    }

    if (responseDisplay) {
        responseDisplay.textContent = average + " ms";
    }
}

function endKeyMagnet(reason) {
    if (!gameRunning || activeMode !== "keymagnet") return;

    stopGame();

    const finalScore = keyScore;
    const correct = keyStats.correct;
    const incorrect = keyStats.incorrect;
    const attempts = keyStats.attempts;

    const accuracy = attempts
        ? Math.round(correct / attempts * 100)
        : 0;

    const average = correct
        ? Math.round(keyStats.responseTime / correct)
        : 0;

    const finalDifficulty = difficulty;
    const finalKeySet = selectedKeySet;
    const finalTime = timeLeft;

    hero.innerHTML = `
        <p class="eyebrow">SESSION COMPLETE</p>
        <h1>Challenge <span>Results</span></h1>
        <p class="intro">${reason}</p>
    `;

    gameArea.innerHTML = `
        <article class="game-card result-card">
            <div class="game-icon">⌨</div>
            <p class="mode-label">KEYMAGNET RESULTS</p>
            <h2>${finalScore} Points</h2>

            <p>Correct: ${correct}</p>
            <p>Incorrect: ${incorrect}</p>
            <p>Accuracy: ${accuracy}%</p>
            <p>Average response: ${average} ms</p>
            <p>Difficulty: ${finalDifficulty}</p>
            <p>Key Set: ${finalKeySet}</p>
            <p>Time remaining: ${finalTime}s</p>

            <button onclick="showKeyMagnetSetup()">
                Play Again →
            </button>

            <button class="secondary-btn" onclick="goHome()">
                ← Home
            </button>
        </article>
    `;
}

// ======================================
// SHARED KEYBOARD INPUT
// ======================================

document.addEventListener("keydown", (event) => {
    if (!gameRunning) return;

    if (event.ctrlKey || event.altKey || event.metaKey) return;

    const key = event.key.toUpperCase();
    if (!/^[A-Z]$/.test(key)) return;

    if (activeMode === "bubbles") {
        handleBubbleKey(key);
    } else if (activeMode === "keymagnet") {
        handleKeyMagnet(key);
    }
});

// ======================================
// INITIALIZE
// ======================================

goHome();

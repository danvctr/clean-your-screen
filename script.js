document.addEventListener('DOMContentLoaded', () => {
    // State
    const defaultState = {
        rows: 4,
        cols: 4,
        primaryColor: '#ffffff',
        secondaryColor: '#000000',
        isCheckerboard: false
    };

    let state = { ...defaultState };

    // DOM Elements
    const gridContainer = document.getElementById('grid-container');
    const rowsInput = document.getElementById('rows');
    const rowsVal = document.getElementById('rows-val');
    const colsInput = document.getElementById('cols');
    const colsVal = document.getElementById('cols-val');

    // Primary Color Inputs
    const primaryColorBtns = document.querySelectorAll('.color-btn:not(.secondary)');
    const primaryColorPicker = document.getElementById('primary-color-picker');

    // Secondary Color Inputs
    const secondaryColorGroup = document.getElementById('secondary-color-group');
    const secondaryColorBtns = document.querySelectorAll('.color-btn.secondary');
    const secondaryColorPicker = document.getElementById('secondary-color-picker');

    // Other Controls
    const checkerboardInput = document.getElementById('checkerboard');
    const controlsPanel = document.getElementById('controls');
    const toggleBtn = document.getElementById('controls-toggle');
    const hideBtn = document.getElementById('hide-controls-btn');

    // New Controls
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    // Initialization
    function init() {
        loadState();
        renderGrid();
        updateUI();
        initCursorHider();
        initKeyboardShortcuts();
    }

    // Persistence
    function saveState() {
        localStorage.setItem('screenCleanerState', JSON.stringify(state));
    }

    function loadState() {
        const saved = localStorage.getItem('screenCleanerState');
        if (saved) {
            try {
                state = { ...defaultState, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to load state', e);
            }
        }
    }

    // Core Logic
    function renderGrid() {
        gridContainer.innerHTML = '';

        // CSS Grid Layout
        gridContainer.style.gridTemplateRows = `repeat(${state.rows}, 1fr)`;
        gridContainer.style.gridTemplateColumns = `repeat(${state.cols}, 1fr)`;

        const totalCells = state.rows * state.cols;

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');

            // Determine background color
            let bgColor = state.primaryColor;

            if (state.isCheckerboard) {
                // Calculate row and col specific to this cell
                // Using 0-based indexing
                const row = Math.floor(i / state.cols);
                const col = i % state.cols;

                // Checkerboard pattern logic
                // If sum of row and col is odd, use secondary color
                if ((row + col) % 2 !== 0) {
                    bgColor = state.secondaryColor;
                }
            }

            cell.style.backgroundColor = bgColor;
            gridContainer.appendChild(cell);
        }
    }

    function updateUI() {
        // Update labels and inputs
        rowsVal.textContent = state.rows;
        rowsInput.value = state.rows;
        colsVal.textContent = state.cols;
        colsInput.value = state.cols;

        // Update primary color active state
        primaryColorBtns.forEach(btn => {
            if (btn.dataset.color.toLowerCase() === state.primaryColor.toLowerCase()) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        primaryColorPicker.value = state.primaryColor;

        // Update checkerboard toggle
        checkerboardInput.checked = state.isCheckerboard;

        // Update secondary color visibility and state
        secondaryColorGroup.style.display = state.isCheckerboard ? 'block' : 'none';

        secondaryColorBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color.toLowerCase() === state.secondaryColor.toLowerCase());
        });
        secondaryColorPicker.value = state.secondaryColor;
    }

    // Auto-Hide Cursor
    let cursorTimer;
    function initCursorHider() {
        document.addEventListener('mousemove', () => {
            document.body.classList.remove('hidden-cursor');
            if (!controlsPanel.classList.contains('hidden')) {
                // Only hide cursor if we are "idle" for a bit, but maybe not if controls are open?
                // Actually, let's always hide it if idle, unless hovering controls? No, simple idle is best for cleaning.
            }

            clearTimeout(cursorTimer);
            cursorTimer = setTimeout(() => {
                // Don't hide if interacting with controls? 
                // Let's hide it anyway, movement brings it back.
                document.body.classList.add('hidden-cursor');
            }, 3000);
        });
    }

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Global shortcuts
            switch (e.key.toLowerCase()) {
                case 'f':
                    toggleFullScreen();
                    break;
                case 'h':
                    toggleControls();
                    break;
            }
        });
    }

    // Full Screen Logic
    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    // Event Listeners

    // Rows & Cols
    rowsInput.addEventListener('input', (e) => {
        state.rows = parseInt(e.target.value);
        saveState();
        updateUI();
        renderGrid();
    });

    colsInput.addEventListener('input', (e) => {
        state.cols = parseInt(e.target.value);
        saveState();
        updateUI();
        renderGrid();
    });

    // Primary Color - Buttons
    primaryColorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.primaryColor = btn.dataset.color;
            saveState();
            updateUI();
            renderGrid();
        });
    });

    // Primary Color - Picker
    primaryColorPicker.addEventListener('input', (e) => {
        state.primaryColor = e.target.value;
        // Remove active class from buttons since we are using custom color
        primaryColorBtns.forEach(btn => btn.classList.remove('active'));
        saveState();
        renderGrid();
    });

    // Checkerboard Toggle
    checkerboardInput.addEventListener('change', (e) => {
        state.isCheckerboard = e.target.checked;
        saveState();
        updateUI();
        renderGrid();
    });

    // Secondary Color - Buttons
    secondaryColorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.secondaryColor = btn.dataset.color;
            saveState();
            updateUI();
            renderGrid();
        });
    });

    // Secondary Color - Picker
    secondaryColorPicker.addEventListener('input', (e) => {
        state.secondaryColor = e.target.value;
        secondaryColorBtns.forEach(btn => btn.classList.remove('active'));
        saveState();
        renderGrid();
    });

    // Controls Visibility
    function toggleControls() {
        const isHidden = controlsPanel.classList.toggle('hidden');
        toggleBtn.classList.toggle('faded', isHidden);
    }

    toggleBtn.addEventListener('click', toggleControls);

    hideBtn.addEventListener('click', () => {
        controlsPanel.classList.add('hidden');
        toggleBtn.classList.add('faded');
    });

    // New Controls Listeners
    fullscreenBtn.addEventListener('click', toggleFullScreen);

    // Initialize
    init();
});

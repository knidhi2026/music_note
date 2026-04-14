// Audio context for Web Audio API
let audioContext;
let isPlaying = false;
let playingSingleVarisai = false; // Track if playing a single varisai
let soundEnabled = true;
let voiceEnabled = false; // Muted by default - voice not yet perfected
let currentLineIndex = 0;
let currentNoteIndex = 0;

// Musical note frequencies (A4 = 440Hz as reference)
const noteFrequencies = {
    'S': 261.63,   // C4
    'R': 293.66,   // D4
    'G': 329.63,   // E4
    'M': 349.23,   // F4
    'P': 392.00,   // G4
    'D': 440.00,   // A4
    'N': 493.88,   // B4
    'Ṡ': 523.25    // C5
};

const noteLetters = ['S', 'R', 'G', 'M', 'P', 'D', 'N', 'Ṡ'];

// Current lesson data
let currentLesson = {
    name: '',
    lines: [],
    isPlayable: [], // Track which lines should be played (true) vs skipped (false)
    varisaiMap: [] // Map of line index to varisai number
};

// Initialize audio context
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Load and initialize voices
function initVoices() {
    if ('speechSynthesis' in window) {
        // Some browsers need this to load voices
        speechSynthesis.getVoices();
        // Re-load voices on voice change event
        speechSynthesis.onvoiceschanged = () => {
            speechSynthesis.getVoices();
        };
    }
}

// Play a musical note
function playNote(note, duration = 0.3) {
    if (!soundEnabled || !audioContext) return;
    
    initAudioContext();
    
    const frequency = noteFrequencies[note];
    if (!frequency) return;

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    
    // Use different waveform for Saa (8th note) to give it a unique "color"
    if (note === 'Ṡ') {
        oscillator.type = 'triangle'; // Brighter, richer tone for the octave note
    } else {
        oscillator.type = 'sine'; // Pure sine wave for other notes
    }

    // ADSR envelope
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
}

// Simple text-to-speech for voice
async function speakNote(note) {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    const noteNames = {
        'S': 'Sa',
        'R': 'Re',
        'G': 'Ga',
        'M': 'Ma',
        'P': 'Pa',
        'D': 'Da',
        'N': 'Ni',
        'Ṡ': 'Saa'
    };

    const utterance = new SpeechSynthesisUtterance(noteNames[note]);
    
    // Get female voice
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('female') ||
        voice.name.includes('woman') ||
        voice.name.includes('Woman') ||
        voice.name.includes('Google UK English Female')
    );
    
    if (femaleVoice) {
        utterance.voice = femaleVoice;
    }
    
    // Settings for melodious, elongated female voice
    utterance.rate = 0.8;      // Slower rate for melodious sound
    utterance.pitch = 1.4;     // Higher pitch for female voice
    utterance.volume = 0.8;    // Good volume level
    
    // Return a promise that resolves after voice finishes
    return new Promise(resolve => {
        speechSynthesis.cancel();
        
        utterance.onend = () => {
            resolve();
        };
        
        utterance.onerror = () => {
            resolve();
        };
        
        // Fallback timeout to ensure we don't wait too long
        setTimeout(resolve, 1250);
        
        speechSynthesis.speak(utterance);
    });
}

// Load lessons from text files
async function loadLessons() {
    try {
        const lessonsFolder = 'lessons';
        
        // Try to fetch the list of files
        const response = await fetch(`${lessonsFolder}/`);
        
        if (!response.ok) {
            // Fallback: Use predefined lessons
            const predefinedLessons = [
                { name: 'sarali-varisai', display: 'Sarali Varisai' }
            ];
            loadPredefinedLessons(predefinedLessons);
            return;
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const links = doc.querySelectorAll('a[href$=".txt"]');
        const lessons = Array.from(links).map(link => ({
            name: link.textContent.replace('.txt', ''),
            display: link.textContent.replace('-', ' ').replace('.txt', '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        }));

        if (lessons.length > 0) {
            loadPredefinedLessons(lessons);
        } else {
            loadPredefinedLessons([{ name: 'sarali-varisai', display: 'Sarali Varisai' }]);
        }
    } catch (error) {
        console.log('Could not load lessons from server, using fallback');
        loadPredefinedLessons([{ name: 'sarali-varisai', display: 'Sarali Varisai' }]);
    }
}

function loadPredefinedLessons(lessons) {
    const container = document.getElementById('lessonsContainer');
    container.innerHTML = '';

    lessons.forEach(lesson => {
        const btn = document.createElement('button');
        btn.className = 'lesson-btn';
        btn.textContent = lesson.display;
        btn.onclick = () => openLesson(lesson.name);
        container.appendChild(btn);
    });
}

// Load lesson content
async function openLesson(lessonName) {
    try {
        const response = await fetch(`lessons/${lessonName}.txt`);
        const text = await response.text();
        
        // Parse lesson content - keep ALL lines for display
        let lines = text.split('\n')
            .filter(line => line.trim().length > 0);
        
        currentLesson.name = lessonName;
        currentLesson.lines = lines.map(line => line.trim());
        
        // Track which lines are playable and map to varisai numbers
        let currentVarisai = 0;
        currentLesson.isPlayable = [];
        currentLesson.varisaiMap = [];
        
        currentLesson.lines.forEach(line => {
            const trimmed = line.trim();
            const isNumber = /^\d+[.:\s]*$/.test(trimmed);
            
            if (isNumber) {
                // Extract the number from lines like "1.", "2:", etc.
                const match = trimmed.match(/\d+/);
                if (match) {
                    currentVarisai = parseInt(match[0]);
                }
            }
            
            // Line is playable if it's not just numbers and not empty
            const isPlayable = !isNumber && trimmed.length > 0;
            currentLesson.isPlayable.push(isPlayable);
            currentLesson.varisaiMap.push(currentVarisai);
        });

        displayLesson();
    } catch (error) {
        // Load fallback lesson
        currentLesson.name = lessonName;
        currentLesson.lines = getFallbackLessonContent(lessonName);
        currentLesson.varisaiMap = currentLesson.lines.map(() => 1);
        currentLesson.isPlayable = currentLesson.lines.map(line => {
            const trimmed = line.trim();
            return !/^\d+[.:\s]*$/.test(trimmed) && trimmed.length > 0;
        });
        displayLesson();
    }
}

// Fallback lesson content
function getFallbackLessonContent(lessonName) {
    if (lessonName === 'sarali-varisai') {
        return [
            'S R G M P D N Ṡ',
            'Ṡ N D P M G R S',
            'S R G R M G P M',
            'M P D P Ṡ N D Ṡ',
            'Ṡ D N Ṡ P D M P',
            'P M G M R G S R'
        ];
    }
    return ['S R G M P D N Ṡ', 'Ṡ N D P M G R S'];
}

// Display lesson on the page
function displayLesson() {
    const notesContent = document.getElementById('notesContent');
    
    // Display all lines - convert number lines to buttons
    let html = '';
    currentLesson.lines.forEach((line, idx) => {
        const trimmed = line.trim();
        const isNumberLine = /^\d+[.:\s]*$/.test(trimmed);
        
        if (isNumberLine) {
            // Extract the number and create a button
            const match = trimmed.match(/\d+/);
            const varisaiNum = match ? match[0] : 1;
            html += `<div class="varisai-button-container" style="margin-bottom: 12px;"><button class="varisai-button" onclick="playVarisai(${varisaiNum})">Varisai ${varisaiNum}</button></div>`;
        } else {
            // Regular line
            html += `<div class="note-line" data-line-index="${idx}" style="margin-bottom: 12px;">${line}</div>`;
        }
    });
    
    notesContent.innerHTML = html;

    document.getElementById('lessonTitle').textContent = currentLesson.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Switch to lesson page
    document.getElementById('homePage').classList.remove('active');
    document.getElementById('lessonPage').classList.add('active');

    // Reset animation
    currentLineIndex = 0;
    currentNoteIndex = 0;
    isPlaying = false;
    playingSingleVarisai = false;
    updatePlayButton();
}

// Go back to home page
function goHome() {
    speechSynthesis.cancel();
    stopPlay();
    document.getElementById('lessonPage').classList.remove('active');
    document.getElementById('homePage').classList.add('active');
}

// Toggle play/stop
async function togglePlay() {
    if (isPlaying) {
        stopPlay();
    } else {
        await startPlaying();
    }
}

// Start playing
async function startPlaying() {
    isPlaying = true;
    currentLineIndex = 0;
    currentNoteIndex = 0;
    updatePlayButton();
    
    await playLines();
}

// Play a specific varisai
async function playVarisai(varisaiNumber) {
    isPlaying = true;
    playingSingleVarisai = true;
    currentLineIndex = 0;
    currentNoteIndex = 0;
    updatePlayButton();
    
    // Find first line of this varisai
    for (let i = 0; i < currentLesson.lines.length; i++) {
        if (currentLesson.varisaiMap[i] === varisaiNumber && currentLesson.isPlayable[i]) {
            currentLineIndex = i;
            break;
        }
    }
    
    await playLinesForVarisai(varisaiNumber);
}

// Play all lines
async function playLines() {
    while (currentLineIndex < currentLesson.lines.length && isPlaying) {
        // Check if this line should be played (skip number-only and empty lines)
        if (currentLesson.isPlayable[currentLineIndex]) {
            const line = currentLesson.lines[currentLineIndex];
            const notes = line.split(/\s+/).filter(n => n.length > 0);
            
            await playLineNotes(notes);
        }
        
        if (isPlaying) {
            currentLineIndex++;
            currentNoteIndex = 0;
        }
    }

    if (isPlaying) {
        isPlaying = false;
        playingSingleVarisai = false;
        updatePlayButton();
        updateProgress();
    }
}

// Play lines for a specific varisai only
async function playLinesForVarisai(targetVarisai) {
    while (currentLineIndex < currentLesson.lines.length && isPlaying) {
        const currentVarisai = currentLesson.varisaiMap[currentLineIndex];
        
        // Stop when we've moved to the next varisai
        if (currentVarisai !== targetVarisai) {
            break;
        }
        
        // Check if this line should be played (skip number-only and empty lines)
        if (currentLesson.isPlayable[currentLineIndex]) {
            const line = currentLesson.lines[currentLineIndex];
            const notes = line.split(/\s+/).filter(n => n.length > 0);
            
            await playLineNotes(notes);
        }
        
        if (isPlaying) {
            currentLineIndex++;
            currentNoteIndex = 0;
        }
    }

    if (isPlaying) {
        isPlaying = false;
        playingSingleVarisai = false;
        updatePlayButton();
        updateProgress();
    }
}

// Play notes in a line
async function playLineNotes(notes) {
    const tempo = 1250; // milliseconds per beat (1.25 seconds)
    
    // Highlight the current line being played in the text panel
    highlightCurrentLine();
    
    // Filter out pipes but keep everything else
    const cleanNotes = notes.filter(n => n !== '|' && n !== '||');
    
    // First, display all notes statically
    displayAllNotesStatic(cleanNotes);
    
    // Wait a moment before starting to play
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let previousNote = null;
    
    for (let i = 0; i < cleanNotes.length && isPlaying; i++) {
        let note = cleanNotes[i];
        currentNoteIndex = i;
        
        // Handle comma - sustain the previous note
        if (note === ',') {
            if (previousNote) {
                // Display and play the previous note without speaking
                highlightNote(note, cleanNotes);
                playNote(previousNote, tempo / 1000);
            }
        } else {
            // Regular note - play sound and voice
            highlightNote(note, cleanNotes);
            playNote(note, tempo / 1000);
            
            // Wait for the voice to complete (up to tempo duration)
            const startTime = Date.now();
            await speakNote(note);
            const elapsedTime = Date.now() - startTime;
            
            // Wait for remaining tempo time
            const remainingTime = Math.max(0, tempo - elapsedTime);
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }
            
            previousNote = note;
            updateProgress();
            continue; // Skip the wait at the end since we already waited
        }
        
        // Update progress
        updateProgress();
        
        // Wait for tempo time
        await new Promise(resolve => setTimeout(resolve, tempo));
    }
}

// Display all notes of a line statically (without highlighting)
function displayAllNotesStatic(notes) {
    const animationArea = document.getElementById('notesAnimation');
    animationArea.innerHTML = '';
    
    // Filter out pipes - only process actual notes and commas
    const displayNotes = notes.filter(n => n !== '|' && n !== '||');
    
    let previousNoteIndex = -1;
    
    displayNotes.forEach((note, idx) => {
        // Handle comma - display as empty circle at same level as previous note
        if (note === ',') {
            if (previousNoteIndex !== -1) {
                const prevNote = displayNotes[previousNoteIndex];
                const noteIndex = noteLetters.indexOf(prevNote);
                if (noteIndex === -1) return;

                // Vertical position same as previous note
                const positionPercent = (noteIndex * 12.5);
                const topPos = 100 - positionPercent - 6.25;

                // Horizontal position based on playback order
                const leftPercent = displayNotes.length > 1 
                    ? 8 + (idx / (displayNotes.length - 1)) * 84
                    : 50;

                const noteEl = document.createElement('div');
                noteEl.className = `animated-note comma`; // Special class for empty circle
                noteEl.textContent = ''; // Empty
                noteEl.setAttribute('data-index', idx);
                noteEl.style.top = `calc(${topPos}% - 27.5px)`;
                noteEl.style.left = `calc(${leftPercent}% - 27.5px)`;
                noteEl.style.opacity = '0.6';
                noteEl.style.border = '2px solid currentColor'; // Make it an outline
                noteEl.style.background = 'transparent'; // Empty inside
                
                animationArea.appendChild(noteEl);
            }
            return;
        }
        
        // Regular note
        const noteIndex = noteLetters.indexOf(note);
        if (noteIndex === -1) return;

        // Vertical position based on note pitch (8 lines, from bottom to top)
        const positionPercent = (noteIndex * 12.5);
        const topPos = 100 - positionPercent - 6.25;

        // Horizontal position based on playback order (time-synchronized)
        const leftPercent = displayNotes.length > 1 
            ? 8 + (idx / (displayNotes.length - 1)) * 84
            : 50;

        const noteEl = document.createElement('div');
        // Map Ṡ character to 'Sa' for CSS class selector
        const cssClass = note === 'Ṡ' ? 'Sa' : note;
        noteEl.className = `animated-note ${cssClass}`;
        noteEl.textContent = note;
        noteEl.setAttribute('data-index', idx); // Store index for later reference
        noteEl.style.top = `calc(${topPos}% - 27.5px)`; // Center vertically
        noteEl.style.left = `calc(${leftPercent}% - 27.5px)`; // Center horizontally
        noteEl.style.opacity = '0.6';
        
        animationArea.appendChild(noteEl);
        previousNoteIndex = idx;
    });
}

// Highlight the currently playing note
function highlightNote(note, allNotes) {
    const animationArea = document.getElementById('notesAnimation');
    
    // Remove highlight from all notes
    document.querySelectorAll('.animated-note').forEach(el => {
        el.classList.remove('highlight');
        el.style.opacity = '0.6';
    });
    
    // Find and highlight the note based on current index
    // This ensures we highlight the correct instance if same note appears multiple times
    const noteElement = document.querySelector(`.animated-note[data-index="${currentNoteIndex}"]`);
    
    if (noteElement) {
        noteElement.classList.add('highlight');
        noteElement.style.opacity = '1';
    }
}

// Highlight the current line being played in the text panel
function highlightCurrentLine() {
    // Remove highlight from all lines
    document.querySelectorAll('.note-line').forEach(el => {
        el.classList.remove('line-highlight');
    });
    
    // Highlight the current line
    const currentLineEl = document.querySelector(`.note-line[data-line-index="${currentLineIndex}"]`);
    if (currentLineEl) {
        currentLineEl.classList.add('line-highlight');
    }
}

// Stop playing
function stopPlay() {
    isPlaying = false;
    speechSynthesis.cancel();
    currentLineIndex = 0;
    currentNoteIndex = 0;
    updatePlayButton();
    
    const animationArea = document.getElementById('notesAnimation');
    animationArea.innerHTML = '';
    
    // Remove line highlighting
    document.querySelectorAll('.note-line').forEach(el => {
        el.classList.remove('line-highlight');
    });
    
    updateProgress();
}

// Update play button state
function updatePlayButton() {
    const playBtn = document.getElementById('playBtn');
    if (isPlaying) {
        playBtn.classList.add('playing');
        playBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
    } else {
        playBtn.classList.remove('playing');
        playBtn.innerHTML = '<span class="btn-icon">▶</span> Play';
    }
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('soundToggle');
    btn.classList.toggle('active');
    
    // Test sound
    if (soundEnabled) {
        playNote('S', 0.2);
    }
}

// Toggle voice
function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    const btn = document.getElementById('voiceToggle');
    btn.classList.toggle('active');
    
    // Test voice
    if (voiceEnabled) {
        speakNote('S');
    }
}

// Update progress bar and text
function updateProgress() {
    let totalNotes = 0;
    let playedNotes = 0;

    currentLesson.lines.forEach((line, lineIdx) => {
        // Only count playable lines
        if (currentLesson.isPlayable[lineIdx]) {
            const notes = line.split(/\s+/).filter(n => n.length > 0 && n !== '|' && n !== '||');
            totalNotes += notes.length;

            if (lineIdx < currentLineIndex) {
                playedNotes += notes.length;
            } else if (lineIdx === currentLineIndex) {
                playedNotes += currentNoteIndex;
            }
        }
    });

    const progressPercent = totalNotes > 0 ? (playedNotes / totalNotes) * 100 : 0;
    document.getElementById('progressFill').style.width = `${progressPercent}%`;

    // Get varisai number for current line
    const currentVarisai = currentLesson.varisaiMap[currentLineIndex] || 1;
    
    const status = isPlaying 
        ? `Playing: Varisai ${currentVarisai}`
        : 'Ready to learn';
    document.getElementById('progressText').textContent = status;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize audio context on first user interaction
    document.addEventListener('click', initAudioContext, { once: true });
    document.addEventListener('touchstart', initAudioContext, { once: true });

    // Initialize voices for speech synthesis
    initVoices();

    // Load lessons
    loadLessons();
});

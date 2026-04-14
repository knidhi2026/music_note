<!-- CUSTOMIZATION GUIDE -->

# Music Notes App - Customization Guide

This guide helps you customize the Music Notes learning application to match your needs.

## Quick Customization Options

### 1. Change App Theme Color
Edit `styles.css` and modify the gradient color at the very beginning:

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* Change these hex colors to your preferred gradient */
}
```

Popular color combinations:
- Purple to Blue: `#667eea` to `#764ba2`
- Red to Orange: `#f093fb` to `#f5576c`
- Teal to Blue: `#06c6ff` to `#005bea`
- Green to Cyan: `#43e97b` to `#38f9d7`

### 2. Adjust Playback Speed
Edit `script.js` and find the `playLineNotes()` function:

```javascript
async function playLineNotes(notes) {
    const tempo = 500; // Change this value (in milliseconds)
    // Lower numbers = faster, Higher numbers = slower
}
```

Recommended values:
- Fast: 300ms
- Normal: 500ms (default)
- Slow: 800ms
- Very Slow: 1200ms

### 3. Change Note Colors
Edit `styles.css` in the "ANIMATED NOTES" section:

```css
.animated-note.S { background: #4CAF50; }  /* Green */
.animated-note.R { background: #66BB6A; }  /* Light Green */
.animated-note.G { background: #81C784; }  /* Lighter Green */
.animated-note.M { background: #FFD54F; color: #333; }  /* Yellow */
.animated-note.P { background: #FFB74D; }  /* Orange */
.animated-note.D { background: #FF7043; }  /* Red-Orange */
.animated-note.N { background: #E64A19; }  /* Red */
.animated-note.Sa { background: #D32F2F; } /* Dark Red */
```

### 4. Modify Audio Frequencies
Edit `script.js` in the note frequencies mapping:

```javascript
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
```

To transpose to a different octave, multiply all frequencies by:
- Half octave down: 0.707
- Full octave down: 0.5
- Half octave up: 1.414
- Full octave up: 2.0

### 5. Change Font
Edit `styles.css` at the very top:

```css
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    /* Replace with your preferred font */
}
```

Popular font options:
- Modern: 'Inter', '-apple-system', 'BlinkMacSystemFont'
- Fun: 'Comic Sans MS', 'Trebuchet MS'
- Classic: 'Georgia', 'Times New Roman'
- Monospace: 'Courier New', 'Monaco'

### 6. Adjust Animation Speed
Edit `styles.css` and modify the animation durations:

```css
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
```

Change the duration value (currently `0.5s`):
- Faster: `0.2s`
- Default: `0.5s`
- Slower: `1s`

### 7. Hide/Show Elements
To hide the "Notes Info" section on home page, add to `styles.css`:

```css
.notes-info {
    display: none;
}
```

To hide progress bar in lesson area:

```css
.progress-info {
    display: none;
}
```

### 8. Change Button Styles
Edit `styles.css` for button customization:

```css
.control-btn {
    padding: 12px 20px;     /* Adjust padding */
    border-radius: 8px;     /* Adjust roundness */
    font-size: 1em;         /* Adjust size */
    font-weight: bold;      /* Change to normal for lighter text */
}
```

## Advanced Customization

### Add Background Music
In `script.js`, add audible background music:

```javascript
let backgroundMusic = new Audio('background-music.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

function toggleBackgroundMusic() {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
}
```

### Extend Lesson System
To add more notes (Sri Chakras or Mallikar system), edit:

1. `noteFrequencies` object in `script.js`
2. `noteLetters` array in `script.js`
3. Add corresponding colors in CSS
4. Update the note display on home page in `index.html`

### Custom Audio Synthesis
Replace the simple sine wave with complex timbres:

```javascript
function playNote(note, duration = 0.3) {
    // ... existing code ...
    
    // Add harmonics for richer sound
    const harmonic2 = audioContext.createOscillator();
    harmonic2.frequency.value = frequency * 1.5;
    harmonic2.connect(gainNode);
    
    // Add more oscillators for different timbre
}
```

### Add Recording Feature
Capture user's voice and compare with lesson:

```javascript
async function recordUserVoice() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    // ... recording logic
}
```

## File Structure Overview

```
music_notes/
├── index.html              # Main app
├── quickstart.html         # Quick start guide
├── styles.css              # All styling
├── script.js               # All functionality
├── lessons/                # Lesson content
│   ├── sarali-varisai.txt
│   ├── jantai.txt
│   └── advanced-patterns.txt
└── README.md              # Full documentation
```

## Testing Your Changes

1. Save your changes to any file
2. Refresh the browser (Ctrl+F5 or Cmd+Shift+R)
3. Clear browser cache if changes don't appear
4. Test on different browsers for compatibility

## Reverting Changes

Keep backup copies of original files:
- `styles.css.backup`
- `script.js.backup`
- `index.html.backup`

## Deployment Options

### Local File
- Simply open `index.html` in a browser
- Works offline once loaded

### Web Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (with http-server package)
http-server .

# Node.js (built-in)
npx serve
```

### Cloud Hosting
Upload to:
- GitHub Pages (free)
- Netlify (free with drag-and-drop)
- Vercel (free)
- AWS S3 (hosted static content)

## SEO & Meta Tags

Edit `index.html` head section for better SEO:

```html
<meta name="description" content="Learn Indian classical music notes">
<meta name="keywords" content="sargam, music, learning, indian">
<meta name="author" content="Your Name">
```

## Performance Optimization

1. **Minify CSS/JS**: Use online tools to reduce file size
2. **Image Optimization**: Use SVG for icons
3. **Lazy Loading**: Load lessons only when needed
4. **Cache Busting**: Add version numbers to files

## Troubleshooting Customization Issues

### Problem: Changes not appearing
- **Solution**: Hard refresh browser (Ctrl+Shift+Delete)

### Problem: Sound not working
- **Solution**: Check browser audio permissions and volume settings

### Problem: Text looks wrong
- **Solution**: Check font is properly installed or use web safe fonts

### Problem: Colors look different on mobile
- **Solution**: Test on actual devices; browser rendering may vary

## Getting Help

For more help with HTML/CSS/JavaScript:
- MDN Web Docs: https://developer.mozilla.org/
- W3Schools: https://www.w3schools.com/
- Stack Overflow: https://stackoverflow.com/

---

**Happy Customizing! Make this app your own! 🎵**

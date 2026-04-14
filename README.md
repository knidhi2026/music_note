# Music Notes - Learn Sargam

A professional, interactive web-based application for learning Indian classical music notes (Sargam). Perfect for kids and beginners to master the 8 notes: Sa, Re, Ga, Ma, Pa, Da, Ni, Saa (S R G M P D N Ṡ).

## Features

### 🎵 Interactive Learning
- **Visual Representation**: Notes displayed as colorful buttons on an 8-line staff
- **Color Gradient**: Notes transition from green (Sa) to red (Saa), making it easy to identify
- **Real-time Playback**: Live animation shows which note is currently playing

### 🔊 Audio Features
- **Musical Notes**: Synthesized musical tones (C4 to C5) for each note
- **Voice Output**: Text-to-speech pronunciation of each note name
- **Toggle Controls**: Easy on/off buttons for sound and voice

### 📚 Lesson Management
- **Multiple Lessons**: Load lessons from text files (scalable)
- **Sarali Varisai**: Pre-loaded basic lesson
- **Jantai Pattern**: Additional lesson for practice
- **Advanced Patterns**: Challenge yourself with complex patterns

### 🎨 User Interface
- **Kid-Friendly Design**: Colorful, interactive interface
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Smooth Animations**: Beautiful transitions and effects
- **Professional Styling**: Modern gradient backgrounds and clean layout

## How to Use

### 1. **Home Page**
   - Click on any lesson button (e.g., "Sarali Varisai", "Jantai")
   - View the 8 notes color reference at the bottom

### 2. **Lesson Page**
   - **Left Panel**: Shows the raw note pattern
   - **Right Panel**: Visual animation area

### 3. **Controls**
   - **▶ Play**: Start playing the lesson
   - **⏹ Stop**: Stop playback at any time
   - **🔊 Sound**: Toggle musical note playback
   - **🎤 Voice**: Toggle voice pronunciation

### 4. **Learning Process**
   - Press Play to start
   - Watch the animation area for visual feedback
   - Each note is highlighted with a yellow outline during playback
   - Listen to the musical tone and voice pronunciation
   - Progress bar shows completion status

## File Structure

```
music_notes/
├── index.html              # Main HTML structure
├── styles.css              # Professional styling
├── script.js               # Application logic & controls
├── lessons/                # Lesson content folder
│   ├── sarali-varisai.txt # Basic Sargam pattern
│   ├── jantai.txt          # Jantai pattern
│   └── advanced-patterns.txt # Advanced exercises
└── README.md              # This file
```

## Adding New Lessons

To add a new lesson:

1. Create a new text file in the `lessons/` folder
2. Write note patterns with notes separated by spaces (one line per pattern)
3. Example: `S R G M P D N Ṡ`
4. Save the file (e.g., `my-lesson.txt`)
5. The app will automatically create a button for your new lesson!

**Lesson File Format:**
- One line per pattern
- Notes separated by spaces
- Use only: S R G M P D N Ṡ
- Example content:
  ```
  S R G M P D N Ṡ
  Ṡ N D P M G R S
  S R G R M
  ```

## Note Mapping

| Letter | Name | Frequency | Color |
|--------|------|-----------|-------|
| S      | Sa   | 261.63 Hz | Green |
| R      | Re   | 293.66 Hz | Green |
| G      | Ga   | 329.63 Hz | Light Green |
| M      | Ma   | 349.23 Hz | Yellow |
| P      | Pa   | 392.00 Hz | Orange |
| D      | Da   | 440.00 Hz | Light Red |
| N      | Ni   | 493.88 Hz | Red |
| Ṡ      | Saa  | 523.25 Hz | Dark Red |

## Technical Details

### Audio System
- **Web Audio API**: Synthesized musical tones with smooth ADSR envelope
- **Text-to-Speech**: Browser's native SpeechSynthesis API for voice

### Performance
- Lightweight: Minimal dependencies, pure HTML/CSS/JavaScript
- Fast Loading: No external libraries required
- Responsive: Adapts to all screen sizes

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support with iOS 14.5+
- Mobile Browsers: Full support

## Customization

### Adjust Playback Speed
Edit `script.js` and change the `tempo` variable in the `playLineNotes()` function:
```javascript
const tempo = 500; // Change this value (in milliseconds)
```

### Change Colors
Edit `styles.css` and modify the note color classes:
```css
.note-letter.S {
    background: #4CAF50; /* Change Green color */
}
```

### Modify Audio Frequencies
Edit `script.js` in the `noteFrequencies` object:
```javascript
const noteFrequencies = {
    'S': 261.63,   // Change frequency (in Hz)
    // ... other notes
};
```

## Tips for Learning

1. **Start Slow**: Begin with the basic Sarali Varisai lesson
2. **Enable Sound**: Keep both sound and voice enabled for best learning
3. **Repeat**: Play each lesson multiple times until you memorize it
4. **Practice Vocally**: Try singing along with the voice pronunciation
5. **Gradual Progress**: Move to advanced patterns after mastering basics

## Known Limitations

- Voice synthesis works best in English-speaking regions
- Some browsers may require user interaction before sound plays
- Mobile speakers produce limited audio quality

## Future Enhancements

Potential features for v2:
- Microphone input for note recognition
- Performance scoring system
- Difficulty levels
- Custom lesson builder
- Playback speed adjustment slider
- MIDI keyboard support
- Sheet music visualization
- Raga-specific lessons

## License

This application is free to use and modify for educational purposes.

## Support

For issues, feedback, or suggestions, please feel free to extend or customize this application based on your needs.

---

**Happy Learning! 🎵 Be patient with yourself and enjoy the journey of learning Sargam!**

# Down Counter Timer

A complete React + Vite countdown timer project with custom hours/minutes/seconds, quick presets, animated countdown ring, and working Start, Pause, Resume, and Reset controls.

## Requirements
- Node.js 18 or newer
- npm

## Run
1. Extract the ZIP.
2. Open the `Down-Counter-Timer` folder in VS Code.
3. Open the terminal in the folder containing `package.json`.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Features
- Enter a custom duration, from seconds to 99 hours.
- Quick presets: 10 seconds, 1 minute, 5 minutes, and 30 minutes.
- Start, pause, resume, and reset work with sensible enabled/disabled states.
- Timer completion displays a success message and attempts a short sound if the browser allows it.
- Countdown uses a deadline, reducing drift when browser intervals are delayed.
- Responsive interface for desktop and mobile.

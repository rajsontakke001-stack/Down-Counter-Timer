import { useEffect, useRef, useState } from "react";
import {
  AlarmClock,
  ArrowLeft,
  Check,
  CirclePause,
  Clock3,
  Hourglass,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";

const PRESETS = [
  { label: "10 sec", seconds: 10, hint: "Quick test" },
  { label: "1 min", seconds: 60, hint: "Short break" },
  { label: "5 min", seconds: 300, hint: "Focus sprint" },
  { label: "30 min", seconds: 1800, hint: "Deep focus" },
];

function formatTime(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

function formatDuration(totalSeconds) {
  const { hours, minutes, seconds } = formatTime(totalSeconds);
  if (Number(hours) > 0) return `${Number(hours)} hr ${Number(minutes)} min`;
  if (Number(minutes) > 0 && Number(seconds) > 0) return `${Number(minutes)} min ${Number(seconds)} sec`;
  if (Number(minutes) > 0) return `${Number(minutes)} min`;
  return `${Number(seconds)} sec`;
}

export default function App() {
  const [hoursInput, setHoursInput] = useState("0");
  const [minutesInput, setMinutesInput] = useState("0");
  const [secondsInput, setSecondsInput] = useState("10");
  const [initialSeconds, setInitialSeconds] = useState(10);
  const [remaining, setRemaining] = useState(10);
  const [status, setStatus] = useState("idle"); // idle | running | paused | finished
  const [showSettings, setShowSettings] = useState(true);
  const deadlineRef = useRef(null);
  const remainingRef = useRef(10);

  useEffect(() => {
    if (status !== "running") return undefined;

    // Deadline-based ticking avoids drifting if the browser throttles intervals.
    deadlineRef.current = Date.now() + remainingRef.current * 1000;
    const intervalId = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      remainingRef.current = next;
      setRemaining(next);
      if (next <= 0) {
        window.clearInterval(intervalId);
        setStatus("finished");
      }
    }, 200);

    return () => window.clearInterval(intervalId);
  }, [status]);

  useEffect(() => {
    if (status === "finished" && typeof window !== "undefined") {
      // A short, unobtrusive browser notification sound using Web Audio when supported.
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const context = new AudioContextClass();
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(880, context.currentTime);
          oscillator.frequency.setValueAtTime(660, context.currentTime + 0.18);
          gain.gain.setValueAtTime(0.0001, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.46);
          window.setTimeout(() => context.close(), 650);
        }
      } catch {
        // Timer completion remains fully functional when audio is blocked.
      }
    }
  }, [status]);

  function getInputSeconds() {
    const hours = Number(hoursInput);
    const minutes = Number(minutesInput);
    const seconds = Number(secondsInput);
    if (![hours, minutes, seconds].every(Number.isFinite)) return null;
    if (![hours, minutes, seconds].every((n) => Number.isInteger(n) && n >= 0)) return null;
    if (minutes > 59 || seconds > 59 || hours > 99) return null;
    const total = hours * 3600 + minutes * 60 + seconds;
    if (total <= 0) return null;
    return total;
  }

  function applyDuration(total) {
    const safe = Math.max(1, Math.min(total, 359999));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;
    setHoursInput(String(hours));
    setMinutesInput(String(minutes));
    setSecondsInput(String(seconds));
    setInitialSeconds(safe);
    setRemaining(safe);
    remainingRef.current = safe;
    setStatus("idle");
    setShowSettings(true);
  }

  function startTimer() {
    const total = status === "paused" ? remainingRef.current : initialSeconds;
    if (status === "paused") {
      if (total <= 0) return;
      setStatus("running");
      setShowSettings(false);
      return;
    }
    const configured = getInputSeconds();
    if (configured === null) {
      setStatus("idle");
      return;
    }
    setInitialSeconds(configured);
    setRemaining(configured);
    remainingRef.current = configured;
    setStatus("running");
    setShowSettings(false);
  }

  function pauseTimer() {
    remainingRef.current = remaining;
    setStatus("paused");
  }

  function resetTimer() {
    setRemaining(initialSeconds);
    remainingRef.current = initialSeconds;
    setStatus("idle");
    setShowSettings(true);
  }

  function handleApply() {
    const total = getInputSeconds();
    if (total === null) return;
    applyDuration(total);
  }

  const inputInvalid = getInputSeconds() === null;
  const time = formatTime(remaining);
  const progress = initialSeconds > 0 ? ((initialSeconds - remaining) / initialSeconds) * 100 : 0;
  const circumference = 2 * Math.PI * 112;
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isFinished = status === "finished";

  return (
    <main className="page-shell">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="app">
        <header className="hero">
          <div className="logo-mark"><Hourglass size={25} /></div>
          <div className="eyebrow"><Sparkles size={13} /> MAKE EVERY SECOND COUNT</div>
          <h1>Down <span>Counter</span></h1>
          <p>Set your time, press start, and let every second bring you closer to done.</p>
        </header>

        <section className="timer-card">
          <div className="card-topline">
            <div className="card-heading">
              <div className="heading-icon"><AlarmClock size={20} /></div>
              <div><h2>Countdown timer</h2><p>Choose a duration and get going</p></div>
            </div>
            <div className={`status-chip ${isRunning ? "chip-running" : isPaused ? "chip-paused" : isFinished ? "chip-finished" : ""}`}>
              <span className="status-dot" />
              {isRunning ? "Running" : isPaused ? "Paused" : isFinished ? "Completed" : "Ready"}
            </div>
          </div>

          {showSettings && (
            <div className="settings-area">
              <div className="section-label"><Settings2 size={15} /> SET TIMER DURATION</div>
              <div className="time-inputs">
                <label className="time-input">
                  <input
                    aria-label="Hours"
                    type="number"
                    min="0"
                    max="99"
                    value={hoursInput}
                    onChange={(e) => setHoursInput(e.target.value)}
                    onBlur={() => setHoursInput((v) => v === "" ? "0" : String(Math.max(0, Math.min(99, Number(v) || 0))))}
                  />
                  <span>Hours</span>
                </label>
                <span className="time-colon">:</span>
                <label className="time-input">
                  <input
                    aria-label="Minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={minutesInput}
                    onChange={(e) => setMinutesInput(e.target.value)}
                    onBlur={() => setMinutesInput((v) => v === "" ? "0" : String(Math.max(0, Math.min(59, Number(v) || 0))))}
                  />
                  <span>Minutes</span>
                </label>
                <span className="time-colon">:</span>
                <label className="time-input">
                  <input
                    aria-label="Seconds"
                    type="number"
                    min="0"
                    max="59"
                    value={secondsInput}
                    onChange={(e) => setSecondsInput(e.target.value)}
                    onBlur={() => setSecondsInput((v) => v === "" ? "0" : String(Math.max(0, Math.min(59, Number(v) || 0))))}
                  />
                  <span>Seconds</span>
                </label>
              </div>
              {inputInvalid && <p className="validation">Enter a duration greater than zero. Minutes and seconds must be 0–59.</p>}
              <div className="preset-label">QUICK SELECT</div>
              <div className="presets">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.seconds}
                    className={`preset ${getInputSeconds() === preset.seconds ? "preset-active" : ""}`}
                    onClick={() => applyDuration(preset.seconds)}
                    type="button"
                  >
                    <strong>{preset.label}</strong><span>{preset.hint}</span>
                  </button>
                ))}
              </div>
              <button className="apply-button" onClick={handleApply} disabled={inputInvalid}>
                <Check size={17} /> Apply duration
              </button>
            </div>
          )}

          {!showSettings && (
            <div className="selected-duration">
              <span>SELECTED DURATION</span>
              <strong>{formatDuration(initialSeconds)}</strong>
              <button onClick={() => setShowSettings(true)} disabled={isRunning}>
                <Settings2 size={14} /> Edit duration
              </button>
            </div>
          )}

          <div className={`timer-stage ${isFinished ? "stage-finished" : ""}`}>
            <div className="timer-ring-wrap">
              <svg className="timer-ring" viewBox="0 0 260 260" role="img" aria-label={`${remaining} seconds remaining`}>
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isFinished ? "#38c99a" : "#9a81ff"} />
                    <stop offset="100%" stopColor={isFinished ? "#159b76" : "#6546dc"} />
                  </linearGradient>
                </defs>
                <circle className="ring-track" cx="130" cy="130" r="112" />
                <circle
                  className="ring-progress"
                  cx="130" cy="130" r="112"
                  stroke="url(#ringGradient)"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress / 100)}
                />
              </svg>
              <div className="timer-center">
                <div className="timer-center-icon">{isFinished ? <Check size={21} /> : <Clock3 size={19} />}</div>
                <div className="digital-time" aria-live="off">
                  <span>{time.hours}</span><i>:</i><span>{time.minutes}</span><i>:</i><span>{time.seconds}</span>
                </div>
                <span className="time-caption">{isFinished ? "TIME'S UP!" : isPaused ? "PAUSED" : isRunning ? "TIME REMAINING" : "READY TO START"}</span>
              </div>
            </div>
            <p className={`timer-message ${isFinished ? "finished-text" : ""}`}>
              {isFinished
                ? "Timer complete — you did it!"
                : isPaused
                ? "Your timer is paused. Resume whenever you're ready."
                : isRunning
                ? "Stay focused. You're doing great."
                : "Your countdown is ready when you are."}
            </p>
          </div>

          <div className="controls">
            {!isRunning ? (
              <button className="primary-control" onClick={startTimer} disabled={isFinished || (status !== "paused" && inputInvalid)}>
                <Play size={18} fill="currentColor" />
                {isPaused ? "Resume timer" : "Start timer"}
              </button>
            ) : (
              <button className="primary-control pause-control" onClick={pauseTimer}>
                <Pause size={18} fill="currentColor" /> Pause timer
              </button>
            )}
            <button className="secondary-control" onClick={resetTimer} disabled={status === "idle" && remaining === initialSeconds}>
              <RotateCcw size={17} /> Reset
            </button>
          </div>

          {isFinished && (
            <div className="completion-banner">
              <div className="completion-check"><Check size={20} /></div>
              <div><strong>Countdown successfully completed</strong><p>Set another duration to start a new timer.</p></div>
              <button onClick={() => { resetTimer(); setShowSettings(true); }} aria-label="Set another timer"><ArrowLeft size={17} /></button>
            </div>
          )}
          <div className="card-footer"><ShieldCheck size={14} /> Runs right in your browser <span>•</span> No sign-up needed</div>
        </section>

        <footer className="page-footer">
          <span className="footer-star">✦</span> One moment at a time. Make it count.
        </footer>
      </div>
    </main>
  );
}

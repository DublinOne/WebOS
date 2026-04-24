import React, { useState, useEffect } from 'react';

const BootScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  
  const playBootSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const masterGain = audioCtx.createGain();
      masterGain.connect(audioCtx.destination);
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);

      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // Nostalgic 4-note chime
      playNote(392.00, audioCtx.currentTime + 0.1, 0.4); // G4
      playNote(523.25, audioCtx.currentTime + 0.3, 0.4); // C5
      playNote(659.25, audioCtx.currentTime + 0.5, 0.4); // E5
      playNote(783.99, audioCtx.currentTime + 0.7, 0.8); // G5
    } catch (e) {
      console.warn('Audio context failed', e);
    }
  };

  const bootLogs = [
    'WEB O-S BIOS v3.2.0',
    'Copyright (C) 2026 Web O-S Corp.',
    '',
    'CPU: WebCore i9-2026 @ 5.40GHz',
    'Memory Test: 65536MB OK',
    'Detecting primary master... SSD 2TB OK',
    'Detecting secondary master... none',
    '',
    'Initializing kernel...',
    'Loading system drivers...',
    '[ OK ] Network Stack',
    '[ OK ] GUI Subsystem',
    '[ OK ] AI Command Bridge',
    '[ OK ] Virtual File System',
    '',
    'Starting Web O-S Services...',
    'Mounting /root/webos...',
    'Starting session manager...',
    'Ready.'
  ];

  useEffect(() => {
    if (!hasStarted) return;
    
    playBootSound();
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    }, 150);
    
    return () => clearInterval(interval);
  }, [onComplete, hasStarted]);

  if (!hasStarted) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[1000]">
        <button 
          onClick={() => setHasStarted(true)}
          className="group flex flex-col items-center gap-4 text-green-500 font-mono"
        >
          <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center group-hover:bg-green-500 group-hover:text-black transition-all animate-pulse">
            <span className="text-2xl">I/O</span>
          </div>
          <span className="text-sm tracking-[0.2em] animate-pulse">POWER ON WEB O-S</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-green-500 font-mono p-8 z-[1000] overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="min-h-[1.5em]">
            {log}
          </div>
        ))}
        <div className="w-2 h-5 bg-green-500 animate-pulse inline-block align-middle ml-1"></div>
      </div>
    </div>
  );
};

export default BootScreen;

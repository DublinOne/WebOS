import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, List, Repeat, Shuffle } from 'lucide-react';
import { FileItem } from '../types';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string;
}

const BUILT_IN_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Dreams',
    artist: 'Web O-S Synth',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop'
  },
  {
    id: '2',
    title: 'Cyberpunk Coffee',
    artist: 'Lofi Bot',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop'
  }
];

interface MediaPlayerProps {
  file?: FileItem;
  addNotification?: (title: string, message: string, type?: any) => void;
}

const MediaPlayer = ({ file, addNotification }: MediaPlayerProps) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const currentTrack = BUILT_IN_TRACKS[currentTrackIndex];

  useEffect(() => {
    if (file && file.mimeType?.startsWith('audio')) {
      // Logic to handle external file if needed
    }
  }, [file]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // AI Global Controls via Window Event
  useEffect(() => {
    const handleAIControl = (e: any) => {
      const { action } = e.detail;
      if (action === 'PLAY') togglePlay();
      if (action === 'PAUSE') {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
      if (action === 'NEXT') handleNext();
    };
    window.addEventListener('media-ai-control', handleAIControl);
    return () => window.removeEventListener('media-ai-control', handleAIControl);
  }, [togglePlay]);

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % BUILT_IN_TRACKS.length);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + BUILT_IN_TRACKS.length) % BUILT_IN_TRACKS.length);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(current || 0);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1b26] text-slate-300 font-sans select-none">
      <div className="flex-1 p-6 flex flex-col items-center justify-center gap-6">
        {/* Vinyl/Cover Art */}
        <div className={`relative w-48 h-48 rounded-full border-8 border-slate-800 shadow-2xl overflow-hidden ${isPlaying ? 'animate-spin-slow' : ''}`}>
          <img src={currentTrack.cover} alt="cover" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-[#1a1b26] rounded-full border-4 border-slate-800"></div>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-white tracking-tight">{currentTrack.title}</h3>
          <p className="text-blue-400 text-sm font-medium uppercase tracking-widest">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Visualizer Simulator */}
      <div className="px-6 h-8 flex items-end gap-1 justify-center mb-4">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="w-1 bg-blue-500/40 rounded-full transition-all duration-150"
            style={{ 
              height: isPlaying ? `${Math.random() * 100}%` : '10%',
              opacity: isPlaying ? 0.4 + Math.random() * 0.6 : 0.2
            }}
          ></div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-slate-900/50 backdrop-blur-xl p-6 border-t border-white/5 space-y-4">
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={(e) => {
              const p = parseFloat(e.target.value);
              setProgress(p);
              if (audioRef.current) audioRef.current.currentTime = (p / 100) * audioRef.current.duration;
            }}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>{Math.floor(audioRef.current?.currentTime || 0)}s</span>
            <span>{Math.floor(audioRef.current?.duration || 0)}s</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500"><Shuffle size={16} /></button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500"><Repeat size={16} /></button>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={handlePrev} className="text-slate-400 hover:text-white transition-colors">
              <SkipBack size={24} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
            </button>
            <button onClick={handleNext} className="text-slate-400 hover:text-white transition-colors">
              <SkipForward size={24} fill="currentColor" />
            </button>
          </div>

          <div className="flex items-center gap-3 w-28">
            <Volume2 size={16} className="text-slate-500" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v / 100;
              }}
              className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
      />
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MediaPlayer;

import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { FileItem } from '../types';

interface MediaPlayerProps {
  file?: FileItem;
}

const MediaPlayer = ({ file }: MediaPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const mediaRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
  }, [file]);

  if (!file) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-900">
      <Music size={48} className="mb-4 opacity-20" />
      <p>Select a media file from File Explorer to play</p>
    </div>
  );

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) mediaRef.current.pause();
      else mediaRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      const current = (mediaRef.current.currentTime / mediaRef.current.duration) * 100;
      setProgress(current || 0);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (mediaRef.current) {
      mediaRef.current.currentTime = (newProgress / 100) * mediaRef.current.duration;
    }
  };

  const isVideo = file.mimeType?.startsWith('video');

  return (
    <div className="h-full flex flex-col bg-black text-white">
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
        {isVideo ? (
          <video
            ref={mediaRef}
            src={file.url}
            className="max-w-full max-h-full"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-48 h-48 bg-blue-600/20 rounded-full flex items-center justify-center animate-pulse">
              <Music size={80} className="text-blue-500" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold truncate max-w-xs">{file.name}</h3>
              <p className="text-slate-400 text-sm">Now Playing</p>
            </div>
            <audio
              ref={mediaRef}
              src={file.url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        )}
      </div>

      <div className="bg-slate-900/90 backdrop-blur-md p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-400">
            {mediaRef.current ? Math.floor(mediaRef.current.currentTime) : 0}s
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleProgressChange}
            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-[10px] font-mono text-slate-400">
            {mediaRef.current ? Math.floor(mediaRef.current.duration || 0) : 0}s
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white transition-colors">
              <SkipBack size={20} />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
            </button>
            <button className="text-slate-400 hover:text-white transition-colors">
              <SkipForward size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 w-32">
            <Volume2 size={16} className="text-slate-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setVolume(v);
                if (mediaRef.current) mediaRef.current.volume = v / 100;
              }}
              className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;

"use client";

import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Mic2, ListMusic, MonitorSpeaker, Volume2, Maximize2, Heart } from "lucide-react";
import Image from "next/image";
import { usePlayer } from "@/hooks/use-player";

export function PlayerBar() {
  const { currentTrack, isPlaying, currentTime, duration, playMode, volume, togglePlay, seek, playNext, playPrevious, setPlayMode, setVolume } = usePlayer();

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    setVolume(percentage);
  };

  return (
    <div className="h-[90px] bg-black px-4 flex items-center justify-between border-t border-[#282828]">
      {/* Left: Now Playing */}
      <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
        <div className="w-14 h-14 rounded-md overflow-hidden relative flex-shrink-0 group cursor-pointer bg-[#282828]">
          {currentTrack ? (
            <img src={currentTrack.coverUrl} alt={currentTrack.name} className="w-full h-full object-cover" />
          ) : null}
        </div>
        <div className="flex flex-col justify-center overflow-hidden">
          {currentTrack ? (
            <>
              <a href="#" className="text-sm text-white hover:underline truncate">
                {currentTrack.name}
              </a>
              <a href="#" className="text-xs text-[#b3b3b3] hover:underline hover:text-white truncate">
                {currentTrack.artist}
              </a>
            </>
          ) : (
            <div className="text-sm text-[#b3b3b3]">未在播放</div>
          )}
        </div>
        <button className={`text-[#b3b3b3] hover:text-white transition ${!currentTrack && "opacity-50 cursor-not-allowed"}`} disabled={!currentTrack}>
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center justify-center max-w-[722px] w-[40%] gap-2">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setPlayMode(playMode === 'sequence' ? 'loop' : playMode === 'loop' ? 'shuffle' : 'sequence')}
            className={`text-[#b3b3b3] hover:text-white transition ${!currentTrack && "opacity-50 cursor-not-allowed"} ${playMode !== 'sequence' && 'text-[#1db954]'}`} 
            disabled={!currentTrack}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button 
            onClick={playPrevious}
            className={`text-[#b3b3b3] hover:text-white transition ${!currentTrack && "opacity-50 cursor-not-allowed"}`} 
            disabled={!currentTrack}
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={togglePlay}
            disabled={!currentTrack}
            className={`w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition ${!currentTrack && "opacity-50 cursor-not-allowed"}`}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
          <button 
            onClick={playNext}
            className={`text-[#b3b3b3] hover:text-white transition ${!currentTrack && "opacity-50 cursor-not-allowed"}`} 
            disabled={!currentTrack}
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={() => setPlayMode(playMode === 'loop' ? 'sequence' : 'loop')}
            className={`text-[#b3b3b3] hover:text-white transition ${!currentTrack && "opacity-50 cursor-not-allowed"} ${playMode === 'loop' && 'text-[#1db954]'}`} 
            disabled={!currentTrack}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-[600px]">
          <span className="text-xs text-[#b3b3b3] w-10 text-right">{formatTime(currentTime)}</span>
          <div 
            className={`flex-1 h-1 bg-[#4d4d4d] rounded-full group cursor-pointer flex items-center ${!currentTrack && "pointer-events-none"}`}
            onClick={handleSeek}
            onTouchStart={handleSeek}
          >
            <div 
              className="h-full bg-white group-hover:bg-[#1db954] rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow" />
            </div>
          </div>
          <span className="text-xs text-[#b3b3b3] w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Extra Controls */}
      <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px] text-[#b3b3b3]">
        <button className="hover:text-white transition"><Mic2 className="w-4 h-4" /></button>
        <button className="hover:text-white transition"><ListMusic className="w-4 h-4" /></button>
        <button className="hover:text-white transition"><MonitorSpeaker className="w-4 h-4" /></button>
        <div className="flex items-center gap-2 w-24 group">
          <button 
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
            className="hover:text-white transition"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <div 
            className="flex-1 h-1 bg-[#4d4d4d] rounded-full cursor-pointer flex items-center"
            onClick={handleVolumeChange}
            onTouchStart={handleVolumeChange}
          >
            <div 
              className="h-full bg-white group-hover:bg-[#1db954] rounded-full relative"
              style={{ width: `${volume * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow" />
            </div>
          </div>
        </div>
        <button className="hover:text-white transition"><Maximize2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
}


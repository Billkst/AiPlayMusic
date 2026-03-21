import { Play, SkipBack, SkipForward, Shuffle, Repeat, Mic2, ListMusic, MonitorSpeaker, Volume2, Maximize2, Heart } from "lucide-react";
import Image from "next/image";

export function PlayerBar() {
  return (
    <div className="h-[90px] bg-black px-4 flex items-center justify-between border-t border-[#282828]">
      {/* Left: Now Playing */}
      <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
        <div className="w-14 h-14 rounded-md overflow-hidden relative flex-shrink-0 group cursor-pointer">
          <Image src="https://picsum.photos/seed/nowplaying/100/100" alt="Now Playing" fill className="object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="flex flex-col justify-center overflow-hidden">
          <a href="#" className="text-sm text-white hover:underline truncate">
            夜曲 (Nocturne)
          </a>
          <a href="#" className="text-xs text-[#b3b3b3] hover:underline hover:text-white truncate">
            周杰伦 (Jay Chou)
          </a>
        </div>
        <button className="text-[#b3b3b3] hover:text-white transition">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center justify-center max-w-[722px] w-[40%] gap-2">
        <div className="flex items-center gap-6">
          <button className="text-[#b3b3b3] hover:text-white transition">
            <Shuffle className="w-4 h-4" />
          </button>
          <button className="text-[#b3b3b3] hover:text-white transition">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
          <button className="text-[#b3b3b3] hover:text-white transition">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button className="text-[#b3b3b3] hover:text-white transition">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-[600px]">
          <span className="text-xs text-[#b3b3b3] w-10 text-right">1:23</span>
          <div className="flex-1 h-1 bg-[#4d4d4d] rounded-full group cursor-pointer flex items-center">
            <div className="h-full bg-white group-hover:bg-[#1db954] w-1/3 rounded-full relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow" />
            </div>
          </div>
          <span className="text-xs text-[#b3b3b3] w-10">4:56</span>
        </div>
      </div>

      {/* Right: Extra Controls */}
      <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px] text-[#b3b3b3]">
        <button className="hover:text-white transition"><Mic2 className="w-4 h-4" /></button>
        <button className="hover:text-white transition"><ListMusic className="w-4 h-4" /></button>
        <button className="hover:text-white transition"><MonitorSpeaker className="w-4 h-4" /></button>
        <div className="flex items-center gap-2 w-24 group">
          <button className="hover:text-white transition"><Volume2 className="w-4 h-4" /></button>
          <div className="flex-1 h-1 bg-[#4d4d4d] rounded-full cursor-pointer flex items-center">
            <div className="h-full bg-white group-hover:bg-[#1db954] w-2/3 rounded-full relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow" />
            </div>
          </div>
        </div>
        <button className="hover:text-white transition"><Maximize2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

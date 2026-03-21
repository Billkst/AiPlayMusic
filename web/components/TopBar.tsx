import { Home, Search, Bell, Users, Sparkles } from "lucide-react";

export function TopBar({ onOpenChat }: { onOpenChat?: () => void }) {
  return (
    <div className="h-16 w-full flex items-center justify-between px-4 bg-black">
      {/* Left: Logo */}
      <div className="flex items-center w-[350px] lg:w-[420px]">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      </div>

      {/* Center: Home & Search */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        <button className="w-12 h-12 rounded-full bg-[#1f1f1f] hover:scale-105 transition flex items-center justify-center text-white flex-shrink-0">
          <Home className="w-6 h-6" />
        </button>
        <div className="flex items-center bg-[#1f1f1f] hover:bg-[#2a2a2a] hover:border-[#333] border border-transparent transition rounded-full px-4 h-12 group w-[480px]">
          <Search className="w-6 h-6 text-[#b3b3b3] group-hover:text-white transition mr-3" />
          <input 
            type="text" 
            placeholder="想播放什么？" 
            className="bg-transparent border-none outline-none text-white text-base w-full placeholder:text-[#b3b3b3]"
          />
          <div className="w-[1px] h-6 bg-[#333] mx-3"></div>
          <button className="text-[#b3b3b3] hover:text-white transition">
            <BrowseIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* AI Button */}
        <button 
          onClick={onOpenChat}
          className="ml-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white px-4 h-12 rounded-full text-sm font-bold hover:scale-105 transition flex items-center gap-2 shadow-lg shadow-purple-500/20 flex-shrink-0"
        >
          <Sparkles className="w-5 h-5" />
          AI 推荐
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 justify-end w-[350px] lg:w-[420px]">
        <button className="bg-white text-black text-sm font-bold px-4 py-1.5 rounded-full hover:scale-105 transition">
          探索 Premium
        </button>
        <button className="text-white text-sm font-bold px-4 py-1.5 rounded-full hover:scale-105 transition flex items-center gap-1">
          <ArrowDownToLine className="w-4 h-4" />
          安装应用
        </button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:scale-105 transition">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:scale-105 transition">
          <Users className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-105 transition p-1">
          <div className="w-full h-full rounded-full bg-[#c084fc] text-black flex items-center justify-center text-xs font-bold">
            B
          </div>
        </button>
      </div>
    </div>
  );
}

function ArrowDownToLine(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 17V3" />
      <path d="m6 11 6 6 6-6" />
      <path d="M19 21H5" />
    </svg>
  );
}

function BrowseIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

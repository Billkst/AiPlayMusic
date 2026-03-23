import { Home, Search, Bell, Users, Sparkles } from "lucide-react";

export function TopBar({ onOpenChat }: { onOpenChat?: () => void }) {
  return (
    <div className="h-16 w-full flex items-center justify-between px-4 bg-black">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 w-[350px] lg:w-[420px]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">AiPlayMusic</span>
        </div>
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
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:scale-105 transition">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 text-white hover:scale-105 transition text-xs font-bold">
          AI
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

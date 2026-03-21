"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";
import { PlayerBar } from "@/components/PlayerBar";
import { TopBar } from "@/components/TopBar";
import { AIChatPanel } from "@/components/AIChatPanel";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col bg-black overflow-hidden font-sans">
      <TopBar onOpenChat={() => setIsChatOpen(true)} />
      {/* Top Section */}
      <div className="flex-1 flex overflow-hidden px-2 pb-2 gap-2">
        <Sidebar />
        <MainContent />
        {isChatOpen && <AIChatPanel onClose={() => setIsChatOpen(false)} />}
      </div>

      {/* Bottom Player */}
      <PlayerBar />
    </div>
  );
}

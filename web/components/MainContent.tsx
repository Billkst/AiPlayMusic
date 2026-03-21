import { Play } from "lucide-react";
import Image from "next/image";

export function MainContent() {
  return (
    <div className="flex-1 bg-[#121212] rounded-lg overflow-y-auto relative flex flex-col">
      {/* Top Gradient */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#2a2a2a] to-[#121212] pointer-events-none" />

      {/* Content */}
      <div className="p-6 flex flex-col gap-8 relative z-10">
        {/* Filters */}
        <div className="flex gap-2">
          <button className="bg-white text-black text-sm px-3 py-1.5 rounded-full transition">
            全部
          </button>
          <button className="bg-[#2a2a2a] hover:bg-[#333] text-white text-sm px-3 py-1.5 rounded-full transition">
            音乐
          </button>
          <button className="bg-[#2a2a2a] hover:bg-[#333] text-white text-sm px-3 py-1.5 rounded-full transition">
            播客
          </button>
        </div>

        {/* Shelves */}
        <Shelf title="热门电台" seed="radio" />
        <Shelf title="当红艺人" seed="artist" isCircle />
        <Shelf title="最近播放" seed="recent" />

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#282828] flex flex-col gap-8 pb-20">
          <div className="flex flex-wrap justify-between gap-8">
            <div className="flex gap-16">
              <div className="flex flex-col gap-4">
                <h3 className="text-white font-bold">公司</h3>
                <a href="#" className="text-[#b3b3b3] hover:text-white hover:underline text-sm">关于</a>
                <a href="#" className="text-[#b3b3b3] hover:text-white hover:underline text-sm">工作机会</a>
                <a href="#" className="text-[#b3b3b3] hover:text-white hover:underline text-sm">For the Record</a>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-white font-bold">社区</h3>
                <a href="#" className="text-[#b3b3b3] hover:text-white hover:underline text-sm">面向艺人</a>
                <a href="#" className="text-[#b3b3b3] hover:text-white hover:underline text-sm">开发者</a>
                <a href="#" className="text-[#b3b3b3] hover:text-white hover:underline text-sm">广告</a>
                <a href="#" className="text-[#b3b3b3] hover:text-white hover:underline text-sm">投资者</a>
                <a href="#" className="text-[#b3b3b3] hover:text-white hover:underline text-sm">供应商</a>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-white font-bold">有用链接</h3>
                <a href="#" className="text-[#b3b3b3] hover:text-white hover:underline text-sm">支持</a>
                <a href="#" className="text-[#b3b3b3] hover:text-white hover:underline text-sm">免费的移动应用</a>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-[#292929] hover:bg-[#727272] transition flex items-center justify-center text-white">
                <InstagramIcon className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#292929] hover:bg-[#727272] transition flex items-center justify-center text-white">
                <TwitterIcon className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#292929] hover:bg-[#727272] transition flex items-center justify-center text-white">
                <FacebookIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-[#b3b3b3]">
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">法律</a>
              <a href="#" className="hover:text-white">隐私中心</a>
              <a href="#" className="hover:text-white">隐私政策</a>
              <a href="#" className="hover:text-white">Cookie</a>
              <a href="#" className="hover:text-white">关于广告</a>
              <a href="#" className="hover:text-white">无障碍</a>
            </div>
            <span>© 2026 Spotify AB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstagramIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function TwitterIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  );
}

function FacebookIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function Shelf({ title, seed, isCircle }: { title: string, seed: string, isCircle?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">{title}</h2>
        <span className="text-sm font-bold text-[#b3b3b3] hover:underline cursor-pointer">显示全部</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[#181818] hover:bg-[#282828] p-4 rounded-md flex flex-col gap-4 group transition cursor-pointer">
            <div className={`w-full aspect-square relative overflow-hidden shadow-lg ${isCircle ? 'rounded-full' : 'rounded-md'}`}>
              <Image src={`https://picsum.photos/seed/${seed}${i}/300/300`} alt="Cover" fill className="object-cover" referrerPolicy="no-referrer" />
              <button className={`absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1db954] flex items-center justify-center text-black opacity-0 group-hover:opacity-100 shadow-xl hover:scale-105 transition-all translate-y-2 group-hover:translate-y-0 ${isCircle ? 'bottom-4 right-4' : ''}`}>
                <Play className="w-6 h-6 fill-current ml-1" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white font-bold truncate">精选内容 {i + 1}</span>
              <span className="text-sm text-[#b3b3b3] line-clamp-2">
                {isCircle ? '艺人' : '汇集最新最热的流行音乐，让你一次听个够。'}
              </span>
            </div>
          </div>
        ))}
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

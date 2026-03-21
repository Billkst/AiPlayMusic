"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, Loader2, Settings, Key } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
  options?: string[];
}

export function AIChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: '👋 你好！我是你的 AI 音乐助手。今天想听点什么？',
      options: ['🎧 专注工作', '🧘 放松休息', '🏃‍♂️ 运动健身', '🎲 随便听听']
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Config states
  const [showConfig, setShowConfig] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [customModel, setCustomModel] = useState('gemini-3.1-flash-preview');
  const [tempModel, setTempModel] = useState('gemini-3.1-flash-preview');

  useEffect(() => {
    const storedKey = localStorage.getItem('custom_gemini_api_key') || '';
    const storedModel = localStorage.getItem('custom_gemini_model') || 'gemini-3.1-flash-preview';
    
    setCustomApiKey(storedKey);
    setTempApiKey(storedKey);
    setCustomModel(storedModel);
    setTempModel(storedModel);
    
    initChat(storedKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '', storedModel);
  }, []);

  const initChat = (key: string, model: string) => {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const aiModel = genAI.getGenerativeModel({
        model: model,
        systemInstruction: `你是一个专业的 Spotify AI 音乐推荐助手。
你的目标是通过对话了解用户的喜好、当前的心情或场景，并为他们推荐合适的音乐。
请主动引导用户，每次回答后，必须提供 3-4 个简短的选项供用户快速点击选择。
格式要求：在你的回复的最后一行，必须严格按照以下格式输出选项（必须是合法的 JSON 数组）：
OPTIONS: ["选项1", "选项2", "选项3"]
当你收集到足够的信息后，请推荐 3-5 首具体的歌曲（包含歌手名），并简述推荐理由。`
      });
      chatRef.current = aiModel.startChat();
    } catch (error) {
      console.error("Failed to initialize chat:", error);
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('custom_gemini_api_key', tempApiKey);
    localStorage.setItem('custom_gemini_model', tempModel);
    setCustomApiKey(tempApiKey);
    setCustomModel(tempModel);
    initChat(tempApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '', tempModel);
    setShowConfig(false);
    
    // Optional: Add a system message to confirm
    setMessages(prev => [...prev, { 
      role: 'model', 
      text: `⚙️ 配置已更新！当前使用模型：**${tempModel}**。有什么我可以帮你的吗？` 
    }]);
  };

  useEffect(() => {
    if (!showConfig) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, showConfig]);

  const extractOptions = (text: string) => {
    const match = text.match(/OPTIONS:\s*(\[[\s\S]*?\])/);
    if (match) {
      try {
        const options = JSON.parse(match[1]);
        const cleanText = text.replace(/OPTIONS:\s*\[[\s\S]*?\]/, '').trim();
        return { cleanText, options };
      } catch (e) {
        return { cleanText: text, options: [] };
      }
    }
    return { cleanText: text, options: [] };
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading || !chatRef.current) return;

    const newMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessage(text);
      const response = await result.response;
      const responseText = response.text();
      const { cleanText, options } = extractOptions(responseText);
      setMessages([...newMessages, { role: 'model', text: cleanText, options }]);
    } catch (error: any) {
      console.error(error);
      let errorMsg = '抱歉，我遇到了一些问题，请稍后再试。';
      if (error?.message?.includes('API key not valid') || error?.status === 400 || error?.status === 401 || error?.status === 403) {
        errorMsg = 'API 请求失败，可能是 API Key 无效或未配置。请点击右上角设置图标检查你的 API Key。';
      }
      setMessages([...newMessages, { role: 'model', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[350px] lg:w-[420px] bg-[#121212] rounded-lg flex flex-col overflow-hidden border border-[#282828] shadow-2xl flex-shrink-0 animate-in slide-in-from-right-8 duration-300">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-[#282828] bg-gradient-to-r from-[#1f1f1f] to-[#121212]">
        <div className="flex items-center gap-2 text-white font-bold">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span>AI 音乐助手</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              setShowConfig(!showConfig);
              if (!showConfig) {
                setTempApiKey(customApiKey);
                setTempModel(customModel);
              }
            }} 
            className={`text-[#b3b3b3] hover:text-white transition p-1.5 rounded-full hover:bg-[#2a2a2a] ${showConfig ? 'bg-[#2a2a2a] text-white' : ''}`}
            title="API 配置"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="text-[#b3b3b3] hover:text-white transition p-1.5 rounded-full hover:bg-[#2a2a2a]">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showConfig ? (
        /* Config View */
        <div className="flex-1 p-6 flex flex-col gap-6 bg-[#121212] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Key className="w-5 h-5 text-[#1db954]" />
              API 配置
            </h3>
            <p className="text-sm text-[#b3b3b3] leading-relaxed">
              自定义你的 Gemini API Key 和模型。如果 API Key 留空，将使用系统默认提供的 Key。
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white">Gemini API Key</label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="bg-[#242424] border border-[#333] focus:border-[#1db954] rounded-md px-3 py-2.5 text-white text-sm outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white">模型 (Model)</label>
              <select
                value={tempModel}
                onChange={(e) => setTempModel(e.target.value)}
                className="bg-[#242424] border border-[#333] focus:border-[#1db954] rounded-md px-3 py-2.5 text-white text-sm outline-none transition appearance-none cursor-pointer"
              >
                <option value="gemini-3.1-flash-preview">Gemini 3.1 Flash (推荐)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                <option value="gemini-3-flash-preview">Gemini 3.0 Flash</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-auto pt-4">
            <button
              onClick={() => setShowConfig(false)}
              className="flex-1 py-2.5 rounded-full border border-[#555] text-white font-bold text-sm hover:border-white hover:bg-[#2a2a2a] transition"
            >
              取消
            </button>
            <button
              onClick={handleSaveConfig}
              className="flex-1 py-2.5 rounded-full bg-[#1db954] text-black font-bold text-sm hover:scale-105 transition"
            >
              保存配置
            </button>
          </div>
        </div>
      ) : (
        /* Chat View */
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex gap-3 max-w-[95%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#c084fc] text-black' : 'bg-[#1db954] text-black'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#2a2a2a] text-white rounded-tr-sm' : 'bg-transparent text-white'}`}>
                    {msg.role === 'user' ? (
                      <p className="text-sm">{msg.text}</p>
                    ) : (
                      <div className="text-sm prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-[#1db954]">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Options Cards */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1 ml-11">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(opt)}
                        disabled={isLoading}
                        className="bg-[#242424] hover:bg-[#333] border border-[#333] text-white text-xs px-3 py-2 rounded-xl transition text-left disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[90%] items-start">
                <div className="w-8 h-8 rounded-full bg-[#1db954] text-black flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-3 rounded-2xl text-[#b3b3b3] flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">正在思考...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[#282828] bg-[#181818]">
            <div className="flex items-center bg-[#242424] rounded-full p-1 pr-2 border border-transparent focus-within:border-[#555] transition">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="告诉 AI 你想听什么..."
                className="flex-1 bg-transparent border-none outline-none text-white text-sm px-4 py-2 placeholder:text-[#b3b3b3]"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-full bg-[#1db954] text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition flex-shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

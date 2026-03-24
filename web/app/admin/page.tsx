"use client"

import { useState, useEffect } from 'react'
import { Lock, Save, Eye, EyeOff, Sparkles, Check, AlertCircle, Users, Activity, Settings } from 'lucide-react'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState('deepseek')
  const [model, setModel] = useState('deepseek-chat')
  const [rateLimit, setRateLimit] = useState(20)
  const [rateLimitWindow, setRateLimitWindow] = useState(24)
  const [showApiKey, setShowApiKey] = useState(false)
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [stats, setStats] = useState({ totalUsers: 0, totalRequests: 0, limit: 20 })
  const [activeTab, setActiveTab] = useState('config')

  const handleLogin = async () => {
    if (!password) {
      setLoginError('请输入密码')
      return
    }
    
    try {
      const res = await fetch('/api/admin/config', {
        headers: { 'x-admin-password': password }
      })
      
      if (res.ok) {
        setIsLoggedIn(true)
        setLoginError('')
        const data = await res.json()
        setProvider(data.provider)
        setModel(data.model)
        setRateLimit(data.rateLimit || 20)
        setRateLimitWindow(data.rateLimitWindow || 24)
        loadStats()
      } else {
        setLoginError('密码错误')
      }
    } catch (err) {
      setLoginError('登录失败')
    }
  }

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-password': password }
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('加载统计失败', err)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(loadStats, 10000)
      return () => clearInterval(interval)
    }
  }, [isLoggedIn])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ apiKey, provider, model, rateLimit, rateLimitWindow })
      })
      if (res.ok) {
        setMessage('success')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('error')
      }
    } catch (err) {
      setMessage('error')
    }
    setIsSaving(false)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-3xl p-10 border border-purple-500/20 shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/50">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">管理控制台</h1>
              <p className="text-purple-300">AiPlayMusic Admin</p>
            </div>
            
            {loginError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {loginError}
              </div>
            )}
            
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="输入管理员密码"
              className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 text-white text-lg placeholder:text-white/40 outline-none focus:border-purple-500 focus:bg-white/10 transition-all mb-4"
            />
            
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-2xl hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all text-lg"
            >
              解锁访问
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Sparkles className="w-10 h-10 text-purple-400" />
            <h1 className="text-5xl font-bold text-white">管理控制台</h1>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'stats'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Activity className="w-5 h-5" />
            使用统计
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'config'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Settings className="w-5 h-5" />
            系统配置
          </button>
        </div>

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-purple-400" />
                <h3 className="text-white/80 text-sm font-medium">今日访客</h3>
              </div>
              <p className="text-4xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-6 h-6 text-blue-400" />
                <h3 className="text-white/80 text-sm font-medium">今日请求</h3>
              </div>
              <p className="text-4xl font-bold text-white">{stats.totalRequests}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-6 h-6 text-green-400" />
                <h3 className="text-white/80 text-sm font-medium">每日限额</h3>
              </div>
              <p className="text-4xl font-bold text-white">{stats.limit}</p>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <>
            {message && (
              <div className={`mb-6 rounded-2xl p-4 border flex items-center gap-3 ${
                message === 'success' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <Check className="w-5 h-5" />
                <span className="font-medium">
                  {message === 'success' ? '✅ 配置保存成功' : '❌ 保存失败'}
                </span>
              </div>
            )}

            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-3xl p-10 border border-purple-500/20 shadow-2xl space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">API 配置</h2>
              
              <div>
                <label className="block text-white text-base font-semibold mb-3">AI 提供商</label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 text-white text-lg outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                >
                  <option value="deepseek" className="bg-black">DeepSeek</option>
                  <option value="openai" className="bg-black">OpenAI</option>
                  <option value="anthropic" className="bg-black">Anthropic (Claude)</option>
                  <option value="google" className="bg-black">Google (Gemini)</option>
                  <option value="moonshot" className="bg-black">Moonshot (Kimi)</option>
                  <option value="zhipu" className="bg-black">智谱 AI (GLM)</option>
                  <option value="qwen" className="bg-black">通义千问</option>
                  <option value="doubao" className="bg-black">豆包</option>
                  <option value="baichuan" className="bg-black">百川智能</option>
                  <option value="minimax" className="bg-black">MiniMax</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-base font-semibold mb-3">模型名称</label>
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="deepseek-chat"
                  className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 text-white text-lg placeholder:text-white/40 outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-white text-base font-semibold mb-3">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 pr-14 text-white text-lg placeholder:text-white/40 outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-xl font-bold text-white mb-4">访客限流配置</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-base font-semibold mb-3">每日限额（次）</label>
                    <input
                      type="number"
                      value={rateLimit}
                      onChange={e => setRateLimit(Number(e.target.value))}
                      min="1"
                      className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 text-white text-lg outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-base font-semibold mb-3">重置周期（小时）</label>
                    <input
                      type="number"
                      value={rateLimitWindow}
                      onChange={e => setRateLimitWindow(Number(e.target.value))}
                      min="1"
                      className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 text-white text-lg outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-5 rounded-2xl hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
              >
                {isSaving ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    保存配置
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

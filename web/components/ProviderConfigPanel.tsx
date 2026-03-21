"use client"

import { useEffect, useMemo, useState } from 'react'
import { AI_PROVIDERS } from '@/lib/providers'

interface ProviderConfigPanelProps {
  onClose: () => void
  onSave: () => void
}

const STORAGE_KEYS = {
  providerId: 'ai_provider_id',
  apiKey: 'ai_api_key',
  model: 'ai_model',
} as const

export function ProviderConfigPanel({ onClose, onSave }: ProviderConfigPanelProps) {
  const defaultProvider = AI_PROVIDERS[0]
  const [providerId, setProviderId] = useState(defaultProvider.id)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState(defaultProvider.defaultModels[0])

  const selectedProvider = useMemo(
    () => AI_PROVIDERS.find(provider => provider.id === providerId) ?? defaultProvider,
    [defaultProvider, providerId]
  )

  const isCustomModel = !selectedProvider.defaultModels.includes(model)

  useEffect(() => {
    const storedProviderId = localStorage.getItem(STORAGE_KEYS.providerId)
    const storedApiKey = localStorage.getItem(STORAGE_KEYS.apiKey)
    const storedModel = localStorage.getItem(STORAGE_KEYS.model)

    const initialProvider =
      AI_PROVIDERS.find(provider => provider.id === storedProviderId) ?? defaultProvider
    const initialModel = storedModel || initialProvider.defaultModels[0]

    setProviderId(initialProvider.id)
    setApiKey(storedApiKey || '')
    setModel(initialModel)
  }, [defaultProvider])

  const handleProviderChange = (nextProviderId: string) => {
    const nextProvider =
      AI_PROVIDERS.find(provider => provider.id === nextProviderId) ?? defaultProvider
    setProviderId(nextProvider.id)

    if (!isCustomModel) {
      setModel(nextProvider.defaultModels[0])
    }
  }

  const handleSave = () => {
    const finalModel = model.trim() || selectedProvider.defaultModels[0]

    localStorage.setItem(STORAGE_KEYS.providerId, providerId)
    localStorage.setItem(STORAGE_KEYS.apiKey, apiKey.trim())
    localStorage.setItem(STORAGE_KEYS.model, finalModel)

    onSave()
  }

  return (
    <div className="flex-1 p-5 bg-[#121212] flex flex-col gap-5 overflow-y-auto">
      <div className="space-y-2">
        <h3 className="text-white text-lg font-bold">AI 提供商配置</h3>
        <p className="text-sm text-[#b3b3b3]">
          选择 API 服务商并填写 Key，模型可直接选预设，也可以手动输入自定义模型名。
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white">提供商</label>
          <select
            value={providerId}
            onChange={event => handleProviderChange(event.target.value)}
            className="w-full bg-[#1f1f1f] border border-[#333] rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-[#1db954]"
          >
            {AI_PROVIDERS.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={event => setApiKey(event.target.value)}
            placeholder="输入你的 API Key"
            className="w-full bg-[#1f1f1f] border border-[#333] rounded-md px-3 py-2.5 text-sm text-white placeholder:text-[#777] outline-none focus:border-[#1db954]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white">模型（预设）</label>
          <select
            value={isCustomModel ? '__custom__' : model}
            onChange={event => {
              if (event.target.value === '__custom__') {
                setModel('')
                return
              }
              setModel(event.target.value)
            }}
            className="w-full bg-[#1f1f1f] border border-[#333] rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-[#1db954]"
          >
            {selectedProvider.defaultModels.map(defaultModel => (
              <option key={defaultModel} value={defaultModel}>
                {defaultModel}
              </option>
            ))}
            <option value="__custom__">自定义模型</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white">模型（自定义）</label>
          <input
            type="text"
            value={model}
            onChange={event => setModel(event.target.value)}
            placeholder="例如：gpt-4.1-mini"
            className="w-full bg-[#1f1f1f] border border-[#333] rounded-md px-3 py-2.5 text-sm text-white placeholder:text-[#777] outline-none focus:border-[#1db954]"
          />
        </div>
      </div>

      <div className="mt-auto flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-full border border-[#555] py-2.5 text-sm font-bold text-white hover:bg-[#2a2a2a] transition"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          className="flex-1 rounded-full bg-[#1db954] py-2.5 text-sm font-bold text-black hover:scale-[1.02] transition"
        >
          保存配置
        </button>
      </div>
    </div>
  )
}

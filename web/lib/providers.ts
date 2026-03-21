export interface AIProvider {
  id: string
  name: string
  baseUrl: string
  defaultModels: string[]
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    defaultModels: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com',
    defaultModels: ['gpt-4o', 'gpt-4o-mini'],
  },
  {
    id: 'moonshot',
    name: 'Moonshot (Kimi)',
    baseUrl: 'https://api.moonshot.cn',
    defaultModels: ['moonshot-v1-8k', 'moonshot-v1-32k'],
  },
  {
    id: 'zhipu',
    name: '智谱 (GLM)',
    baseUrl: 'https://open.bigmodel.cn/api/paas',
    defaultModels: ['glm-4-flash', 'glm-4'],
  },
  {
    id: 'qwen',
    name: '通义千问 (Qwen)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode',
    defaultModels: ['qwen-turbo', 'qwen-plus'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModels: ['gemini-2.0-flash', 'gemini-2.5-flash-preview-05-20'],
  },
]

export function getProviderById(id: string): AIProvider | undefined {
  return AI_PROVIDERS.find(p => p.id === id)
}

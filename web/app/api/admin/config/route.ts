import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { updateRateLimit } from '@/lib/rate-limiter'

const CONFIG_FILE = join(process.cwd(), '.admin-config.json')
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

interface AdminConfig {
  apiKey: string
  provider: string
  model: string
  rateLimit?: number
  rateLimitWindow?: number
}

// 读取配置
async function getConfig(): Promise<AdminConfig> {
  try {
    const data = await readFile(CONFIG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { 
      apiKey: '', 
      provider: 'deepseek', 
      model: 'deepseek-chat',
      rateLimit: 20,
      rateLimitWindow: 24
    }
  }
}

// 保存配置
async function saveConfig(config: AdminConfig) {
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2))
}

// 验证密码
function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

// GET - 获取配置
export async function GET(request: NextRequest) {
  const password = request.headers.get('x-admin-password')
  
  if (!verifyPassword(password || '')) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }
  
  const config = await getConfig()
  return NextResponse.json({ ...config, apiKey: config.apiKey ? '***' : '' })
}

// POST - 保存配置
export async function POST(request: NextRequest) {
  const password = request.headers.get('x-admin-password')
  
  if (!verifyPassword(password || '')) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }
  
  const body = await request.json()
  await saveConfig(body)
  
  if (body.rateLimit && body.rateLimitWindow) {
    updateRateLimit(body.rateLimit, body.rateLimitWindow)
  }
  
  return NextResponse.json({ success: true })
}

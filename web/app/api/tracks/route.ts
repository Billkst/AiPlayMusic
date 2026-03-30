import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tracks')
    .select('*')
    .eq('is_active', true)
  
  return NextResponse.json(data || [])
}

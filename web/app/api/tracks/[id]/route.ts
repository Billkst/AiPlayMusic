import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', id)
    .single()
  
  if (!data) {
    return NextResponse.json({ error: 'Track not found' }, { status: 404 })
  }
  
  return NextResponse.json(data)
}

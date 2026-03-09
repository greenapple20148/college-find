import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ collegeId: string }> }
) {
    const { collegeId } = await params
    const supabase = createServiceClient()

    const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('college_id', collegeId)
        .order('amount', { ascending: false, nullsFirst: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [], total: (data ?? []).length })
}

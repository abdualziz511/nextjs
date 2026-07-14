import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const supabase = createServerClient();
  const body = await request.json();
  const { data, error } = await supabase
    .from('filters').update(body).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
  const supabase = createServerClient();
  const { error } = await supabase.from('filters').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

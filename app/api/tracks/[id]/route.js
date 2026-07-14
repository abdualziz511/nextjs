import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// PUT /api/tracks/[id]
export async function PUT(request, { params }) {
  const supabase = createServerClient();
  const body = await request.json();

  // Clean payload from relation objects and empty artist_id
  delete body.artists;
  delete body.artist;
  if (body.artist_id === "" || body.artist_id === undefined) {
    body.artist_id = null;
  } else {
    // Fetch artist name to satisfy not-null constraint on artist_name
    const { data: artistData } = await supabase.from('artists').select('name').eq('id', body.artist_id).single();
    if (artistData) {
      body.artist_name = artistData.name;
    }
  }

  const { data, error } = await supabase
    .from('tracks')
    .update(body)
    .eq('id', params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/tracks/[id]
export async function DELETE(request, { params }) {
  const supabase = createServerClient();
  const { error } = await supabase.from('tracks').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

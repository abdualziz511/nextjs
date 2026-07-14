import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/tracks — جلب كل المقاطع
export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('tracks')
    .select(`
      *,
      artists ( id, name, image_url, specialty )
    `)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/tracks — إضافة مقطع جديد (Admin)
export async function POST(request) {
  const supabase = createServerClient();
  const body = await request.json();
  
  // Clean payload from relation objects and empty artist_id
  delete body.artists;
  delete body.artist;
  if (body.artist_id === "" || body.artist_id === undefined) {
    body.artist_id = null;
    body.artist_name = 'استوديو النبلاء';
  } else {
    // Fetch artist name to satisfy not-null constraint on artist_name
    const { data: artistData } = await supabase.from('artists').select('name').eq('id', body.artist_id).single();
    if (artistData) {
      body.artist_name = artistData.name;
    } else {
      body.artist_name = 'استوديو النبلاء';
    }
  }

  const { data, error } = await supabase.from('tracks').insert([body]).select().single();
  if (error) {
    console.error("Database INSERT Error on 'tracks':", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

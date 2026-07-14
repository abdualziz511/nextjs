import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// POST /api/upload
// FormData: { file: File, bucket: 'images' | 'audio', folder?: string }
export async function POST(request) {
  try {
    const supabase = createServerClient();
    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket') || 'images';
    const folder = formData.get('folder') || '';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Build a unique file path
    const ext = file.name.split('.').pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = folder ? `${folder}/${uniqueName}` : uniqueName;

    // Convert File to ArrayBuffer then Uint8Array for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filePath,
      bucket,
    }, { status: 201 });

  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

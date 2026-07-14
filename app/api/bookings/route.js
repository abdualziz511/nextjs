import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/bookings — جلب الحجوزات
export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/bookings — إنشاء حجز جديد
export async function POST(request) {
  const supabase = createServerClient();
  const body = await request.json();
  const { data, error } = await supabase.from('bookings').insert([{
    client_name: body.client_name,
    client_email: body.client_email || '',
    client_phone: body.client_phone || '',
    booking_date: body.booking_date || null,
    booking_time: body.booking_time || null,
    service_type: body.service_type || 'recording',
    notes: body.notes || '',
    status: 'pending',
  }]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

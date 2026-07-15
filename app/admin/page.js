'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Bell,
  Music,
  Users,
  ClipboardList,
  Play,
  Pause,
  Search,
  MessageSquare,
  Bookmark,
  User,
  Compass,
  Send,
  Heart,
  Calendar,
  Clock,
  Plus,
  Sun,
  Moon,
  Share2,
  MessageCircle,
  Eye,
  LogOut,
  Edit,
  Trash2,
  Save,
  X,
  Star,
  Filter,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';



// NAV items
const NAV = [
  { key: 'coming_soon', label: 'قريباً', icon: <ImageIcon size={16} /> },
  { key: 'latest', label: 'أحدث الأعمال', icon: <ClipboardList size={16} /> },
  { key: 'exclusive', label: 'حصريات', icon: <Star size={16} /> },
  { key: 'artists', label: 'الفنانون', icon: <User size={16} /> },
  { key: 'filters', label: 'الفلاتر', icon: <Filter size={16} /> },
  { key: 'bookings', label: 'الحجوزات', icon: <Calendar size={16} /> },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard state
  const [section, setSection] = useState('coming_soon');
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [filters, setFilters] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2600); };

  // Check auth on mount
  useEffect(() => {
    const isAuthed = sessionStorage.getItem('studio_admin_auth') === 'true';
    if (isAuthed) {
      setAuthed(true);
    }
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (!authed) return;

    const fetchAllData = async () => {
      try {
        const [artistsRes, tracksRes, filtersRes, comingRes, bookingsRes] = await Promise.all([
          fetch('/api/artists'),
          fetch('/api/tracks'),
          fetch('/api/filters'),
          fetch('/api/coming-soon'),
          fetch('/api/bookings')
        ]);

        if (artistsRes.ok) setArtists(await artistsRes.json());
        if (tracksRes.ok) setTracks(await tracksRes.json());
        if (filtersRes.ok) setFilters(await filtersRes.json());
        if (comingRes.ok) setComingSoon(await comingRes.json());
        if (bookingsRes.ok) setBookings(await bookingsRes.json());
      } catch (err) {
        console.error("Error fetching admin dashboard data", err);
      }
    };

    fetchAllData();
  }, [authed]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    setTimeout(() => {
      // Hardcoded credentials match the original dataStore.js exactly
      if (email.trim() === 'admin@studio.com' && password === 'Studio@2026') {
        sessionStorage.setItem('studio_admin_auth', 'true');
        setAuthed(true);
      } else {
        setLoginError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
      setLoginLoading(false);
    }, 600);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('studio_admin_auth');
    setAuthed(false);
    setEmail('');
    setPassword('');
  };

  // CRUD actions helper
  const upsert = async (endpoint, stateList, setStateList, item, isTrack = false) => {
    try {
      const url = item.id ? `/api/${endpoint}/${item.id}` : `/api/${endpoint}`;
      const method = item.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      if (response.ok) {
        const savedItem = await response.json();
        
        // Refresh all tracks/artists to ensure relationships display properly
        if (isTrack || endpoint === 'artists') {
          const freshRes = await fetch(`/api/${endpoint}`);
          if (freshRes.ok) {
            setStateList(await freshRes.json());
          }
        } else {
          setStateList(prev => {
            if (item.id) {
              return prev.map(x => x.id === item.id ? savedItem : x);
            } else {
              return [...prev, savedItem];
            }
          });
        }
        
        setModal(null);
        showToast('تم الحفظ بنجاح ✓');
      } else {
        const errData = await response.json().catch(() => ({}));
        showToast('خطأ: ' + (errData.error || 'حدث خطأ أثناء الحفظ'));
      }
    } catch (err) {
      console.error(err);
      showToast('خطأ في الاتصال بالخادم');
    }
  };

  const remove = async (endpoint, setStateList, id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setStateList(prev => prev.filter(x => x.id !== id));
        showToast('تم الحذف بنجاح ✓');
      } else {
        showToast('حدث خطأ أثناء الحذف');
      }
    } catch (err) {
      console.error(err);
      showToast('خطأ في الاتصال بالخادم');
    }
  };

  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1508 50%, #0d0d0d 100%)',
        fontFamily: 'Cairo, sans-serif', direction: 'rtl', padding: '20px'
      }}>
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(204,164,59,0.08) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(204,164,59,0.06) 0%, transparent 70%)' }} />
        </div>

        <div style={{
          width: '100%', maxWidth: '420px',
          background: 'rgba(22,22,22,0.95)',
          borderRadius: '20px',
          border: '1px solid rgba(204,164,59,0.3)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(204,164,59,0.05)',
          overflow: 'hidden', position: 'relative', zIndex: 1
        }}>
          <div style={{ padding: '36px 32px 24px', textAlign: 'center', borderBottom: '1px solid rgba(204,164,59,0.15)' }}>
            <div style={{
              width: '68px', height: '68px', borderRadius: '18px', margin: '0 auto 16px',
              background: 'linear-gradient(135deg,#cca43b,#7a5f1e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', boxShadow: '0 8px 30px rgba(204,164,59,0.35)'
            }}>🎸</div>
            <h1 style={{ color: '#fff', fontWeight: '800', fontSize: '1.3rem', margin: '0 0 4px' }}>استوديو النبلاء</h1>
            <p style={{ color: '#9c9b96', fontSize: '0.82rem', margin: 0 }}>لوحة إدارة المحتوى · Admin Panel</p>
          </div>

          <form onSubmit={handleLogin} style={{ padding: '28px 32px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={lbl}>البريد الإلكتروني</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@studio.com"
                required style={inp}
                autoComplete="username"
              />
            </div>
            <div>
              <label style={lbl}>كلمة المرور</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required style={inp}
                autoComplete="current-password"
              />
            </div>

            {loginError && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.82rem', textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                padding: '13px', background: loginLoading ? '#6e5a25' : 'linear-gradient(135deg,#cca43b,#b8912e)',
                border: 'none', borderRadius: '10px', color: '#000', fontFamily: 'Cairo, sans-serif',
                fontWeight: '800', fontSize: '1rem', cursor: loginLoading ? 'not-allowed' : 'pointer',
                marginTop: '4px', boxShadow: '0 4px 20px rgba(204,164,59,0.3)',
                transition: 'all 0.2s'
              }}
            >
              {loginLoading ? '...جاري التحقق' : 'دخول للوحة الإدارة ←'}
            </button>

            <p style={{ color: '#6e6e6e', fontSize: '0.74rem', textAlign: 'center', margin: 0 }}>
              الوصول للمسؤولين المعتمدين فقط
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#090909', display: 'flex', flexDirection: 'column', fontFamily: 'Cairo, sans-serif', direction: 'rtl', color: '#fff' }}>
      
      <style>{`
        @media (max-width: 767px) { .adm-sidebar { display: none !important; } }
        @media (min-width: 768px) { .adm-bottom-nav { display: none !important; } }
        @media (max-width: 767px) { .adm-main { padding: 16px 14px 90px !important; } }
        @media (max-width: 480px) { .adm-grid-2 { grid-template-columns: 1fr !important; } }
        @media (max-width: 480px) { .adm-grid-3 { grid-template-columns: 1fr 1fr !important; } }
      `}</style>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* SIDEBAR (desktop) */}
        <aside className="adm-sidebar" style={{
          width: '220px', flexShrink: 0, background: '#111',
          borderLeft: '1px solid rgba(204,164,59,0.2)',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
        }}>
          <div style={{ padding: '22px 18px', borderBottom: '1px solid rgba(204,164,59,0.15)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,#cca43b,#7a5f1e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🎸</div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.85rem', lineHeight: 1.2 }}>استوديو النبلاء</div>
              <div style={{ fontSize: '0.65rem', color: '#9c9b96' }}>Admin Panel</div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV.map(n => (
              <button key={n.key} onClick={() => setSection(n.key)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 14px', borderRadius: '10px', border: 'none',
                background: section === n.key ? 'rgba(204,164,59,0.15)' : 'transparent',
                color: section === n.key ? '#cca43b' : '#aeaeae',
                fontFamily: 'Cairo, sans-serif', fontWeight: '700', fontSize: '0.84rem',
                cursor: 'pointer', textAlign: 'right', width: '100%',
                borderRight: section === n.key ? '3px solid #cca43b' : '3px solid transparent',
                transition: 'all 0.18s'
              }}>
                {n.icon} {n.label}
              </button>
            ))}
          </nav>

          <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => { if (window.confirm('تسجيل الخروج؟')) handleLogout(); }} style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '10px 14px', borderRadius: '10px',
              border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)',
              color: '#fca5a5', fontFamily: 'Cairo, sans-serif', fontWeight: '700',
              fontSize: '0.82rem', cursor: 'pointer'
            }}>
              <LogOut size={14} /> تسجيل الخروج
            </button>
            <div style={{ marginTop: '8px', fontSize: '0.65rem', color: '#6e6e6e', textAlign: 'center' }}>admin@studio.com</div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="adm-main" style={{ flex: 1, padding: '26px', overflowY: 'auto' }}>

          {/* Mobile Status Header */}
          <div className="adm-bottom-nav" style={{ marginBottom: '16px', borderBottom: '1px solid rgba(204,164,59,0.15)', paddingBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#cca43b,#7a5f1e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎸</div>
              <span style={{ fontWeight: '800', fontSize: '0.92rem' }}>لوحة الإدارة</span>
            </div>
            <button onClick={() => { if (window.confirm('تسجيل الخروج؟')) handleLogout(); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '7px 12px', color: '#fca5a5', fontFamily: 'Cairo, sans-serif', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={14} /> خروج
            </button>
          </div>

          {/* COMING SOON */}
          {section === 'coming_soon' && (
            <Section title="قسم قريباً" subtitle="البطاقات المعروضة في الشريح الرئيسي بالصفحة الرئيسية" onAdd={() => setModal({ type: 'coming_soon', data: { title: '', description: '', image_url: '' } })}>
              <div className="adm-grid-3" style={grid(3)}>
                {comingSoon.map(item => (
                  <CardItem key={item.id} image={item.image_url} title={item.title} sub={item.description}
                    onEdit={() => setModal({ type: 'coming_soon', data: { ...item } })}
                    onDelete={() => remove('coming-soon', setComingSoon, item.id)} />
                ))}
              </div>
            </Section>
          )}

          {/* LATEST */}
          {section === 'latest' && (
            <Section title="أحدث الأعمال" subtitle={`آخر المقاطع المضافة كـ "أحدث الأعمال" (${tracks.filter(t => t.section === 'latest').length} حالياً)`}
              onAdd={() => setModal({ type: 'track', data: { title: '', artist_id: '', filters: [], audio_url: '', section: 'latest', is_exclusive: false, cover_image_url: '' } })} addLabel="إضافة مقطع">
              {tracks.filter(t => t.section === 'latest').length === 0 && <EmptyState />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tracks.filter(t => t.section === 'latest')
                  .map(tr => <TrackRow key={tr.id} track={tr} artists={artists}
                    onEdit={() => setModal({ type: 'track', data: { ...tr } })}
                    onDelete={() => remove('tracks', setTracks, tr.id)} />)}
              </div>
            </Section>
          )}

          {/* EXCLUSIVE */}
          {section === 'exclusive' && (
            <Section title="حصرياتنا" subtitle={`المقاطع الحصرية (${tracks.filter(t => t.section === 'exclusive' || t.is_exclusive).length} حالياً)`}
              onAdd={() => setModal({ type: 'track', data: { title: '', artist_id: '', filters: [], audio_url: '', section: 'exclusive', is_exclusive: true, cover_image_url: '' } })} addLabel="إضافة حصري">
              {tracks.filter(t => t.section === 'exclusive' || t.is_exclusive).length === 0 && <EmptyState />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tracks.filter(t => t.section === 'exclusive' || t.is_exclusive)
                  .map(tr => <TrackRow key={tr.id} track={tr} artists={artists}
                    onEdit={() => setModal({ type: 'track', data: { ...tr } })}
                    onDelete={() => remove('tracks', setTracks, tr.id)} />)}
              </div>
            </Section>
          )}

          {/* ARTISTS */}
          {section === 'artists' && (
            <Section title="الفنانون" subtitle="المميزون ⭐ يظهرون في قسم كبار الفنانين"
              onAdd={() => setModal({ type: 'artist', data: { name: '', specialty: '', description: '', image_url: '', is_featured: false } })} addLabel="إضافة فنان">
              <div className="adm-grid-2" style={grid(2)}>
                {artists.map(a => (
                  <ArtistCard key={a.id} artist={a}
                    onEdit={() => setModal({ type: 'artist', data: { ...a } })}
                    onDelete={() => remove('artists', setArtists, a.id)}
                    onToggleFeatured={() => {
                      const updated = { ...a, is_featured: !a.is_featured };
                      upsert('artists', artists, setArtists, updated);
                    }} />
                ))}
              </div>
            </Section>
          )}

          {/* FILTERS */}
          {section === 'filters' && (
            <Section title="الفلاتر" subtitle="التبويبات التي تظهر في صفحة كل فنان لفلترة أعماله"
              onAdd={() => setModal({ type: 'filter', data: { label: '' } })} addLabel="إضافة فلتر">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {filters.map(f => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: '#1a1a1a', border: '1px solid rgba(204,164,59,0.25)', borderRadius: '40px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>{f.label}</span>
                    <button onClick={() => setModal({ type: 'filter', data: { ...f } })} style={smBtn('#cca43b')}><Edit size={12} /></button>
                    <button onClick={() => remove('filters', setFilters, f.id)} style={smBtn('#ef4444')}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
              <Info>الفلاتر تُستخدم عند إضافة المقاطع لتحديد نوعها. يمكنك إضافة أي عدد منها.</Info>
            </Section>
          )}

          {/* BOOKINGS */}
          {section === 'bookings' && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ marginBottom: '18px' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>إدارة الحجوزات</h2>
                <p style={{ margin: 0, fontSize: '0.76rem', color: '#9c9b96' }}>تأكيد أو إلغاء طلبات حجز الاستوديو من العملاء</p>
              </div>

              {bookings.length === 0 ? <EmptyState /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {bookings.map(b => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#1a1a1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>{b.client_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#cca43b', marginTop: '4px' }}>{b.service_type}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>هاتف: {b.client_phone || 'لا يوجد'} | إيميل: {b.client_email || 'لا يوجد'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>ملاحظات: {b.notes || 'لا يوجد'}</div>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '8px', fontSize: '0.75rem', color: '#cca43b' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Calendar size={12} />{b.booking_date}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={12} />{b.booking_time}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <div className={`booking-status ${b.status}`} style={{ margin: 0, padding: '4px 10px', borderRadius: '6px' }}>
                          {b.status === 'pending' ? 'قيد الانتظار' : b.status === 'confirmed' ? 'تم التأكيد' : 'ملغي'}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          {b.status !== 'confirmed' && (
                            <button onClick={() => upsert('bookings', bookings, setBookings, { ...b, status: 'confirmed' })} style={{ background: '#059669', border: 'none', borderRadius: '6px', padding: '6px 10px', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>تأكيد</button>
                          )}
                          {b.status !== 'cancelled' && (
                            <button onClick={() => upsert('bookings', bookings, setBookings, { ...b, status: 'cancelled' })} style={{ background: '#dc2626', border: 'none', borderRadius: '6px', padding: '6px 10px', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>إلغاء</button>
                          )}
                          <button onClick={() => remove('bookings', setBookings, b.id)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px', color: '#f87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="adm-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 500,
        background: '#111', borderTop: '1px solid rgba(204,164,59,0.2)',
        display: 'flex', alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {NAV.map(n => (
          <button key={n.key} onClick={() => setSection(n.key)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '3px', padding: '10px 4px',
            border: 'none', background: 'transparent',
            color: section === n.key ? '#cca43b' : '#6e6e6e',
            fontFamily: 'Cairo, sans-serif', fontWeight: '700',
            fontSize: '0.6rem', cursor: 'pointer',
            borderTop: section === n.key ? '2px solid #cca43b' : '2px solid transparent',
            transition: 'all 0.18s'
          }}>
            {n.icon}
            {n.label}
          </button>
        ))}
      </nav>

      {/* MODALS */}
      {modal?.type === 'coming_soon' && (
        <Modal title={modal.data.id ? 'تعديل بطاقة قريباً' : 'إضافة بطاقة قريباً'} onClose={() => setModal(null)}>
          <ComingSoonForm init={modal.data} onSave={item => upsert('coming-soon', comingSoon, setComingSoon, item)} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'track' && (
        <Modal title={modal.data.id ? 'تعديل مقطع' : 'إضافة مقطع صوتي'} onClose={() => setModal(null)} wide>
          <TrackForm init={modal.data} artists={artists} filters={filters}
            onSave={item => upsert('tracks', tracks, setTracks, item, true)}
            onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'artist' && (
        <Modal title={modal.data.id ? 'تعديل فنان' : 'إضافة فنان جديد'} onClose={() => setModal(null)}>
          <ArtistForm init={modal.data} onSave={item => upsert('artists', artists, setArtists, item)} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'filter' && (
        <Modal title={modal.data.id ? 'تعديل فلتر' : 'إضافة فلتر'} onClose={() => setModal(null)}>
          <FilterForm init={modal.data} onSave={item => upsert('filters', filters, setFilters, item)} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(204,164,59,0.95)', color: '#000', padding: '10px 22px', borderRadius: '30px', fontWeight: '800', fontSize: '0.88rem', boxShadow: '0 8px 30px rgba(204,164,59,0.4)', zIndex: 9999, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

    </div>
  );
}

// Sub components
function Section({ title, subtitle, onAdd, addLabel = 'إضافة', children }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', gap: '10px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>{title}</h2>
          <p style={{ margin: 0, fontSize: '0.76rem', color: '#9c9b96' }}>{subtitle}</p>
        </div>
        <button onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', flexShrink: 0, background: 'linear-gradient(135deg,#cca43b,#b8912e)', border: 'none', borderRadius: '10px', color: '#000', fontFamily: 'Cairo, sans-serif', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(204,164,59,0.3)' }}>
          <Plus size={14} /> {addLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

function CardItem({ image, title, sub, onEdit, onDelete }) {
  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', position: 'relative', height: '155px', border: '1px solid rgba(204,164,59,0.2)', cursor: 'pointer' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)' }} />
      <div style={{ position: 'absolute', bottom: '10px', right: '10px', left: '10px' }}>
        <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#fff' }}>{title}</div>
        <div style={{ fontSize: '0.7rem', color: '#cca43b', marginTop: '2px' }}>{sub}</div>
      </div>
      <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '5px' }}>
        <button onClick={onEdit} style={smBtn('#cca43b')}><Edit size={12} /></button>
        <button onClick={onDelete} style={smBtn('#ef4444')}><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

function TrackRow({ track, artists, onEdit, onDelete }) {
  const artist = artists.find(a => String(a.id) === String(track.artist_id));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '10px', flexShrink: 0, backgroundImage: `url(${track.cover_image_url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&q=60'})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(204,164,59,0.2)' }} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff', marginBottom: '2px' }}>{track.title}</div>
        <div style={{ fontSize: '0.73rem', color: '#cca43b' }}>{artist?.name || track.artist || '—'}</div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
          {(track.filters || []).map(fl => <span key={fl} style={{ padding: '1px 7px', background: 'rgba(204,164,59,0.1)', border: '1px solid rgba(204,164,59,0.25)', borderRadius: '20px', fontSize: '0.67rem', color: '#cca43b' }}>{fl}</span>)}
          {track.is_exclusive && <span style={{ padding: '1px 7px', background: 'rgba(255,193,7,0.12)', border: '1px solid rgba(255,193,7,0.3)', borderRadius: '20px', fontSize: '0.67rem', color: '#ffc107' }}>★ حصري</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '7px', flexShrink: 0 }}>
        <button onClick={onEdit} style={rowBtn('#cca43b')}><Edit size={13} /></button>
        <button onClick={onDelete} style={rowBtn('#ef4444')}><Trash2 size={13} /></button>
      </div>
    </div>
  );
}

function ArtistCard({ artist, onEdit, onDelete, onToggleFeatured }) {
  return (
    <div style={{ background: '#1a1a1a', border: `1px solid ${artist.is_featured ? 'rgba(204,164,59,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '14px', overflow: 'hidden' }}>
      <div style={{ height: '95px', backgroundImage: `url(${artist.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)' }} />
        {artist.is_featured && <div style={{ position: 'absolute', top: '7px', right: '7px', background: 'rgba(204,164,59,0.92)', padding: '2px 7px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: '800', color: '#000' }}>⭐ كبار الفنانين</div>}
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontWeight: '800', fontSize: '0.92rem', marginBottom: '2px' }}>{artist.name}</div>
        <div style={{ color: '#cca43b', fontSize: '0.73rem', marginBottom: '10px' }}>{artist.specialty}</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={onToggleFeatured} style={{ flex: 1, padding: '6px', fontSize: '0.72rem', fontWeight: '700', background: artist.is_featured ? 'rgba(204,164,59,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${artist.is_featured ? 'rgba(204,164,59,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: artist.is_featured ? '#cca43b' : '#aeaeae', fontFamily: 'Cairo, sans-serif', cursor: 'pointer' }}>
            {artist.is_featured ? '⭐ مميز' : '☆ تمييز'}
          </button>
          <button onClick={onEdit} style={rowBtn('#cca43b')}><Edit size={13} /></button>
          <button onClick={onDelete} style={rowBtn('#ef4444')}><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, wide, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ width: '100%', maxWidth: wide ? '540px' : '420px', background: '#161616', borderRadius: '16px', border: '1px solid rgba(204,164,59,0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(204,164,59,0.14)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '800', fontSize: '0.97rem' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '7px', padding: '5px 8px', color: '#aeaeae', cursor: 'pointer' }}><X size={14} /></button>
        </div>
        <div style={{ padding: '20px', maxHeight: '74vh', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── FileUpload Component ────────────────────────────────────────────────────
// Accepts a file from the device, uploads to Supabase Storage, and returns the public URL
function FileUpload({ label, currentUrl, onUploaded, bucket = 'images', accept = 'image/*', folder = '' }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('bucket', bucket);
      if (folder) form.append('folder', folder);

      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'فشل الرفع');
      onUploaded(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const isImage = bucket === 'images';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={lbl}>{label}</label>

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${dragOver ? '#cca43b' : 'rgba(204,164,59,0.3)'}`,
          borderRadius: '12px',
          padding: '18px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragOver ? 'rgba(204,164,59,0.08)' : 'rgba(255,255,255,0.03)',
          transition: 'all 0.2s',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Preview for images */}
        {isImage && currentUrl && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${currentUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.25, borderRadius: '10px'
          }} />
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          {uploading ? (
            <div style={{ color: '#cca43b', fontSize: '0.85rem', fontWeight: '700' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>⏳</div>
              جاري الرفع...
            </div>
          ) : (
            <>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>
                {isImage ? '🖼️' : '🎵'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#cca43b', fontWeight: '700', marginBottom: '3px' }}>
                {currentUrl ? 'تغيير الملف' : 'رفع ملف من الجهاز'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6e6e6e' }}>
                اضغط أو اسحب الملف هنا
              </div>
              {currentUrl && !isImage && (
                <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '4px' }}>✓ تم رفع ملف مسبقاً</div>
              )}
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {/* Audio preview */}
      {!isImage && currentUrl && (
        <audio controls src={currentUrl} style={{ width: '100%', borderRadius: '8px', marginTop: '4px' }} />
      )}

      {/* Image preview */}
      {isImage && currentUrl && (
        <div style={{ height: '70px', borderRadius: '8px', backgroundImage: `url(${currentUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(204,164,59,0.25)', marginTop: '2px' }} />
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.77rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* URL as fallback */}
      <div style={{ position: 'relative' }}>
        <input
          value={currentUrl || ''}
          onChange={(e) => onUploaded(e.target.value)}
          placeholder={isImage ? 'أو الصق رابط الصورة هنا...' : 'أو الصق رابط الصوت هنا...'}
          style={{ ...inp, fontSize: '0.78rem', paddingRight: '34px', color: '#888' }}
        />
        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#6e6e6e' }}>🔗</span>
      </div>
    </div>
  );
}

// ─── Forms ───────────────────────────────────────────────────────────────────
function ComingSoonForm({ init, onSave, onCancel }) {
  const [f, setF] = useState({ ...init });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Field label="العنوان" value={f.title} onChange={v => set('title', v)} placeholder="مثال: ألبوم جديد قريباً" />
      <Field label="وصف قصير" value={f.description} onChange={v => set('description', v)} placeholder="وصف مختصر عن البطاقة" />
      <FileUpload
        label="صورة البطاقة 🖼️"
        currentUrl={f.image_url}
        onUploaded={url => set('image_url', url)}
        bucket="images"
        folder="coming-soon"
        accept="image/*"
      />
      <FormActions onSave={() => onSave(f)} onCancel={onCancel} disabled={!f.title || !f.image_url} />
    </div>
  );
}

function TrackForm({ init, artists, filters, onSave, onCancel }) {
  const [f, setF] = useState({ ...init, filters: init.filters || [] });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const toggleFilter = (label) => setF(p => ({
    ...p, filters: p.filters.includes(label) ? p.filters.filter(x => x !== label) : [...p.filters, label]
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Field label="عنوان المقطع" value={f.title} onChange={v => set('title', v)} placeholder="مثال: زفة فخمة بالأسماء" />

      <div>
        <label style={lbl}>الفنان</label>
        <select value={f.artist_id || ''} onChange={e => set('artist_id', e.target.value || null)} style={inp}>
          <option value="">— اختر فنان —</option>
          {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div>
        <label style={lbl}>القسم في الصفحة الرئيسية</label>
        <select value={f.section} onChange={e => set('section', e.target.value)} style={inp}>
          <option value="latest">أحدث الأعمال</option>
          <option value="exclusive">حصرياتنا</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input type="checkbox" id="excl" checked={!!f.is_exclusive} onChange={e => set('is_exclusive', e.target.checked)} style={{ accentColor: '#cca43b', width: '15px', height: '15px' }} />
        <label htmlFor="excl" style={{ ...lbl, margin: 0, cursor: 'pointer' }}>تمييز كحصري ★</label>
      </div>

      <div>
        <label style={lbl}>الفلاتر المرتبطة</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '6px' }}>
          {filters.map(fl => {
            const on = f.filters.includes(fl.label);
            return (
              <button key={fl.id} type="button" onClick={() => toggleFilter(fl.label)} style={{
                padding: '6px 14px', borderRadius: '30px', cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif', fontWeight: '600', fontSize: '0.8rem',
                border: `1px solid ${on ? '#cca43b' : 'rgba(255,255,255,0.1)'}`,
                background: on ? 'rgba(204,164,59,0.18)' : 'rgba(255,255,255,0.04)',
                color: on ? '#cca43b' : '#aeaeae', transition: 'all 0.14s'
              }}>
                {on ? '✓ ' : ''}{fl.label}
              </button>
            );
          })}
        </div>
      </div>

      <FileUpload
        label="صورة الغلاف (اختيارية) 🖼️"
        currentUrl={f.cover_image_url}
        onUploaded={url => set('cover_image_url', url)}
        bucket="images"
        folder="covers"
        accept="image/*"
      />

      <FileUpload
        label="ملف الصوت 🎵"
        currentUrl={f.audio_url}
        onUploaded={url => set('audio_url', url)}
        bucket="audio"
        folder="tracks"
        accept="audio/*"
      />

      <FormActions onSave={() => onSave(f)} onCancel={onCancel} disabled={!f.title || !f.audio_url} label="حفظ المقطع" />
    </div>
  );
}

function ArtistForm({ init, onSave, onCancel }) {
  const [f, setF] = useState({ ...init });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Field label="اسم الفنان" value={f.name} onChange={v => set('name', v)} placeholder="مثال: أحمد المنشد" />
      <Field label="التخصص" value={f.specialty} onChange={v => set('specialty', v)} placeholder="مثال: منشد ومؤدي زفات" />
      <Field label="وصف قصير" value={f.description} onChange={v => set('description', v)} placeholder="وصف مختصر عن الفنان" />
      <FileUpload
        label="صورة الفنان 🖼️"
        currentUrl={f.image_url}
        onUploaded={url => set('image_url', url)}
        bucket="images"
        folder="artists"
        accept="image/*"
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: 'rgba(204,164,59,0.06)', borderRadius: '10px', border: '1px solid rgba(204,164,59,0.2)' }}>
        <input type="checkbox" id="feat" checked={!!f.is_featured} onChange={e => set('is_featured', e.target.checked)} style={{ accentColor: '#cca43b', width: '16px', height: '16px' }} />
        <label htmlFor="feat" style={{ cursor: 'pointer', fontWeight: '700', color: '#cca43b', fontSize: '0.85rem' }}>⭐ من كبار الفنانين (يظهر في قسم كبار الفنانين)</label>
      </div>
      <FormActions onSave={() => onSave(f)} onCancel={onCancel} disabled={!f.name || !f.image_url} />
    </div>
  );
}

function FilterForm({ init, onSave, onCancel }) {
  const [f, setF] = useState({ ...init });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Field label="اسم الفلتر" value={f.label} onChange={v => setF(p => ({ ...p, label: v }))} placeholder="مثال: زفات" />
      <FormActions onSave={() => onSave(f)} onCancel={onCancel} disabled={!f.label} />
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inp} />
    </div>
  );
}

function FormActions({ onSave, onCancel, disabled, label = 'حفظ' }) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
      <button onClick={onSave} disabled={disabled} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', background: disabled ? '#333' : 'linear-gradient(135deg,#cca43b,#b8912e)', border: 'none', borderRadius: '10px', color: disabled ? '#666' : '#000', fontFamily: 'Cairo, sans-serif', fontWeight: '800', fontSize: '0.9rem', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <Save size={14} /> {label}
      </button>
      <button onClick={onCancel} style={{ padding: '11px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#aeaeae', fontFamily: 'Cairo, sans-serif', fontWeight: '600', fontSize: '0.87rem', cursor: 'pointer' }}>إلغاء</button>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '36px 20px', color: '#6e6e6e', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.09)', marginBottom: '14px' }}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📂</div>
      <div style={{ fontSize: '0.84rem' }}>لا توجد عناصر بعد. أضف أول عنصر الآن.</div>
    </div>
  );
}

function Info({ children }) {
  return <div style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(204,164,59,0.06)', borderRadius: '10px', border: '1px dashed rgba(204,164,59,0.22)', color: '#9c9b96', fontSize: '0.77rem', lineHeight: 1.75 }}>💡 {children}</div>;
}

const lbl = { display: 'block', marginBottom: '5px', fontSize: '0.77rem', fontWeight: '700', color: '#aeaeae' };
const inp = { width: '100%', padding: '10px 13px', background: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', color: '#fff', fontSize: '0.87rem', fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box' };
const grid = (cols) => ({ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '14px' });
const smBtn = (c) => ({ background: `${c}20`, border: `1px solid ${c}50`, borderRadius: '6px', padding: '4px 6px', color: c, cursor: 'pointer', display: 'flex', alignItems: 'center' });
const rowBtn = (c) => ({ background: `${c}15`, border: `1px solid ${c}40`, borderRadius: '8px', padding: '7px 9px', color: c, cursor: 'pointer', display: 'flex', alignItems: 'center' });

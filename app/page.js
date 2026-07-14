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
  MessageCircle
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [filters, setFilters] = useState([]);
  const [savedTrackIds, setSavedTrackIds] = useState([]);
  const [cart, setCart] = useState([]);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'studio', text: 'أهلاً بك في استوديو النبلاء للصوتيات! كيف يمكننا مساعدتك اليوم؟ 🎧', time: '12:00' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // All Works view states
  const [allWorksFilter, setAllWorksFilter] = useState('all');
  const [allWorksSearch, setAllWorksSearch] = useState('');

  // Loading state
  const [loading, setLoading] = useState(true);

  // Sync favorites and cart to local storage (after mount)
  useEffect(() => {
    const savedFavs = localStorage.getItem('studio_favorites');
    if (savedFavs) setSavedTrackIds(JSON.parse(savedFavs));

    const savedCart = localStorage.getItem('studio_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    if (savedTrackIds.length > 0 || localStorage.getItem('studio_favorites')) {
      localStorage.setItem('studio_favorites', JSON.stringify(savedTrackIds));
    }
  }, [savedTrackIds]);

  useEffect(() => {
    if (cart.length > 0 || localStorage.getItem('studio_cart')) {
      localStorage.setItem('studio_cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Dynamic SEO & ItemList JSON-LD Schema
  useEffect(() => {
    if (tracks.length === 0) return;

    const existingScript = document.getElementById('dynamic-tracks-schema');
    if (existingScript) existingScript.remove();

    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "أعمال استوديو النبلاء الصوتية",
      "description": "مجموعة الأعمال الصوتية الحصرية من استوديو النبلاء - شيلات، زفات، أناشيد",
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "numberOfItems": tracks.length,
      "itemListElement": tracks.map((track, index) => {
        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@context": "https://schema.org",
            "@type": "MusicRecording",
            "@id": typeof window !== 'undefined' ? `${window.location.origin}/#track-${encodeURIComponent(track.title)}` : '',
            "name": track.title,
            "description": track.description || `${track.title} - من إنتاج استوديو النبلاء للصوتيات`,
            "duration": track.duration || "PT3M",
            "url": typeof window !== 'undefined' ? `${window.location.origin}/#track-${encodeURIComponent(track.title)}` : '',
            "image": track.cover_image_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
            "genre": track.filters ? track.filters.join(', ') : 'شيلات',
            "inAlbum": {
              "@type": "MusicAlbum",
              "name": "أعمال استوديو النبلاء",
              "byArtist": {
                "@type": "MusicGroup",
                "name": "استوديو النبلاء للصوتيات"
              }
            },
            "byArtist": {
              "@type": "MusicGroup",
              "name": track.artists?.name || track.artist || "استوديو النبلاء"
            },
            "isAccessibleForFree": true,
            "keywords": `${track.title}, شيلات, زفات, استوديو النبلاء, ${track.filters?.join(', ') || ''}`
          }
        };
      })
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamic-tracks-schema';
    script.textContent = JSON.stringify(itemListSchema);
    document.head.appendChild(script);

    document.title = `استوديو النبلاء للصوتيات | ${tracks.length} عمل صوتي - شيلات، زفات، أناشيد`;

    return () => {
      const s = document.getElementById('dynamic-tracks-schema');
      if (s) s.remove();
    };
  }, [tracks]);

  // Artist detail view states
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistSubFilter, setArtistSubFilter] = useState('all');

  // Active playing track state
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);

  const getTrackImage = (index) => {
    const urls = [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484755560693-a4074577af3a?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&auto=format&fit=crop&q=80'
    ];
    return urls[index % urls.length];
  };

  const getArtistImage = (name) => {
    const images = {
      'أحمد المنشد': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80',
      'فهد المطرب': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      'المهندس حسام': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      'المهندس خالد': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80'
    };
    return images[name] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
  };

  const audioRef = useRef(null);
  const exclusivesScrollRef = useRef(null);
  const latestScrollRef = useRef(null);
  const artistsScrollRef = useRef(null);

  // Smooth marquee-like scroll loop for Latest Works section
  useEffect(() => {
    const el = latestScrollRef.current;
    if (!el || activeTab !== 'home' || categoryFilter === 'requests') return;

    let direction = 1;
    const interval = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      const currentScroll = Math.abs(el.scrollLeft);

      if (currentScroll >= maxScroll - 5) {
        direction = -1;
      } else if (currentScroll <= 5) {
        direction = 1;
      }

      el.scrollLeft -= direction * 1;
    }, 25);

    return () => clearInterval(interval);
  }, [tracks, activeTab, categoryFilter]);

  // Smooth marquee-like scroll loop for Top Artists section
  useEffect(() => {
    const el = artistsScrollRef.current;
    if (!el || activeTab !== 'home' || categoryFilter === 'requests') return;

    let direction = 1;
    const interval = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      const currentScroll = Math.abs(el.scrollLeft);

      if (currentScroll >= maxScroll - 5) {
        direction = -1;
      } else if (currentScroll <= 5) {
        direction = 1;
      }

      el.scrollLeft -= direction * 1;
    }, 28);

    return () => clearInterval(interval);
  }, [artists, activeTab, categoryFilter]);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Bookings list state
  const [bookings, setBookings] = useState([]);

  // Form states
  const [bookingForm, setBookingForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    booking_date: '',
    booking_time: '12:00',
    service_type: 'recording',
    notes: ''
  });

  // State to toggle Booking overlay drawer
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [appTheme, setAppTheme] = useState('light');
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotating slider for hero
  useEffect(() => {
    if (comingSoon.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % comingSoon.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [comingSoon]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tracksRes, artistsRes, comingRes, filtersRes, bookingsRes] = await Promise.all([
          fetch('/api/tracks'),
          fetch('/api/artists'),
          fetch('/api/coming-soon'),
          fetch('/api/filters'),
          fetch('/api/bookings')
        ]);

        if (tracksRes.ok) {
          const tData = await tracksRes.json();
          setTracks(tData);
          if (tData.length > 0) {
            setCurrentTrack(tData[0]);
          }
        }
        if (artistsRes.ok) setArtists(await artistsRes.json());
        if (comingRes.ok) setComingSoon(await comingRes.json());
        if (filtersRes.ok) setFilters(await filtersRes.json());
        if (bookingsRes.ok) setBookings(await bookingsRes.json());
      } catch (err) {
        console.error("Failed to fetch dynamic Supabase data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Play controls
  const handlePlayPause = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Playback error:", err);
      });
    }
  };

  const handleSelectTrack = (track, autoPlay = true) => {
    setCurrentTrack(track);
    setIsPlaying(false);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        if (autoPlay) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(err => console.log("Init play interrupted"));
        }
      }
    }, 100);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setCurrentTimeSec(current);
    setDurationSec(dur);
    setProgress(dur > 0 ? (current / dur) * 100 : 0);
  };

  const handleProgressBarClick = (e) => {
    if (!audioRef.current || durationSec === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newPercentage = clickX / width;
    const newTime = newPercentage * durationSec;
    audioRef.current.currentTime = newTime;
    setCurrentTimeSec(newTime);
    setProgress(newPercentage * 100);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Add/Remove saved
  const toggleSaveTrack = (trackId, e) => {
    e.stopPropagation();
    if (savedTrackIds.includes(trackId)) {
      setSavedTrackIds(savedTrackIds.filter(id => id !== trackId));
    } else {
      setSavedTrackIds([...savedTrackIds, trackId]);
    }
  };

  // Cart operations
  const addToCart = (track, e) => {
    if (e) e.stopPropagation();
    if (cart.some(item => item.id === track.id)) return;
    setCart([...cart, track]);
  };

  const removeFromCart = (trackId) => {
    setCart(cart.filter(item => item.id !== trackId));
  };

  // Submit booking request
  const submitBooking = async (e) => {
    e.preventDefault();

    // 1. Save to Supabase DB via our route handler
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm)
      });
      if (response.ok) {
        const newBooking = await response.json();
        setBookings(prev => [newBooking, ...prev]);
      }
    } catch (err) {
      console.error("Failed to post booking to database", err);
    }

    // 2. Format WhatsApp Message
    const serviceName = bookingForm.service_type === 'recording' ? 'جلسة تسجيل' :
      bookingForm.service_type === 'podcast' ? 'تسجيل بودكاست' :
        bookingForm.service_type === 'mixing_mastering' ? 'مكس وماستر' : bookingForm.service_type;

    const cartItemsText = cart.length > 0 ? `\n*الأعمال المرجعية المختارة:*\n` + cart.map(item => `- ${item.title}`).join('\n') : '';

    const message = `مرحباً استوديو النبلاء، أود طلب جديد:
*الاسم:* ${bookingForm.client_name}
*الخدمة المطلوبة:* ${serviceName}
*التفاصيل:* ${bookingForm.notes || 'لا يوجد'}${cartItemsText}`;

    const encodedMessage = encodeURIComponent(message);
    const studioWhatsAppNumber = '967776158797';

    setIsBookingOpen(false);
    window.open(`https://wa.me/${studioWhatsAppNumber}?text=${encodedMessage}`, '_blank');
  };

  // Send message in chat
  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    setTimeout(() => {
      let botResponseText = 'شكراً لرسالتك! مهندس الصوت متواجد حالياً وسيقوم بالرد عليك بخصوص تفاصيل الهندسة الصوتية والأسعار قريباً جداً. 🎙️';

      const query = inputMessage.toLowerCase();
      if (query.includes('سعر') || query.includes('كم') || query.includes('تكلفة')) {
        botResponseText = 'تختلف التكلفة حسب نوع العمل: تسجيل الساعة بـ 150 ريال، والمكس والماستر يبدأ من 400 ريال للعمل الكامل. يمكنك حجز جلسة مباشرة من قائمة الطلبات! 💰';
      } else if (query.includes('موقع') || query.includes('اين') || query.includes('عنوان')) {
        botResponseText = 'الاستوديو الخاص بنا يقع في الطابق الثالث، مجمع صروح الرياض الإداري. مرحباً بك لزيارتنا! 📍';
      } else if (query.includes('شيلة') || query.includes('زفة')) {
        botResponseText = 'نوفر شيلات تخرج وزفات خاصة بالأسماء مع أحدث الأجهزة الصوتية والمؤدين. يمكنك الاستماع للنماذج في الصفحة الرئيسية! 🎶';
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'studio',
        text: botResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  // Filters combining category tabs
  const getFilteredTracks = () => {
    if (categoryFilter === 'all') {
      return searchQuery ? tracks.filter(t => t.title.includes(searchQuery) || (t.artists?.name || '').toLowerCase().includes(searchQuery.toLowerCase())) : tracks;
    } else if (categoryFilter === 'artists') {
      return tracks.filter(t => t.section === 'exclusive' || t.is_exclusive);
    } else {
      return [];
    }
  };

  const getArtistFilteredTracks = () => {
    if (!selectedArtist) return [];

    let artistTracks = tracks.filter(t =>
      t.artist_id === selectedArtist.id ||
      (t.artists?.name && t.artists.name.includes(selectedArtist.name)) ||
      (t.artist && t.artist.includes(selectedArtist.name))
    );

    if (artistSubFilter === 'all') {
      return artistTracks;
    }

    return artistTracks.filter(track => {
      const isArr = Array.isArray(track.filters);
      if (artistSubFilter === 'مع موسيقى') {
        return isArr ? track.filters.includes('مع موسيقى') : false;
      }
      if (artistSubFilter === 'بدون موسيقى') {
        return isArr ? track.filters.includes('بدون موسيقى') : false;
      }
      if (artistSubFilter === 'زفات') {
        return isArr ? track.filters.includes('زفات') : false;
      }
      if (artistSubFilter === 'شيلات') {
        return isArr ? track.filters.includes('شيلات') : false;
      }
      if (artistSubFilter === 'اناشيد') {
        return isArr ? track.filters.includes('اناشيد') : false;
      }
      return true;
    });
  };

  return (
    <div className="rtl app-container" data-theme={appTheme}>
      <div className="phone-mockup">
        <div className="app-viewport">

          {/* App Header */}
          {activeTab !== 'artist_detail' && (
            <header className="app-header">
              <div className="header-left">
                <button
                  className="icon-btn"
                  onClick={() => setAppTheme(prev => prev === 'light' ? 'dark' : 'light')}
                  title={appTheme === 'light' ? 'وضع داكن' : 'وضع فاتح'}
                >
                  {appTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                <button className="icon-btn" title="الإشعارات" onClick={() => setActiveTab('profile')}>
                  <Bell size={18} />
                  {bookings.filter(b => b.status === 'confirmed').length > 0 && (
                    <span className="icon-badge">!</span>
                  )}
                </button>

                <button
                  className="icon-btn"
                  title="سلة الطلبات"
                  onClick={() => { setActiveTab('home'); setCategoryFilter('requests'); }}
                >
                  <ShoppingBag size={18} />
                  {cart.length > 0 && <span className="icon-badge">{cart.length}</span>}
                </button>
              </div>

              <div className="header-logo">
                <h1 className="logo-circle" title="استوديو زفات يباريك للصوتيات">🎸</h1>
              </div>
            </header>
          )}

          {/* Primary Navigation */}
          {(activeTab === 'home' || activeTab === 'all_artists' || activeTab === 'all_works') && (
            <nav className="category-tabs-container">
              <button
                className={`tab-item ${activeTab === 'home' && categoryFilter === 'all' ? 'active' : ''}`}
                onClick={() => { setActiveTab('home'); setCategoryFilter('all'); }}
              >
                <Compass size={15} />
                الرئيسية
              </button>
              <button
                className={`tab-item ${activeTab === 'all_works' ? 'active' : ''}`}
                onClick={() => setActiveTab('all_works')}
              >
                <Music size={15} />
                كل الأعمال
              </button>
              <button
                className={`tab-item ${activeTab === 'all_artists' ? 'active' : ''}`}
                onClick={() => setActiveTab('all_artists')}
              >
                <Users size={15} />
                كبار الفنانين
              </button>
              <button
                className={`tab-item ${categoryFilter === 'requests' && activeTab === 'home' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('home');
                  setCategoryFilter('requests');
                  setIsBookingOpen(true);
                }}
              >
                <ClipboardList size={15} />
                الطلبات
              </button>
            </nav>
          )}

          {/* Main App Content */}
          <main className="app-content" id="main-content">
            <div className="section-header" style={{ marginTop: '5px', marginBottom: '-15px' }}>
              <h2 id="exclusives-title" className="section-title">قريباً 🔥</h2>
            </div>

            {/* View 1: Home Viewport */}
            {activeTab === 'home' && (
              <>
                {categoryFilter !== 'requests' ? (
                  <>
                    {/* Hero Carousel */}
                    {comingSoon.length > 0 && (
                      <div className="hero-carousel">
                        <div style={{
                          display: 'flex',
                          height: '100%',
                          width: `${comingSoon.length * 100}%`,
                          transform: `translateX(${activeSlide * (100 / comingSoon.length)}%)`,
                          transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
                        }}>
                          {comingSoon.map((slide, i) => (
                            <div key={`slide-${i}`} style={{
                              position: 'relative',
                              width: `${100 / comingSoon.length}%`,
                              height: '100%',
                              flexShrink: 0,
                              backgroundImage: `url(${slide.image_url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}>
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.4) 100%)' }} />
                              <div className="carousel-slide" style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px' }}>
                                <h3 style={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.6)', marginBottom: '8px' }}>
                                  {slide.title}
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.88)', textShadow: '0 1px 4px rgba(0,0,0,0.5)', fontSize: '0.9rem' }}>
                                  {slide.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="carousel-decor"></div>
                        <div className="carousel-pagination">
                          {comingSoon.map((_, i) => (
                            <span key={i} className={`dot ${activeSlide % comingSoon.length === i ? 'active' : ''}`}
                              onClick={() => setActiveSlide(i)} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 1: احدث اعمالنا */}
                    <section aria-labelledby="latest-works-title" id="latest-works">
                      <div className="section-header">
                        <h2 id="latest-works-title" className="section-title">احدث اعمالنا</h2>
                        <a href="#all-works" className="section-link" onClick={(e) => { e.preventDefault(); setActiveTab('all_works'); }}>عرض الكل</a>
                      </div>

                      <div className="horizontal-scroll" ref={latestScrollRef} role="list">
                        {tracks.filter(t => t.section === 'latest').map((track, i) => (
                          <article
                            key={track.id}
                            className="work-card small"
                            role="listitem"
                            title={track.title}
                            onClick={() => handleSelectTrack(track)}
                          >
                            <figure className="card-inner-bg" style={{ backgroundImage: `url(${track.cover_image_url || getTrackImage(i)})`, backgroundSize: 'cover', backgroundPosition: 'center', margin: 0 }}>
                              <span className="tag-badge">★ NEW</span>

                              {currentTrack && currentTrack.id === track.id && isPlaying ? (
                                <div className="card-music-indicator">
                                  <div className="waveform-container" style={{ height: '10px', gap: '1.5px' }}>
                                    <div className="wave-bar" style={{ width: '1.5px', height: '100%', background: '#fff' }}></div>
                                    <div className="wave-bar" style={{ width: '1.5px', height: '100%', background: '#fff' }}></div>
                                    <div className="wave-bar" style={{ width: '1.5px', height: '100%', background: '#fff' }}></div>
                                  </div>
                                </div>
                              ) : (
                                <div className="card-music-indicator">
                                  <Play size={10} fill="#fff" />
                                </div>
                              )}

                              <figcaption className="card-text-overlay">
                                <h3 className="card-title">{track.title}</h3>
                                <p className="card-artist">{track.artists?.name || track.artist || 'استوديو النبلاء'}</p>
                              </figcaption>
                            </figure>
                          </article>
                        ))}
                      </div>
                    </section>

                    {/* Section 2: حصرياتنا */}
                    <section aria-labelledby="exclusives-title" id="exclusives">
                      <div className="section-header">
                        <h2 id="exclusives-title" className="section-title">حصرياتنا 🔥</h2>
                      </div>

                      <div className="horizontal-scroll" ref={exclusivesScrollRef}>
                        {tracks.filter(t => t.section === 'exclusive' || t.is_exclusive).map((track, i) => (
                          <div
                            key={`exclusive-${track.id}`}
                            className="work-card tall"
                            onClick={() => handleSelectTrack(track)}
                          >
                            <div className="card-inner-bg" style={{ backgroundImage: `url(${track.cover_image_url || getTrackImage(i + 3)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                              <span className="tag-badge hot">★ NEW 🔥</span>

                              <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10 }}>
                                <button
                                  onClick={(e) => toggleSaveTrack(track.id, e)}
                                  style={{ background: 'rgba(0,0,0,0.5)', border: 'none', width: '25px', height: '25px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: savedTrackIds.includes(track.id) ? 'var(--accent-color)' : '#fff', cursor: 'pointer' }}
                                >
                                  <Heart size={12} fill={savedTrackIds.includes(track.id) ? 'var(--accent-color)' : 'none'} />
                                </button>
                              </div>

                              {currentTrack && currentTrack.id === track.id && isPlaying ? (
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 6 }}>
                                  <div className="waveform-container">
                                    <div className="wave-bar"></div>
                                    <div className="wave-bar"></div>
                                    <div className="wave-bar"></div>
                                    <div className="wave-bar"></div>
                                  </div>
                                </div>
                              ) : (
                                <div className="card-music-indicator" style={{ top: '8px', left: '38px' }}>
                                  <Play size={10} fill="#fff" />
                                </div>
                              )}

                              <div className="card-text-overlay">
                                <div className="card-title" style={{ fontSize: '0.92rem' }}>{track.title}</div>
                                <div className="card-artist">{track.artists?.name || track.artist || 'استوديو النبلاء'}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Section 3: كبار الفنانين */}
                    <section aria-labelledby="artists-title" id="artists" style={{ marginTop: '24px' }}>
                      <div className="section-header">
                        <h2 id="artists-title" className="section-title">كبار فنانين المنصة 💫</h2>
                      </div>

                      <div className="horizontal-scroll" ref={artistsScrollRef} style={{ paddingBottom: '24px' }}>
                        {artists.filter(a => a.is_featured).map((artist, idx) => (
                          <div
                            key={`featured-artist-${artist.id}`}
                            className="artist-card"
                            onClick={() => {
                              setSelectedArtist(artist);
                              setArtistSubFilter('all');
                              setActiveTab('artist_detail');
                            }}
                          >
                            <div className="card-inner-bg" style={{ backgroundImage: `url(${artist.image_url || getArtistImage(artist.name)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                              <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', color: '#fff', backdropFilter: 'blur(4px)' }}>
                                FMT
                              </div>

                              <div className="card-text-overlay">
                                <div className="card-title" style={{ fontSize: '0.85rem' }}>{artist.name}</div>
                                <div className="card-artist" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{artist.specialty}</div>
                                <div style={{ fontSize: '0.65rem', color: '#f1f5f9', opacity: 0.8, marginTop: '2px', wordBreak: 'break-word', lineHeight: '1.2' }}>{artist.description}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 16px 24px' }}>
                        <button
                          onClick={() => setActiveTab('all_artists')}
                          style={{
                            padding: '10px 28px',
                            background: 'var(--accent-color)',
                            color: '#000',
                            border: 'none',
                            borderRadius: 'var(--radius-full)',
                            fontFamily: 'var(--font-arabic)',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(204,164,59,0.35)'
                          }}
                        >
                          عرض كل الفنانين ←
                        </button>
                      </div>
                    </section>

                    {/* Footer */}
                    <footer style={{ padding: '24px 16px 80px', borderTop: '1px solid var(--border-color)', marginTop: '24px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '8px' }}>
                        <strong>استوديو النبلاء للصوتيات</strong> — متخصصون في إنتاج{' '}
                        <a href="#works" onClick={(e) => { e.preventDefault(); setActiveTab('all_works'); setAllWorksFilter('sheelat'); }} style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>الشيلات بالأسماء</a>،{' '}
                        <a href="#works" onClick={(e) => { e.preventDefault(); setActiveTab('all_works'); setAllWorksFilter('zaffat'); }} style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>زفات الأفراح</a>،{' '}
                        الأناشيد الإسلامية، المكس والماستر الاحترافي، وتسجيل البودكاست.
                      </p>
                      <address style={{ fontStyle: 'normal', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        تواصل معنا:{' '}
                        <a href="https://wa.me/967776158797" style={{ color: 'var(--accent-color)', textDecoration: 'none' }} rel="noopener noreferrer" target="_blank">واتساب: 967776158797+</a>
                      </address>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        © {new Date().getFullYear()} استوديو النبلاء للصوتيات. جميع الحقوق محفوظة.
                      </p>
                    </footer>
                  </>
                ) : (
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>طلبات الحجز الحالية</h3>
                      <button className="btn-primary" onClick={() => setIsBookingOpen(true)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>حجز جديد +</button>
                    </div>

                    {bookings.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                        <ClipboardList size={40} strokeWidth={1} style={{ marginBottom: '12px' }} />
                        <p>لا يوجد لديك طلبات حجز حالية.</p>
                      </div>
                    ) : (
                      bookings.map((booking) => (
                        <div key={booking.id} className="booking-card" style={{ margin: '0 0 12px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{booking.client_name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{booking.service_type}</div>
                            </div>
                            <div className={`booking-status ${booking.status}`}>{booking.status === 'pending' ? 'قيد الانتظار' : booking.status === 'confirmed' ? 'تم التأكيد' : 'ملغي'}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '15px', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Calendar size={12} />{booking.booking_date}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={12} />{booking.booking_time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}

            {/* View: All Artists */}
            {activeTab === 'all_artists' && (
              <div className="artists-grid-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <button
                    onClick={() => setActiveTab('home')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-color)', fontWeight: '700', fontSize: '1rem', fontFamily: 'var(--font-arabic)' }}
                  >
                    ← العودة
                  </button>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>كبار فنانين المنصة</h2>
                </div>

                <div className="artists-grid">
                  {artists.map((artist, idx) => (
                    <div
                      key={`all-artist-${artist.id}`}
                      className="artist-card"
                      style={{ width: '100%', height: '200px' }}
                      onClick={() => {
                        setSelectedArtist(artist);
                        setArtistSubFilter('all');
                        setActiveTab('artist_detail');
                      }}
                    >
                      <div
                        className="card-inner-bg"
                        style={{ backgroundImage: `url(${artist.image_url || getArtistImage(artist.name)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      >
                        <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: 'rgba(204,164,59,0.85)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 'bold', color: '#000' }}>
                          FMT
                        </div>
                        <div className="card-text-overlay">
                          <div className="card-title" style={{ fontSize: '0.85rem' }}>{artist.name}</div>
                          <div className="card-artist" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{artist.specialty}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: All Works Page */}
            {activeTab === 'all_works' && (
              <div className="all-works-container" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px', scrollbarWidth: 'none' }}>
                  <button onClick={() => setAllWorksFilter('all')} style={{ padding: '8px 16px', borderRadius: '20px', background: allWorksFilter === 'all' ? 'var(--accent-color)' : 'var(--bg-secondary)', color: allWorksFilter === 'all' ? '#000' : 'var(--text-primary)', border: 'none', whiteSpace: 'nowrap', fontWeight: 'bold', cursor: 'pointer' }}>
                    كل الأعمال
                  </button>
                  <button onClick={() => setAllWorksFilter('saved')} style={{ padding: '8px 16px', borderRadius: '20px', background: allWorksFilter === 'saved' ? 'var(--accent-color)' : 'var(--bg-secondary)', color: allWorksFilter === 'saved' ? '#000' : 'var(--text-primary)', border: 'none', whiteSpace: 'nowrap', fontWeight: 'bold', cursor: 'pointer' }}>
                    المفضلة
                  </button>
                  <button onClick={() => setAllWorksFilter('zaffat')} style={{ padding: '8px 16px', borderRadius: '20px', background: allWorksFilter === 'zaffat' ? 'var(--accent-color)' : 'var(--bg-secondary)', color: allWorksFilter === 'zaffat' ? '#000' : 'var(--text-primary)', border: 'none', whiteSpace: 'nowrap', fontWeight: 'bold', cursor: 'pointer' }}>
                    زفات
                  </button>
                  <button onClick={() => setAllWorksFilter('sheelat')} style={{ padding: '8px 16px', borderRadius: '20px', background: allWorksFilter === 'sheelat' ? 'var(--accent-color)' : 'var(--bg-secondary)', color: allWorksFilter === 'sheelat' ? '#000' : 'var(--text-primary)', border: 'none', whiteSpace: 'nowrap', fontWeight: 'bold', cursor: 'pointer' }}>
                    شيلات
                  </button>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="ابحث عن عمل..."
                    value={allWorksSearch}
                    onChange={(e) => setAllWorksSearch(e.target.value)}
                    style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'var(--font-arabic)' }}
                  />
                  <Search size={18} style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--text-muted)' }} />
                </div>

                {/* List of works */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '80px' }}>
                  {(() => {
                    let filtered = tracks;

                    if (allWorksFilter === 'saved') {
                      filtered = filtered.filter(t => savedTrackIds.includes(t.id));
                    } else if (allWorksFilter === 'zaffat') {
                      filtered = filtered.filter(t => (t.filters || []).includes('زفات') || t.title.includes('زفة') || t.title.includes('زفات'));
                    } else if (allWorksFilter === 'sheelat') {
                      filtered = filtered.filter(t => (t.filters || []).includes('شيلات') || t.title.includes('شيلة') || t.title.includes('شيلات'));
                    }

                    if (allWorksSearch) {
                      filtered = filtered.filter(t => t.title.includes(allWorksSearch) || (t.artists?.name || '').includes(allWorksSearch));
                    }

                    if (filtered.length === 0) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                          <Search size={40} strokeWidth={1} style={{ marginBottom: '12px', opacity: 0.5 }} />
                          <p>لا توجد نتائج مطابقة</p>
                        </div>
                      );
                    }

                    return filtered.map((track, i) => (
                      <div
                        key={`allworks-${track.id}`}
                        onClick={() => handleSelectTrack(track)}
                        style={{ display: 'flex', gap: '12px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--border-color)', alignItems: 'center' }}
                      >
                        <div className={`grad-${(i % 5) + 1}`} style={{ width: '50px', height: '50px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', backgroundImage: `url(${track.cover_image_url || getTrackImage(i)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                          {currentTrack && currentTrack.id === track.id && isPlaying ? (
                            <div className="waveform-container" style={{ height: '10px', gap: '2px' }}>
                              <div className="wave-bar" style={{ width: '2px', height: '100%', background: '#fff' }}></div>
                              <div className="wave-bar" style={{ width: '2px', height: '100%', background: '#fff' }}></div>
                              <div className="wave-bar" style={{ width: '2px', height: '100%', background: '#fff' }}></div>
                            </div>
                          ) : (
                            <Play size={16} fill="#fff" />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>{track.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{track.artists?.name || track.artist || 'استوديو النبلاء'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={(e) => toggleSaveTrack(track.id, e)}
                            style={{ border: 'none', background: 'transparent', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Heart size={20} fill={savedTrackIds.includes(track.id) ? 'var(--accent-color)' : 'none'} color={savedTrackIds.includes(track.id) ? 'var(--accent-color)' : 'var(--text-muted)'} />
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* View 2: Search Viewport */}
            {activeTab === 'search' && (
              <div className="search-container">
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="ابحث عن مؤثرات، ألقاب، أو زفات..."
                    className="form-input"
                    style={{ width: '100%', paddingRight: '40px' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search size={18} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>أعمال مقترحة تناسب بحثك</h3>
                  {getFilteredTracks().map((track, i) => (
                    <div
                      key={`search-res-${track.id}`}
                      onClick={() => handleSelectTrack(track)}
                      style={{ display: 'flex', gap: '12px', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--border-color)', alignItems: 'center' }}
                    >
                      <div className={`grad-${(i % 5) + 1}`} style={{ width: '50px', height: '50px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', backgroundImage: `url(${track.cover_image_url || getTrackImage(i)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <Play size={16} fill="#fff" />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{track.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{track.artists?.name || track.artist || 'استوديو النبلاء'}</div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => addToCart(track, e)}
                          style={{ border: 'none', background: 'var(--bg-tertiary)', width: '32px', height: '32px', borderRadius: '50%', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View 3: Chat Viewport */}
            {activeTab === 'chat' && (
              <div className="chat-container">
                <div className="chat-messages">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                      {msg.text}
                      <div style={{ fontSize: '0.65rem', textAlign: 'left', marginTop: '4px', opacity: 0.7 }}>{msg.time}</div>
                    </div>
                  ))}
                </div>

                <div className="chat-input-bar">
                  <input
                    type="text"
                    placeholder="اكتب استشارتك الصوتية..."
                    className="form-input"
                    style={{ flex: 1 }}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button className="icon-btn" style={{ background: 'var(--accent-color)', color: 'white' }} onClick={sendMessage}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* View 4: Saved / Favorites Viewport */}
            {activeTab === 'saved' && (
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px' }}>المحفوظات 💖</h3>

                {savedTrackIds.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                    <Bookmark size={40} strokeWidth={1} style={{ marginBottom: '12px' }} />
                    <p>قائمتك المفضلة فارغة حالياً.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tracks.filter(t => savedTrackIds.includes(t.id)).map((track, i) => (
                      <div
                        key={`saved-res-${track.id}`}
                        onClick={() => handleSelectTrack(track)}
                        style={{ display: 'flex', gap: '12px', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--border-color)', alignItems: 'center' }}
                      >
                        <div className={`grad-${(i % 5) + 1}`} style={{ width: '50px', height: '50px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', backgroundImage: `url(${track.cover_image_url || getTrackImage(i)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                          <Play size={16} fill="#fff" />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{track.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{track.artists?.name || track.artist || 'استوديو النبلاء'}</div>
                        </div>

                        <button
                          onClick={(e) => toggleSaveTrack(track.id, e)}
                          style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Heart size={16} fill="#ef4444" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View 5: Profile */}
            {activeTab === 'profile' && (
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #cca43b 0%, #0d0d0d 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '2rem', fontWeight: 'bold', marginBottom: '12px' }}>
                    ح
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>حسام العميل المميز</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>husam@studio.com</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>خيارات الحساب</h4>

                  <button
                    onClick={() => {
                      setCategoryFilter('requests');
                      setActiveTab('home');
                    }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '100%', cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit', color: 'inherit' }}
                  >
                    <span>عرض طلباتي وجدول الحجوزات</span>
                    <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>←</span>
                  </button>

                  <button
                    onClick={() => setIsBookingOpen(true)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '100%', cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit', color: 'inherit' }}
                  >
                    <span>طلب حجز تسجيل جديد</span>
                    <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>←</span>
                  </button>

                  <button
                    onClick={() => alert("استوديو مهيأ ببرنامج نكست جي اس متواصل بقاعدة بيانات سوبابيس")}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '100%', cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit', color: 'inherit' }}
                  >
                    <span>معلومات النظام والنسخة</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>v2.0.0 Next.js + Supabase</span>
                  </button>
                </div>
              </div>
            )}

            {/* Floating Action Button */}
            <button className="floating-cart" onClick={() => setIsBookingOpen(true)}>
              <Plus size={24} />
            </button>

            {/* Mini Player */}
            {currentTrack && (
              <div className="mini-player">
                <audio
                  ref={audioRef}
                  src={currentTrack.audio_url || currentTrack.audio_file}
                  onTimeUpdate={handleTimeUpdate}
                />

                <div className="player-cover grad-2" onClick={handlePlayPause} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
                  {isPlaying ? <Pause size={18} /> : <Play size={18} fill="#fff" />}
                </div>

                <div className="player-info" onClick={handlePlayPause} style={{ cursor: 'pointer' }}>
                  <span className="player-title">{currentTrack.title}</span>
                  <span className="player-artist">{currentTrack.artists?.name || currentTrack.artist || 'استوديو النبلاء'}</span>
                </div>

                <div
                  style={{ width: '17%', height: '6px', background: 'var(--border-color)', borderRadius: '2px', cursor: 'pointer', position: 'relative', overflow: 'hidden', alignItems: 'center' }}
                  onClick={handleProgressBarClick}
                >
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-color)' }}></div>
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {formatTime(currentTimeSec)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginRight: 'auto', gap: '4px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const msg = `مرحباً، أعجبتني (${currentTrack.title}) وأرغب في طلب عمل مشابه.`;
                      window.open(`https://wa.me/967776158797?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    style={{ background: 'rgba(37, 211, 102, 0.15)', border: '1px solid #25D366', color: '#25D366', borderRadius: '10px', cursor: 'pointer', padding: '4px 5px', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem', fontWeight: 'bold' }}
                    title="اطلب مثل هذا العمل عبر واتساب"
                  >
                    <MessageCircle size={30} className="hide-mobile" />
                    <span>اطلب مثل</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = typeof window !== 'undefined' ? window.location.origin + `/#track-${encodeURIComponent(currentTrack.title)}` : '';
                      if (navigator.share) {
                        navigator.share({
                          title: currentTrack.title,
                          text: `استمع إلى ${currentTrack.title} من استوديو النبلاء`,
                          url: url
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(url);
                        alert('تم نسخ الرابط!');
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px' }}
                    title="مشاركة"
                  >
                    <Share2 size={16} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (audioRef.current) {
                        audioRef.current.pause();
                      }
                      setIsPlaying(false);
                      setCurrentTrack(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="إغلاق"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Navigation */}
            <div className="bottom-nav" style={{ width: '100%' }}>
              <button className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setCategoryFilter('all'); }}>
                <Compass className="nav-tab-icon" />
                الرئيسية
              </button>
              <button className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
                <Search className="nav-tab-icon" />
                البحث
              </button>
              <button className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                <MessageSquare className="nav-tab-icon" />
                الدردشة
              </button>
              <button className={`nav-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
                <Bookmark className="nav-tab-icon" />
                المحفوظات
              </button>
              <button className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                <User className="nav-tab-icon" />
                صفحتي
              </button>
            </div>

            {/* Drawer: Place audio booking request */}
            {isBookingOpen && (
              <>
                <div className="drawer-overlay" onClick={() => setIsBookingOpen(false)}></div>
                <div className="drawer">
                  <div className="drawer-header">
                    <span className="drawer-title">طلب جديد بجدول الهندسة</span>
                    <button className="icon-btn" onClick={() => setIsBookingOpen(false)}>×</button>
                  </div>

                  <form onSubmit={submitBooking}>
                    <div className="form-group">
                      <label className="form-label">الاسم</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="مثال: خالد محمد"
                        value={bookingForm.client_name}
                        onChange={(e) => setBookingForm({ ...bookingForm, client_name: e.target.value })}
                      />
                    </div>

                    {cart.length > 0 && (
                      <div className="form-group" style={{ background: 'rgba(204,164,59,0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(204,164,59,0.3)' }}>
                        <label className="form-label" style={{ color: 'var(--accent-color)' }}>الأعمال المختارة كمرجع للطلب:</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {cart.map((item) => (
                            <div key={`cart-${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-primary)', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                              <span style={{ fontWeight: 'bold' }}>{item.title}</span>
                              <button type="button" onClick={() => removeFromCart(item.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>حذف</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">الخدمة المطلوبة</label>
                      <select
                        className="form-input"
                        value={bookingForm.service_type}
                        onChange={(e) => setBookingForm({ ...bookingForm, service_type: e.target.value })}
                      >
                        <option value="recording">Recording Session (جلسة تسجيل)</option>
                        <option value="mixing_mastering">Mixing & Mastering (مكس وماستر)</option>
                        <option value="voiceover">Voiceover & Dubbing (تعليق صوتي)</option>
                        <option value="podcast">Podcast Production (بودكاست مجهز)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">تفاصيل العمل الصوتي</label>
                      <textarea
                        className="form-input"
                        style={{ height: '60px', fontFamily: 'inherit' }}
                        placeholder="اكتب الأسماء المطلوبة أو التجهيزات المرافقة..."
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>إرسال حجز للاستوديو</button>
                  </form>
                </div>
              </>
            )}

          </main>

          {/* Artist Detail */}
          {activeTab === 'artist_detail' && selectedArtist && (
            <div className="artist-detail-page">
              <div className="artist-detail-header" style={{ backgroundImage: `url(${selectedArtist.image_url || getArtistImage(selectedArtist.name)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <button className="back-btn" onClick={() => { setActiveTab('home'); setSelectedArtist(null); }}>
                  العودة ←
                </button>
                <div className="artist-header-content">
                  <div className="artist-header-name">{selectedArtist.name}</div>
                  <div className="artist-header-specialty">{selectedArtist.specialty}</div>
                  <div className="artist-header-desc">{selectedArtist.description}</div>
                </div>
              </div>

              {/* Scrollable filter tabs */}
              <div className="artist-filter-slider">
                {['all', 'مع موسيقى', 'بدون موسيقى', 'زفات', 'شيلات', 'اناشيد'].map(filter => (
                  <div
                    key={filter}
                    className={`filter-slider-item ${artistSubFilter === filter ? 'active' : ''}`}
                    onClick={() => setArtistSubFilter(filter)}
                  >
                    {filter === 'all' ? 'الكل' : filter}
                  </div>
                ))}
              </div>

              {/* Track list */}
              <div className="artist-tracks-container">
                <div className="artist-tracks-list" style={{ marginTop: '12px' }}>
                  {getArtistFilteredTracks().length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Music size={36} strokeWidth={1} />
                      <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>لا توجد أعمال في هذا التصنيف</p>
                    </div>
                  ) : (
                    getArtistFilteredTracks().map((track) => (
                      <div
                        key={`art-trk-${track.id}`}
                        className={`artist-track-item ${currentTrack && currentTrack.id === track.id ? 'active' : ''}`}
                        onClick={() => handleSelectTrack(track)}
                      >
                        <div className="track-icon-avatar">
                          {currentTrack && currentTrack.id === track.id && isPlaying
                            ? <Pause size={14} />
                            : <Play size={14} style={{ marginLeft: '2px' }} />}
                        </div>
                        <div style={{ flex: 1, padding: '0 12px' }}>
                          <div className="track-title">{track.title}</div>
                          <div className="track-desc">{track.artists?.name || track.artist || 'استوديو النبلاء'} • {Array.isArray(track.filters) ? track.filters.join(', ') : 'صوتيات'}</div>
                        </div>
                        <div className="track-duration">{track.duration || '03:40'}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

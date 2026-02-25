import React, { useState, useEffect } from 'react';
import { supabase, WeddingSettings, RSVP, GalleryImage } from '../lib/supabase';
import { Save, LogOut, Plus, Trash2, Image as ImageIcon, Users, Settings, MessageSquare, ExternalLink, Phone, X, Database, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  onUpdate: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'gallery' | 'rsvps'>('settings');
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [wishes, setWishes] = useState<any[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedRSVP, setSelectedRSVP] = useState<RSVP | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (supabase) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    if (!supabase) return;
    setIsLoading(true);
    setFetchError(null);
    
    try {
      const [settingsRes, rsvpsRes, galleryRes] = await Promise.all([
        supabase.from('EASE-settings').select('*').single(),
        supabase.from('EASE-rsvp').select('*').order('created_at', { ascending: false }),
        supabase.from('EASE-gallery').select('*').order('order', { ascending: true })
      ]);

      if (settingsRes.error && settingsRes.error.code !== 'PGRST116') {
        throw new Error(`Settings error: ${settingsRes.error.message}`);
      }
      if (rsvpsRes.error) throw new Error(`RSVP error: ${rsvpsRes.error.message}`);
      if (galleryRes.error) throw new Error(`Gallery error: ${galleryRes.error.message}`);

      if (settingsRes.data) setSettings(settingsRes.data);
      if (rsvpsRes.data) {
        setRsvps(rsvpsRes.data);
        // Filter wishes from RSVPs
        const guestWishes = rsvpsRes.data.filter(r => r.message && r.message.trim() !== '');
        setWishes(guestWishes);
      }
      if (galleryRes.data) setGallery(galleryRes.data);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setFetchError(err.message || 'An unexpected error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !supabase) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('EASE-settings')
      .update(settings)
      .eq('id', settings.id);

    if (error) alert('Error saving settings: ' + error.message);
    else {
      onUpdate();
      alert('Settings saved successfully!');
    }
    setIsSaving(false);
  };

  const handleAddImage = async () => {
    if (!newImageUrl || !supabase) return;
    const { error } = await supabase
      .from('EASE-gallery')
      .insert([{ url: newImageUrl, order: gallery.length }]);

    if (error) alert('Error adding image: ' + error.message);
    else {
      setNewImageUrl('');
      fetchData();
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Delete this image?') || !supabase) return;
    const { error } = await supabase.from('EASE-gallery').delete().eq('id', id);
    if (error) alert('Error deleting image: ' + error.message);
    else fetchData();
  };

  const handleDeleteRSVP = async (id: string) => {
    if (!confirm('Delete this RSVP?') || !supabase) return;
    const { error } = await supabase.from('EASE-rsvp').delete().eq('id', id);
    if (error) alert('Error deleting RSVP: ' + error.message);
    else fetchData();
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm('Remove this wish from the guest book? (The RSVP will remain)') || !supabase) return;
    const { error } = await supabase
      .from('EASE-rsvp')
      .update({ message: '' })
      .eq('id', id);
      
    if (error) alert('Error removing wish: ' + error.message);
    else fetchData();
  };

  const handleSeedDatabase = async () => {
    if (!supabase || !confirm('This will populate your database with default wedding data. Continue?')) return;
    setIsSeeding(true);
    try {
      // 1. Seed Settings
      const { data: existingSettings } = await supabase.from('EASE-settings').select('id').single();
      const defaultSettings = {
        groom_name: 'Emmanuel',
        bride_name: 'Esther',
        wedding_date: '2026-07-11T10:00:00Z',
        engagement_time: '7:30 AM',
        church_service_time: '11:00 AM',
        venue_name: 'Miracles-Link Word Ministries Intl.',
        venue_address: 'Behinde Nepa\'s Quaters, Araromi, Oyo',
        reception_details: 'Location on Access Card',
        hashtag: '#EASE\'26',
        rsvp_deadline: 'June 25th, 2026',
        rsvp_phones: ['08023650289', '07018712196', '09039244218'],
        hero_image_url: 'https://picsum.photos/seed/wedding-hero/1920/1080',
        background_image_url: 'https://picsum.photos/seed/wedding-bg/1920/1080?blur=10'
      };

      if (existingSettings) {
        await supabase.from('EASE-settings').update(defaultSettings).eq('id', existingSettings.id);
      } else {
        await supabase.from('EASE-settings').insert([defaultSettings]);
      }

      // 3. Seed Gallery
      const defaultImages = [
        { url: "https://picsum.photos/seed/wed1/1200/800", order: 0 },
        { url: "https://picsum.photos/seed/wed2/1200/800", order: 1 },
        { url: "https://picsum.photos/seed/wed3/1200/800", order: 2 }
      ];
      await supabase.from('EASE-gallery').insert(defaultImages);

      // 4. Seed RSVPs with Guest Book entries
      const defaultRSVPs = [
        { name: 'John Doe', email: 'john@example.com', attending: 'yes', guests: 2, message: 'Wishing you both a lifetime of happiness and love!' },
        { name: 'Jane Smith', email: 'jane@example.com', attending: 'yes', guests: 1, message: 'So happy for you two! Can\'t wait to celebrate.' },
        { name: 'Michael Brown', email: 'mike@example.com', attending: 'no', guests: 0, message: 'May your journey together be filled with joy and laughter. Sorry I can\'t make it!' }
      ];
      await supabase.from('EASE-rsvp').insert(defaultRSVPs);

      alert('Database seeded successfully!');
      fetchData();
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Unknown error';
      if (msg.includes('relation') && msg.includes('does not exist')) {
        alert('Error: Database tables not found. Please run the SQL schema in your Supabase SQL Editor first.');
      } else {
        alert(`Error seeding database: ${msg}`);
      }
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] flex flex-col">
      {/* Header */}
      <header className="bg-[#008080] text-white p-6 shadow-lg flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <Settings size={24} />
          </div>
          <h1 className="text-xl font-serif-elegant font-bold tracking-widest">EASE'26 ADMIN</h1>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all text-sm font-bold"
        >
          <LogOut size={18} /> Logout
        </button>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto p-6 grid md:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'settings' ? 'bg-[#008080] text-white shadow-md' : 'hover:bg-stone-100 text-stone-600'}`}
            >
              <Settings size={20} /> Wedding Details
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'gallery' ? 'bg-[#008080] text-white shadow-md' : 'hover:bg-stone-100 text-stone-600'}`}
            >
              <ImageIcon size={20} /> Gallery
            </button>
            <button 
              onClick={() => setActiveTab('rsvps')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'rsvps' ? 'bg-[#008080] text-white shadow-md' : 'hover:bg-stone-100 text-stone-600'}`}
            >
              <Users size={20} /> RSVPs
            </button>
            <button 
              onClick={() => setActiveTab('guestbook' as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === ('guestbook' as any) ? 'bg-[#008080] text-white shadow-md' : 'hover:bg-stone-100 text-stone-600'}`}
            >
              <MessageSquare size={20} /> Guest Book
            </button>
          </div>

          <div className="pt-6 border-t border-stone-100">
            <div className="bg-stone-50 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-400">
                <Database size={14} /> Database Status
              </div>
              
              <div className="flex items-center gap-2">
                {supabase ? (
                  <>
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-xs font-bold text-green-700">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} className="text-amber-500" />
                    <span className="text-xs font-bold text-amber-700">Not Configured</span>
                  </>
                )}
              </div>

              <button 
                onClick={handleSeedDatabase}
                disabled={!supabase || isSeeding}
                className="w-full bg-stone-200 hover:bg-stone-300 text-stone-700 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSeeding ? 'Seeding...' : 'Seed Default Data'}
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-[#008080] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-[#008080] uppercase tracking-widest">Loading Data...</p>
              </div>
            </div>
          )}

          {fetchError && (
            <div className="mb-8 bg-red-50 border border-red-100 p-6 rounded-2xl flex flex-col items-center text-center gap-4">
              <AlertTriangle className="text-red-500" size={32} />
              <div>
                <h3 className="text-red-900 font-bold">Data Fetch Error</h3>
                <p className="text-red-700 text-sm mt-1">{fetchError}</p>
              </div>
              <button 
                onClick={fetchData}
                className="bg-red-100 text-red-700 px-6 py-2 rounded-xl text-xs font-bold hover:bg-red-200 transition-all flex items-center gap-2"
              >
                <Database size={14} /> Try Again
              </button>
            </div>
          )}

          {activeTab === 'settings' && settings && (
            <form onSubmit={handleSaveSettings} className="space-y-8">
              <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-serif-elegant text-[#008080]">Wedding Details</h2>
                  <button 
                    type="button"
                    onClick={fetchData}
                    className="text-stone-400 hover:text-[#008080] transition-colors"
                    title="Refresh Data"
                  >
                    <Database size={18} />
                  </button>
                </div>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#008080] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#006666] transition-all disabled:opacity-50"
                >
                  <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Bride Name</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
                    value={settings.bride_name}
                    onChange={e => setSettings({...settings, bride_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Groom Name</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
                    value={settings.groom_name}
                    onChange={e => setSettings({...settings, groom_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Wedding Date (ISO)</label>
                  <input 
                    type="datetime-local"
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
                    value={new Date(settings.wedding_date).toISOString().slice(0, 16)}
                    onChange={e => setSettings({...settings, wedding_date: new Date(e.target.value).toISOString()})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Hashtag</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
                    value={settings.hashtag}
                    onChange={e => setSettings({...settings, hashtag: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Engagement Time</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
                    value={settings.engagement_time}
                    onChange={e => setSettings({...settings, engagement_time: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Church Service Time</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
                    value={settings.church_service_time}
                    onChange={e => setSettings({...settings, church_service_time: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Venue Name</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
                    value={settings.venue_name}
                    onChange={e => setSettings({...settings, venue_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Venue Address</label>
                  <textarea 
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none resize-none"
                    rows={2}
                    value={settings.venue_address}
                    onChange={e => setSettings({...settings, venue_address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-stone-400">RSVP Deadline</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
                    value={settings.rsvp_deadline}
                    onChange={e => setSettings({...settings, rsvp_deadline: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Reception Details</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
                    value={settings.reception_details}
                    onChange={e => setSettings({...settings, reception_details: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-stone-400">RSVP Contact Phones (Comma separated)</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
                    value={settings.rsvp_phones.join(', ')}
                    onChange={e => setSettings({...settings, rsvp_phones: e.target.value.split(',').map(p => p.trim())})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2 border-t border-stone-100 pt-6">
                  <h3 className="text-sm font-bold text-[#008080] uppercase tracking-wider">Theme Images</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Hero Image URL</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
                    placeholder="https://..."
                    value={settings.hero_image_url || ''}
                    onChange={e => setSettings({...settings, hero_image_url: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Background Image URL</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
                    placeholder="https://..."
                    value={settings.background_image_url || ''}
                    onChange={e => setSettings({...settings, background_image_url: e.target.value})}
                  />
                </div>
              </div>
            </form>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                <h2 className="text-2xl font-serif-elegant text-[#008080]">Gallery Management</h2>
              </div>

              <div className="flex gap-2">
                <input 
                  className="flex-1 px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
                  placeholder="Paste Image URL here..."
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                />
                <button 
                  onClick={handleAddImage}
                  className="bg-[#008080] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#006666] transition-all flex items-center gap-2"
                >
                  <Plus size={18} /> Add Image
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((img) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-video bg-stone-100">
                    <img src={img.url} className="w-full h-full object-cover" alt="Gallery" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handleDeleteImage(img.id)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rsvps' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                <h2 className="text-2xl font-serif-elegant text-[#008080]">RSVPs</h2>
                <div className="text-sm text-stone-400 font-bold">Total: {rsvps.length}</div>
              </div>

              <div className="space-y-4">
                {rsvps.length === 0 ? (
                  <div className="text-center py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                    <Users size={48} className="mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-500 font-medium">No RSVPs yet.</p>
                    <p className="text-stone-400 text-xs mt-1">When guests submit the form, they will appear here.</p>
                    <button 
                      onClick={fetchData}
                      className="mt-6 text-[#008080] text-sm font-bold hover:underline flex items-center gap-2 mx-auto"
                    >
                      <Database size={14} /> Refresh Data
                    </button>
                  </div>
                ) : (
                  rsvps.map((rsvp) => (
                  <div key={rsvp.id} className="border border-stone-100 rounded-2xl p-6 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-[#008080]">{rsvp.name}</h3>
                        <p className="text-sm text-stone-400">{rsvp.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${rsvp.attending === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {rsvp.attending === 'yes' ? 'Attending' : 'Not Attending'}
                        </span>
                        <button 
                          onClick={() => setSelectedRSVP(rsvp)}
                          className="text-stone-300 hover:text-[#008080] transition-colors"
                          title="View Details"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRSVP(rsvp.id)}
                          className="text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    {rsvp.message && (
                      <div className="bg-stone-50 p-4 rounded-xl flex gap-3">
                        <MessageSquare size={18} className="text-[#008080] shrink-0 mt-1" />
                        <p className="text-stone-600 italic text-sm">"{rsvp.message}"</p>
                      </div>
                    )}
                    <div className="mt-4 text-[10px] text-stone-300 uppercase tracking-widest font-bold">
                      Guests: {rsvp.guests} | Submitted: {new Date(rsvp.created_at).toLocaleString()}
                    </div>
                  </div>
                )))}
              </div>
            </div>
          )}

          {(activeTab as string) === 'guestbook' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                <h2 className="text-2xl font-serif-elegant text-[#008080]">Guest Book Management</h2>
                <div className="text-sm text-stone-400 font-bold">Total Wishes: {wishes.length}</div>
              </div>

              <div className="space-y-4">
                {wishes.length === 0 ? (
                  <div className="text-center py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                    <MessageSquare size={48} className="mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-500 font-medium">No wishes yet.</p>
                  </div>
                ) : (
                  wishes.map((wish) => (
                    <div key={wish.id} className="border border-stone-100 rounded-2xl p-6 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-[#008080]">{wish.name}</h3>
                          <p className="text-xs text-stone-300 uppercase tracking-widest font-bold">
                            {new Date(wish.created_at).toLocaleString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteWish(wish.id)}
                          className="text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="bg-stone-50 p-4 rounded-xl">
                        <p className="text-stone-600 italic leading-relaxed">"{wish.message}"</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* RSVP Details Modal */}
      {selectedRSVP && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up">
            <div className="bg-[#008080] p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-serif-elegant">RSVP Details</h3>
              <button onClick={() => setSelectedRSVP(null)} className="hover:rotate-90 transition-transform">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-1">Guest Name</label>
                  <p className="font-bold text-stone-800">{selectedRSVP.name}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-1">Email Address</label>
                  <p className="text-stone-600">{selectedRSVP.email}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-1">Status</label>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${selectedRSVP.attending === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedRSVP.attending === 'yes' ? 'Attending' : 'Not Attending'}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-1">Number of Guests</label>
                  <p className="font-bold text-stone-800">{selectedRSVP.guests}</p>
                </div>
              </div>
              
              <div className="border-t border-stone-100 pt-6">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-2">Message / Wish</label>
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <p className="text-stone-700 italic leading-relaxed">
                    {selectedRSVP.message ? `"${selectedRSVP.message}"` : "No message provided."}
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-stone-300 uppercase tracking-widest font-bold pt-4">
                Submitted on {new Date(selectedRSVP.created_at).toLocaleString()}
              </div>
            </div>
            <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button 
                onClick={() => setSelectedRSVP(null)}
                className="bg-[#008080] text-white px-8 py-2 rounded-xl font-bold hover:bg-[#006666] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

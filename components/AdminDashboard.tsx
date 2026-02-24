import React, { useState, useEffect } from 'react';
import { supabase, WeddingSettings, RSVP, GalleryImage } from '../lib/supabase';
import { Save, LogOut, Plus, Trash2, Image as ImageIcon, Users, Settings, MessageSquare } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  onUpdate: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'gallery' | 'rsvps'>('settings');
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (supabase) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    if (!supabase) return;
    
    const [settingsRes, rsvpsRes, galleryRes] = await Promise.all([
      supabase.from('EASE-settings').select('*').single(),
      supabase.from('EASE-rsvp').select('*').order('created_at', { ascending: false }),
      supabase.from('EASE-gallery').select('*').order('order', { ascending: true })
    ]);

    if (settingsRes.data) setSettings(settingsRes.data);
    if (rsvpsRes.data) setRsvps(rsvpsRes.data);
    if (galleryRes.data) setGallery(galleryRes.data);
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
        <aside className="space-y-2">
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
            <Users size={20} /> RSVPs & Guest Book
          </button>
        </aside>

        {/* Content */}
        <main className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 overflow-hidden">
          {activeTab === 'settings' && settings && (
            <form onSubmit={handleSaveSettings} className="space-y-8">
              <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                <h2 className="text-2xl font-serif-elegant text-[#008080]">Wedding Details</h2>
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
                <h2 className="text-2xl font-serif-elegant text-[#008080]">RSVPs & Guest Book</h2>
                <div className="text-sm text-stone-400 font-bold">Total: {rsvps.length}</div>
              </div>

              <div className="space-y-4">
                {rsvps.map((rsvp) => (
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
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

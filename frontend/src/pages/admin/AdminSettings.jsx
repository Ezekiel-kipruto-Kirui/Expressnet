import { Check, Palette, Save, Type } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'expressnet.admin.preferences';
const palettes = [
  { id: 'blue', label: 'Ocean blue', color: '#2563eb' },
  { id: 'violet', label: 'Violet', color: '#7c3aed' },
  { id: 'teal', label: 'Teal', color: '#0f9f91' },
  { id: 'rose', label: 'Rose', color: '#e44770' },
  { id: 'orange', label: 'Express orange', color: '#f97316' },
];
const fonts = [
  { id: 'Inter', label: 'Inter' },
  { id: 'Roboto', label: 'Roboto' },
  { id: 'system-ui', label: 'System default' },
  { id: 'Georgia', label: 'Georgia' },
  { id: 'Arial', label: 'Arial' },
];

function readPreferences() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

export default function AdminSettings() {
  const [preferences, setPreferences] = useState({ theme: 'dark', accent: 'blue', font: 'Inter', terms: '', ...readPreferences() });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setPreferences((current) => ({ ...current, ...readPreferences() }));
    window.addEventListener('expressnet-admin-preferences', handleUpdate);
    return () => window.removeEventListener('expressnet-admin-preferences', handleUpdate);
  }, []);

  const update = (key, value) => { setSaved(false); setPreferences((current) => ({ ...current, [key]: value })); };
  const save = (event) => {
    event.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    window.dispatchEvent(new Event('expressnet-admin-preferences'));
    setSaved(true);
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <div><p className="admin-accent-label text-[10px] font-bold uppercase tracking-[0.18em]">Personalization</p><h2 className="admin-heading mt-1 text-2xl font-bold tracking-tight">Settings</h2><p className="admin-muted mt-1 text-sm">Choose how the administration console looks and set your platform terms.</p></div>

      <section className="admin-card overflow-hidden rounded-2xl border shadow-[0_16px_48px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200/70 px-5 py-4"><h3 className="admin-heading flex items-center gap-2 text-sm font-bold"><Palette size={16} className="admin-accent-text" />Appearance</h3><p className="admin-muted mt-1 text-xs">Theme and accent color apply across all admin pages.</p></div>
        <div className="grid gap-6 p-5 lg:grid-cols-2">
          <fieldset><legend className="admin-heading mb-3 text-xs font-semibold">Page theme</legend><div className="grid grid-cols-3 gap-2">{[['light', 'Light'], ['dark', 'Dark'], ['system', 'System']].map(([value, label]) => <button key={value} type="button" onClick={() => update('theme', value)} className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${preferences.theme === value ? 'admin-selected-option' : 'admin-option'}`}><span className={`mx-auto mb-2 block h-7 w-11 rounded-md border ${value === 'dark' ? 'border-slate-600 bg-slate-800' : value === 'system' ? 'border-slate-300 bg-gradient-to-r from-white to-slate-800' : 'border-slate-200 bg-white'}`} />{label}</button>)}</div></fieldset>
          <fieldset><legend className="admin-heading mb-3 text-xs font-semibold">Accent color</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{palettes.map((palette) => <button key={palette.id} type="button" onClick={() => update('accent', palette.id)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition ${preferences.accent === palette.id ? 'admin-selected-option' : 'admin-option'}`}><span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: palette.color }}>{preferences.accent === palette.id && <Check size={14} className="text-white" />}</span>{palette.label}</button>)}</div></fieldset>
          <label className="block"><span className="admin-heading mb-2 flex items-center gap-2 text-xs font-semibold"><Type size={15} className="admin-accent-text" />Interface font</span><select value={preferences.font} onChange={(event) => update('font', event.target.value)} className="admin-input h-10 w-full rounded-xl border px-3 text-xs"><option value="Inter">Inter</option><option value="Roboto">Roboto</option><option value="system-ui">System default</option><option value="Georgia">Georgia</option><option value="Arial">Arial</option></select><span className="admin-muted mt-1 block text-[10px]">The selected font is used throughout the admin console.</span></label>
        </div>
      </section>

      <section className="admin-card overflow-hidden rounded-2xl border shadow-[0_16px_48px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200/70 px-5 py-4"><h3 className="admin-heading text-sm font-bold">Terms and conditions</h3><p className="admin-muted mt-1 text-xs">Set the terms displayed to businesses using the platform.</p></div>
        <div className="p-5"><label htmlFor="admin-terms" className="admin-heading mb-2 block text-xs font-semibold">Terms content</label><textarea id="admin-terms" rows="9" value={preferences.terms} onChange={(event) => update('terms', event.target.value)} placeholder="Enter your platform terms and conditions…" className="admin-input w-full resize-y rounded-xl border p-3 text-sm leading-6 outline-none focus:ring-4" /><p className="admin-muted mt-2 text-[10px]">Saved in this browser. To publish these terms for all businesses, connect this setting to the platform configuration API.</p></div>
      </section>

      <div className="flex items-center justify-end gap-3"><span role="status" className="admin-muted text-xs">{saved ? 'Settings saved' : ''}</span><button type="submit" className="admin-primary inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-semibold text-white shadow-md transition"><Save size={15} />Save settings</button></div>
    </form>
  );
}

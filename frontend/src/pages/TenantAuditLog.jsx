import { CalendarDays, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

function kindOf(action = '') {
  const value = action.toLowerCase();
  if (value.includes('delete')) return 'deletion';
  if (value.includes('update') || value.includes('patch') || value.includes('edit')) return 'update';
  if (value.includes('create') || value.includes('post')) return 'create';
  return 'event';
}

export default function TenantAuditLog() {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async (showError = true) => {
      try {
        const { data } = await api.get('/audit/logs');
        if (alive) setLogs(Array.isArray(data) ? data : []);
      } catch (error) {
        if (alive && showError) toast.error(error.response?.data?.message || 'Could not load account activity');
      } finally { if (alive) setLoading(false); }
    };
    load();
    const timer = window.setInterval(() => load(false), 30000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

  const filtered = useMemo(() => logs.filter((log) => {
    const date = log.timestamp ? new Date(log.timestamp) : null;
    if (from && date && date < new Date(`${from}T00:00:00`)) return false;
    if (to && date && date > new Date(`${to}T23:59:59`)) return false;
    return [log.action, log.target_type, log.target_id, log.admin_email, log.ip, JSON.stringify(log.metadata || {})].join(' ').toLowerCase().includes(query.trim().toLowerCase());
  }), [logs, from, to, query]);
  const today = logs.filter((log) => log.timestamp && new Date(log.timestamp).toDateString() === new Date().toDateString()).length;
  const updates = logs.filter((log) => kindOf(log.action) === 'update').length;
  const deletions = logs.filter((log) => kindOf(log.action) === 'deletion').length;

  return <div className="space-y-5">
    <div className="border-b border-slate-200 pb-4 dark:border-slate-700"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Insights <span className="mx-1 text-slate-400">—</span> Audit trail</p><h1 className="page-title mt-1">Account <span className="text-app-accent">audit trail.</span></h1><p className="page-subtitle">Activity for your business account only. Updates automatically every 30 seconds.</p></div>
    <section className="theme-card overflow-hidden rounded-2xl border"><div className="grid sm:grid-cols-2 xl:grid-cols-4">{[['All events', logs.length, 'in this account'], ['Today', today, 'in the last 24h'], ['Updates', updates, 'account changes'], ['Deletions', deletions, 'removed records']].map(([label, value, note]) => <div key={label} className="border-b border-slate-200 p-4 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0 dark:border-slate-700"><p className="theme-muted text-[10px] font-bold uppercase tracking-wide">{label}</p><p className="theme-text mt-2 text-2xl font-bold">{value}</p><p className="theme-muted mt-1 text-[10px]">{note}</p></div>)}</div></section>
    <div className="grid gap-2 sm:grid-cols-2"><label className="relative"><CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input type="date" aria-label="From date" className="form-input h-10 rounded-full pl-9" value={from} onChange={(event) => setFrom(event.target.value)}/></label><label className="relative"><CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input type="date" aria-label="To date" className="form-input h-10 rounded-full pl-9" value={to} onChange={(event) => setTo(event.target.value)}/></label></div>
    <label className="relative ml-auto block sm:max-w-[360px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input className="form-input h-10 rounded-full pl-9" placeholder="Search event, IP, actor, or model…" value={query} onChange={(event) => setQuery(event.target.value)}/></label>
    <section className="table-shell overflow-hidden rounded-xl"><div className="overflow-x-auto"><table className="min-w-full text-left"><thead className="table-head"><tr>{['Event', 'Target', 'Changes', 'Actor', 'Source', 'When'].map((heading) => <th key={heading} className="whitespace-nowrap px-4 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-700">{loading ? <tr><td colSpan="6" className="table-cell text-center text-slate-500">Loading account events…</td></tr> : filtered.length === 0 ? <tr><td colSpan="6" className="table-cell text-center text-slate-500">No activity recorded for this account.</td></tr> : filtered.map((log) => { const kind = kindOf(log.action); const changes = log.metadata?.updated_fields || log.metadata?.changed_fields || []; return <tr key={log.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800"><td className="whitespace-nowrap px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${kind === 'deletion' ? 'bg-rose-500/15 text-rose-600' : kind === 'update' ? 'bg-amber-500/15 text-amber-600' : 'bg-slate-500/10 text-slate-600'}`}>{String(log.action || 'event').replaceAll('_', '.')}</span></td><td className="whitespace-nowrap px-4 py-4 text-xs font-semibold capitalize">{String(log.target_type || 'Record').replaceAll('_', ' ')} <span className="font-mono font-normal text-slate-500">#{log.target_id || '—'}</span></td><td className="max-w-[240px] px-4 py-4 text-xs text-slate-500">{Array.isArray(changes) && changes.length ? changes.join(', ') : (log.metadata?.path || log.metadata?.business_name || '—')}</td><td className="whitespace-nowrap px-4 py-4 text-xs">{log.metadata?.actor_name || log.admin_email || 'System'}</td><td className="whitespace-nowrap px-4 py-4 font-mono text-[10px] text-slate-500">{log.ip || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-xs">{log.timestamp ? new Date(log.timestamp).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td></tr>; })}</tbody></table></div><div className="border-t border-slate-200 px-4 py-3 text-[10px] text-slate-500 dark:border-slate-700">Showing {filtered.length} of {logs.length} most recent account events</div></section>
  </div>;
}

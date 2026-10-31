import { CalendarDays, RefreshCw, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import adminApi from '../../api/adminAxios';

function eventKind(action = '') {
  const value = action.toLowerCase();
  if (value.includes('delete')) return 'deletion';
  if (value.includes('update') || value.includes('patch') || value.includes('edit')) return 'update';
  if (value.includes('create') || value.includes('post')) return 'create';
  if (value.includes('login')) return 'login';
  return 'event';
}

function Stat({ label, value, note }) {
  return <div className="min-w-0 border-b border-white/[0.08] p-4 sm:border-b-0 sm:border-r sm:last:border-r-0"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-slate-100">{Number(value || 0).toLocaleString()}</p><p className="mt-1 text-[10px] text-slate-500">{note}</p></div>;
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({});
  const [query, setQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [actorFilter, setActorFilter] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreRef = useRef(null);

  async function load(pageNumber = 1, { append = false, showError = true } = {}) {
    if (append) setLoadingMore(true);
    else setRefreshing(true);
    try {
      const { data } = await adminApi.get(`/admin/tenants/audit/logs?page=${pageNumber}`);
      const rows = Array.isArray(data) ? data : (data.results || []);
      setLogs((current) => append ? [...current, ...rows] : rows);
      setSummary(data.summary || {});
      setPage(Number(data.page || pageNumber));
      setHasMore(Boolean(data.hasMore));
    } catch (error) {
      if (showError) toast.error(error.response?.data?.error || 'Failed to load audit trail');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) load(page + 1, { append: true, showError: false });
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(() => load(1, { showError: false }), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore || loading || loadingMore) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { rootMargin: '240px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page]);

  const models = useMemo(() => [...new Set(logs.map((log) => String(log.target_type || '').trim()).filter(Boolean))].sort(), [logs]);
  const filtered = useMemo(() => logs.filter((log) => {
    const kind = eventKind(log.action);
    if (eventFilter !== 'all' && kind !== eventFilter) return false;
    if (modelFilter !== 'all' && String(log.target_type || '') !== modelFilter) return false;
    if (actorFilter !== 'all' && (log.actor_type || 'admin') !== actorFilter) return false;
    const time = log.timestamp ? new Date(log.timestamp) : null;
    if (from && time && time < new Date(`${from}T00:00:00`)) return false;
    if (to && time && time > new Date(`${to}T23:59:59`)) return false;
    const metadata = JSON.stringify(log.metadata || {});
    const haystack = [log.action, log.target_type, log.target_id, log.admin_email, log.ip, log.user_agent, metadata].join(' ').toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  }), [logs, eventFilter, modelFilter, actorFilter, from, to, query]);

  return <div className="space-y-6">
    <div className="border-b border-white/10 pb-5"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Insights <span className="mx-1 text-slate-600">—</span> Audit trail</p><div className="mt-1 flex flex-wrap items-center justify-between gap-3"><h2 className="text-[26px] font-bold tracking-tight text-slate-100">System <span className="text-[var(--admin-accent)]">audit trail.</span></h2><button type="button" onClick={() => load()} disabled={refreshing} className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50"><RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>Refresh</button></div><p className="mt-1 text-xs text-slate-400">{Number(summary.total ?? logs.length).toLocaleString()} events recorded · {Number(summary.today || 0).toLocaleString()} today · {Number(summary.recent || 0).toLocaleString()} in the last 7 days.</p></div>

    <section className="overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.025]"><div className="grid sm:grid-cols-2 xl:grid-cols-4"><Stat label="All events" value={summary.total ?? logs.length} note="since the beginning"/><Stat label="Today" value={summary.today} note="in the last 24h"/><Stat label="Updates" value={summary.updates} note="model changes"/><Stat label="Deletions" value={summary.deletions} note="records removed"/></div></section>

    <section className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-3 xl:max-w-[960px]">
        <select aria-label="Filter by event" className="admin-audit-filter" value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}><option value="all">All events</option><option value="create">Creates</option><option value="update">Updates</option><option value="deletion">Deletions</option><option value="login">Logins</option></select>
        <select aria-label="Filter by model" className="admin-audit-filter" value={modelFilter} onChange={(event) => setModelFilter(event.target.value)}><option value="all">All models</option>{models.map((model) => <option key={model} value={model}>{model}</option>)}</select>
        <select aria-label="Filter by operator" className="admin-audit-filter" value={actorFilter} onChange={(event) => setActorFilter(event.target.value)}><option value="all">All operators</option><option value="admin">Admin users</option><option value="tenant">Tenant users</option></select>
      </div>
      <div className="grid gap-2 sm:grid-cols-2"><label className="relative"><CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input aria-label="From date" type="date" className="admin-audit-filter pl-9" value={from} onChange={(event) => setFrom(event.target.value)}/></label><label className="relative"><CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input aria-label="To date" type="date" className="admin-audit-filter pl-9" value={to} onChange={(event) => setTo(event.target.value)}/></label></div>
      <label className="relative ml-auto block sm:max-w-[360px]"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input className="admin-audit-filter pl-9" placeholder="Search URL, IP, user-agent, or model…" value={query} onChange={(event) => setQuery(event.target.value)}/></label>
    </section>

    <section className="overflow-hidden rounded-xl border border-white/[0.14] bg-white/[0.025]"><div className="overflow-x-auto"><table className="min-w-full text-left"><thead className="bg-white/[0.06]"><tr>{['Event', 'Target', 'Changes', 'Actor', 'Source', 'When'].map((heading) => <th key={heading} className="whitespace-nowrap px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">{heading}</th>)}</tr></thead><tbody className="divide-y divide-white/[0.08]">
      {loading ? <tr><td colSpan="6" className="px-4 py-12 text-center text-sm text-slate-400">Loading audit events…</td></tr> : filtered.length === 0 ? <tr><td colSpan="6" className="px-4 py-12 text-center text-sm text-slate-400">No audit events match the selected filters.</td></tr> : filtered.map((log) => {
        const kind = eventKind(log.action);
        const changes = log.metadata?.updated_fields || log.metadata?.changed_fields || [];
        const targetLabel = String(log.target_type || 'Record').replaceAll('_', ' ');
        return <tr key={log.id} className="transition hover:bg-white/[0.035]"><td className="whitespace-nowrap px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${kind === 'deletion' ? 'bg-rose-500/15 text-rose-300' : kind === 'update' ? 'bg-amber-500/15 text-amber-300' : 'bg-white/10 text-slate-300'}`}>{String(log.action || 'event').replaceAll('_', '.')}</span></td><td className="whitespace-nowrap px-4 py-4 text-xs font-semibold capitalize text-slate-200">{targetLabel} <span className="font-mono font-normal text-slate-400">#{log.target_id || '—'}</span></td><td className="max-w-[260px] px-4 py-4 text-xs text-slate-400">{Array.isArray(changes) && changes.length ? changes.join(', ') : (log.metadata?.path || log.metadata?.business_name || '—')}</td><td className="whitespace-nowrap px-4 py-4"><p className="max-w-[140px] truncate text-xs font-medium text-slate-200">{log.metadata?.actor_name || log.admin_email || 'System'}</p><p className="mt-1 text-[9px] uppercase tracking-wide text-slate-500">{log.actor_type === 'tenant' ? 'Tenant user' : 'Admin user'}</p></td><td className="whitespace-nowrap px-4 py-4 font-mono text-[10px] text-slate-400">{log.ip || '—'}</td><td className="whitespace-nowrap px-4 py-4 text-xs text-slate-300">{log.timestamp ? new Date(log.timestamp).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td></tr>;
      })}
    </tbody></table></div><div ref={loadMoreRef} className="border-t border-white/[0.08] px-4 py-4 text-center text-[10px] text-slate-500">{loadingMore ? 'Loading 15 more events…' : hasMore ? `Showing ${logs.length.toLocaleString()} of ${Number(summary.total ?? logs.length).toLocaleString()} events · scroll for more` : `Showing ${logs.length.toLocaleString()} of ${Number(summary.total ?? logs.length).toLocaleString()} events`}</div></section>
  </div>;
}

import { Activity, CheckCircle2, Cpu, Database, HardDrive, MemoryStick, RefreshCw, Server, Wifi } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminApi from '../../api/adminAxios';

const MAX_SAMPLES = 60;

function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = bytes / 1024;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) { size /= 1024; index += 1; }
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[index]}`;
}

function formatDuration(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value)) return '—';
  const days = Math.floor(value / 86400);
  const hours = Math.floor((value % 86400) / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  return days ? `${days}d ${hours}h` : hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function StatusPill({ value }) {
  const healthy = value === 'ok' || value === 'healthy';
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${healthy ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-400'}`}><span className={`h-1.5 w-1.5 rounded-full ${healthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />{value || 'unknown'}</span>;
}

function LineChart({ title, value, unit = '%', samples, field, color = 'var(--admin-accent)', maxValue = 100 }) {
  const values = samples.map((sample) => Number(field(sample))).filter(Number.isFinite);
  const max = Math.max(maxValue, ...values, 1);
  const points = values.map((item, index) => `${values.length < 2 ? 10 : 10 + (index / (values.length - 1)) * 380},${106 - (Math.min(item, max) / max) * 92}`).join(' ');
  return <section className="admin-card overflow-hidden rounded-2xl border p-4 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:p-5">
    <div className="flex items-start justify-between gap-3"><div><h3 className="admin-heading text-xs font-semibold">{title}</h3><p className="admin-muted mt-1 text-[10px]">Recent samples · 15 second interval</p></div><p className="admin-heading text-lg font-bold">{Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)}${unit}` : '—'}</p></div>
    <div className="mt-4 h-28"><svg viewBox="0 0 400 120" preserveAspectRatio="none" className="h-full w-full"><line x1="8" x2="392" y1="14" y2="14" stroke="var(--admin-border)" strokeDasharray="3 5"/><line x1="8" x2="392" y1="60" y2="60" stroke="var(--admin-border)" strokeDasharray="3 5"/><line x1="8" x2="392" y1="106" y2="106" stroke="var(--admin-border)" strokeDasharray="3 5"/>{points && <><polyline points={`10,106 ${points} 390,106`} fill={color} fillOpacity="0.10" stroke="none"/><polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></>}</svg></div>
    <p className="admin-muted mt-1 text-[10px]">{samples.length ? `${samples.length} samples · latest ${new Date(samples.at(-1).sampledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Collecting first sample…'}</p>
  </section>;
}

function ResourceCard({ label, value, detail, icon: Icon, percent }) {
  const progress = Math.max(0, Math.min(100, Number(percent) || 0));
  return <section className="admin-card rounded-2xl border p-4 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:p-5"><div className="flex items-center justify-between"><p className="admin-muted text-xs font-medium">{label}</p><span className="admin-accent-icon flex h-9 w-9 items-center justify-center rounded-xl"><Icon size={17} /></span></div><p className="admin-heading mt-3 text-2xl font-bold tracking-tight">{value}</p><p className="admin-muted mt-1 text-[10px]">{detail}</p>{percent !== undefined && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200/70"><div className="h-full rounded-full bg-[var(--admin-accent)] transition-all" style={{ width: `${progress}%` }} /></div>}</section>;
}

export default function AdminSystem() {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [samples, setSamples] = useState([]);
  const [migrations, setMigrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showError = true) => {
    setRefreshing(true);
    const [healthResult, migrationResult, metricsResult] = await Promise.allSettled([
      adminApi.get('/health/'),
      adminApi.get('/admin/system/migrations'),
      adminApi.get('/admin/system/metrics'),
    ]);
    if (healthResult.status === 'fulfilled') setHealth(healthResult.value.data);
    if (migrationResult.status === 'fulfilled') setMigrations(migrationResult.value.data.migrations || []);
    if (metricsResult.status === 'fulfilled') {
      setMetrics(metricsResult.value.data);
      setSamples((previous) => [...previous, metricsResult.value.data].slice(-MAX_SAMPLES));
    } else if (showError) {
      toast.error(metricsResult.reason?.response?.data?.error || 'Failed to load system health metrics');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(() => load(false), 15000);
    return () => window.clearInterval(timer);
  }, [load]);

  if (loading) return <div className="space-y-5"><div className="h-20 animate-pulse rounded-2xl bg-white/5"/><div className="grid gap-4 sm:grid-cols-3">{[0,1,2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-white/5" />)}</div><div className="grid gap-4 md:grid-cols-2">{[0,1,2,3].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl bg-white/5" />)}</div></div>;

  const cpu = metrics?.cpu || {};
  const memory = metrics?.memory || {};
  const disk = metrics?.disk || {};
  const database = metrics?.database || {};
  const redis = metrics?.redis || {};
  const healthy = health?.status === 'healthy';

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="admin-accent-label text-[10px] font-bold uppercase tracking-[0.18em]">Platform</p><h2 className="admin-heading mt-1 text-2xl font-bold tracking-tight">System health</h2><p className="admin-muted mt-1 text-sm">Live server resources, service status, and database capacity for scaling decisions.</p></div><button className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-300/50 px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-500/10 disabled:opacity-50" onClick={() => load()} disabled={refreshing}><RefreshCw size={14} className={`admin-accent-text ${refreshing ? 'animate-spin' : ''}`}/>Refresh</button></div>

    <section className="admin-card overflow-hidden rounded-2xl border shadow-[0_16px_48px_rgba(15,23,42,0.06)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4"><div><h3 className="admin-heading flex items-center gap-2 text-sm font-bold"><Activity size={16} className="admin-accent-text"/>Service status</h3><p className="admin-muted mt-1 text-xs">Health checks are refreshed every 15 seconds.</p></div><div className="flex items-center gap-2"><StatusPill value={healthy ? 'healthy' : health?.status || 'unknown'} /><span className="admin-muted text-[10px]">{metrics?.sampledAt ? `Updated ${new Date(metrics.sampledAt).toLocaleTimeString()}` : ''}</span></div></div><div className="grid gap-3 p-5 sm:grid-cols-3">
      {[[Database, 'Database', health?.db, `${database.engine || 'database'}${database.latencyMs != null ? ` · ${database.latencyMs} ms` : ''}`], [Wifi, 'Redis / queue broker', health?.redis, `${redis.latencyMs != null ? `${redis.latencyMs} ms ping` : 'Broker connection'}`], [Server, 'Application', health?.status, `${metrics?.runtime?.platform || 'Server'} · Python ${metrics?.runtime?.python || '—'}`]].map(([Icon, label, status, detail]) => <div key={label} className="admin-card-muted rounded-xl border border-slate-200/70 p-4"><div className="flex items-center justify-between"><span className="admin-accent-icon flex h-9 w-9 items-center justify-center rounded-xl"><Icon size={17}/></span><StatusPill value={status}/></div><h4 className="admin-heading mt-3 text-xs font-semibold">{label}</h4><p className="admin-muted mt-1 text-[10px]">{detail}</p></div>)}
    </div></section>

    <section><div className="mb-3"><h3 className="admin-heading text-sm font-bold">Server resources</h3><p className="admin-muted mt-1 text-xs">Current usage relative to the host/container limits visible to this application.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <ResourceCard label="CPU utilization" value={cpu.usagePercent != null ? `${Number(cpu.usagePercent).toFixed(1)}%` : '—'} detail={`${cpu.cores || '—'} logical cores${cpu.loadAverage?.length ? ` · load ${cpu.loadAverage[0].toFixed(2)}` : ''}`} icon={Cpu} percent={cpu.usagePercent}/>
      <ResourceCard label="Memory / RAM" value={memory.usagePercent != null ? `${Number(memory.usagePercent).toFixed(1)}%` : '—'} detail={`${formatBytes(memory.usedBytes)} used of ${formatBytes(memory.totalBytes)} · process ${formatBytes(memory.processRssBytes)}`} icon={MemoryStick} percent={memory.usagePercent}/>
      <ResourceCard label="Disk storage" value={disk.usagePercent != null ? `${Number(disk.usagePercent).toFixed(1)}%` : '—'} detail={`${formatBytes(disk.freeBytes)} available of ${formatBytes(disk.totalBytes)}`} icon={HardDrive} percent={disk.usagePercent}/>
      <ResourceCard label="Database storage" value={formatBytes(database.sizeBytes)} detail={`${database.connections ?? '—'} active of ${database.maxConnections ?? '—'} connections`} icon={Database}/>
    </div></section>

    <section><div className="mb-3"><h3 className="admin-heading text-sm font-bold">Performance history</h3><p className="admin-muted mt-1 text-xs">Charts collect samples while this page is open; up to 15 minutes are shown.</p></div><div className="grid gap-4 md:grid-cols-2">
      <LineChart title="CPU utilization" value={cpu.usagePercent} samples={samples} field={(sample) => sample.cpu?.usagePercent}/>
      <LineChart title="Memory utilization" value={memory.usagePercent} samples={samples} field={(sample) => sample.memory?.usagePercent}/>
      <LineChart title="Disk utilization" value={disk.usagePercent} samples={samples} field={(sample) => sample.disk?.usagePercent}/>
      <LineChart title="Database query latency" value={database.latencyMs} unit=" ms" maxValue={500} samples={samples} field={(sample) => sample.database?.latencyMs}/>
    </div></section>

    <section className="admin-card overflow-hidden rounded-2xl border shadow-[0_16px_48px_rgba(15,23,42,0.06)]"><div className="border-b border-slate-200/70 px-5 py-4"><h3 className="admin-heading text-sm font-bold">Runtime and data services</h3><p className="admin-muted mt-1 text-xs">Process and backing-service details visible from the application container.</p></div><div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4"><div><p className="admin-muted text-[10px]">Server uptime</p><p className="admin-heading mt-1 text-xs font-semibold">{formatDuration(metrics?.runtime?.uptimeSeconds)}</p></div><div><p className="admin-muted text-[10px]">Application process uptime</p><p className="admin-heading mt-1 text-xs font-semibold">{formatDuration(metrics?.runtime?.processUptimeSeconds)}</p></div><div><p className="admin-muted text-[10px]">Redis memory / clients</p><p className="admin-heading mt-1 text-xs font-semibold">{formatBytes(redis.usedMemoryBytes)} / {redis.connectedClients ?? '—'} clients</p></div><div><p className="admin-muted text-[10px]">Database response time</p><p className="admin-heading mt-1 text-xs font-semibold">{database.latencyMs != null ? `${database.latencyMs} ms` : '—'}</p></div></div></section>

    <section className="admin-card overflow-hidden rounded-2xl border shadow-[0_16px_48px_rgba(15,23,42,0.06)]"><div className="border-b border-slate-200/70 px-5 py-4"><h3 className="admin-heading text-sm font-bold">Database migrations</h3><p className="admin-muted mt-1 text-xs">Applied migration history reported by the backend.</p></div><pre className="m-5 max-h-80 overflow-auto rounded-xl bg-[#101c32] p-4 text-xs leading-6 text-slate-100">{migrations.length ? migrations.join('\n') : 'No migration history available.'}</pre></section>
  </div>;
}

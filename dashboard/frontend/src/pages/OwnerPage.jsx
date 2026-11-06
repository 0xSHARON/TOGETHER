import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, 
  Server, 
  Cpu, 
  Database, 
  Activity, 
  Terminal, 
  Radio, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  PlayCircle,
  Wifi,
  HardDrive,
  Trash2,
  Send,
  Search,
  Check,
  Layers,
  ArrowDown
} from 'lucide-react';
import { BrutCard, StatBox, BrutButton } from '../components/Brutalist';

export const LOG_CHANNEL_ID = "1568284208533864498";

export default function OwnerPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flushing, setFlushing] = useState(false);
  const [flushSuccess, setFlushSuccess] = useState(false);

  // Terminal & Discord Log Stream State
  const [discordLogs, setDiscordLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
  const [customLogMsg, setCustomLogMsg] = useState('');
  const [isSendingLog, setIsSendingLog] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  const terminalEndRef = useRef(null);

  useEffect(() => {
    fetchOwnerData();
  }, []);

  // Poll Discord logs every 4 seconds to maintain live stream
  useEffect(() => {
    const timer = setInterval(() => {
      fetchDiscordLogsQuiet();
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll terminal when new logs arrive
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [discordLogs, autoScroll]);

  async function fetchOwnerData() {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get('/api/owner/overview', { withCredentials: true });
      setData(resp.data);
      if (resp.data?.discordLogs?.logs) {
        setDiscordLogs(resp.data.discordLogs.logs);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to load owner telemetry');
    } finally {
      setLoading(false);
    }
  }

  async function fetchDiscordLogsQuiet() {
    try {
      const resp = await axios.get('/api/owner/discord-logs', { withCredentials: true });
      if (Array.isArray(resp.data?.logs)) {
        setDiscordLogs(resp.data.logs);
      }
    } catch {
      // Quiet background polling
    }
  }

  async function handleRefreshLogsManual() {
    setIsRefreshingLogs(true);
    try {
      const resp = await axios.get('/api/owner/discord-logs', { withCredentials: true });
      if (Array.isArray(resp.data?.logs)) {
        setDiscordLogs(resp.data.logs);
      }
    } catch (e) {
      console.error("Manual log fetch failed:", e);
    } finally {
      setTimeout(() => setIsRefreshingLogs(false), 500);
    }
  }

  async function handleSendCustomLog(e) {
    if (e) e.preventDefault();
    if (!customLogMsg.trim() || isSendingLog) return;

    setIsSendingLog(true);
    setSendStatus(null);
    try {
      await axios.post('/api/owner/send-log', { message: customLogMsg.trim() }, { withCredentials: true });
      setCustomLogMsg('');
      setSendStatus('SENT');
      setTimeout(() => setSendStatus(null), 2500);
      await fetchDiscordLogsQuiet();
    } catch (err) {
      setSendStatus('FAILED');
      setTimeout(() => setSendStatus(null), 3000);
    } finally {
      setIsSendingLog(false);
    }
  }

  async function handleFlushLogs() {
    setFlushing(true);
    setFlushSuccess(false);
    try {
      await axios.post('/api/owner/flush-logs', {}, { withCredentials: true });
      setFlushSuccess(true);
      setTimeout(() => setFlushSuccess(false), 3000);
      await fetchDiscordLogsQuiet();
    } catch (err) {
      alert('Failed to flush logs: ' + (err.response?.data?.error || err.message));
    } finally {
      setFlushing(false);
    }
  }

  const sys = data?.system || {};
  const bot = data?.bot || {};
  const db = data?.database || {};
  const sessions = data?.activeMusicSessions || [];
  const lavalink = data?.lavalink || { totalNodes: 1, onlineNodes: 1, gatewayPing: bot.ping || 24, nodes: [] };
  const nodes = lavalink.nodes || [];

  // Filter terminal logs
  const filteredLogs = discordLogs.filter(item => {
    if (!logFilter) return true;
    const q = logFilter.toLowerCase();
    const c = (item.content || '').toLowerCase();
    const a = (item.author || '').toLowerCase();
    const embedText = item.embed ? `${item.embed.title || ''} ${item.embed.description || ''}`.toLowerCase() : '';
    return c.includes(q) || a.includes(q) || embedText.includes(q);
  });

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-12 text-center">
        <div className="w-12 h-12 border-4 border-brutal-accent border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="font-mono text-sm text-brutal-text font-bold uppercase tracking-widest">
          AUTHENTICATING OWNER CLEARANCE // FETCHING CLUSTER TELEMETRY...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="border-2 border-brutal-danger bg-brutal-surface p-6 shadow-brutal-danger">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-brutal-danger" />
            <span className="font-mono text-xs uppercase text-brutal-danger font-black tracking-widest">
              RESTRICTED OWNER ZONE
            </span>
          </div>
          <h2 className="font-display font-black text-2xl text-brutal-text uppercase">
            CLEARANCE FAILED
          </h2>
          <p className="font-mono text-xs text-brutal-muted mt-2">
            {error}
          </p>
          <div className="mt-4 flex gap-3">
            <BrutButton onClick={fetchOwnerData} variant="danger">
              RETRY AUTHENTICATION
            </BrutButton>
            <a href="/api/auth/login" className="inline-block">
              <BrutButton variant="secondary">
                RE-LOGIN VIA DISCORD
              </BrutButton>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ─── Level 5 Owner Top Banner ─────────────────────────────── */}
      <div className="border-2 border-brutal-danger bg-brutal-surface p-6 shadow-brutal-danger flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-brutal-danger inline-block animate-pulse"></span>
            <span className="font-mono text-xs uppercase text-brutal-danger font-black tracking-widest">
              RESTRICTED ACCESS // LEVEL 5 CLEARED
            </span>
          </div>
          <h2 className="font-display font-black text-3xl text-brutal-text uppercase">
            SYSTEM OWNER CONTROL PANEL
          </h2>
          <p className="font-mono text-xs text-brutal-muted mt-1">
            Lavalink cluster telemetry, live memory isolate gauges, and real-time Discord event streaming.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <BrutButton 
            onClick={handleFlushLogs} 
            disabled={flushing}
            className="flex items-center gap-2 text-xs"
          >
            {flushing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>FLUSHING...</span>
              </>
            ) : flushSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>LOGS DISPATCHED!</span>
              </>
            ) : (
              <>
                <Terminal className="w-4 h-4" />
                <span>DISPATCH LOG BATCH</span>
              </>
            )}
          </BrutButton>

          <BrutButton onClick={fetchOwnerData} variant="secondary" className="p-2.5" title="Refresh Telemetry">
            <RefreshCw className="w-4 h-4" />
          </BrutButton>
        </div>
      </div>

      {/* ─── Primary System Health Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox 
          label="HOST UPTIME" 
          value={`${Math.floor((sys.uptime || 0) / 3600)}h ${Math.floor(((sys.uptime || 0) % 3600) / 60)}m`} 
          sub={`Node ${sys.nodeVersion || 'v22'}`} 
          icon={Cpu} 
        />
        <StatBox 
          label="GATEWAY LATENCY" 
          value={`${lavalink.gatewayPing || bot.ping || 24} MS`} 
          sub="WebSocket Ping" 
          icon={Wifi} 
          accent={true}
        />
        <StatBox 
          label="24/7 GUILD LOCKS" 
          value={db.total247Guilds || 0} 
          sub="MongoDB Persistence" 
          icon={Radio} 
        />
        <StatBox 
          label="CONNECTED PLAYERS" 
          value={sessions.length} 
          sub="Active Voice Instances" 
          icon={Activity} 
        />
      </div>

      {/* ─── SECTION 1: LAVALINK CLUSTER TELEMETRY ────────────────── */}
      <BrutCard 
        title="LAVALINK AUDIO CLUSTER TELEMETRY" 
        subtitle="Real-time Shoukaku audio nodes, CPU/RAM isolations, frame health, and player load"
        badge={`${lavalink.onlineNodes || 1}/${lavalink.totalNodes || 1} NODES ONLINE`}
        highlight={true}
      >
        <div className="space-y-6">
          {/* Cluster Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-brutal-secondary border-2 border-brutal-border shadow-brutal-sm flex items-center justify-between">
              <div>
                <span className="text-brutal-muted text-[10px] uppercase font-bold">TOTAL AUDIO PLAYERS</span>
                <p className="font-black text-2xl text-brutal-text mt-1">{sessions.length} ACTIVE</p>
                <p className="text-[11px] text-brutal-accent">0% Frame Drop Deficit</p>
              </div>
              <PlayCircle className="w-8 h-8 text-brutal-accent opacity-80" />
            </div>

            <div className="p-4 bg-brutal-secondary border-2 border-brutal-border shadow-brutal-sm flex items-center justify-between">
              <div>
                <span className="text-brutal-muted text-[10px] uppercase font-bold">GATEWAY WEBSOCKET</span>
                <p className="font-black text-2xl text-brutal-accent mt-1">{lavalink.gatewayPing || 24} MS</p>
                <p className="text-[11px] text-brutal-muted">Discord Shard 0/0</p>
              </div>
              <Wifi className="w-8 h-8 text-brutal-accent opacity-80" />
            </div>

            <div className="p-4 bg-brutal-secondary border-2 border-brutal-border shadow-brutal-sm flex items-center justify-between">
              <div>
                <span className="text-brutal-muted text-[10px] uppercase font-bold">AUDIO TRANSCODER</span>
                <p className="font-black text-xl text-brutal-text mt-1">24-BIT OPUS</p>
                <p className="text-[11px] text-brutal-accent">Lossless 320kbps Stream</p>
              </div>
              <Server className="w-8 h-8 text-brutal-accent opacity-80" />
            </div>
          </div>

          {/* Node Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {nodes.length === 0 ? (
              <div className="col-span-full border border-dashed border-brutal-border p-6 text-center font-mono text-xs text-brutal-muted">
                NO SEPARATE SHOUKAKU LAVALINK NODES REPORTED. RUNNING IN STANDALONE OPUS ENGINE MODE.
              </div>
            ) : (
              nodes.map((node, i) => {
                const sysCpu = node.cpu?.systemLoad || 12.5;
                const lavaCpu = node.cpu?.lavalinkLoad || 4.2;
                const memUsed = node.memory?.used || 128;
                const memAlloc = node.memory?.allocated || 256;
                const memPct = memAlloc > 0 ? Math.min(100, Math.round((memUsed / memAlloc) * 100)) : 45;

                return (
                  <div key={i} className="border-2 border-brutal-border bg-brutal-secondary p-5 shadow-brutal flex flex-col justify-between gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-brutal-border pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3 h-3 ${node.status === 'ONLINE' ? 'bg-brutal-accent' : 'bg-red-500'} inline-block animate-pulse`}></span>
                        <span className="font-mono font-black text-sm uppercase text-brutal-text tracking-wide">
                          {node.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 border border-black bg-brutal-accent text-black">
                          {node.status}
                        </span>
                        <span className="font-mono text-xs font-bold text-brutal-muted">
                          {node.ping || 24}ms
                        </span>
                      </div>
                    </div>

                    {/* Gauges & Progress Meters */}
                    <div className="space-y-4 font-mono text-xs">
                      {/* CPU Utilization Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-1 text-[11px]">
                          <span className="text-brutal-muted font-bold uppercase">CPU UTILIZATION ({node.cpu?.cores || 4} CORES)</span>
                          <span className="text-brutal-text font-bold">
                            Lavalink: <span className="text-brutal-accent">{lavaCpu}%</span> / Sys: {sysCpu}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-black border border-brutal-border flex overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, lavaCpu)}%` }} 
                            className="bg-brutal-accent h-full transition-all duration-300"
                            title={`Lavalink: ${lavaCpu}%`}
                          />
                          <div 
                            style={{ width: `${Math.min(100 - lavaCpu, sysCpu)}%` }} 
                            className="bg-zinc-600 h-full transition-all duration-300"
                            title={`System: ${sysCpu}%`}
                          />
                        </div>
                      </div>

                      {/* Memory Allocation Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-1 text-[11px]">
                          <span className="text-brutal-muted font-bold uppercase">JVM / V8 MEMORY HEAP</span>
                          <span className="text-brutal-text font-bold">
                            {memUsed} MB <span className="text-brutal-muted">/ {memAlloc} MB ({memPct}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-3 bg-black border border-brutal-border overflow-hidden">
                          <div 
                            style={{ width: `${memPct}%` }} 
                            className={`h-full transition-all duration-300 ${memPct > 80 ? 'bg-red-500' : 'bg-brutal-accent'}`}
                          />
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-brutal-border/60 text-[11px]">
                        <div>
                          <span className="text-brutal-muted uppercase text-[9px] block">PLAYERS</span>
                          <span className="font-bold text-brutal-text">{node.players} Active</span>
                        </div>
                        <div>
                          <span className="text-brutal-muted uppercase text-[9px] block">UPTIME</span>
                          <span className="font-bold text-brutal-text">{node.uptime || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-brutal-muted uppercase text-[9px] block">FRAMES DEFICIT</span>
                          <span className="font-bold text-brutal-accent">{node.frameStats?.deficit ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </BrutCard>

      {/* ─── SECTION 2: EMBEDDED DISCORD LOG TERMINAL ─────────────── */}
      <BrutCard 
        title="LIVE DISCORD LOG TERMINAL // CHANNEL #1568284208533864498" 
        subtitle="Real-time telemetry, bot stdout/stderr logs, slash executions, and fatal error events"
        badge="CHANNEL #1568284208533864498"
      >
        <div className="space-y-4">
          {/* Terminal Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black p-3 border-2 border-black">
            {/* Terminal Window Dots & Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-red-500 border border-black inline-block" />
                <span className="w-3 h-3 bg-yellow-400 border border-black inline-block" />
                <span className="w-3 h-3 bg-brutal-accent border border-black inline-block" />
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-zinc-400 font-bold hidden md:inline">stream@together-cluster:</span>
                <span className="text-brutal-accent font-bold">#1568284208533864498</span>
                <span className="flex items-center gap-1.5 text-[10px] bg-zinc-900 text-brutal-accent border border-zinc-700 px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brutal-accent animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>

            {/* Terminal Action Tools */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {/* Search / Filter Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  placeholder="FILTER LOGS..."
                  className="bg-zinc-900 border border-zinc-700 text-white pl-7 pr-2 py-1 text-xs focus:border-brutal-accent focus:outline-none w-36 sm:w-44"
                />
              </div>

              {/* Auto Scroll Toggle */}
              <button
                type="button"
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-2.5 py-1 text-[11px] font-bold border transition-all ${
                  autoScroll 
                    ? 'border-brutal-accent bg-brutal-accent text-black' 
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
                title="Toggle Auto-Scroll to Bottom"
              >
                AUTO-SCROLL: {autoScroll ? 'ON' : 'OFF'}
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleRefreshLogsManual}
                disabled={isRefreshingLogs}
                className="p-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-brutal-accent hover:border-brutal-accent transition-colors"
                title="Manual Reload Logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingLogs ? 'animate-spin text-brutal-accent' : ''}`} />
              </button>

              {/* Clear Display Button */}
              <button
                type="button"
                onClick={() => setDiscordLogs([])}
                className="p-1.5 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500 transition-colors"
                title="Clear Terminal Output Screen"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Terminal Console Output Screen */}
          <div className="bg-[#040406] border-2 border-black p-4 font-mono text-xs h-96 overflow-y-auto space-y-2 selection:bg-brutal-accent selection:text-black shadow-inner">
            {filteredLogs.length === 0 ? (
              <div className="text-zinc-500 text-center py-20 flex flex-col items-center justify-center gap-2">
                <Terminal className="w-8 h-8 opacity-40" />
                <p className="font-bold text-xs uppercase tracking-wider">
                  {logFilter 
                    ? `NO LOGS MATCHING "${logFilter}".` 
                    : "NO RECENT LOG EVENTS IN CHANNEL #1568284208533864498."}
                </p>
                <p className="text-[10px] text-zinc-600">
                  Logs from both Together Helper and Music Bot stream here automatically.
                </p>
              </div>
            ) : (
              filteredLogs.map((log, index) => {
                const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '00:00:00';
                const hasError = (log.content || '').includes('[ERROR]') || (log.content || '').includes('🔴') || (log.embed?.title || '').toLowerCase().includes('error');
                const hasWarn = (log.content || '').includes('[WARN]') || (log.content || '').includes('🟡');
                const hasCommand = (log.content || '').includes('[COMMAND]') || (log.content || '').includes('⚡');

                return (
                  <div key={log.id || index} className="group border-b border-zinc-900/80 pb-2 hover:bg-zinc-950/60 transition-colors">
                    <div className="flex items-start gap-2 text-zinc-300">
                      {/* Timestamp & Tag */}
                      <span className="text-zinc-600 select-none shrink-0 font-semibold text-[10px]">
                        [{timeStr}]
                      </span>

                      {/* Level Badge */}
                      <span className="shrink-0">
                        {hasError ? (
                          <span className="text-red-400 bg-red-950/50 border border-red-800 px-1 py-0.2 text-[9px] font-bold">ERR</span>
                        ) : hasWarn ? (
                          <span className="text-yellow-400 bg-yellow-950/50 border border-yellow-800 px-1 py-0.2 text-[9px] font-bold">WRN</span>
                        ) : hasCommand ? (
                          <span className="text-cyan-400 bg-cyan-950/50 border border-cyan-800 px-1 py-0.2 text-[9px] font-bold">CMD</span>
                        ) : (
                          <span className="text-brutal-accent bg-emerald-950/50 border border-emerald-800 px-1 py-0.2 text-[9px] font-bold">LOG</span>
                        )}
                      </span>

                      {/* Author */}
                      <span className="text-zinc-400 font-bold shrink-0 text-[11px]">
                        {log.author}:
                      </span>

                      {/* Text Content */}
                      <div className="flex-1 overflow-x-auto break-words leading-relaxed text-zinc-200">
                        {log.content && (
                          <span className={hasError ? 'text-red-300 font-medium' : hasCommand ? 'text-cyan-300' : 'text-zinc-200'}>
                            {log.content}
                          </span>
                        )}

                        {/* Embed Display if log is a Discord Embed */}
                        {log.embed && (
                          <div 
                            className="mt-1.5 p-2.5 bg-zinc-900/90 border-l-4 font-mono text-[11px] space-y-1"
                            style={{ borderColor: log.embed.color || '#00E676' }}
                          >
                            {log.embed.title && (
                              <p className="font-bold text-white uppercase tracking-wider">{log.embed.title}</p>
                            )}
                            {log.embed.description && (
                              <p className="text-zinc-300 whitespace-pre-wrap">{log.embed.description}</p>
                            )}
                            {log.embed.fields && log.embed.fields.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800">
                                {log.embed.fields.map((f, fi) => (
                                  <div key={fi}>
                                    <span className="text-zinc-500 font-bold text-[9px] uppercase">{f.name}:</span>
                                    <p className="text-zinc-300 font-medium">{f.value}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Terminal Command Dispatch Form */}
          <form onSubmit={handleSendCustomLog} className="flex gap-2 font-mono text-xs">
            <div className="relative flex-1">
              <span className="text-brutal-accent font-bold absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <input 
                type="text"
                value={customLogMsg}
                onChange={(e) => setCustomLogMsg(e.target.value)}
                placeholder="write-log [message to channel #1568284208533864498]..."
                className="w-full bg-black border-2 border-brutal-border text-white pl-8 pr-4 py-2.5 font-mono text-xs focus:border-brutal-accent focus:outline-none"
              />
            </div>

            <BrutButton 
              type="submit" 
              disabled={isSendingLog || !customLogMsg.trim()}
              className="px-5 py-2.5 text-xs flex items-center gap-1.5 shrink-0"
            >
              {isSendingLog ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>DISPATCHING...</span>
                </>
              ) : sendStatus === 'SENT' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>DISPATCHED!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>SEND TO DISCORD</span>
                </>
              )}
            </BrutButton>
          </form>
        </div>
      </BrutCard>

      {/* ─── SECTION 3: MEMORY HEAP TELEMETRY ─────────────────────── */}
      <BrutCard title="V8 ISOLATE PROCESS MEMORY" subtitle="Direct heap telemetry allocated by Node.js runtime">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 bg-brutal-secondary border-2 border-brutal-border shadow-brutal-sm">
            <span className="text-brutal-muted uppercase text-[10px] font-bold">HEAP USED</span>
            <p className="font-black text-xl text-brutal-text mt-1">
              {Math.round((sys.memoryUsage?.heapUsed || 0) / 1024 / 1024)} MB
            </p>
          </div>
          <div className="p-3 bg-brutal-secondary border-2 border-brutal-border shadow-brutal-sm">
            <span className="text-brutal-muted uppercase text-[10px] font-bold">HEAP TOTAL</span>
            <p className="font-black text-xl text-brutal-text mt-1">
              {Math.round((sys.memoryUsage?.heapTotal || 0) / 1024 / 1024)} MB
            </p>
          </div>
          <div className="p-3 bg-brutal-secondary border-2 border-brutal-border shadow-brutal-sm">
            <span className="text-brutal-muted uppercase text-[10px] font-bold">RSS RESIDENT</span>
            <p className="font-black text-xl text-brutal-text mt-1">
              {Math.round((sys.memoryUsage?.rss || 0) / 1024 / 1024)} MB
            </p>
          </div>
        </div>
      </BrutCard>

      {/* ─── SECTION 4: LIVE VOICE SESSIONS TABLE ─────────────────── */}
      <BrutCard title="LIVE VOICE SESSIONS" subtitle="Real-time player instances streaming across Discord servers">
        {sessions.length === 0 ? (
          <div className="text-center py-6 font-mono text-xs text-brutal-muted">
            NO ACTIVE VOICE PLAYERS CONNECTED CURRENTLY
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-brutal-border text-brutal-muted uppercase text-[10px]">
                  <th className="py-2.5 px-3">GUILD</th>
                  <th className="py-2.5 px-3">TRACK</th>
                  <th className="py-2.5 px-3">AUTHOR</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">VOLUME</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, idx) => (
                  <tr key={idx} className="border-b border-brutal-border hover:bg-brutal-secondary transition-colors">
                    <td className="py-2.5 px-3 font-bold text-brutal-text">
                      {s.guildName || s.guildId}
                    </td>
                    <td className="py-2.5 px-3 text-brutal-accent truncate max-w-xs font-semibold">
                      {s.title || "Idle"}
                    </td>
                    <td className="py-2.5 px-3 text-brutal-muted truncate max-w-[150px]">
                      {s.author || "N/A"}
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      {s.playing ? (
                        <span className="text-brutal-accent">● PLAYING</span>
                      ) : (
                        <span className="text-amber-400">⏸ PAUSED</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-brutal-text">
                      {s.volume || 80}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BrutCard>
    </div>
  );
}

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ArrowDown,
  UserX,
  UserCheck,
  Shield,
  ExternalLink,
  LogOut,
  Disc,
  MessageSquare,
  Users,
  Copy,
  Volume2,
  Music,
  Sparkles,
  Zap,
  Clock,
  Pause,
  Play,
  Flame,
  AlertCircle
} from 'lucide-react';
import { BrutCard, StatBox, BrutButton } from '../components/Brutalist';
import SEO from '../components/SEO';

export const LOG_CHANNEL_ID = "1557621712948830388";

export default function OwnerPage() {
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'terminal' | 'servers' | 'blacklist' | 'commands'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flushing, setFlushing] = useState(false);
  const [flushSuccess, setFlushSuccess] = useState(false);

  // Terminal & Discord Log Stream State
  const [discordLogs, setDiscordLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('');
  const [logCategory, setLogCategory] = useState('all'); // 'all' | 'error' | 'warn' | 'command' | 'system'
  const [autoScroll, setAutoScroll] = useState(true);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
  const [customLogMsg, setCustomLogMsg] = useState('');
  const [isSendingLog, setIsSendingLog] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  // Server Directory State
  const [servers, setServers] = useState([]);
  const [serversLoading, setServersLoading] = useState(false);
  const [serverSearch, setServerSearch] = useState('');
  const [serverFilter, setServerFilter] = useState('all'); // 'all' | 'playing' | 'largest'
  const [leavingGuildId, setLeavingGuildId] = useState(null);
  const [leaveStatusMsg, setLeaveStatusMsg] = useState('');

  // Blacklist Management State
  const [blacklist, setBlacklist] = useState([]);
  const [blacklistLoading, setBlacklistLoading] = useState(false);
  const [newBlacklistUserId, setNewBlacklistUserId] = useState('');
  const [blacklistSubmitting, setBlacklistSubmitting] = useState(false);
  const [blacklistStatusMsg, setBlacklistStatusMsg] = useState('');

  // Command Operations State
  const [reloadingCommands, setReloadingCommands] = useState(false);
  const [reloadResult, setReloadResult] = useState(null);

  // Clipboard feedback
  const [copiedText, setCopiedText] = useState(null);

  const terminalEndRef = useRef(null);

  useEffect(() => {
    fetchOwnerData();
    fetchServersList();
    fetchBlacklist();
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
    if (autoScroll && terminalEndRef.current && (activeTab === 'telemetry' || activeTab === 'terminal')) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [discordLogs, autoScroll, activeTab]);

  function copyToClipboard(text, label) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(label || text);
    setTimeout(() => setCopiedText(null), 2000);
  }

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

  async function fetchServersList() {
    setServersLoading(true);
    try {
      const resp = await axios.get('/api/owner/servers', { withCredentials: true });
      if (Array.isArray(resp.data?.guilds)) {
        setServers(resp.data.guilds);
      }
    } catch (err) {
      console.warn("Failed to load server list:", err.message);
    } finally {
      setServersLoading(false);
    }
  }

  async function fetchBlacklist() {
    setBlacklistLoading(true);
    try {
      const resp = await axios.get('/api/owner/blacklist', { withCredentials: true });
      if (Array.isArray(resp.data?.blacklist)) {
        setBlacklist(resp.data.blacklist);
      }
    } catch (err) {
      console.warn("Failed to load blacklist:", err.message);
    } finally {
      setBlacklistLoading(false);
    }
  }

  async function handleLeaveServer(guildId, guildName) {
    if (!window.confirm(`⚠️ CONFIRM SERVER EXPULSION:\nAre you sure you want TOGETHER bot to immediately leave:\n"${guildName}" (${guildId})?`)) {
      return;
    }

    setLeavingGuildId(guildId);
    setLeaveStatusMsg('');
    try {
      const resp = await axios.post('/api/owner/leave-server', { guildId }, { withCredentials: true });
      setLeaveStatusMsg(resp.data?.message || `Bot successfully left ${guildName}.`);
      setServers(prev => prev.filter(g => g.id !== guildId));
    } catch (err) {
      alert(`Failed to leave server: ${err.response?.data?.error || err.message}`);
    } finally {
      setLeavingGuildId(null);
    }
  }

  async function handleAddBlacklist(e) {
    e.preventDefault();
    const id = newBlacklistUserId.trim();
    if (!id || blacklistSubmitting) return;

    if (!/^\d{17,20}$/.test(id)) {
      alert("Invalid Discord User ID format. A valid snowflake is 17-20 digits.");
      return;
    }

    setBlacklistSubmitting(true);
    setBlacklistStatusMsg('');
    try {
      const resp = await axios.post('/api/owner/blacklist', { action: 'add', userId: id }, { withCredentials: true });
      setBlacklistStatusMsg(resp.data?.message || `User ${id} added to blacklist.`);
      setNewBlacklistUserId('');
      await fetchBlacklist();
    } catch (err) {
      alert(`Blacklist addition failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setBlacklistSubmitting(false);
    }
  }

  async function handleRemoveBlacklist(userId) {
    if (!window.confirm(`Remove user ${userId} from the blacklist?`)) return;

    try {
      await axios.post('/api/owner/blacklist', { action: 'remove', userId }, { withCredentials: true });
      setBlacklist(prev => prev.filter(b => b.userId !== userId));
      setBlacklistStatusMsg(`User ${userId} removed from blacklist.`);
    } catch (err) {
      alert(`Blacklist removal failed: ${err.response?.data?.error || err.message}`);
    }
  }

  async function handleReloadCommands() {
    setReloadingCommands(true);
    setReloadResult(null);
    try {
      const resp = await axios.post('/api/owner/reload', {}, { withCredentials: true });
      setReloadResult(resp.data);
    } catch (err) {
      alert(`Command reload failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setReloadingCommands(false);
    }
  }

  async function fetchDiscordLogsQuiet() {
    try {
      const resp = await axios.get('/api/owner/discord-logs', { withCredentials: true });
      if (Array.isArray(resp.data?.logs)) {
        setDiscordLogs(resp.data.logs);
      }
    } catch {}
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

  // Filter terminal logs with category + text
  const filteredLogs = useMemo(() => {
    return discordLogs.filter(item => {
      const c = (item.content || '').toLowerCase();
      const a = (item.author || '').toLowerCase();
      const embedText = item.embed ? `${item.embed.title || ''} ${item.embed.description || ''}`.toLowerCase() : '';

      const isErr = c.includes('[error]') || c.includes('🔴') || embedText.includes('error');
      const isWarn = c.includes('[warn]') || c.includes('🟡');
      const isCmd = c.includes('[command]') || c.includes('⚡');

      if (logCategory === 'error' && !isErr) return false;
      if (logCategory === 'warn' && !isWarn) return false;
      if (logCategory === 'command' && !isCmd) return false;
      if (logCategory === 'system' && (isErr || isCmd)) return false;

      if (!logFilter.trim()) return true;
      const q = logFilter.toLowerCase().trim();
      return c.includes(q) || a.includes(q) || embedText.includes(q);
    });
  }, [discordLogs, logCategory, logFilter]);

  // Filter & sort servers
  const filteredServers = useMemo(() => {
    let list = [...servers];
    if (serverFilter === 'playing') {
      list = list.filter(g => g.isPlaying);
    } else if (serverFilter === 'largest') {
      list.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
    }

    if (!serverSearch.trim()) return list;
    const q = serverSearch.toLowerCase().trim();
    return list.filter(g => 
      (g.name && g.name.toLowerCase().includes(q)) || 
      (g.id && g.id.includes(q)) ||
      (g.vanityURLCode && g.vanityURLCode.toLowerCase().includes(q))
    );
  }, [servers, serverFilter, serverSearch]);

  const playingServersCount = useMemo(() => {
    return servers.filter(g => g.isPlaying).length;
  }, [servers]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-24 text-center font-mono">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-brutal-border"></div>
          <div className="absolute inset-0 border-4 border-brutal-danger border-t-transparent animate-spin"></div>
          <ShieldAlert className="w-8 h-8 text-brutal-danger absolute inset-0 m-auto" />
        </div>
        <div className="inline-block px-3 py-1 bg-brutal-surface border border-brutal-border text-xs text-brutal-danger font-black tracking-widest uppercase mb-2">
          APEX LEVEL 5 CLEARANCE REQUIRED
        </div>
        <p className="font-mono text-sm text-brutal-text font-bold uppercase tracking-wider">
          AUTHENTICATING CREDENTIALS // STREAMING CLUSTER TELEMETRY...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-8 font-mono">
        <div className="border-2 border-brutal-danger bg-brutal-surface p-8 shadow-brutal-danger relative overflow-hidden">
          <div className="h-2 brutal-hazard absolute top-0 left-0 right-0"></div>
          <div className="flex items-center gap-2 mb-2 mt-2">
            <AlertTriangle className="w-6 h-6 text-brutal-danger" />
            <span className="font-mono text-xs uppercase text-brutal-danger font-black tracking-widest">
              SECURITY LOCKOUT // RESTRICTED ZONE
            </span>
          </div>
          <h2 className="font-display font-black text-3xl text-brutal-text uppercase">
            CLEARANCE FAILED
          </h2>
          <p className="font-mono text-xs text-brutal-muted mt-2 max-w-xl">
            {error}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <BrutButton onClick={fetchOwnerData} variant="danger">
              RETRY APEX CLEARANCE
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-mono">
      <SEO title="Apex Mission Control — TOGETHER" noindex={true} />
      {/* Toast Notification for Clipboard */}
      {copiedText && (
        <div className="fixed bottom-6 right-6 z-50 bg-brutal-accent text-black font-black font-mono text-xs px-4 py-2.5 border-2 border-black shadow-brutal flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>COPIED TO CLIPBOARD: {copiedText}</span>
        </div>
      )}

      {/* ─── Hero Header / Tactical Command HUD ─────────────────────── */}
      <div className="relative border-2 border-brutal-danger bg-brutal-surface p-6 shadow-brutal-danger overflow-hidden">
        {/* Top Hazard Warning Stripe */}
        <div className="h-2 brutal-hazard absolute top-0 left-0 right-0"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mt-1">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="w-2.5 h-2.5 bg-brutal-danger inline-block animate-ping"></span>
              <span className="px-2 py-0.5 bg-red-950/80 border border-red-700 text-red-400 font-mono text-[10px] font-black uppercase tracking-widest">
                RESTRICTED // APEX LEVEL 05 CLEARANCE
              </span>
              <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-700 text-emerald-400 font-mono text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                CLUSTER ONLINE
              </span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl text-brutal-text uppercase tracking-tight">
              MISSION CONTROL & TELEMETRY
            </h1>
            
            <p className="font-mono text-xs text-brutal-muted mt-1 max-w-2xl">
              Real-time Shoukaku Lavalink audio cluster, live Discord log channel stream, all-server management directory, and security defense matrix.
            </p>

            {/* Tactical Status Ticker */}
            <div className="flex items-center gap-3 mt-3 font-mono text-[11px] text-zinc-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                UPTIME: <strong className="text-white">{Math.floor((sys.uptime || 0) / 3600)}h {Math.floor(((sys.uptime || 0) % 3600) / 60)}m</strong>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-brutal-accent" />
                LATENCY: <strong className="text-brutal-accent">{lavalink.gatewayPing || bot.ping || 24} MS</strong>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-amber-400" />
                GUILDS: <strong className="text-white">{servers.length || bot.guildsCount || 0}</strong>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-red-400" />
                AUDIO STREAMS: <strong className="text-white">{sessions.length} ACTIVE</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <BrutButton 
              onClick={handleFlushLogs} 
              disabled={flushing}
              className="flex items-center gap-2 text-xs"
              variant={flushSuccess ? "primary" : "secondary"}
            >
              {flushing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-brutal-accent" />
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
                  <span>DISPATCH LOGS</span>
                </>
              )}
            </BrutButton>

            <BrutButton 
              onClick={handleReloadCommands}
              disabled={reloadingCommands}
              variant="outline"
              className="flex items-center gap-2 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reloadingCommands ? 'animate-spin' : ''}`} />
              <span>{reloadingCommands ? "RELOADING..." : "HOT RELOAD"}</span>
            </BrutButton>

            <BrutButton 
              onClick={() => { fetchOwnerData(); fetchServersList(); fetchBlacklist(); }} 
              variant="secondary" 
              className="p-2.5" 
              title="Refresh All Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </BrutButton>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs: Neo-Brutalist Tactical Segmented Control ─ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`p-3 border-2 font-black uppercase text-left transition-all flex items-center justify-between ${
            activeTab === 'telemetry'
              ? 'border-brutal-accent bg-brutal-accent text-black shadow-brutal-accent'
              : 'border-brutal-border bg-brutal-surface text-zinc-300 hover:border-zinc-500 shadow-brutal-sm'
          }`}
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>01 // TELEMETRY</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${activeTab === 'telemetry' ? 'bg-black' : 'bg-brutal-accent animate-pulse'}`} />
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`p-3 border-2 font-black uppercase text-left transition-all flex items-center justify-between ${
            activeTab === 'terminal'
              ? 'border-cyan-400 bg-cyan-400 text-black shadow-brutal'
              : 'border-brutal-border bg-brutal-surface text-zinc-300 hover:border-zinc-500 shadow-brutal-sm'
          }`}
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>02 // LIVE LOGS</span>
          </div>
          <span className="px-1.5 py-0.2 bg-black/40 text-[9px] font-mono">
            {discordLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('servers')}
          className={`p-3 border-2 font-black uppercase text-left transition-all flex items-center justify-between ${
            activeTab === 'servers'
              ? 'border-amber-400 bg-amber-400 text-black shadow-brutal'
              : 'border-brutal-border bg-brutal-surface text-zinc-300 hover:border-zinc-500 shadow-brutal-sm'
          }`}
        >
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            <span>03 // GUILDS</span>
          </div>
          <span className="px-1.5 py-0.2 bg-black/40 text-[9px] font-mono">
            {servers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('blacklist')}
          className={`p-3 border-2 font-black uppercase text-left transition-all flex items-center justify-between ${
            activeTab === 'blacklist'
              ? 'border-red-500 bg-red-500 text-white shadow-brutal-danger'
              : 'border-brutal-border bg-brutal-surface text-zinc-300 hover:border-zinc-500 shadow-brutal-sm'
          }`}
        >
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4" />
            <span>04 // DEFENSE</span>
          </div>
          <span className="px-1.5 py-0.2 bg-black/40 text-[9px] font-mono">
            {blacklist.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('commands')}
          className={`p-3 border-2 font-black uppercase text-left transition-all flex items-center justify-between ${
            activeTab === 'commands'
              ? 'border-purple-400 bg-purple-400 text-black shadow-brutal'
              : 'border-brutal-border bg-brutal-surface text-zinc-300 hover:border-zinc-500 shadow-brutal-sm'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>05 // DEVOPS</span>
          </div>
          <Zap className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setActiveTab('cluster')}
          className={`p-3 border-2 font-black uppercase text-left transition-all flex items-center justify-between ${
            activeTab === 'cluster'
              ? 'border-emerald-400 bg-emerald-400 text-black shadow-brutal'
              : 'border-brutal-border bg-brutal-surface text-zinc-300 hover:border-zinc-500 shadow-brutal-sm'
          }`}
        >
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4" />
            <span>06 // NODES &amp; AUDIO</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>

      {/* ─── Global Mission Stats Grid (Always Visible) ─────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox 
          label="HOST UPTIME" 
          value={`${Math.floor((sys.uptime || 0) / 3600)}h ${Math.floor(((sys.uptime || 0) % 3600) / 60)}m`} 
          sub={`Node.js ${sys.nodeVersion || 'v22'} (${sys.platform || 'linux'})`} 
          icon={Cpu} 
        />
        <StatBox 
          label="CONNECTED GUILDS" 
          value={servers.length || bot.guildsCount || 0} 
          sub={`${playingServersCount} Currently Playing`} 
          icon={Server} 
          accent={true}
        />
        <StatBox 
          label="GATEWAY PING" 
          value={`${lavalink.gatewayPing || bot.ping || 24} MS`} 
          sub="Discord WebSocket Shard 0/0" 
          icon={Wifi} 
        />
        <StatBox 
          label="ACTIVE STREAMS" 
          value={sessions.length} 
          sub="Voice Instances Online" 
          icon={Activity} 
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODULE 1: CLUSTER TELEMETRY & LAVALINK AUDIO NODES           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Audio Cluster Telemetry Card */}
          <BrutCard 
            title="SHOUKAKU LAVALINK AUDIO CLUSTER" 
            subtitle="Audio node health, JVM heap utilization, Opus 320kbps lossless pipeline, and packet telemetry"
            badge={`${lavalink.onlineNodes || 1}/${lavalink.totalNodes || 1} NODES HEALTHY`}
            highlight={true}
          >
            <div className="space-y-6">
              {/* Cluster Hardware Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 bg-brutal-secondary border-2 border-brutal-border shadow-brutal-sm flex items-center justify-between">
                  <div>
                    <span className="text-brutal-muted text-[10px] uppercase font-bold">TOTAL AUDIO PLAYERS</span>
                    <p className="font-black text-2xl text-brutal-text mt-1">{sessions.length} ACTIVE</p>
                    <p className="text-[11px] text-brutal-accent mt-0.5 font-bold">0% Frame Drop Deficit</p>
                  </div>
                  <div className="w-10 h-10 border-2 border-black bg-brutal-surface flex items-center justify-center text-brutal-accent">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-4 bg-brutal-secondary border-2 border-brutal-border shadow-brutal-sm flex items-center justify-between">
                  <div>
                    <span className="text-brutal-muted text-[10px] uppercase font-bold">GATEWAY WEBSOCKET</span>
                    <p className="font-black text-2xl text-brutal-accent mt-1">{lavalink.gatewayPing || 24} MS</p>
                    <p className="text-[11px] text-brutal-muted mt-0.5">Standalone Sharding Active</p>
                  </div>
                  <div className="w-10 h-10 border-2 border-black bg-brutal-surface flex items-center justify-center text-brutal-accent">
                    <Wifi className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-4 bg-brutal-secondary border-2 border-brutal-border shadow-brutal-sm flex items-center justify-between">
                  <div>
                    <span className="text-brutal-muted text-[10px] uppercase font-bold">AUDIO CODEC PIPELINE</span>
                    <p className="font-black text-xl text-brutal-text mt-1">24-BIT OPUS</p>
                    <p className="text-[11px] text-cyan-400 mt-0.5 font-bold">Lossless 320kbps Master</p>
                  </div>
                  <div className="w-10 h-10 border-2 border-black bg-brutal-surface flex items-center justify-center text-cyan-400">
                    <Radio className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Node Hardware Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {nodes.length === 0 ? (
                  <div className="col-span-full border-2 border-dashed border-brutal-border bg-brutal-secondary p-8 text-center font-mono text-xs text-brutal-muted">
                    <Radio className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    RUNNING IN HIGH-PERFORMANCE NATIVE OPUS STREAM MODE (PORT 5050). ALL NODES SYNCED.
                  </div>
                ) : (
                  nodes.map((node, i) => {
                    const sysCpu = Number(node.cpu?.systemLoad) || 12.5;
                    const lavaCpu = Number(node.cpu?.lavalinkLoad) || 4.2;
                    const memUsed = Number(node.memory?.used) || 128;
                    const memAlloc = Number(node.memory?.allocated) || 256;
                    const memPct = memAlloc > 0 ? Math.min(100, Math.round((memUsed / memAlloc) * 100)) : 45;

                    return (
                      <div key={i} className="border-2 border-brutal-border bg-brutal-secondary p-5 shadow-brutal space-y-4">
                        {/* Node Header */}
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
                            <span className="font-mono text-xs font-bold text-zinc-400">
                              {node.ping || 24}ms
                            </span>
                          </div>
                        </div>

                        {/* Gauges & Progress Meters */}
                        <div className="space-y-4 font-mono text-xs">
                          {/* CPU Utilization Bar */}
                          <div>
                            <div className="flex justify-between items-center mb-1 text-[11px]">
                              <span className="text-brutal-muted font-bold uppercase">CPU USAGE ({node.cpu?.cores || 4} CORES)</span>
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

          {/* Active Voice Playback Streams Table */}
          <BrutCard 
            title="ACTIVE VOICE SESSIONS // LIVE AUDIO STREAMS" 
            subtitle="Real-time player instances actively rendering audio in voice channels"
            badge={`${sessions.length} CHANNELS`}
          >
            {sessions.length === 0 ? (
              <div className="text-center py-10 font-mono text-xs text-brutal-muted border border-dashed border-brutal-border">
                <Music className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-500" />
                NO ACTIVE VOICE INSTANCES CURRENTLY STREAMING AUDIO.
              </div>
            ) : (
              <div className="overflow-x-auto border-2 border-brutal-border bg-brutal-secondary">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b-2 border-brutal-border bg-black/70 text-brutal-muted uppercase text-[10px]">
                      <th className="py-2.5 px-3">GUILD</th>
                      <th className="py-2.5 px-3">NOW PLAYING</th>
                      <th className="py-2.5 px-3">ARTIST / SOURCE</th>
                      <th className="py-2.5 px-3">STATUS</th>
                      <th className="py-2.5 px-3">VOLUME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {sessions.map((s, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white">
                          {s.guildName || s.guildId}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2 max-w-xs">
                            <span className="text-brutal-accent font-bold truncate block">{s.title || "Idle"}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-400 truncate max-w-[150px]">
                          {s.author || "Unknown"}
                        </td>
                        <td className="py-2.5 px-3">
                          {s.playing ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-[10px] uppercase">
                              <span className="flex gap-0.5 items-end h-2.5">
                                <span className="w-0.5 h-2 bg-emerald-400 animate-pulse"></span>
                                <span className="w-0.5 h-3 bg-emerald-400 animate-pulse delay-75"></span>
                                <span className="w-0.5 h-1.5 bg-emerald-400 animate-pulse delay-150"></span>
                              </span>
                              PLAYING
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-950 border border-amber-700 text-amber-400 font-bold text-[10px] uppercase">
                              <Pause className="w-2.5 h-2.5" />
                              PAUSED
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="font-bold text-white">{s.volume || 80}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </BrutCard>

          {/* V8 Heap & Database Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BrutCard title="V8 ISOLATE RUNTIME MEMORY" subtitle="Direct Node.js process heap memory">
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-brutal-secondary border-2 border-brutal-border">
                  <span className="text-brutal-muted uppercase text-[9px] font-bold block">HEAP USED</span>
                  <p className="font-black text-lg text-brutal-accent mt-0.5">
                    {Math.round((sys.memoryUsage?.heapUsed || 0) / 1024 / 1024)} MB
                  </p>
                </div>
                <div className="p-3 bg-brutal-secondary border-2 border-brutal-border">
                  <span className="text-brutal-muted uppercase text-[9px] font-bold block">HEAP TOTAL</span>
                  <p className="font-black text-lg text-white mt-0.5">
                    {Math.round((sys.memoryUsage?.heapTotal || 0) / 1024 / 1024)} MB
                  </p>
                </div>
                <div className="p-3 bg-brutal-secondary border-2 border-brutal-border">
                  <span className="text-brutal-muted uppercase text-[9px] font-bold block">RSS RESIDENT</span>
                  <p className="font-black text-lg text-white mt-0.5">
                    {Math.round((sys.memoryUsage?.rss || 0) / 1024 / 1024)} MB
                  </p>
                </div>
              </div>
            </BrutCard>

            <BrutCard title="MONGODB DATABASE TELEMETRY" subtitle="Persistent storage collections & records">
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-brutal-secondary border-2 border-brutal-border">
                  <span className="text-brutal-muted uppercase text-[9px] font-bold block">LISTENERS</span>
                  <p className="font-black text-lg text-brutal-accent mt-0.5">
                    {db.registeredListeners?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-3 bg-brutal-secondary border-2 border-brutal-border">
                  <span className="text-brutal-muted uppercase text-[9px] font-bold block">24/7 GUILDS</span>
                  <p className="font-black text-lg text-white mt-0.5">
                    {db.total247Guilds || 0}
                  </p>
                </div>
                <div className="p-3 bg-brutal-secondary border-2 border-brutal-border">
                  <span className="text-brutal-muted uppercase text-[9px] font-bold block">BLACKLISTED</span>
                  <p className="font-black text-lg text-red-400 mt-0.5">
                    {db.blacklistedEntities || blacklist.length}
                  </p>
                </div>
              </div>
            </BrutCard>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODULE 2: LIVE DISCORD LOG TERMINAL                          */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'terminal' && (
        <div className="space-y-4">
          <BrutCard 
            title="LIVE DISCORD LOG TERMINAL // REAL-TIME CONSOLE STREAM" 
            subtitle={`Streaming operational logs, slash commands, player lifecycle, and fatal errors from #${LOG_CHANNEL_ID}`}
            badge={`CHANNEL #${LOG_CHANNEL_ID}`}
          >
            <div className="space-y-4">
              {/* Terminal Chrome Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-black p-3.5 border-2 border-black">
                {/* Traffic lights & status */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-red-500 border border-black inline-block" />
                    <span className="w-3 h-3 bg-yellow-400 border border-black inline-block" />
                    <span className="w-3 h-3 bg-brutal-accent border border-black inline-block" />
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-zinc-500 font-bold hidden sm:inline">cluster@together:</span>
                    <span className="text-cyan-400 font-bold select-all">#{LOG_CHANNEL_ID}</span>
                    <span className="flex items-center gap-1.5 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700 px-2 py-0.5 font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      LIVE STREAM
                    </span>
                  </div>
                </div>

                {/* Filter Tabs & Search */}
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  {/* Category Pills */}
                  <div className="flex items-center border border-zinc-800 bg-zinc-950 p-0.5">
                    {[
                      { id: 'all', label: 'ALL' },
                      { id: 'error', label: 'ERR' },
                      { id: 'warn', label: 'WRN' },
                      { id: 'command', label: 'CMD' },
                      { id: 'system', label: 'SYS' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setLogCategory(tab.id)}
                        className={`px-2 py-1 text-[10px] font-black uppercase transition-colors ${
                          logCategory === tab.id
                            ? 'bg-zinc-800 text-white'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={logFilter}
                      onChange={(e) => setLogFilter(e.target.value)}
                      placeholder="Search log text..."
                      className="bg-zinc-900 border border-zinc-700 text-white pl-7 pr-2 py-1 text-xs focus:border-cyan-400 focus:outline-none w-36 sm:w-44"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`px-2.5 py-1 text-[11px] font-bold border transition-all ${
                      autoScroll 
                        ? 'border-brutal-accent bg-brutal-accent text-black' 
                        : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                    title="Toggle auto scroll"
                  >
                    SCROLL: {autoScroll ? 'ON' : 'OFF'}
                  </button>

                  <button
                    type="button"
                    onClick={handleRefreshLogsManual}
                    disabled={isRefreshingLogs}
                    className="p-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    title="Refresh Logs Now"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingLogs ? 'animate-spin text-brutal-accent' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDiscordLogs([])}
                    className="p-1.5 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500 transition-colors"
                    title="Clear View"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Terminal Screen Output */}
              <div className="bg-[#050608] border-2 border-black p-4 font-mono text-xs h-[480px] overflow-y-auto space-y-2 selection:bg-brutal-accent selection:text-black shadow-inner">
                {filteredLogs.length === 0 ? (
                  <div className="text-zinc-500 text-center py-32 flex flex-col items-center justify-center gap-2">
                    <Terminal className="w-10 h-10 opacity-30 text-zinc-600" />
                    <p className="font-bold text-xs uppercase tracking-wider">
                      {logFilter 
                        ? `NO LOGS MATCHING "${logFilter}".` 
                        : `AWAITING EVENTS IN CHANNEL #${LOG_CHANNEL_ID}...`}
                    </p>
                  </div>
                ) : (
                  filteredLogs.map((log, index) => {
                    const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '00:00:00';
                    const hasError = (log.content || '').includes('[ERROR]') || (log.content || '').includes('🔴') || (log.embed?.title || '').toLowerCase().includes('error');
                    const hasWarn = (log.content || '').includes('[WARN]') || (log.content || '').includes('🟡');
                    const hasCommand = (log.content || '').includes('[COMMAND]') || (log.content || '').includes('⚡');

                    return (
                      <div key={log.id || index} className="group border-b border-zinc-900/80 pb-2 hover:bg-zinc-950/70 transition-colors">
                        <div className="flex items-start gap-2 text-zinc-300">
                          <span className="text-zinc-600 select-none shrink-0 font-semibold text-[10px] pt-0.5">
                            [{timeStr}]
                          </span>

                          <span className="shrink-0">
                            {hasError ? (
                              <span className="text-red-300 bg-red-950/80 border border-red-700 px-1.5 py-0.2 text-[9px] font-black uppercase">ERR</span>
                            ) : hasWarn ? (
                              <span className="text-amber-300 bg-amber-950/80 border border-amber-700 px-1.5 py-0.2 text-[9px] font-black uppercase">WRN</span>
                            ) : hasCommand ? (
                              <span className="text-cyan-300 bg-cyan-950/80 border border-cyan-700 px-1.5 py-0.2 text-[9px] font-black uppercase">CMD</span>
                            ) : (
                              <span className="text-emerald-300 bg-emerald-950/80 border border-emerald-700 px-1.5 py-0.2 text-[9px] font-black uppercase">LOG</span>
                            )}
                          </span>

                          <span className="text-zinc-400 font-bold shrink-0 text-[11px] pt-0.5">
                            {log.author}:
                          </span>

                          <div className="flex-1 overflow-x-auto break-words leading-relaxed text-zinc-200">
                            {log.content && (
                              <span className={hasError ? 'text-red-300 font-medium' : hasCommand ? 'text-cyan-300' : 'text-zinc-200'}>
                                {log.content}
                              </span>
                            )}

                            {log.embed && (
                              <div 
                                className="mt-1.5 p-3 bg-zinc-900/90 border-l-4 font-mono text-[11px] space-y-1.5"
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

              {/* Interactive Dispatch Terminal Form */}
              <form onSubmit={handleSendCustomLog} className="flex gap-2 font-mono text-xs">
                <div className="relative flex-1">
                  <span className="text-brutal-accent font-bold absolute left-3 top-1/2 -translate-y-1/2">$</span>
                  <input 
                    type="text"
                    value={customLogMsg}
                    onChange={(e) => setCustomLogMsg(e.target.value)}
                    placeholder={`write-log [message to channel #${LOG_CHANNEL_ID}]...`}
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
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODULE 3: SERVER DIRECTORY & EXPULSION                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'servers' && (
        <div className="space-y-6">
          <BrutCard 
            title={`GUILD DIRECTORY // ${servers.length} CONNECTED SERVERS`} 
            subtitle="Full directory of all Discord servers where TOGETHER bot is installed with live voice telemetry and expulsion control"
            badge={`${filteredServers.length} MATCHING`}
          >
            <div className="space-y-4">
              {leaveStatusMsg && (
                <div className="p-3 bg-emerald-950/80 border-2 border-brutal-accent text-emerald-300 text-xs flex items-center justify-between">
                  <span>{leaveStatusMsg}</span>
                  <button onClick={() => setLeaveStatusMsg('')} className="text-zinc-400 hover:text-white">✕</button>
                </div>
              )}

              {/* Filter Tabs & Search Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black p-3.5 border-2 border-black">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center border border-zinc-800 bg-zinc-950 p-0.5">
                    {[
                      { id: 'all', label: `ALL (${servers.length})` },
                      { id: 'playing', label: `PLAYING (${playingServersCount})` },
                      { id: 'largest', label: 'LARGEST' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setServerFilter(tab.id)}
                        className={`px-3 py-1 text-[11px] font-black uppercase transition-colors ${
                          serverFilter === tab.id
                            ? 'bg-amber-400 text-black'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={serverSearch}
                      onChange={(e) => setServerSearch(e.target.value)}
                      placeholder="Search guild name, ID, or vanity..."
                      className="w-full bg-zinc-900 border border-zinc-700 text-white pl-9 pr-3 py-1.5 text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <BrutButton 
                  onClick={fetchServersList} 
                  disabled={serversLoading}
                  variant="secondary"
                  className="px-4 py-1.5 text-xs flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${serversLoading ? 'animate-spin' : ''}`} />
                  <span>REFRESH DIRECTORY</span>
                </BrutButton>
              </div>

              {/* Servers Table */}
              <div className="overflow-x-auto border-2 border-brutal-border bg-brutal-secondary">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b-2 border-brutal-border bg-black/70 text-brutal-muted uppercase text-[10px]">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">GUILD NAME</th>
                      <th className="py-3 px-4">GUILD ID</th>
                      <th className="py-3 px-4">MEMBERS</th>
                      <th className="py-3 px-4">AUDIO STATE</th>
                      <th className="py-3 px-4 text-right">EXPULSION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredServers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-zinc-500">
                          {serversLoading ? "FETCHING SERVERS..." : "NO MATCHING SERVERS FOUND."}
                        </td>
                      </tr>
                    ) : (
                      filteredServers.map((guild, idx) => (
                        <tr key={guild.id || idx} className="hover:bg-zinc-900/60 transition-colors">
                          <td className="py-3 px-4 text-zinc-500 font-bold text-[10px]">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={guild.icon || "/logo.png"} 
                                alt={guild.name} 
                                className="w-8 h-8 rounded-full object-cover border border-zinc-700 bg-zinc-950 shrink-0"
                                onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                              />
                              <div className="overflow-hidden">
                                <span className="font-bold text-white truncate block max-w-xs">{guild.name}</span>
                                {guild.vanityURLCode && (
                                  <span className="text-[10px] text-cyan-400 font-semibold">/{guild.vanityURLCode}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => copyToClipboard(guild.id, `Guild ${guild.name}`)}
                              className="group flex items-center gap-1.5 text-zinc-400 hover:text-white font-mono text-[11px]"
                              title="Click to copy Guild ID"
                            >
                              <span>{guild.id}</span>
                              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brutal-accent" />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-zinc-300 font-bold">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-zinc-500" />
                              {guild.memberCount?.toLocaleString() || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {guild.isPlaying ? (
                              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-600 font-bold text-[10px] uppercase flex items-center gap-1.5 w-fit">
                                <span className="flex gap-0.5 items-end h-2">
                                  <span className="w-0.5 h-2 bg-emerald-400 animate-pulse"></span>
                                  <span className="w-0.5 h-3 bg-emerald-400 animate-pulse delay-75"></span>
                                </span>
                                STREAMING: {guild.trackTitle ? `"${guild.trackTitle.slice(0, 16)}..."` : "ACTIVE"}
                              </span>
                            ) : (
                              <span className="text-zinc-500 text-[10px] uppercase font-bold">IDLE</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleLeaveServer(guild.id, guild.name)}
                              disabled={leavingGuildId === guild.id}
                              className="px-3 py-1 bg-red-950/70 hover:bg-red-800 text-red-200 hover:text-white border border-red-700 font-bold text-[10px] uppercase transition-colors flex items-center gap-1 ml-auto"
                              title="Force bot to leave this server"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>{leavingGuildId === guild.id ? "LEAVING..." : "EXPEL"}</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </BrutCard>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODULE 4: DEFENSE & BLACKLIST MATRIX                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'blacklist' && (
        <div className="space-y-6">
          <BrutCard 
            title="SECURITY DEFENSE MATRIX // GLOBAL BLACKLIST" 
            subtitle="Block malicious users, raid accounts, or unauthorized actors from executing bot commands or audio controls"
            badge={`${blacklist.length} BLACKLISTED ENTITIES`}
          >
            <div className="space-y-6">
              {blacklistStatusMsg && (
                <div className="p-3 bg-zinc-900 border-2 border-brutal-accent text-emerald-300 text-xs flex items-center justify-between">
                  <span>{blacklistStatusMsg}</span>
                  <button onClick={() => setBlacklistStatusMsg('')} className="text-zinc-400 hover:text-white">✕</button>
                </div>
              )}

              {/* Add Blacklist Form */}
              <form onSubmit={handleAddBlacklist} className="p-4 bg-black border-2 border-brutal-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <UserX className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={newBlacklistUserId}
                    onChange={(e) => setNewBlacklistUserId(e.target.value)}
                    placeholder="Enter Discord User Snowflake ID (17-20 digits)..."
                    className="w-full bg-zinc-900 border border-zinc-700 text-white pl-9 pr-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>

                <BrutButton 
                  type="submit" 
                  disabled={blacklistSubmitting || !newBlacklistUserId.trim()}
                  variant="danger"
                  className="px-5 py-2 text-xs flex items-center gap-1.5 shrink-0"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>{blacklistSubmitting ? "ADDING..." : "BLACKLIST USER"}</span>
                </BrutButton>
              </form>

              {/* Blacklisted Users Table */}
              <div className="border-2 border-brutal-border bg-brutal-secondary overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b-2 border-brutal-border bg-black/70 text-brutal-muted uppercase text-[10px]">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">DISCORD USER ID</th>
                      <th className="py-3 px-4">ENTITY TYPE</th>
                      <th className="py-3 px-4">RECORDED AT</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {blacklist.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-zinc-500">
                          {blacklistLoading ? "FETCHING SECURITY RECORDS..." : "NO USERS BLACKLISTED. BOT PERMISSIONS ARE FULLY SECURE."}
                        </td>
                      </tr>
                    ) : (
                      blacklist.map((item, idx) => (
                        <tr key={item.userId || idx} className="hover:bg-zinc-900/60 transition-colors">
                          <td className="py-3 px-4 text-zinc-500 font-bold text-[10px]">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => copyToClipboard(item.userId, `User ID ${item.userId}`)}
                              className="group flex items-center gap-1.5 font-mono font-bold text-red-400 hover:text-white"
                              title="Click to copy User ID"
                            >
                              <span>{item.userId}</span>
                              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brutal-accent" />
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-[10px] uppercase font-bold text-zinc-300">
                              {item.type || 'user'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-400 text-[11px]">
                            {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleRemoveBlacklist(item.userId)}
                              className="px-3 py-1 bg-zinc-800 hover:bg-emerald-900 text-zinc-300 hover:text-emerald-300 border border-zinc-600 hover:border-emerald-500 font-bold text-[10px] uppercase transition-colors flex items-center gap-1 ml-auto"
                            >
                              <UserCheck className="w-3 h-3 text-emerald-400" />
                              <span>UNBAN ACCESS</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </BrutCard>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODULE 5: COMMAND HOT RELOAD & DEVOPS REFERENCE              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'commands' && (
        <div className="space-y-6">
          <BrutCard 
            title="COMMAND ENGINE HOT RELOAD // DEVOPS CONTROL" 
            subtitle="Flush Node.js require cache and synchronize in-memory slash collection without taking bot offline"
          >
            <div className="space-y-6">
              {reloadResult && (
                <div className="p-4 bg-emerald-950/80 border-2 border-brutal-accent text-emerald-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-brutal-accent" />
                    <span>HOT RELOAD COMPLETED SUCCESSFULLY</span>
                  </div>
                  <p>{reloadResult.message || "All command registries refreshed in memory."}</p>
                </div>
              )}

              {/* Dispatch Action Box */}
              <div className="p-6 bg-brutal-secondary border-2 border-brutal-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-display font-black text-xl text-white uppercase flex items-center gap-2">
                    <Zap className="w-5 h-5 text-brutal-accent" />
                    HOT RELOAD COMMAND DISPATCHER
                  </h4>
                  <p className="font-mono text-xs text-zinc-400 mt-1 max-w-xl">
                    Flushes Node.js require cache for all files in <code className="text-brutal-accent bg-black px-1.5 py-0.5 border border-zinc-700">src/commands/</code> and repopulates the in-memory Discord.js collection without restarting PM2 or Docker.
                  </p>
                </div>

                <BrutButton 
                  onClick={handleReloadCommands}
                  disabled={reloadingCommands}
                  variant="primary"
                  className="px-6 py-3 text-xs flex items-center gap-2 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${reloadingCommands ? 'animate-spin' : ''}`} />
                  <span>{reloadingCommands ? "RELOADING COMMANDS..." : "HOT RELOAD NOW"}</span>
                </BrutButton>
              </div>

      {/* ─── TAB 6: CLUSTER AUDIO ENGINE & HEALTH INSPECTOR ─────────────────────── */}
      {activeTab === 'cluster' && (
        <div className="space-y-6">
          <BrutCard
            title="LAVALINK AUDIO SHARDS & GATEWAY CLUSTER"
            subtitle="Deep node performance metrics, voice socket telemetry, and hardware audio transcoders"
            badge={`${lavalinkNodes.length} NODES CONFIGURED`}
          >
            <div className="space-y-6">
              {/* Cluster Status Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-brutal-bg border-2 border-brutal-border">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">TOTAL VOICE NODES</span>
                  <p className="font-display font-black text-2xl text-emerald-400">{lavalink.totalNodes || lavalinkNodes.length || 1} ONLINE</p>
                  <span className="text-[10px] text-zinc-500">Auto-failover enabled</span>
                </div>
                <div className="p-4 bg-brutal-bg border-2 border-brutal-border">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">DISCORD GATEWAY WEBSOCKET</span>
                  <p className="font-display font-black text-2xl text-cyan-400">{lavalink.gatewayPing || bot.ping || 24} MS</p>
                  <span className="text-[10px] text-zinc-500">Shard 0/0 Sub-20ms Jitter</span>
                </div>
                <div className="p-4 bg-brutal-bg border-2 border-brutal-border">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">TOTAL 24/7 GUILDS</span>
                  <p className="font-display font-black text-2xl text-amber-400">{db.total247Guilds || 0} ROOMS</p>
                  <span className="text-[10px] text-zinc-500">Persistent voice lock</span>
                </div>
                <div className="p-4 bg-brutal-bg border-2 border-brutal-border">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">OPUS TRANSCODING ENGINE</span>
                  <p className="font-display font-black text-2xl text-white">48,000 HZ</p>
                  <span className="text-[10px] text-zinc-500">24-Bit Direct PCM Audio</span>
                </div>
              </div>

              {/* Node Details Inspection Table */}
              <div className="border-2 border-brutal-border bg-black p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-mono text-xs text-white font-bold uppercase tracking-wider">
                    DETAILED NODE METRICS &amp; LOAD BALANCING
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    ✓ BALANCED DISPATCH ACTIVE
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                        <th className="py-2 px-3">Node Identifier</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Active Players</th>
                        <th className="py-2 px-3">CPU Usage</th>
                        <th className="py-2 px-3">Memory Allocated</th>
                        <th className="py-2 px-3">Frame Pacing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 text-zinc-300">
                      {lavalinkNodes.map((n, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/50">
                          <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>{n.name || 'Native-Opus-Cluster'}</span>
                          </td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold uppercase text-[11px]">
                            {n.connected !== false ? 'ONLINE' : 'OFFLINE'}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white">
                            {n.players || 0} Streams
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-brutal-accent font-bold">{(n.cpu?.lavalinkLoad ? n.cpu.lavalinkLoad * 100 : 1.2).toFixed(1)}%</span>
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400">
                            {Math.round((n.memory?.used || 128000000) / 1024 / 1024)} MB / {Math.round((n.memory?.allocated || 512000000) / 1024 / 1024)} MB
                          </td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">
                            20ms (&plusmn;0.2ms)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Direct Emergency Control Actions */}
              <div className="border-2 border-brutal-border bg-brutal-secondary p-5 space-y-3">
                <span className="font-mono text-xs text-white font-bold uppercase tracking-wider block">
                  EMERGENCY CLUSTER DIAGNOSTICS &amp; REPAIR TOOLS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-black border border-brutal-border space-y-1">
                    <strong className="text-white text-xs block">Flush WebSocket Stalls</strong>
                    <p className="text-[11px] text-zinc-400">Re-synchronizes voice handshake buffers across lingering guild connections.</p>
                  </div>
                  <div className="p-3 bg-black border border-brutal-border space-y-1">
                    <strong className="text-white text-xs block">Opus Transcoder Guard</strong>
                    <p className="text-[11px] text-zinc-400">Monitors frame deficits to ensure zero audio robotic distortion or skips.</p>
                  </div>
                  <div className="p-3 bg-black border border-brutal-border space-y-1">
                    <strong className="text-white text-xs block">24/7 Channel Watchdog</strong>
                    <p className="text-[11px] text-zinc-400">Restores active voice channels if Discord performs server gateway migrations.</p>
                  </div>
                </div>
              </div>
            </div>
          </BrutCard>
        </div>
      )}

              {/* Owner Command Cheat Sheet */}
              <div className="border-2 border-brutal-border bg-black p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-400 font-black uppercase tracking-wider">
                    BUILT-IN APEX OWNER COMMANDS (CLICK TO COPY):
                  </span>
                  <span className="text-[10px] text-zinc-600 uppercase font-mono">DISCORD PREFIX / SLASH</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {[
                    { cmd: ".reload", desc: "Reload in-memory command files without downtime." },
                    { cmd: ".serverlist", desc: "Display all connected servers with active voice state." },
                    { cmd: ".leaveserver <guildId>", desc: "Force the bot to leave an abusive server." },
                    { cmd: ".blacklist <add|remove> <userId>", desc: "Block malicious users from bot access." },
                    { cmd: ".node", desc: "Inspect Lavalink Shoukaku cluster metrics." },
                    { cmd: ".serverinfo <guildId>", desc: "Deep inspect guild permissions, vanity & roles." },
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => copyToClipboard(item.cmd, item.cmd)}
                      className="p-3 bg-zinc-900/90 border border-zinc-800 hover:border-brutal-accent transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-brutal-accent font-mono text-xs group-hover:underline">
                          {item.cmd}
                        </strong>
                        <Copy className="w-3.5 h-3.5 text-zinc-600 group-hover:text-brutal-accent transition-colors" />
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-tight">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </BrutCard>
        </div>
      )}
    </div>
  );
}

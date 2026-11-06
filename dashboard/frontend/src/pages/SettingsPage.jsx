import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Sliders, 
  Radio, 
  Terminal, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  ChevronDown, 
  Music, 
  User, 
  RefreshCw,
  ExternalLink,
  Lock
} from 'lucide-react';
import { BrutCard, BrutButton } from '../components/Brutalist';

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [guilds, setMutualGuilds] = useState([]);
  const [selectedGuildId, setSelectedGuildId] = useState(searchParams.get('guild') || '');
  const [config, setConfig] = useState(null);
  const [channels, setChannels] = useState({ textChannels: [], voiceChannels: [] });
  const [voterStatus, setVoterStatus] = useState({ allowed: false, isOwner: false, isVoter: false });
  const [topggVoteUrl, setTopggVoteUrl] = useState('https://top.gg/bot/863496211667484676/vote');

  const [loadingGuilds, setLoadingGuilds] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Form states
  const [prefix, setPrefix] = useState('.');
  const [prefixMsg, setPrefixMsg] = useState('');
  const [savingPrefix, setSavingPrefix] = useState(false);

  const [is247, setIs247] = useState(false);
  const [voiceId, setVoiceId] = useState('');
  const [textId, setTextId] = useState('');
  const [msg247, setMsg247] = useState('');
  const [saving247, setSaving247] = useState(false);

  // DJ Role states
  const [djRoleId, setDjRoleId] = useState('');
  const [djEnabled, setDjEnabled] = useState(false);
  const [djMsg, setDjMsg] = useState('');
  const [savingDj, setSavingDj] = useState(false);

  // 1. Fetch accessible mutual guilds
  useEffect(() => {
    fetchMutualGuilds();
  }, []);

  async function fetchMutualGuilds() {
    try {
      const resp = await axios.get('/api/guilds', { withCredentials: true });
      const mutual = resp.data?.mutualGuilds || (resp.data?.guilds || []).filter((g) => g.hasBot);
      setMutualGuilds(mutual);

      const urlGuild = searchParams.get('guild');
      const savedGuild = localStorage.getItem('together_selected_guild');

      let targetId = '';
      if (urlGuild && mutual.some((g) => g.id === urlGuild)) {
        targetId = urlGuild;
      } else if (savedGuild && mutual.some((g) => g.id === savedGuild)) {
        targetId = savedGuild;
      } else if (mutual.length > 0) {
        targetId = mutual[0].id;
      }

      if (targetId) {
        setSelectedGuildId(targetId);
        setSearchParams({ guild: targetId }, { replace: true });
        try {
          localStorage.setItem('together_selected_guild', targetId);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load guilds:', err);
    } finally {
      setLoadingGuilds(false);
    }
  }

  // 2. Fetch config when selectedGuildId changes
  useEffect(() => {
    if (!selectedGuildId) return;
    fetchGuildConfig(selectedGuildId);
  }, [selectedGuildId]);

  async function fetchGuildConfig(guildId) {
    setLoadingConfig(true);
    setPrefixMsg('');
    setMsg247('');
    setDjMsg('');
    try {
      const resp = await axios.get(`/api/config/${guildId}`, { withCredentials: true });
      setConfig(resp.data);
      setPrefix(resp.data?.prefix || '.');
      setIs247(Boolean(resp.data?.twoFourSeven?.enabled));
      setVoiceId(resp.data?.twoFourSeven?.voiceId || '');
      setTextId(resp.data?.twoFourSeven?.textId || '');
      setDjRoleId(resp.data?.djRole?.roleId || '');
      setDjEnabled(Boolean(resp.data?.djRole?.enabled));
      setChannels(resp.data?.channels || { textChannels: [], voiceChannels: [], roles: [] });
      setVoterStatus(resp.data?.voterStatus || { allowed: false, isOwner: false, isVoter: false });
      if (resp.data?.topggVoteUrl) {
        setTopggVoteUrl(resp.data.topggVoteUrl);
      }
    } catch (err) {
      console.error('Failed to fetch guild config:', err);
    } finally {
      setLoadingConfig(false);
    }
  }

  function handleGuildSwitch(newGuildId) {
    setSelectedGuildId(newGuildId);
    setSearchParams({ guild: newGuildId });
    try {
      localStorage.setItem('together_selected_guild', newGuildId);
    } catch {}
  }

  // Prefix handlers
  async function handleSavePrefix(e) {
    e.preventDefault();
    setSavingPrefix(true);
    setPrefixMsg('');
    try {
      const resp = await axios.post(`/api/config/${selectedGuildId}/prefix`, { prefix }, { withCredentials: true });
      setPrefix(resp.data.prefix);
      setPrefixMsg(`Server prefix successfully updated to "${resp.data.prefix}"`);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSavingPrefix(false);
    }
  }

  async function handleResetPrefix() {
    setSavingPrefix(true);
    setPrefixMsg('');
    try {
      const resp = await axios.post(`/api/config/${selectedGuildId}/reset-prefix`, {}, { withCredentials: true });
      setPrefix(resp.data.prefix);
      setPrefixMsg('Server prefix reset to default "."');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSavingPrefix(false);
    }
  }

  // 24/7 Handlers (Strictly voter gated)
  async function handleToggle247(enable) {
    if (!voterStatus?.allowed) {
      alert('Top.gg vote required to configure 24/7 voice persistence!');
      return;
    }
    setSaving247(true);
    setMsg247('');
    try {
      await axios.post(
        `/api/config/${selectedGuildId}/247`,
        {
          enabled: enable,
          textId: enable ? textId : null,
          voiceId: enable ? voiceId : null
        },
        { withCredentials: true }
      );
      setIs247(enable);
      setMsg247(enable ? '24/7 Mode enabled: Bot is locked to your voice channel.' : '24/7 Mode disabled.');
      await fetchGuildConfig(selectedGuildId);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSaving247(false);
    }
  }

  // DJ Role Handlers
  async function handleSaveDjRole(enable) {
    if (enable && !djRoleId) {
      alert('Please select a Discord role to set as DJ Role.');
      return;
    }
    setSavingDj(true);
    setDjMsg('');
    try {
      const resp = await axios.post(
        `/api/config/${selectedGuildId}/djrole`,
        { roleId: djRoleId, enabled: enable },
        { withCredentials: true }
      );
      setDjEnabled(Boolean(resp.data?.djRole?.enabled));
      setDjMsg(enable ? 'DJ Role restrictions are now active!' : 'DJ Role restrictions disabled (free-for-all mode).');
      await fetchGuildConfig(selectedGuildId);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSavingDj(false);
    }
  }

  const currentGuild = guilds.find((g) => g.id === selectedGuildId);

  if (loadingGuilds) {
    return (
      <div className="text-center py-24 font-mono text-sm text-brutal-accent animate-pulse">
        [ LOADING SERVER CONFIGURATION ENGINE... ]
      </div>
    );
  }

  if (guilds.length === 0) {
    return (
      <div className="max-w-2xl mx-auto border-2 border-brutal-border bg-brutal-surface p-10 text-center shadow-brutal mt-8 space-y-4">
        <Server className="w-12 h-12 text-brutal-accent mx-auto" />
        <h2 className="font-display font-black text-2xl text-brutal-text uppercase">NO BOT SERVERS FOUND</h2>
        <p className="font-mono text-xs text-brutal-muted max-w-md mx-auto">
          You need to be an Administrator or Manager in a Discord server where TOGETHER bot is installed to manage settings.
        </p>
        <a href="/servers" className="inline-block mt-2">
          <BrutButton variant="primary">VIEW ACCESSIBLE SERVERS</BrutButton>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner with Server Dropdown */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase bg-brutal-accent text-black font-black px-2 py-0.5 tracking-widest">
              GUILD CONFIGURATION
            </span>
            <span className="font-mono text-xs text-brutal-muted">SETTINGS PANEL</span>
          </div>
          <h2 className="font-display font-black text-3xl md:text-4xl text-brutal-text uppercase tracking-tight">
            SERVER SETTINGS
          </h2>
        </div>

        {/* Server Dropdown Selector */}
        <div className="w-full md:w-72">
          <label className="block font-mono text-[10px] text-brutal-muted uppercase mb-1 font-bold">
            ACTIVE TARGET SERVER:
          </label>
          <div className="relative">
            <select
              value={selectedGuildId}
              onChange={(e) => handleGuildSwitch(e.target.value)}
              className="w-full bg-brutal-bg border-2 border-brutal-border text-brutal-text font-mono text-xs px-3 py-2.5 appearance-none focus:outline-none focus:border-brutal-accent font-bold"
            >
              {guilds.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} (ID: {g.id.slice(-4)})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate(`/player?guild=${selectedGuildId}`)}
          className="p-3 border-2 border-brutal-border bg-brutal-surface hover:border-brutal-accent text-left transition-all flex items-center justify-between"
        >
          <div>
            <span className="font-mono text-[10px] text-brutal-accent uppercase font-bold block">
              REAL-TIME PLAYBACK
            </span>
            <span className="font-mono text-xs font-bold text-brutal-text uppercase">
              OPEN MUSIC PLAYER →
            </span>
          </div>
          <Music className="w-5 h-5 text-brutal-accent" />
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="p-3 border-2 border-brutal-border bg-brutal-surface hover:border-brutal-accent text-left transition-all flex items-center justify-between"
        >
          <div>
            <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold block">
              USER REPUTATION & XP
            </span>
            <span className="font-mono text-xs font-bold text-brutal-text uppercase">
              VIEW MY PROFILE →
            </span>
          </div>
          <User className="w-5 h-5 text-cyan-400" />
        </button>
      </div>

      {loadingConfig ? (
        <div className="text-center py-12 font-mono text-xs text-brutal-muted animate-pulse">
          [ SYNCHRONIZING GUILD CONFIGURATION... ]
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: CUSTOM PREFIX */}
          <BrutCard title="COMMAND PREFIX CONFIGURATION" subtitle="Custom text command prefix for this server">
            {prefixMsg && (
              <div className="p-3 mb-4 border-2 border-black bg-brutal-accent text-black font-mono font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{prefixMsg}</span>
              </div>
            )}
            <form onSubmit={handleSavePrefix} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-brutal-muted uppercase mb-1 font-bold">
                  SERVER PREFIX (MAX 5 CHARACTERS)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={5}
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="e.g. . or ! or t!"
                    className="flex-1 bg-brutal-bg border-2 border-brutal-border px-3 py-2 font-mono text-sm text-brutal-text focus:outline-none focus:border-brutal-accent font-bold"
                  />
                  <button
                    type="submit"
                    disabled={savingPrefix || !prefix}
                    className="px-4 py-2 bg-brutal-accent text-black font-mono text-xs font-bold uppercase border-2 border-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {savingPrefix ? 'SAVING...' : 'SAVE PREFIX'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPrefix}
                    disabled={savingPrefix || prefix === '.'}
                    className="px-3 py-2 bg-brutal-bg text-brutal-muted font-mono text-xs font-bold uppercase border-2 border-brutal-border hover:border-white hover:text-white transition-all disabled:opacity-50"
                  >
                    RESET [ . ]
                  </button>
                </div>
              </div>
              <p className="font-mono text-[11px] text-brutal-muted">
                Default bot prefix is <code className="text-brutal-accent">.</code> (e.g. <code className="text-brutal-accent">.play</code>). Discord slash commands (<code className="text-brutal-accent">/play</code>) always function simultaneously.
              </p>
            </form>
          </BrutCard>

          {/* SECTION 2: 24/7 MODE (WITH TOP.GG VOTE GATE AND CHANNELS DROPDOWN) */}
          <BrutCard title="24/7 VOICE PERSISTENCE" subtitle="Locked zero-downtime voice connection with auto-reconnect">
            {msg247 && (
              <div className="p-3 mb-4 border-2 border-black bg-brutal-accent text-black font-mono font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{msg247}</span>
              </div>
            )}

            {/* Voter Gate Notice */}
            {!voterStatus?.allowed ? (
              <div className="p-4 mb-4 border-2 border-amber-500 bg-amber-500/10 text-amber-300 font-mono text-xs space-y-3">
                <div className="flex items-center gap-2 font-black text-amber-400 uppercase tracking-wider text-sm">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>TOP.GG VOTE REQUIRED TO UPDATE 24/7 MODE</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  24/7 voice persistence is an exclusive voter privilege. You must upvote TOGETHER on Top.gg to unlock 12 hours of uninterrupted 24/7 mode for your server.
                </p>
                <div>
                  <a
                    href={topggVoteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 text-black font-mono text-xs font-black uppercase border-2 border-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    ⭐ VOTE ON TOP.GG TO UNLOCK 24/7
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-3 mb-4 border-2 border-brutal-accent bg-brutal-accent/10 text-brutal-accent font-mono font-bold text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {voterStatus.isOwner ? '👑 BOT OWNER UNLOCKED — UNLIMITED 24/7 ACCESS' : '⭐ TOP.GG VOTE VERIFIED — 24/7 MODE UNLOCKED'}
                  </span>
                </div>
                <a
                  href={topggVoteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-[10px] uppercase font-bold text-zinc-300 hover:text-white"
                >
                  Renew Vote
                </a>
              </div>
            )}

            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between p-3 border border-brutal-border bg-brutal-bg">
                <div>
                  <span className="font-bold text-brutal-text block">CURRENT 24/7 STATUS:</span>
                  <span className="text-[11px] text-brutal-muted">Auto-reconnects bot when server voice channel empties</span>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-bold uppercase border ${
                    is247
                      ? 'border-brutal-accent bg-brutal-accent/10 text-brutal-accent'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {is247 ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>

              {/* Channels Dropdown Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Voice Channels Selector */}
                <div>
                  <label className="block text-brutal-muted uppercase text-[10px] mb-1 font-bold">
                    VOICE CHANNEL TO LOCK
                  </label>
                  <div className="relative">
                    <select
                      value={voiceId}
                      onChange={(e) => setVoiceId(e.target.value)}
                      disabled={!voterStatus?.allowed || saving247}
                      className="w-full bg-brutal-bg border-2 border-brutal-border p-2.5 font-mono text-xs text-brutal-text focus:outline-none focus:border-brutal-accent appearance-none disabled:opacity-50 font-bold"
                    >
                      <option value="">-- SELECT VOICE CHANNEL --</option>
                      {channels.voiceChannels.map((vc) => (
                        <option key={vc.id} value={vc.id}>
                          🔊 {vc.name} ({vc.id.slice(-4)})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-muted pointer-events-none" />
                  </div>
                  {channels.voiceChannels.length === 0 && (
                    <input
                      type="text"
                      value={voiceId}
                      onChange={(e) => setVoiceId(e.target.value)}
                      placeholder="Paste Voice Channel ID"
                      disabled={!voterStatus?.allowed || saving247}
                      className="w-full mt-2 bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-xs text-brutal-text disabled:opacity-50"
                    />
                  )}
                  <span className="text-[10px] text-brutal-muted mt-1 block">
                    Target voice room where TOGETHER stays connected 24/7
                  </span>
                </div>

                {/* Text Channels Selector */}
                <div>
                  <label className="block text-brutal-muted uppercase text-[10px] mb-1 font-bold">
                    TEXT NOTIFICATION CHANNEL
                  </label>
                  <div className="relative">
                    <select
                      value={textId}
                      onChange={(e) => setTextId(e.target.value)}
                      disabled={!voterStatus?.allowed || saving247}
                      className="w-full bg-brutal-bg border-2 border-brutal-border p-2.5 font-mono text-xs text-brutal-text focus:outline-none focus:border-brutal-accent appearance-none disabled:opacity-50 font-bold"
                    >
                      <option value="">-- SELECT TEXT CHANNEL --</option>
                      {channels.textChannels.map((tc) => (
                        <option key={tc.id} value={tc.id}>
                          # {tc.name} ({tc.id.slice(-4)})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-muted pointer-events-none" />
                  </div>
                  {channels.textChannels.length === 0 && (
                    <input
                      type="text"
                      value={textId}
                      onChange={(e) => setTextId(e.target.value)}
                      placeholder="Paste Text Channel ID"
                      disabled={!voterStatus?.allowed || saving247}
                      className="w-full mt-2 bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-xs text-brutal-text disabled:opacity-50"
                    />
                  )}
                  <span className="text-[10px] text-brutal-muted mt-1 block">
                    Channel where 24/7 status alerts and track changes are sent
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!voterStatus?.allowed || saving247 || !voiceId || !textId}
                  onClick={() => handleToggle247(true)}
                  className="px-5 py-2.5 bg-brutal-accent text-black font-mono text-xs font-bold uppercase border-2 border-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving247 ? 'UPDATING...' : 'ENABLE / UPDATE 24/7'}
                </button>
                {is247 && (
                  <button
                    type="button"
                    disabled={!voterStatus?.allowed || saving247}
                    onClick={() => handleToggle247(false)}
                    className="px-5 py-2.5 bg-red-950/40 text-red-400 font-mono text-xs font-bold uppercase border-2 border-red-600 hover:bg-red-600 hover:text-black transition-all disabled:opacity-40"
                  >
                    DISABLE 24/7
                  </button>
                )}
              </div>
            </div>
          </BrutCard>

          {/* SECTION 3: DJ ROLE ENFORCEMENT */}
          <BrutCard title="DJ ROLE CONTROLLER" subtitle="Restrict queue, skip, volume, and filter controls to authorized DJs">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-brutal-border pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-white uppercase block">
                    STATUS: {djEnabled && djRoleId ? 'ACTIVE / RESTRICTED' : 'FREE FOR ALL'}
                  </span>
                  <span className="font-mono text-[11px] text-brutal-muted">
                    {djEnabled && djRoleId
                      ? 'Only DJs, server administrators, and solo listeners can skip/stop playback.'
                      : 'Anyone in the voice channel can use playback commands.'}
                  </span>
                </div>
                <span
                  className={`font-mono text-xs font-black px-2 py-0.5 border ${
                    djEnabled && djRoleId
                      ? 'border-brutal-accent bg-brutal-accent/20 text-brutal-accent'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {djEnabled && djRoleId ? 'ENFORCED' : 'OFF'}
                </span>
              </div>

              {djMsg && (
                <div className="p-3 border-2 border-brutal-accent bg-black text-xs font-mono text-brutal-accent flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{djMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-mono text-xs text-brutal-text font-bold mb-1 uppercase">
                  SELECT DJ ROLE
                </label>
                <div className="relative">
                  <select
                    value={djRoleId}
                    onChange={(e) => setDjRoleId(e.target.value)}
                    disabled={savingDj}
                    className="w-full bg-brutal-bg border-2 border-brutal-border p-2.5 font-mono text-xs text-brutal-text appearance-none cursor-pointer focus:outline-none focus:border-brutal-accent"
                  >
                    <option value="">-- No DJ Role (Free-for-all) --</option>
                    {(channels.roles || []).map((r) => (
                      <option key={r.id} value={r.id}>
                        @{r.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-muted pointer-events-none" />
                </div>
                <span className="text-[10px] text-brutal-muted mt-1 block font-mono">
                  Members with this role (plus Admins and the Server Owner) will be the only users permitted to use /skip, /stop, /clear, and /filters.
                </span>
              </div>

              <div className="pt-2 flex flex-wrap gap-3 font-mono">
                <button
                  type="button"
                  disabled={savingDj || !djRoleId}
                  onClick={() => handleSaveDjRole(true)}
                  className="px-5 py-2.5 bg-brutal-accent text-black text-xs font-bold uppercase border-2 border-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {savingDj ? 'SAVING...' : 'SAVE & ENFORCE DJ ROLE'}
                </button>
                {djEnabled && (
                  <button
                    type="button"
                    disabled={savingDj}
                    onClick={() => handleSaveDjRole(false)}
                    className="px-5 py-2.5 bg-red-950/40 text-red-400 text-xs font-bold uppercase border-2 border-red-600 hover:bg-red-600 hover:text-black transition-all disabled:opacity-40"
                  >
                    DISABLE DJ RESTRICTIONS
                  </button>
                )}
              </div>
            </div>
          </BrutCard>

          {/* SECTION 4: SETUP STATUS */}
          <BrutCard title="DEDICATED SONG REQUEST CHANNEL" subtitle="Automatic queue controller embed">
            <div className="font-mono text-xs space-y-2">
              <div className="flex items-center justify-between p-3 border border-brutal-border bg-brutal-bg">
                <div>
                  <span className="font-bold text-brutal-text block">REQUEST CHANNEL SETUP:</span>
                  <span className="text-[11px] text-brutal-muted">Dedicated controller channel configured via /setup</span>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs font-bold uppercase border ${
                    config?.setup
                      ? 'border-cyan-600 bg-cyan-950/30 text-cyan-400'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {config?.setup ? 'CONFIGURED' : 'NOT CONFIGURED'}
                </span>
              </div>
              {config?.setup && (
                <div className="p-3 border border-brutal-border bg-brutal-bg space-y-1 text-[11px]">
                  <p><strong className="text-brutal-muted">Channel ID:</strong> {config.setup.channelId}</p>
                  <p><strong className="text-brutal-muted">Controller Message ID:</strong> {config.setup.messageId}</p>
                </div>
              )}
            </div>
          </BrutCard>
        </div>
      )}
    </div>
  );
}

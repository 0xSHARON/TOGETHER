import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Server, Plus, ArrowRight, Music, Radio, Sliders, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BrutCard, BrutButton } from '../components/Brutalist';
import SEO from '../components/SEO';

const BOT_INVITE_URL = "https://discord.com/oauth2/authorize?client_id=863496211667484676&permissions=277298439232&scope=bot%20applications.commands";

export default function ServersPage() {
  const [guilds, setGuilds] = useState([]);
  const [mutualGuilds, setMutualGuilds] = useState([]);
  const [inviteGuilds, setInviteGuilds] = useState([]);
  const [tab, setTab] = useState('MUTUAL'); // 'MUTUAL' or 'INVITE'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGuilds();
  }, []);

  async function fetchGuilds() {
    try {
      const resp = await axios.get('/api/guilds', { withCredentials: true });
      const all = resp.data?.guilds || [];
      const mutual = resp.data?.mutualGuilds || all.filter((g) => g.hasBot);
      const invite = resp.data?.inviteGuilds || all.filter((g) => !g.hasBot);

      setGuilds(all);
      setMutualGuilds(mutual);
      setInviteGuilds(invite);

      // If user has no mutual servers but has invite servers, switch to invite
      if (mutual.length === 0 && invite.length > 0) {
        setTab('INVITE');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectServer(guildId, targetRoute) {
    try {
      localStorage.setItem('together_selected_guild', guildId);
    } catch {}
    navigate(`${targetRoute}?guild=${guildId}`);
  }

  const displayedList = tab === 'MUTUAL' ? mutualGuilds : inviteGuilds;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <SEO 
        title="Servers & Communities — TOGETHER Discord Music Bot"
        description="Select and manage your Discord servers with TOGETHER music bot. Configure audio playback, invite bot to new servers, and customize settings."
        canonical="https://dash.together.dpdns.org/servers"
      />
      {/* Header Banner */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase bg-brutal-accent text-black font-black px-2 py-0.5 tracking-widest">
              DISCORD AUTHORIZED SERVERS
            </span>
            <span className="font-mono text-xs text-brutal-muted">
              {mutualGuilds.length} CONNECTED
            </span>
          </div>
          <h2 className="font-display font-black text-3xl md:text-4xl text-brutal-text uppercase tracking-tight">
            SERVER CONTROL CENTER
          </h2>
          <p className="font-mono text-xs text-brutal-muted mt-1 max-w-2xl">
            Select a server where TOGETHER bot is installed to manage live music streaming, 24/7 channels, and custom server settings.
          </p>
        </div>
        <a href={BOT_INVITE_URL} target="_blank" rel="noreferrer">
          <BrutButton variant="primary" size="sm" icon={Plus}>
            INVITE TOGETHER BOT
          </BrutButton>
        </a>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b-2 border-brutal-border pb-3">
        <button
          onClick={() => setTab('MUTUAL')}
          className={`px-4 py-2 font-mono text-xs font-bold uppercase border-2 transition-all flex items-center gap-2 ${
            tab === 'MUTUAL'
              ? 'bg-brutal-accent text-black border-black shadow-brutal-sm'
              : 'bg-brutal-surface text-brutal-text border-brutal-border hover:bg-brutal-secondary'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>BOT INSTALLED</span>
          <span className={`text-[10px] px-1.5 py-0.2 font-mono ${tab === 'MUTUAL' ? 'bg-black text-brutal-accent' : 'bg-brutal-bg text-brutal-muted'}`}>
            {mutualGuilds.length}
          </span>
        </button>

        <button
          onClick={() => setTab('INVITE')}
          className={`px-4 py-2 font-mono text-xs font-bold uppercase border-2 transition-all flex items-center gap-2 ${
            tab === 'INVITE'
              ? 'bg-amber-400 text-black border-black shadow-brutal-sm'
              : 'bg-brutal-surface text-brutal-text border-brutal-border hover:bg-brutal-secondary'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>INVITE REQUIRED</span>
          <span className={`text-[10px] px-1.5 py-0.2 font-mono ${tab === 'INVITE' ? 'bg-black text-amber-400' : 'bg-brutal-bg text-brutal-muted'}`}>
            {inviteGuilds.length}
          </span>
        </button>
      </div>

      {/* Server Grid */}
      {loading ? (
        <div className="text-center py-20 font-mono text-sm text-brutal-accent animate-pulse">
          [ SYNCHRONIZING ACCESSIBLE DISCORD GUILDS... ]
        </div>
      ) : displayedList.length === 0 ? (
        <div className="border-2 border-dashed border-brutal-border bg-brutal-surface p-12 text-center shadow-brutal space-y-4">
          <Server className="w-12 h-12 text-brutal-muted mx-auto" />
          <h3 className="font-display font-bold text-xl text-brutal-text uppercase">
            {tab === 'MUTUAL' ? 'NO BOT SERVERS DETECTED' : 'NO SERVERS PENDING INVITATION'}
          </h3>
          <p className="font-mono text-xs text-brutal-muted max-w-md mx-auto">
            {tab === 'MUTUAL'
              ? 'TOGETHER bot is not currently installed in any servers you manage. Invite the bot to start controlling audio.'
              : 'You have installed TOGETHER in all the servers you manage!'}
          </p>
          {tab === 'MUTUAL' && (
            <a href={BOT_INVITE_URL} target="_blank" rel="noreferrer" className="inline-block">
              <BrutButton variant="primary" size="md" icon={Plus}>
                INVITE TO YOUR SERVER
              </BrutButton>
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedList.map((g) => (
            <div
              key={g.id}
              className={`border-2 bg-brutal-surface p-5 shadow-brutal-sm flex flex-col justify-between transition-all ${
                g.hasBot ? 'border-brutal-border hover:border-brutal-accent' : 'border-zinc-800 opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  {g.icon ? (
                    <img
                      src={g.icon}
                      alt={g.name}
                      className="w-14 h-14 border-2 border-black object-cover shadow-brutal-sm shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 border-2 border-black bg-brutal-secondary flex items-center justify-center font-mono font-bold text-lg text-brutal-accent shadow-brutal-sm shrink-0">
                      {g.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h4 className="font-display font-bold text-base text-brutal-text truncate uppercase">
                      {g.name}
                    </h4>
                    <p className="font-mono text-[10px] text-brutal-muted">ID: {g.id}</p>
                    {g.hasBot ? (
                      g.isPlaying ? (
                        <span className="inline-block mt-1 font-mono text-[9px] px-1.5 py-0.5 bg-brutal-accent text-black font-black uppercase">
                          ● STREAMING AUDIO
                        </span>
                      ) : (
                        <span className="inline-block mt-1 font-mono text-[9px] px-1.5 py-0.5 border border-brutal-border bg-brutal-bg text-brutal-accent font-bold uppercase">
                          CONNECTED
                        </span>
                      )
                    ) : (
                      <span className="inline-block mt-1 font-mono text-[9px] px-1.5 py-0.5 border border-amber-800 bg-amber-950/40 text-amber-400 font-bold uppercase">
                        NOT INSTALLED
                      </span>
                    )}
                  </div>
                </div>

                {/* Now Playing Preview */}
                {g.currentTrack && (
                  <div className="bg-brutal-secondary border border-brutal-border p-2.5 mb-4 font-mono text-xs">
                    <p className="text-[10px] text-brutal-accent uppercase font-bold">Now Playing:</p>
                    <p className="truncate text-brutal-text font-bold">{g.currentTrack.title}</p>
                    <p className="text-[10px] text-brutal-muted truncate">{g.currentTrack.author}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-brutal-border">
                {g.hasBot ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSelectServer(g.id, '/player')}
                      className="px-3 py-2 bg-brutal-accent text-black font-mono font-bold text-xs uppercase border-2 border-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Music className="w-3.5 h-3.5" />
                      <span>PLAYER</span>
                    </button>
                    <button
                      onClick={() => handleSelectServer(g.id, '/settings')}
                      className="px-3 py-2 bg-brutal-surface text-brutal-text font-mono font-bold text-xs uppercase border-2 border-brutal-border hover:border-brutal-accent hover:text-brutal-accent transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>SETTINGS</span>
                    </button>
                  </div>
                ) : (
                  <a
                    href={`${BOT_INVITE_URL}&guild_id=${g.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full"
                  >
                    <button className="w-full px-3 py-2 bg-amber-400 text-black font-mono font-bold text-xs uppercase border-2 border-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      <span>INVITE TOGETHER BOT</span>
                    </button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

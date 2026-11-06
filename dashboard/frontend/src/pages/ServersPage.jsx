import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Plus, ArrowRight, Music, Radio } from 'lucide-react';
import { BrutCard, BrutButton } from '../components/Brutalist';

export default function ServersPage() {
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuilds();
  }, []);

  async function fetchGuilds() {
    try {
      const resp = await axios.get('/api/guilds', { withCredentials: true });
      setGuilds(resp.data?.guilds || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="font-display font-black text-3xl text-brutal-text uppercase">
            SERVER SELECTOR
          </h2>
          <p className="font-mono text-xs text-brutal-muted mt-1">
            Choose a Discord server where you have Administrator or Manage Server permissions.
          </p>
        </div>
        <a 
          href="https://discord.com/oauth2/authorize?client_id=863496211667484676&permissions=277298439232&scope=bot%20applications.commands" 
          target="_blank" 
          rel="noreferrer"
        >
          <BrutButton variant="primary" size="sm" icon={Plus}>
            INVITE TOGETHER BOT
          </BrutButton>
        </a>
      </div>

      {loading ? (
        <div className="text-center py-16 font-mono text-sm text-brutal-accent">
          [ SCANNING DISCORD GUILD PERMISSIONS... ]
        </div>
      ) : guilds.length === 0 ? (
        <div className="border-2 border-dashed border-brutal-border bg-brutal-surface p-12 text-center">
          <Server className="w-12 h-12 text-brutal-muted mx-auto mb-3" />
          <h3 className="font-display font-bold text-xl text-brutal-text uppercase">NO MANAGEABLE SERVERS FOUND</h3>
          <p className="font-mono text-xs text-brutal-muted mt-2 max-w-md mx-auto">
            You must be an Administrator or have Manage Server permissions in at least one Discord server to manage bot settings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guilds.map((g) => (
            <BrutCard key={g.id} className="flex flex-col justify-between hover:border-brutal-accent transition-colors">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  {g.icon ? (
                    <img src={g.icon} alt={g.name} className="w-14 h-14 border-2 border-black object-cover shadow-brutal-sm" />
                  ) : (
                    <div className="w-14 h-14 border-2 border-black bg-brutal-secondary flex items-center justify-center font-mono font-bold text-lg text-brutal-accent shadow-brutal-sm">
                      {g.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h4 className="font-display font-bold text-base text-brutal-text truncate uppercase">{g.name}</h4>
                    <p className="font-mono text-[10px] text-brutal-muted">ID: {g.id}</p>
                    {g.isPlaying && (
                      <span className="inline-block mt-1 font-mono text-[9px] px-1.5 py-0.5 bg-brutal-accent text-black font-black uppercase">
                        ● STREAMING AUDIO
                      </span>
                    )}
                  </div>
                </div>

                {g.currentTrack && (
                  <div className="bg-brutal-secondary border border-brutal-border p-2.5 mb-4 font-mono text-xs">
                    <p className="text-[10px] text-brutal-accent uppercase font-bold">Now Playing:</p>
                    <p className="truncate text-brutal-text font-bold">{g.currentTrack.title}</p>
                    <p className="text-[10px] text-brutal-muted truncate">{g.currentTrack.author}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-brutal-border flex gap-2">
                <a href={`/player?guild=${g.id}`} className="flex-1">
                  <BrutButton variant="primary" size="sm" className="w-full" icon={Music}>
                    PLAYER
                  </BrutButton>
                </a>
                <a href={`/autoplay-247?guild=${g.id}`}>
                  <BrutButton variant="secondary" size="sm" icon={Radio}>
                    24/7
                  </BrutButton>
                </a>
              </div>
            </BrutCard>
          ))}
        </div>
      )}
    </div>
  );
}


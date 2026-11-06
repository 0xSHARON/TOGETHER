import React, { useState, useEffect } from 'react';
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
  PlayCircle
} from 'lucide-react';
import { BrutCard, StatBox, BrutButton } from '../components/Brutalist';

export default function OwnerPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flushing, setFlushing] = useState(false);
  const [flushSuccess, setFlushSuccess] = useState(false);

  useEffect(() => {
    fetchOwnerData();
  }, []);

  async function fetchOwnerData() {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get('/api/owner/overview', { withCredentials: true });
      setData(resp.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to load owner telemetry');
    } finally {
      setLoading(false);
    }
  }

  async function handleFlushLogs() {
    setFlushing(true);
    setFlushSuccess(false);
    try {
      await axios.post('/api/owner/flush-logs', {}, { withCredentials: true });
      setFlushSuccess(true);
      setTimeout(() => setFlushSuccess(false), 3000);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
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
            Node health, MongoDB cluster counts, live voice sessions, and Discord log stream sync.
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
                <span>SYNC LOGS TO THREAD</span>
              </>
            )}
          </BrutButton>

          <BrutButton onClick={fetchOwnerData} variant="secondary" className="p-2">
            <RefreshCw className="w-4 h-4" />
          </BrutButton>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox 
          label="HOST UPTIME" 
          value={`${Math.floor((sys.uptime || 0) / 3600)}h ${Math.floor(((sys.uptime || 0) % 3600) / 60)}m`} 
          sub={`Node ${sys.nodeVersion || 'v22'}`} 
          icon={Cpu} 
        />
        <StatBox 
          label="24/7 GUILD LOCKS" 
          value={db.total247Guilds || 0} 
          sub="MongoDB Autoreconnect" 
          icon={Radio} 
        />
        <StatBox 
          label="REGISTERED LISTENERS" 
          value={db.registeredListeners || 0} 
          sub="User Preferences Docs" 
          icon={Database} 
        />
        <StatBox 
          label="ACTIVE PLAYERS" 
          value={sessions.length} 
          sub="Connected Voice Channels" 
          icon={Activity} 
        />
      </div>

      {/* Memory Heap Breakdown */}
      <BrutCard title="PROCESS MEMORY HEAP TELEMETRY" subtitle="Direct V8 isolate allocations">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 bg-brutal-secondary border border-brutal-border">
            <span className="text-brutal-muted uppercase text-[10px]">HEAP USED</span>
            <p className="font-bold text-lg text-brutal-text mt-1">
              {Math.round((sys.memoryUsage?.heapUsed || 0) / 1024 / 1024)} MB
            </p>
          </div>
          <div className="p-3 bg-brutal-secondary border border-brutal-border">
            <span className="text-brutal-muted uppercase text-[10px]">HEAP TOTAL</span>
            <p className="font-bold text-lg text-brutal-text mt-1">
              {Math.round((sys.memoryUsage?.heapTotal || 0) / 1024 / 1024)} MB
            </p>
          </div>
          <div className="p-3 bg-brutal-secondary border border-brutal-border">
            <span className="text-brutal-muted uppercase text-[10px]">RSS RESIDENT</span>
            <p className="font-bold text-lg text-brutal-text mt-1">
              {Math.round((sys.memoryUsage?.rss || 0) / 1024 / 1024)} MB
            </p>
          </div>
        </div>
      </BrutCard>

      {/* Live Voice Sessions Table */}
      <BrutCard title="LIVE VOICE SESSIONS" subtitle="Real-time player instances across servers">
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
                    <td className="py-2.5 px-3 text-brutal-accent truncate max-w-xs">
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

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Radio, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { BrutCard, BrutButton } from '../components/Brutalist';

export default function Autoplay247Page() {
  const [searchParams] = useSearchParams();
  const guildId = searchParams.get('guild');

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voiceId, setVoiceId] = useState('');
  const [textId, setTextId] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!guildId) return;
    fetchConfig();
  }, [guildId]);

  async function fetchConfig() {
    try {
      const resp = await axios.get(`/api/config/${guildId}`, { withCredentials: true });
      setConfig(resp.data);
      if (resp.data?.twoFourSeven) {
        setVoiceId(resp.data.twoFourSeven.voiceId || '');
        setTextId(resp.data.twoFourSeven.textId || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle247(enable) {
    setSaving(true);
    setMsg('');
    try {
      await axios.post(`/api/config/${guildId}/247`, {
        enabled: enable,
        textId: enable ? textId : null,
        voiceId: enable ? voiceId : null
      }, { withCredentials: true });
      setMsg(enable ? '24/7 Mode successfully enabled!' : '24/7 Mode disabled.');
      await fetchConfig();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!guildId) {
    return (
      <div className="max-w-2xl mx-auto border-2 border-brutal-border bg-brutal-surface p-8 text-center shadow-brutal mt-12">
        <Radio className="w-12 h-12 text-brutal-accent mx-auto mb-4" />
        <h2 className="font-display font-black text-2xl text-brutal-text uppercase">SELECT A SERVER</h2>
        <p className="font-mono text-xs text-brutal-muted mt-2 mb-6">
          Choose a server to configure persistent 24/7 voice connectivity and autoplay.
        </p>
        <a href="/servers">
          <BrutButton variant="primary">GO TO SERVERS</BrutButton>
        </a>
      </div>
    );
  }

  const is247 = config?.twoFourSeven?.enabled;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal">
        <span className="font-mono text-xs uppercase text-brutal-accent font-black tracking-widest">
          SERVER SETTINGS // GUILD: {guildId}
        </span>
        <h2 className="font-display font-black text-3xl text-brutal-text uppercase mt-1">
          24/7 MODE & RECONNECTION
        </h2>
        <p className="font-mono text-xs text-brutal-muted mt-1">
          Keep TOGETHER bot permanently connected to your voice channel even after the queue is empty.
        </p>
      </div>

      {msg && (
        <div className="p-4 border-2 border-black bg-brutal-accent text-black font-mono font-bold text-xs shadow-brutal flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <BrutCard title="PERSISTENT VOICE CONFIGURATION" subtitle="Zero-downtime voice channel bonding">
        <div className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-brutal-muted uppercase text-[10px] mb-1 font-bold">
              VOICE CHANNEL ID
            </label>
            <input 
              type="text" 
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              placeholder="e.g. 1523598777573970014"
              className="w-full bg-brutal-secondary border-2 border-brutal-border px-3 py-2 text-brutal-text focus:outline-none focus:border-brutal-accent"
            />
          </div>

          <div>
            <label className="block text-brutal-muted uppercase text-[10px] mb-1 font-bold">
              LOG / TEXT CHANNEL ID
            </label>
            <input 
              type="text" 
              value={textId}
              onChange={(e) => setTextId(e.target.value)}
              placeholder="e.g. 1523598777573970012"
              className="w-full bg-brutal-secondary border-2 border-brutal-border px-3 py-2 text-brutal-text focus:outline-none focus:border-brutal-accent"
            />
          </div>

          <div className="pt-4 flex gap-3">
            {is247 ? (
              <BrutButton 
                variant="danger" 
                onClick={() => handleToggle247(false)}
                disabled={saving}
              >
                DISABLE 24/7 MODE
              </BrutButton>
            ) : (
              <BrutButton 
                variant="primary" 
                onClick={() => handleToggle247(true)}
                disabled={saving || !voiceId || !textId}
              >
                ENABLE 24/7 MODE
              </BrutButton>
            )}
          </div>
        </div>
      </BrutCard>
    </div>
  );
}


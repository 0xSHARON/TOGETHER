import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Server, Cpu, Database, Activity, Terminal } from 'lucide-react';
import { BrutCard, StatBox, BrutButton } from '../components/Brutalist';

export default function OwnerPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwnerData();
  }, []);

  async function fetchOwnerData() {
    try {
      const resp = await axios.get('/api/owner/overview', { withCredentials: true });
      setData(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const sys = data?.system || {};
  const bot = data?.bot || {};
  const db = data?.database || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-2 border-brutal-danger bg-brutal-surface p-6 shadow-brutal-danger">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 bg-brutal-danger inline-block"></span>
          <span className="font-mono text-xs uppercase text-brutal-danger font-black tracking-widest">
            RESTRICTED ACCESS // LEVEL 5 CLEARED
          </span>
        </div>
        <h2 className="font-display font-black text-3xl text-brutal-text uppercase">
          SYSTEM OWNER CONTROL PANEL
        </h2>
        <p className="font-mono text-xs text-brutal-muted mt-1">
          Internal node health, database registries, and cluster sharding controls.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox 
          label="HOST UPTIME" 
          value={`${Math.floor((sys.uptime || 0) / 3600)}h`} 
          sub="System Process" 
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
          label="BLACKLISTED ENTITIES" 
          value={db.blacklistedEntities || 0} 
          sub="Enforced Security" 
          icon={ShieldAlert} 
        />
      </div>

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
    </div>
  );
}


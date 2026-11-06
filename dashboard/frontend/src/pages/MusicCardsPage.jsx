import React, { useState } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { BrutCard, BrutButton } from '../components/Brutalist';

export default function MusicCardsPage() {
  const [selectedTheme, setSelectedTheme] = useState('CYBER_CRIMSON');

  const themes = [
    { id: 'CYBER_CRIMSON', name: 'Cyber Crimson (Default)', primary: '#FF1E38', bg: '#0A0B0E', desc: 'Aggressive neo-brutalist contrast with hazard cross-hatch' },
    { id: 'NEO_EMERALD', name: 'Neo Emerald (Dashboard)', primary: '#00E676', bg: '#080C0A', desc: 'Phosphor green terminal lines and wireframe telemetry' },
    { id: 'ACID_YELLOW', name: 'Acid Voltage', primary: '#B6FF00', bg: '#0B0D05', desc: 'High-visibility industrial hazard aesthetic' },
    { id: 'MONOCHROME', name: 'Monochrome Steel', primary: '#F5F5F5', bg: '#101010', desc: 'Minimalist editorial Swiss typography' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal">
        <span className="font-mono text-xs uppercase text-brutal-accent font-black tracking-widest">
          STUDIO CUSTOMIZATION
        </span>
        <h2 className="font-display font-black text-3xl text-brutal-text uppercase mt-1">
          NOW-PLAYING MUSIC CARD STUDIO
        </h2>
        <p className="font-mono text-xs text-brutal-muted mt-1">
          Customize the high-resolution Canvas banner generated whenever music starts playing in Discord.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Theme Selection */}
        <div className="space-y-4">
          <BrutCard title="PRESET COLOR THEMES" subtitle="Select card color profile">
            <div className="space-y-3">
              {themes.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`p-3.5 border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedTheme === t.id 
                      ? "border-brutal-accent bg-brutal-secondary shadow-brutal-sm" 
                      : "border-brutal-border bg-brutal-surface hover:bg-brutal-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-4 h-4 border border-black shadow-brutal-sm inline-block shrink-0" 
                      style={{ backgroundColor: t.primary }}
                    />
                    <div>
                      <p className="font-mono font-bold text-xs text-brutal-text">{t.name}</p>
                      <p className="font-mono text-[10px] text-brutal-muted">{t.desc}</p>
                    </div>
                  </div>
                  {selectedTheme === t.id && <Check className="w-4 h-4 text-brutal-accent shrink-0" />}
                </div>
              ))}
            </div>
            <div className="mt-5">
              <BrutButton variant="primary" size="sm" className="w-full">
                APPLY THEME TO SERVER
              </BrutButton>
            </div>
          </BrutCard>
        </div>

        {/* Right: Real-Time Preview Canvas */}
        <div className="lg:col-span-2 space-y-6">
          <BrutCard title="INTERACTIVE LIVE CARD PREVIEW" subtitle="Actual output sent to Discord channel on track start">
            <div className="border-2 border-black bg-[#06070A] p-6 shadow-brutal overflow-hidden relative">
              {/* Top Barcode Strip */}
              <div className="flex justify-between items-center pb-4 border-b border-[#222]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-brutal-accent inline-block"></span>
                  <span className="font-mono text-[10px] text-white uppercase font-bold tracking-widest">
                    TOGETHER AUDIO PROTOCOL // 24-BIT LOSSLESS
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#666]">STEREO 48KHZ // OPUS</span>
              </div>

              {/* Body */}
              <div className="flex flex-col sm:flex-row gap-6 items-center my-6">
                <img 
                  src="https://together.dpdns.org/banner.webp" 
                  alt="Track" 
                  className="w-32 h-32 border-2 border-black object-cover shadow-brutal shrink-0" 
                />
                <div className="overflow-hidden flex-1 w-full text-center sm:text-left">
                  <span className="font-mono text-[9px] px-2 py-0.5 bg-[#FF1E38] text-white font-black uppercase">
                    NOW PLAYING
                  </span>
                  <h3 className="font-display font-black text-2xl text-white truncate mt-2">
                    STARBOY (FEAT. DAFT PUNK)
                  </h3>
                  <p className="font-mono text-sm text-[#888] truncate mt-0.5">
                    The Weeknd • Starboy (Deluxe Edition)
                  </p>
                  <div className="mt-4 flex items-center justify-between font-mono text-xs text-[#00E676]">
                    <span>1:24</span>
                    <span>3:50</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#151515] border border-[#222] mt-1">
                    <div className="w-1/3 h-full bg-[#00E676]"></div>
                  </div>
                </div>
              </div>

              {/* Bottom Strip */}
              <div className="pt-3 border-t border-[#222] flex justify-between items-center font-mono text-[10px] text-[#666]">
                <span>REQ BY: kajukatli.</span>
                <span>DSP FILTERS: BASSBOOST + 320KBPS</span>
              </div>
            </div>
          </BrutCard>
        </div>
      </div>
    </div>
  );
}


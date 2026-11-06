import React, { useState, useEffect } from 'react';
import {
  Shield,
  LifeBuoy,
  Server,
  Activity,
  Users,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Lock,
  CheckCircle,
  Clock,
  Terminal,
  Settings
} from 'lucide-react';

export default function App() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [configs, setConfigs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterTicket, setFilterTicket] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, ticketsRes, warnsRes, configRes] = await Promise.all([
        fetch('/api/stats').then(r => r.json()).catch(() => null),
        fetch('/api/tickets').then(r => r.json()).catch(() => ({ tickets: [] })),
        fetch('/api/warnings').then(r => r.json()).catch(() => ({ warnings: [] })),
        fetch('/api/config').then(r => r.json()).catch(() => null)
      ]);

      if (statsRes) setStats(statsRes);
      if (ticketsRes?.tickets) setTickets(ticketsRes.tickets);
      if (warnsRes?.warnings) setWarnings(warnsRes.warnings);
      if (configRes) setConfigs(configRes);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (ms = 0) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m ${s % 60}s`;
  };

  const filteredTickets = tickets.filter(t => 
    !filterTicket || 
    t.userId?.includes(filterTicket) || 
    t.category?.toLowerCase().includes(filterTicket.toLowerCase()) ||
    t.channelId?.includes(filterTicket)
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Brand Navigation Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #FF1E38 0%, #B3001F 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            color: '#FFF',
            boxShadow: '0 4px 12px rgba(255, 30, 56, 0.35)'
          }}>
            T
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>TOGETHER HELPER</h1>
              <span style={{
                background: 'rgba(0, 230, 118, 0.12)',
                color: 'var(--accent-green)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Mission Control
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              help.together.dpdns.org · Support & Moderation Microservice
            </div>
          </div>
        </div>

        {/* Live Diagnostics Pill & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: stats ? 'var(--accent-green)' : 'var(--accent-amber)',
              boxShadow: stats ? '0 0 8px var(--accent-green)' : 'none'
            }} />
            <span>{stats?.bot?.ping ? `${stats.bot.ping} ms` : 'Live'}</span>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <span style={{ color: 'var(--text-muted)' }}>{stats ? formatUptime(stats.bot.uptime) : 'Connecting...'}</span>
          </div>

          <button
            onClick={fetchData}
            title="Refresh Data"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <a
            href="https://together.dpdns.org"
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.2) 0%, rgba(88, 101, 242, 0.1) 100%)',
              border: '1px solid rgba(88, 101, 242, 0.4)',
              color: '#8A99FF',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}
          >
            Music Bot <ExternalLink size={12} />
          </a>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        display: 'flex',
        gap: '4px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'tickets', label: `Tickets (${stats?.counts?.ticketsOpen || 0})`, icon: LifeBuoy },
          { id: 'moderation', label: `Moderation (${stats?.counts?.warnsTotal || 0})`, icon: Shield },
          { id: 'config', label: 'Server Config', icon: Settings },
          { id: 'raw', label: 'API Diagnostics', icon: Terminal }
        ].map(item => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: active ? '#FFF' : 'var(--text-muted)',
                borderBottom: active ? '2px solid var(--accent-red)' : '2px solid transparent',
                transition: 'all 0.15s'
              }}
            >
              <Icon size={16} color={active ? 'var(--accent-red)' : 'var(--text-muted)'} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '28px 24px', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
        {/* TAB 1: OVERVIEW */}
        {tab === 'overview' && (
          <div>
            {/* 4 Metric Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '28px'
            }}>
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <span style={cardTitleStyle}>CONNECTED SERVERS</span>
                  <Server size={18} color="var(--accent-blue)" />
                </div>
                <div style={cardValueStyle}>{stats?.bot?.guildsCount || 0}</div>
                <div style={cardSubtextStyle}>Active Discord guilds operating</div>
              </div>

              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <span style={cardTitleStyle}>MEMBERS PROTECTED</span>
                  <Users size={18} color="var(--accent-green)" />
                </div>
                <div style={cardValueStyle}>{stats?.bot?.membersCount?.toLocaleString() || 0}</div>
                <div style={cardSubtextStyle}>Total community users served</div>
              </div>

              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <span style={cardTitleStyle}>OPEN SUPPORT TICKETS</span>
                  <LifeBuoy size={18} color="var(--accent-red)" />
                </div>
                <div style={cardValueStyle}>
                  {stats?.counts?.ticketsOpen || 0}
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: 500 }}>
                    / {stats?.counts?.ticketsTotal || 0} total
                  </span>
                </div>
                <div style={cardSubtextStyle}>Active rooms awaiting resolution</div>
              </div>

              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <span style={cardTitleStyle}>RECORDED INFRACTIONS</span>
                  <Shield size={18} color="var(--accent-amber)" />
                </div>
                <div style={cardValueStyle}>{stats?.counts?.warnsTotal || 0}</div>
                <div style={cardSubtextStyle}>Logged formal warnings across guilds</div>
              </div>
            </div>

            {/* Quick Status and Information */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '20px'
            }}>
              <div style={{ ...cardStyle, padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="var(--accent-green)" /> Bot Gateway Health
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  <div style={rowBetween}>
                    <span style={{ color: 'var(--text-muted)' }}>Identity</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{stats?.bot?.tag || 'TOGETHER HELPER'}</span>
                  </div>
                  <div style={rowBetween}>
                    <span style={{ color: 'var(--text-muted)' }}>Application ID</span>
                    <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>{stats?.bot?.id || 'N/A'}</span>
                  </div>
                  <div style={rowBetween}>
                    <span style={{ color: 'var(--text-muted)' }}>Command Suite</span>
                    <span><strong>{stats?.bot?.commandsCount || 25}</strong> Registered slash & prefix</span>
                  </div>
                  <div style={rowBetween}>
                    <span style={{ color: 'var(--text-muted)' }}>Node.js Runtime</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>{stats?.nodeVersion || 'v22.x'}</span>
                  </div>
                  <div style={rowBetween}>
                    <span style={{ color: 'var(--text-muted)' }}>Memory RSS</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>
                      {stats?.memory ? `${Math.round(stats.memory.rss / 1024 / 1024)} MB` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle, padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={18} color="var(--accent-red)" /> Support Operations
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  <div style={rowBetween}>
                    <span style={{ color: 'var(--text-muted)' }}>Tickets Category</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>1568280456250527844</span>
                  </div>
                  <div style={rowBetween}>
                    <span style={{ color: 'var(--text-muted)' }}>Dedicated Logs Thread Channel</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>1568284208533864498</span>
                  </div>
                  <div style={rowBetween}>
                    <span style={{ color: 'var(--text-muted)' }}>Sticky Messages Active</span>
                    <span><strong>{stats?.counts?.stickyTotal || 0}</strong> anchored channels</span>
                  </div>
                  <div style={rowBetween}>
                    <span style={{ color: 'var(--text-muted)' }}>HTML Transcripts Engine</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Enabled (discord-html-transcripts)</span>
                  </div>
                  <div style={rowBetween}>
                    <span style={{ color: 'var(--text-muted)' }}>AutoMod Protection</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Active (Anti-Link, Anti-Invite, Spam)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TICKETS DESK */}
        {tab === 'tickets' && (
          <div style={cardStyle}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Support Tickets Desk</h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Showing the latest 50 customer support inquiries</div>
              </div>
              <input
                type="text"
                placeholder="Filter by User ID or Category..."
                value={filterTicket}
                onChange={e => setFilterTicket(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  minWidth: '240px'
                }}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={thStyle}># TICKET</th>
                    <th style={thStyle}>CATEGORY</th>
                    <th style={thStyle}>USER ID</th>
                    <th style={thStyle}>STATUS</th>
                    <th style={thStyle}>CREATED</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No support tickets matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map(t => (
                      <tr key={t._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--accent-red)' }}>
                            #{t.ticketNumber}
                          </span>
                        </td>
                        <td style={tdStyle}>{t.category || 'General'}</td>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'JetBrains Mono' }}>{t.userId}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: t.status === 'open' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(237, 66, 69, 0.15)',
                            color: t.status === 'open' ? 'var(--accent-green)' : 'var(--accent-red)'
                          }}>
                            {t.status?.toUpperCase() || 'OPEN'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MODERATION */}
        {tab === 'moderation' && (
          <div style={cardStyle}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Infraction Audit Log</h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Recent warnings and formal moderation actions taken by staff</div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={thStyle}>CASE ID</th>
                    <th style={thStyle}>TARGET USER</th>
                    <th style={thStyle}>REASON</th>
                    <th style={thStyle}>MODERATOR</th>
                    <th style={thStyle}>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {warnings.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No infractions logged. The community is clean!
                      </td>
                    </tr>
                  ) : (
                    warnings.map(w => (
                      <tr key={w._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--accent-amber)' }}>
                            #{w.warnId}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'JetBrains Mono' }}>{w.userId}</span>
                        </td>
                        <td style={tdStyle}>{w.reason}</td>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>{w.moderatorId}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SERVER CONFIG */}
        {tab === 'config' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            <div style={{ ...cardStyle, padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>👋 Welcome Greeting Configuration</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Custom greetings sent whenever new members join the server.
              </p>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Active Welcome Template:</div>
                <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                  {configs?.welcomes?.[0]?.message || 'Welcome to **{server}**, {user}! Dive into lossless audio with TOGETHER.'}
                </div>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>📌 Sticky Notice Anchors</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Important channel notices that automatically anchor to the bottom.
              </p>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Anchored Notice Preview:</div>
                <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                  {configs?.stickies?.[0]?.message || 'No sticky notices currently anchored. Use `/sticky set <message>` in Discord to attach one.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RAW API DIAGNOSTICS */}
        {tab === 'raw' && (
          <div style={{ ...cardStyle, padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>⚡ Live System JSON Payload</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Real-time telemetry payload polled directly from <code>/api/stats</code>
            </p>
            <pre style={{
              background: 'var(--bg-secondary)',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '12px',
              overflowX: 'auto',
              border: '1px solid var(--border-color)',
              color: '#A6ACCD'
            }}>
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        TOGETHER HELPER Mission Control · Designed for lossless audio & community excellence · Developed by kajukatli.
      </footer>
    </div>
  );
}

const cardStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  overflow: 'hidden'
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px 20px 8px'
};

const cardTitleStyle = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.8px',
  color: 'var(--text-muted)'
};

const cardValueStyle = {
  fontSize: '28px',
  fontWeight: 800,
  padding: '0 20px',
  letterSpacing: '-0.5px'
};

const cardSubtextStyle = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  padding: '4px 20px 18px'
};

const rowBetween = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '8px',
  borderBottom: '1px solid var(--border-color)'
};

const thStyle = {
  padding: '12px 18px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.6px',
  color: 'var(--text-muted)'
};

const tdStyle = {
  padding: '14px 18px'
};


import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Disc3, 
  ListMusic, 
  Server, 
  Palette, 
  Radio, 
  Trophy, 
  Medal, 
  Terminal, 
  Sliders, 
  ShieldAlert, 
  LogOut, 
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'OVERVIEW', path: '/overview', icon: LayoutDashboard },
    { name: 'MUSIC PLAYER', path: '/player', icon: Disc3 },
    { name: 'QUEUE', path: '/queue', icon: ListMusic },
    { name: 'SERVERS', path: '/servers', icon: Server },
    { name: 'MUSIC CARDS', path: '/cards', icon: Palette },
    { name: 'AUTOPLAY & 24/7', path: '/autoplay-247', icon: Radio },
    { name: 'MUSIC XP', path: '/xp', icon: Trophy },
    { name: 'LEADERBOARD', path: '/leaderboard', icon: Medal },
    { name: 'COMMANDS', path: '/commands', icon: Terminal },
    { name: 'SETTINGS', path: '/settings', icon: Sliders },
  ];

  if (user?.isOwner) {
    navItems.push({ name: 'OWNER PANEL', path: '/owner', icon: ShieldAlert, owner: true });
  }

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text flex flex-col md:flex-row brutal-grid">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-brutal-surface border-b-2 border-brutal-border">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-brutal-accent animate-pulse border border-black inline-block"></span>
          <span className="font-display font-black text-xl tracking-wider text-brutal-text">TOGETHER // DASH</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 border-2 border-brutal-border bg-brutal-secondary text-brutal-text"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={clsx(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-brutal-surface border-r-2 border-brutal-border flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b-2 border-brutal-border bg-brutal-secondary">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-brutal-accent border border-black shadow-brutal-sm"></div>
              <h1 className="font-display font-black text-2xl tracking-wider text-brutal-text">
                TOGETHER
              </h1>
            </div>
            <p className="font-mono text-[10px] text-brutal-muted mt-1 uppercase tracking-widest">
              24-Bit Lossless Audio OS
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => clsx(
                    "flex items-center gap-3 px-3.5 py-2.5 font-mono text-xs font-bold uppercase transition-all duration-150 border-2",
                    isActive
                      ? "bg-brutal-accent text-black border-black shadow-brutal-sm translate-x-1"
                      : "text-brutal-text border-transparent hover:border-brutal-border hover:bg-brutal-secondary",
                    item.owner && !isActive && "text-brutal-danger"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Status Strip & Logout */}
        <div className="p-4 border-t-2 border-brutal-border bg-brutal-secondary">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-9 h-9 border-2 border-brutal-border object-cover shrink-0" 
                />
                <div className="overflow-hidden">
                  <p className="font-mono font-bold text-xs truncate text-brutal-text">{user.global_name}</p>
                  <p className="font-mono text-[10px] text-brutal-accent uppercase">
                    {user.isOwner ? "SYSTEM OWNER" : "AUTHENTICATED"}
                  </p>
                </div>
              </div>
              <button 
                onClick={logout} 
                title="Disconnect Session"
                className="p-2 border border-brutal-border bg-brutal-surface hover:bg-brutal-danger hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <a 
              href="/api/auth/login"
              className="w-full font-mono text-xs font-bold uppercase py-2.5 px-4 bg-brutal-accent text-black border-2 border-black flex items-center justify-center gap-2 shadow-brutal-sm"
            >
              <span>DISCORD LOGIN</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}


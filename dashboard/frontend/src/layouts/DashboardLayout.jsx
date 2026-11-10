import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  Home,
  LayoutDashboard, 
  Disc3, 
  Server, 
  User, 
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

  const isBotOwner = Boolean(
    user?.isOwner ||
    user?.id === '780345293237125152' ||
    user?.username === 'kajukatli.' ||
    user?.username === 'KAJU🦋' ||
    user?.username?.toLowerCase() === 'kaju' ||
    user?.global_name?.toLowerCase()?.includes('kaju')
  );

  const navItems = [
    { name: 'HOME', path: '/', icon: Home, end: true },
    { name: 'OVERVIEW', path: '/overview', icon: LayoutDashboard },
    { name: 'MUSIC PLAYER', path: '/player', icon: Disc3 },
    { name: 'SERVERS', path: '/servers', icon: Server },
    { name: 'USER PROFILE', path: '/profile', icon: User },
    { name: 'LEADERBOARD', path: '/leaderboard', icon: Medal },
    { name: 'SETTINGS', path: '/settings', icon: Sliders },
  ];

  if (isBotOwner) {
    navItems.push({ name: 'OWNER PANEL', path: '/owner', icon: ShieldAlert, owner: true });
  }

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text flex flex-col md:flex-row brutal-grid">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-brutal-surface border-b-2 border-brutal-border">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="TOGETHER" className="w-7 h-7 object-contain" />
          <span className="font-display font-black text-xl tracking-wider text-brutal-text">TOGETHER // DASH</span>
        </Link>
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
          {/* Brand Header with Logo */}
          <Link to="/" className="block p-6 border-b-2 border-brutal-border bg-brutal-secondary hover:bg-zinc-900 transition-colors">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="TOGETHER" className="w-9 h-9 object-contain shrink-0" />
              <div>
                <h1 className="font-display font-black text-2xl tracking-wider text-brutal-text leading-none">
                  TOGETHER
                </h1>
                <p className="font-mono text-[9px] text-brutal-accent mt-1 uppercase tracking-widest font-black">
                  24-BIT AUDIO OS
                </p>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => clsx(
                    "flex items-center gap-3 px-3.5 py-2.5 font-mono text-xs font-bold uppercase transition-all duration-150 border-2",
                    isActive
                      ? "bg-brutal-accent text-black border-black shadow-brutal-sm translate-x-1"
                      : "text-brutal-text border-transparent hover:border-brutal-border hover:bg-brutal-secondary",
                    item.owner && !isActive && "text-red-400 border-red-950 bg-red-950/20"
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
              <div 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 overflow-hidden cursor-pointer group"
                title="View User Profile"
              >
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-9 h-9 border-2 border-brutal-border group-hover:border-brutal-accent object-cover shrink-0 transition-colors" 
                />
                <div className="overflow-hidden">
                  <p className="font-mono font-bold text-xs truncate text-brutal-text group-hover:text-brutal-accent transition-colors">
                    {user.global_name || user.username}
                  </p>
                  <p className="font-mono text-[10px] text-brutal-accent uppercase">
                    {isBotOwner ? "SYSTEM OWNER" : "AUTHENTICATED"}
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

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, Settings, Bell, Home, Activity } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Brand } from './Brand';
import { useTranslations } from '@/lib/i18n';
import { apiClient } from '@/lib/api';
import { LanguageSelector } from './LanguageSelector';
import { ThemeSelector } from './ThemeSelector';
import { Button } from './Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, language, sidebarOpen, setSidebarOpen } = useAppStore();
  const reset = useAppStore((state) => state.reset);
  const router = useRouter();
  const t = useTranslations();
  const [showNotifications, setShowNotifications] = useState(false);
  const [health, setHealth] = useState<{ ok: boolean; db?: string; vectorDb?: string }>({ ok: false });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await apiClient.getHealthCheck();
        if (res.status === 'ok' || (res.data && res.data.status === 'ok')) {
          setHealth({
            ok: true,
            db: res.data?.details?.database || 'ok',
            vectorDb: res.data?.details?.vectorDb || 'ok',
          });
        } else {
          setHealth({ ok: false });
        }
      } catch {
        setHealth({ ok: false });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } finally {
      localStorage.removeItem('authToken');
      reset();
      router.push('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card/95 shadow-sm backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-2 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            type="button"
            aria-label={t('toggleSidebar')}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Brand />
            <Link
              href="/"
              className="flex items-center gap-1 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t('home')}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{t('home')}</span>
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-4">
          {/* Real-time Health Check Badge */}
          <div className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium md:flex">
            <span
              className={`h-2 w-2 rounded-full ${
                health.ok ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {health.ok ? 'Backend Ready' : 'Connecting...'}
            </span>
          </div>

          <LanguageSelector compact />

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-expanded={showNotifications}
            aria-label={t('notifications')}
          >
            <Bell className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button type="button" variant="ghost" className="h-auto p-2" />}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                  <span className="text-sm font-medium text-primary">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="p-2">
                  <ThemeSelector />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/settings" />}>
                  <Settings className="h-4 w-4" />
                  {t('settings')}
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

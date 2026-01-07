import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Users,
  Fuel,
  BarChart3,
  LogOut,
  Menu,
  ChevronLeft,
  Bell,
  Settings,
  X,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/caja', label: 'Caja Registradora', icon: Receipt },
  { to: '/admin/pagos', label: 'Gestión de Pagos', icon: CreditCard },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/combustible', label: 'Combustible', icon: Fuel },
  { to: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
];

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Error fetching notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error("Error marking as read", e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 flex flex-col',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Fuel className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">GasAdmin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  sidebarCollapsed && 'justify-center',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-border">
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg bg-muted/50',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            className={cn(
              'w-full mt-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10',
              sidebarCollapsed ? 'px-0' : 'justify-start gap-3'
            )}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && 'Cerrar Sesión'}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        'flex-1 transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold">Panel Administrativo</h1>
          </div>
          <div className="flex items-center gap-2 relative">
            <div ref={notifRef}>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border shadow-lg rounded-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="font-semibold text-sm">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-muted-foreground">{unreadCount} nuevas</span>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        No tienes notificaciones
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            "p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-default",
                            !notif.read && "bg-primary/5"
                          )}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className={cn("text-sm font-medium", !notif.read && "text-primary")}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground/70 mt-2">
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!notif.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notif.id);
                                }}
                                title="Marcar como leída"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

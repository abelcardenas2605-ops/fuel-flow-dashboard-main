import React, { useEffect, useState } from 'react';
import { ConsumerLayout } from '@/components/layout/ConsumerLayout';
import { Bell, Check, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('http://localhost:3000/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setNotifications(await response.json());
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Update local state
                setNotifications(notifications.map(n =>
                    n.id === id ? { ...n, read: true } : n
                ));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('es-MX', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateStr));
    };

    return (
        <ConsumerLayout>
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
                <div className="page-header">
                    <h1 className="page-title">Notificaciones</h1>
                    <p className="page-subtitle">Mantente al día con tu actividad</p>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="p-8 text-center">Cargando...</div>
                    ) : notifications.length === 0 ? (
                        <div className="card-elevated p-12 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                <Bell className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">No tienes notificaciones nuevas</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "card-elevated p-4 flex gap-4 transition-all duration-300",
                                    !notification.read ? "border-l-4 border-l-primary bg-primary/5" : "opacity-80"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                    !notification.read ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={cn("font-semibold", !notification.read && "text-primary")}>
                                            {notification.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(notification.createdAt)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{notification.message}</p>

                                    {!notification.read && (
                                        <div className="pt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 -ml-3 text-primary hover:text-primary hover:bg-primary/10"
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Marcar como leída
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </ConsumerLayout>
    );
}

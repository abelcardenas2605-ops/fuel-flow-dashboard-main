import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Receipt,
  TrendingUp,
  Fuel,
  AlertTriangle,
  Clock,
  ArrowRight,
  Users,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { weeklyData } from '@/data/mockData'; // Keeping charts mock for now as backend doesnt provide it yet

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/transactions/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch admin stats", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  // If loading, show skeleton or spinner
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  // Fallback defaults
  const data = stats || {
    todaySales: 0,
    totalTransactions: 0,
    avgTicket: 0,
    pendingPayments: 0,
    recentSales: [],
    lowStockFuels: [],
    topFuel: 'N/A'
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Dashboard Administrativo</h1>
          <p className="page-subtitle">Resumen general del día</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Ventas del Día"
            value={formatCurrency(data.todaySales)}
            icon={DollarSign}
            trend={{ value: 0, isPositive: true }} // Validar tendencia requeriria datos de ayer
            variant="primary"
          />
          <StatCard
            title="Transacciones"
            value={data.totalTransactions}
            subtitle="Hoy"
            icon={Receipt}
            variant="accent"
          />
          <StatCard
            title="Ticket Promedio"
            value={formatCurrency(data.avgTicket)}
            icon={TrendingUp}
            variant="default"
          />
          <StatCard
            title="Pagos Pendientes"
            value={data.pendingPayments}
            subtitle="Por verificar"
            icon={Clock}
            variant="warning"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Sales Chart (Keep Mock for now 30% or implement endpoint later) */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Ventas Semanales</h2>
              <Button variant="ghost" size="sm">
                Ver más
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="ventas"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transactions Trend */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Transacciones por Día</h2>
              <Button variant="ghost" size="sm">
                Ver más
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    formatter={(value: number) => [value, 'Transacciones']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="transacciones"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Sales */}
          <div className="lg:col-span-2 card-elevated">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Ventas Recientes</h2>
              <Button variant="ghost" size="sm">
                Ver todas
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="divide-y divide-border">
              {data.recentSales.length === 0 ? (
                <p className="p-4 text-center text-muted-foreground">No hay ventas recientes hoy.</p>
              ) : (
                data.recentSales.map((sale: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="icon-box-primary">
                        <Fuel className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{sale.fuel}</p>
                        <p className="text-sm text-muted-foreground">{parseFloat(sale.liters).toFixed(2)} L • {sale.method}</p>
                        <p className="text-xs text-muted-foreground">Cliente: {sale.user || 'Anon'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(parseFloat(sale.amount))}</p>
                      <p className="text-sm text-muted-foreground">{new Date(sale.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Alerts & Quick Actions */}
          <div className="space-y-6">
            {/* Alerts */}
            {data.lowStockFuels.length > 0 && (
              <div className="card-elevated p-4 border-l-4 border-l-warning">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Alertas de Inventario</h3>
                    <div className="mt-2 space-y-2">
                      {data.lowStockFuels.map((fuel: any) => (
                        <div key={fuel.id} className="text-sm">
                          <span className="font-medium">{fuel.name}</span>
                          <span className="text-muted-foreground"> - {parseFloat(fuel.stockLevel).toFixed(0)} L restantes</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="warning" size="sm" className="mt-3">
                      Gestionar Inventario
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="card-elevated p-4">
              <h3 className="font-semibold mb-4">Resumen Rápido</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Clientes Activos</span>
                  </div>
                  <span className="font-semibold">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Combustible Top</span>
                  </div>
                  <span className="font-semibold capitalize">{data.topFuel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Turno Actual</span>
                  </div>
                  <span className="badge-status badge-info">Abierto</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

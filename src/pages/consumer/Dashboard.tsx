import React, { useState, useEffect } from 'react';
import { ConsumerLayout } from '@/components/layout/ConsumerLayout';
import { StatCard } from '@/components/shared/StatCard';
import { FuelCard } from '@/components/shared/FuelCard';
import { Button } from '@/components/ui/button';
import {
  Fuel,
  TrendingUp,
  CreditCard,
  Car,
  ArrowRight,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ConsumerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [fuels, setFuels] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    monthlySpend: 0,
    totalTransactions: 0,
    lastConsumption: { liters: 0, amount: 0 },
    favoriteFuel: 'N/A'
  });

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("No token found");
          setLoading(false);
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch individually to better handle partial failures
        const [vRes, fRes, tRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/vehicles`, { headers }).catch(e => ({ ok: false, error: e })),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/fuels`, { headers }).catch(e => ({ ok: false, error: e })),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/transactions/history`, { headers }).catch(e => ({ ok: false, error: e }))
        ]);

        // Vehicles
        if ('ok' in vRes && vRes.ok) {
          const data = await (vRes as Response).json();
          setVehicles(Array.isArray(data) ? data : []);
        } else {
          console.warn("Failed to load vehicles");
        }

        // Fuels
        if ('ok' in fRes && fRes.ok) {
          const data = await (fRes as Response).json();
          setFuels(Array.isArray(data) ? data : []);
        }

        // Transactions
        if ('ok' in tRes && tRes.ok) {
          const txs = await (tRes as Response).json();
          if (Array.isArray(txs)) {
            setTransactions(txs);
            calculateStats(txs);
          }
        }

      } catch (error: any) {
        console.error("Dashboard Load Error:", error);
        setError(error.message || "Error desconocido cargando datos.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  const calculateStats = (txs: any[]) => {
    try {
      const totalTx = txs.length;
      const totalSpend = txs.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0);
      const lastTx = txs.length > 0 ? txs[0] : null;

      const fuelCounts: Record<string, number> = {};
      txs.forEach(t => {
        const name = t.fuelType?.name || 'Desconocido';
        fuelCounts[name] = (fuelCounts[name] || 0) + 1;
      });
      const fav = Object.keys(fuelCounts).sort((a, b) => fuelCounts[b] - fuelCounts[a])[0] || 'N/A';

      setStats({
        monthlySpend: totalSpend,
        totalTransactions: totalTx,
        lastConsumption: lastTx ? { liters: parseFloat(lastTx.volume) || 0, amount: parseFloat(lastTx.totalAmount) || 0 } : { liters: 0, amount: 0 },
        favoriteFuel: fav
      });
    } catch (e) {
      console.error("Error calculating stats", e);
    }
  };

  if (loading) return (
    <ConsumerLayout>
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </ConsumerLayout>
  );

  if (error) return (
    <ConsumerLayout>
      <div className="flex h-[80vh] flex-col items-center justify-center text-destructive space-y-4">
        <AlertCircle className="w-12 h-12" />
        <h2 className="text-xl font-bold">Error cargando el Dashboard</h2>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    </ConsumerLayout>
  );

  return (
    <ConsumerLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="page-header">
          <h1 className="page-title">¡Bienvenido, {user?.name || 'Conductor'}!</h1>
          <p className="page-subtitle">Aquí tienes un resumen de tu actividad reciente.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Último Consumo"
            value={`${stats.lastConsumption.liters} L`}
            subtitle={formatCurrency(stats.lastConsumption.amount)}
            icon={Fuel}
            variant="primary"
          />
          <StatCard
            title="Gasto Total"
            value={formatCurrency(stats.monthlySpend)}
            subtitle="Histórico"
            icon={TrendingUp}
            variant="accent"
          />
          <StatCard
            title="Combustible Favorito"
            value={stats.favoriteFuel}
            subtitle="Más utilizado"
            icon={Fuel}
            variant="warning"
          />
          <StatCard
            title="Transacciones"
            value={stats.totalTransactions.toString()}
            subtitle="Total histórico"
            icon={CreditCard}
            variant="default"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fuel Prices */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Precios Actuales</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {fuels.map((fuel) => (
                <FuelCard key={fuel.id} fuel={fuel} />
              ))}
            </div>
          </div>

          {/* My Vehicles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Mis Vehículos</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/perfil')}>
                Gestionar
              </Button>
            </div>
            <div className="space-y-3">
              {vehicles.length === 0 ? (
                <div className="text-center p-4 border rounded-lg text-muted-foreground text-sm">
                  No tienes vehículos registrados.
                </div>
              ) : (
                vehicles.slice(0, 3).map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="card-elevated p-4 flex items-center gap-4 card-hover"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{vehicle.plate}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                    </div>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full" onClick={() => navigate('/perfil')}>
                + Agregar vehículo
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Transacciones Recientes</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/historial')}>
              Ver historial
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="card-elevated overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No tienes transacciones recientes.</div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.slice(0, 3).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="icon-box-primary">
                        <Fuel className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{tx.fuelType?.name || 'Desconocido'}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(parseFloat(tx.totalAmount))}</p>
                      <p className="text-sm text-muted-foreground">{tx.volume} L</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Pay CTA */}
        <div className="card-elevated p-6 gradient-primary text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">¿Listo para cargar combustible?</h3>
              <p className="opacity-90 mt-1">Realiza tu pago de forma rápida y segura</p>
            </div>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
              onClick={() => navigate('/pagar')}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Pagar Ahora
            </Button>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  );
}

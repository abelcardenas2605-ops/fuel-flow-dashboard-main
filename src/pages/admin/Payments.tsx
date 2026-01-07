import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Smartphone,
  Wallet,
  Eye,
  Ban,
  Check,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentMethod, TransactionStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

const paymentIcons: Record<string, React.ElementType> = {
  card: CreditCard,
  qr: Smartphone,
  wallet: Wallet,
  cash: CreditCard,
};

const statusConfig: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  completed: { label: 'Completado', class: 'badge-success', icon: CheckCircle },
  pending: { label: 'Pendiente', class: 'badge-warning', icon: Clock },
  cancelled: { label: 'Cancelado', class: 'badge-error', icon: XCircle },
  refunded: { label: 'Reembolsado', class: 'badge-info', icon: Ban },
};

export default function PaymentsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      } else {
        console.error('Failed to fetch transactions');
        toast({
          title: "Error",
          description: "No se pudieron cargar las transacciones.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Error de conexión.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const filteredTransactions = transactions.filter(tx => {
    if (statusFilter !== 'all' && tx.status.toLowerCase() !== statusFilter) return false;
    // Mock receipt number matching since real DB might not have receiptNumber exposed directly or it is the ID
    const receiptMatch = tx.id.toString().includes(searchTerm) || (tx.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return searchTerm ? receiptMatch : true;
  });

  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  if (loading && transactions.length === 0) {
    return (
      <AdminLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Gestión de Pagos</h1>
            <p className="page-subtitle">Valida y administra todas las transacciones</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Actualizar
            </Button>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 border border-warning/20">
                <Clock className="w-5 h-5 text-warning" />
                <span className="font-medium text-warning">{pendingCount} pagos pendientes</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(['completed', 'pending', 'cancelled', 'refunded']).map((status) => {
            const config = statusConfig[status] || statusConfig['completed'];
            const count = transactions.filter(t => t.status.toLowerCase() === status).length;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                className={cn(
                  'card-elevated p-4 text-left transition-all',
                  statusFilter === status && 'ring-2 ring-primary'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <config.icon className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">{config.label}</span>
                </div>
                <p className="text-2xl font-bold">{count}</p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID o Usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Más filtros
          </Button>
        </div>

        {/* Transactions Table */}
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="text-left p-4">Recibo (ID)</th>
                  <th className="text-left p-4">Fecha</th>
                  <th className="text-left p-4">Usuario</th>
                  <th className="text-left p-4">Combustible</th>
                  <th className="text-left p-4">Método</th>
                  <th className="text-right p-4">Monto</th>
                  <th className="text-center p-4">Estado</th>
                  <th className="text-right p-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((tx) => {
                  const statusInfo = statusConfig[tx.status.toLowerCase()] || statusConfig['completed'];
                  const PaymentIcon = paymentIcons[tx.paymentMethod.toLowerCase()] || CreditCard;

                  return (
                    <tr key={tx.id} className="table-row-hover">
                      <td className="p-4">
                        <span className="font-mono text-sm">#{tx.id}</span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDate(tx.timestamp)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{tx.user?.name || `Usuario #${tx.userId}`}</span>
                          <span className="text-xs text-muted-foreground">{tx.user?.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="font-medium capitalize">{tx.fuelType?.name || 'Unknown'}</span>
                          <span className="text-sm text-muted-foreground ml-2">({Number(tx.volume).toFixed(2)} L)</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <PaymentIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{tx.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-semibold">
                        {formatCurrency(Number(tx.totalAmount))}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <span className={cn('badge-status', statusInfo.class)}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {tx.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success">
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-muted-foreground">
                      No se encontraron transacciones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

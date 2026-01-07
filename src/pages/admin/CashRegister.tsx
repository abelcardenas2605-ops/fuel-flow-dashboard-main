import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DollarSign,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  ArrowLeft,
  Printer,
  RefreshCw,
  CheckCircle,
  XCircle,
  Calculator,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

type CashStatus = 'closed' | 'opening' | 'open' | 'closing';

interface Shift {
  id: number;
  startCash: number;
  currentAmount: number; // calculated or stored? For now derived from context + local mock sales
  openedAt: string;
  totalSales: number;
}

interface Fuel {
  id: number;
  name: string;
  pricePerUnit: number; // backend calls it currentPrice, keeping align
}

export default function CashRegisterPage() {
  const [status, setStatus] = useState<CashStatus>('closed');
  const [shiftData, setShiftData] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [manualSale, setManualSale] = useState({
    fuelId: 0,
    liters: '',
    amount: '',
  });
  const [fuels, setFuels] = useState<Fuel[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkCurrentShift();
    fetchFuels();
  }, []);

  // Update amount when liters or fuel changes
  useEffect(() => {
    if (manualSale.liters && manualSale.fuelId) {
      const fuel = fuels.find(f => f.id === Number(manualSale.fuelId));
      if (fuel) {
        const calculated = Number(manualSale.liters) * Number(fuel.pricePerUnit);
        setManualSale(prev => ({ ...prev, amount: calculated.toFixed(2) }));
      }
    }
  }, [manualSale.liters, manualSale.fuelId]);


  const checkCurrentShift = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/shifts/current', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setShiftData({
            id: data.id,
            startCash: Number(data.startCash),
            currentAmount: Number(data.startCash) + Number(data.totalSales),
            openedAt: data.startTime,
            totalSales: Number(data.totalSales)
          });
          setStatus('open');
        } else {
          setStatus('closed');
        }
      }
    } catch (e) {
      console.error("Failed to check shift", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFuels = async () => {
    try {
      const res = await fetch('http://localhost:3000/fuels');
      if (res.ok) {
        const data = await res.json();
        setFuels(data.map((f: any) => ({
          id: f.id,
          name: f.name,
          pricePerUnit: Number(f.currentPrice)
        })));
        if (data.length > 0) {
          setManualSale(prev => ({ ...prev, fuelId: data[0].id }));
        }
      }
    } catch (e) { console.error(e); }
  };

  const handleOpenCash = async () => {
    if (!openingAmount) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/shifts/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ openingAmount: parseFloat(openingAmount) })
      });

      if (res.ok) {
        toast({ title: "Caja abierta exitosamente" });
        checkCurrentShift();
      } else {
        throw new Error("Failed to open");
      }
    } catch (e) {
      toast({ title: "Error al abrir caja", variant: "destructive" });
    }
  };

  const handleCloseCash = () => {
    setStatus('closing');
  };

  const handleConfirmClose = async () => {
    if (!closingAmount) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/shifts/close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ closingAmount: parseFloat(closingAmount) })
      });

      if (res.ok) {
        toast({ title: "Turno cerrado correctamente" });
        setStatus('closed');
        setShiftData(null);
        setClosingAmount('');
        setOpeningAmount('');
      } else {
        throw new Error("Failed to close");
      }
    } catch (e) {
      toast({ title: "Error al cerrar caja", variant: "destructive" });
    }
  };

  const handleRegisterSale = async () => {
    if (!manualSale.liters || !manualSale.fuelId) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          fuelTypeId: Number(manualSale.fuelId),
          volume: Number(manualSale.liters),
          vehicleId: null, // Manual sale usually no vehicle linked immediately or generic
          paymentMethod: 'CASH', // Default for Manual Cash Register
        })
      });

      if (res.ok) {
        toast({ title: "Venta registrada exitosamente" });
        setManualSale(prev => ({ ...prev, liters: '', amount: '' }));
        checkCurrentShift(); // Refresh totals
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.message || "Error al registrar", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error de conexión", variant: "destructive" });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (loading) {
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
            <h1 className="page-title">Caja Registradora</h1>
            <p className="page-subtitle">Gestión de apertura, cierre y ventas en efectivo</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              status === 'open' ? 'bg-success/10 text-success' :
                status === 'closed' ? 'bg-muted text-muted-foreground' :
                  'bg-warning/10 text-warning'
            )}>
              {status === 'open' ? '● Caja Abierta' :
                status === 'closed' ? '○ Caja Cerrada' :
                  '◐ En Proceso'}
            </span>
          </div>
        </div>

        {/* Cash Closed State */}
        {status === 'closed' && (
          <div className="card-elevated p-8 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Caja Cerrada</h2>
            <p className="text-muted-foreground mb-6">
              Ingresa el monto inicial para abrir la caja
            </p>
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="opening">Monto de Apertura</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="opening"
                    type="number"
                    value={openingAmount}
                    onChange={(e) => setOpeningAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-10 text-lg"
                  />
                </div>
              </div>
              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                onClick={handleOpenCash}
                disabled={!openingAmount}
              >
                Abrir Caja
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Cash Open State */}
        {status === 'open' && shiftData && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Apertura</span>
                </div>
                <p className="text-2xl font-bold">{formatTime(shiftData.openedAt)}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(shiftData.startCash)}</p>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">En Caja</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(shiftData.currentAmount)}</p>
                <p className="text-sm text-muted-foreground">Total actual</p>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Ventas</span>
                </div>
                <p className="text-2xl font-bold text-success">{formatCurrency(shiftData.totalSales)}</p>
                <p className="text-sm text-muted-foreground">Balance del turno</p>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calculator className="w-4 h-4" />
                  <span className="text-sm">Transacciones</span>
                </div>
                {/* To implement transaction count for shift would need backend update, showing simplified */}
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">Este turno</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Manual Sale Form */}
              <div className="card-elevated p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Registrar Venta
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fuel">Tipo de Combustible</Label>
                    <select
                      id="fuel"
                      value={manualSale.fuelId}
                      onChange={(e) => setManualSale({ ...manualSale, fuelId: Number(e.target.value) })}
                      className="w-full h-10 rounded-lg border border-input bg-background px-3"
                    >
                      {fuels.map(f => (
                        <option key={f.id} value={f.id}>{f.name} - {formatCurrency(f.pricePerUnit)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="liters">Litros</Label>
                    <Input
                      id="liters"
                      type="number"
                      value={manualSale.liters}
                      onChange={(e) => setManualSale({ ...manualSale, liters: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto (MXN)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={manualSale.amount}
                      readOnly
                      placeholder="Calculation auto"
                      className="bg-muted"
                    />
                  </div>
                  <Button variant="gradient" className="w-full" onClick={handleRegisterSale}>
                    Registrar Venta
                  </Button>
                </div>
              </div>

              {/* Recent Transactions Placeholder */}
              <div className="lg:col-span-2 card-elevated flex items-center justify-center text-muted-foreground">
                <p>Las transacciones recientes se pueden ver en Pagos.</p>
              </div>
            </div>

            {/* Close Cash Button */}
            <div className="flex justify-end">
              <Button variant="destructive" size="lg" onClick={handleCloseCash}>
                Cerrar Caja
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </>
        )}

        {/* Closing State */}
        {status === 'closing' && shiftData && (
          <div className="card-elevated p-8 max-w-xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-warning" />
              </div>
              <h2 className="text-xl font-semibold">Cierre de Caja</h2>
              <p className="text-muted-foreground">Verifica el monto en caja para cerrar el turno</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto de apertura</span>
                  <span>{formatCurrency(shiftData.startCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ventas en efectivo</span>
                  <span className="text-success">+{formatCurrency(shiftData.totalSales)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-semibold">
                  <span>Monto esperado</span>
                  <span>{formatCurrency(shiftData.currentAmount)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="closing">Monto contado en caja</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="closing"
                    type="number"
                    value={closingAmount}
                    onChange={(e) => setClosingAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-10 text-lg"
                  />
                </div>
              </div>

              {closingAmount && (
                <div className={cn(
                  'p-4 rounded-lg',
                  parseFloat(closingAmount) === shiftData.currentAmount
                    ? 'bg-success/10 border border-success/20'
                    : 'bg-warning/10 border border-warning/20'
                )}>
                  <div className="flex items-center gap-2">
                    {parseFloat(closingAmount) === shiftData.currentAmount ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-warning" />
                    )}
                    <span className="font-medium">
                      {parseFloat(closingAmount) === shiftData.currentAmount
                        ? 'Caja cuadrada'
                        : `Diferencia: ${formatCurrency(parseFloat(closingAmount) - shiftData.currentAmount)}`
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStatus('open')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                onClick={handleConfirmClose}
                disabled={!closingAmount}
              >
                Confirmar Cierre
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

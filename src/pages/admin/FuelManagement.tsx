import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { FuelCard } from '@/components/shared/FuelCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fuel } from '@/types';
import {
  Plus,
  Edit2,
  History,
  AlertTriangle,
  DollarSign,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function FuelManagement() {
  const [fuels, setFuels] = useState<Fuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFuel, setEditingFuel] = useState<Fuel | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchFuels();
  }, []);

  const fetchFuels = async () => {
    try {
      const res = await fetch('http://localhost:3000/fuels');
      if (res.ok) {
        const data = await res.json();
        // Map backend simple type to frontend complex type
        const mapped: Fuel[] = data.map((f: any) => ({
          id: f.id,
          name: f.name,
          pricePerLiter: Number(f.currentPrice),
          type: f.name === 'DIESEL' ? 'diesel' : f.name === 'PREMIUM_91' ? 'premium' : 'regular', // simplified mapping
          color: f.name === 'DIESEL' ? 'bg-black' : f.name === 'PREMIUM_91' ? 'bg-red-500' : 'bg-green-500',
          stockLevel: Number(f.stockLevel),
          capacity: 5000, // Hardcoded capacity for now as backend model doesn't have it yet or it's static
          lastUpdated: f.updatedAt
        }));
        setFuels(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch fuels", error);
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

  const lowStockFuels = fuels.filter(f => f.stockLevel < 20);

  const handleEditPrice = (fuel: Fuel) => {
    setEditingFuel(fuel);
    setNewPrice(fuel.pricePerLiter.toString());
  };

  const handleSavePrice = async () => {
    if (!editingFuel || !newPrice) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/fuels/${editingFuel.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          price: parseFloat(newPrice)
        })
      });

      if (res.ok) {
        toast({
          title: "Precio actualizado",
          description: `El precio de ${editingFuel.name} ha sido actualizado exitosamente.`,
        });
        fetchFuels(); // Refresh
        setEditingFuel(null);
        setNewPrice('');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio.",
        variant: "destructive"
      });
    }
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
            <h1 className="page-title">Gestión de Combustible</h1>
            <p className="page-subtitle">Control de precios e inventario</p>
          </div>
          {/* Add Fuel removed for MVP simplicity - focused on managing existing */}
        </div>

        {/* Alerts */}
        {lowStockFuels.length > 0 && (
          <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-warning">⚠️ Alerta de Inventario Bajo</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Los siguientes combustibles requieren reabastecimiento urgente:
                </p>
                <ul className="mt-2 space-y-1">
                  {lowStockFuels.map(fuel => (
                    <li key={fuel.id} className="text-sm font-medium">
                      {fuel.name} - Solo {fuel.stockLevel}% restante
                    </li>
                  ))}
                </ul>
                <Button variant="warning" size="sm" className="mt-3">
                  Solicitar Reabastecimiento
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Fuel Cards with Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fuels.map((fuel) => (
            <div key={fuel.id} className="relative">
              <FuelCard fuel={fuel} showStock />
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => handleEditPrice(fuel)}
                >
                  <Edit2 className="w-3 h-3" />
                  Editar Precio
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Price Modal */}
        {editingFuel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
            <div className="card-elevated p-6 w-full max-w-md mx-4 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Actualizar Precio</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingFuel(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Combustible</p>
                  <p className="font-semibold">{editingFuel.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Precio Actual</Label>
                    <p className="text-2xl font-bold">{formatCurrency(editingFuel.pricePerLiter)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPrice">Nuevo Precio</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="newPrice"
                        type="number"
                        step="0.01"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="pl-10 text-lg"
                      />
                    </div>
                  </div>
                </div>

                {newPrice && parseFloat(newPrice) !== editingFuel.pricePerLiter && (
                  <div className={cn(
                    'p-3 rounded-lg text-sm',
                    parseFloat(newPrice) > editingFuel.pricePerLiter
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-success/10 text-success'
                  )}>
                    Cambio: {parseFloat(newPrice) > editingFuel.pricePerLiter ? '+' : ''}
                    {formatCurrency(parseFloat(newPrice) - editingFuel.pricePerLiter)} por litro
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setEditingFuel(null)}>
                    Cancelar
                  </Button>
                  <Button variant="gradient" className="flex-1" onClick={handleSavePrice}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

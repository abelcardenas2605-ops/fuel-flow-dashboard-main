import React, { useEffect, useState } from 'react';
import { ConsumerLayout } from '@/components/layout/ConsumerLayout';
import { FuelCard } from '@/components/shared/FuelCard';
import { Info, Loader2 } from 'lucide-react';
import { Fuel } from '@/types';

export default function FuelPrices() {
  const [fuels, setFuels] = useState<Fuel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFuels();
  }, []);

  const fetchFuels = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/fuels`);
      if (res.ok) {
        const data = await res.json();
        const mapped: Fuel[] = data.map((f: any) => ({
          id: f.id,
          name: f.name,
          pricePerLiter: Number(f.currentPrice),
          type: f.name === 'DIESEL' ? 'diesel' : f.name === 'PREMIUM_91' ? 'premium' : 'regular',
          color: f.name === 'DIESEL' ? 'bg-black' : f.name === 'PREMIUM_91' ? 'bg-red-500' : 'bg-green-500',
          stockLevel: Number(f.stockLevel),
          available: Number(f.stockLevel) > 50, // Threshold for display availability
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

  if (loading) {
    return (
      <ConsumerLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ConsumerLayout>
    );
  }

  return (
    <ConsumerLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Precios de Combustibles</h1>
          <p className="page-subtitle">Consulta los precios actualizados y promociones disponibles</p>
        </div>

        {/* Info Banner */}
        <div className="card-elevated p-4 flex items-start gap-3 bg-info/5 border-info/20">
          <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Precios actualizados diariamente</p>
            <p className="text-sm text-muted-foreground">
              Los precios pueden variar según la ubicación.
            </p>
          </div>
        </div>

        {/* Fuel Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fuels.map((fuel) => (
            <FuelCard key={fuel.id} fuel={fuel} />
          ))}
        </div>

        {/* Promotions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Promociones Activas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-elevated p-5 border-l-4 border-l-accent">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl">
                  🎉
                </div>
                <div>
                  <h3 className="font-semibold">Martes de Descuento</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    5% de descuento en gasolina Premium todos los martes
                  </p>
                  <span className="badge-status badge-success mt-2 inline-block">
                    Activa
                  </span>
                </div>
              </div>
            </div>
            <div className="card-elevated p-5 border-l-4 border-l-primary">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  🚗
                </div>
                <div>
                  <h3 className="font-semibold">Carga Completa</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Al cargar más de 40L, obtén 3% de descuento adicional
                  </p>
                  <span className="badge-status badge-success mt-2 inline-block">
                    Activa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  );
}

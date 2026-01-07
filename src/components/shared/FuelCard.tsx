import React from 'react';
import { Fuel } from '@/types';
import { cn } from '@/lib/utils';
import { Droplets, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FuelCardProps {
  fuel: Fuel;
  onSelect?: () => void;
  showStock?: boolean;
  selected?: boolean;
}

const fuelColors = {
  regular: 'from-blue-500 to-blue-600',
  premium: 'from-emerald-500 to-teal-600',
  diesel: 'from-amber-500 to-orange-600',
};

const fuelIcons = {
  regular: '⛽',
  premium: '✨',
  diesel: '🔥',
};

export function FuelCard({ fuel, onSelect, showStock, selected }: FuelCardProps) {
  const isLowStock = fuel.stockLevel < 20;

  return (
    <div
      className={cn(
        'card-elevated overflow-hidden card-hover cursor-pointer',
        selected && 'ring-2 ring-primary'
      )}
      onClick={onSelect}
    >
      {/* Header with gradient */}
      <div className={cn(
        'p-4 bg-gradient-to-br text-white',
        fuelColors[fuel.type]
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{fuelIcons[fuel.type]}</span>
            <div>
              <h3 className="font-bold">{fuel.name}</h3>
              <p className="text-sm opacity-90">Por litro</p>
            </div>
          </div>
          {fuel.available ? (
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
              Disponible
            </span>
          ) : (
            <span className="px-2 py-1 bg-red-500/30 rounded-full text-xs font-medium">
              Agotado
            </span>
          )}
        </div>
      </div>

      {/* Price Section */}
      <div className="p-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">${Number(fuel.pricePerLiter || 0).toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">MXN</span>
        </div>

        {showStock && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Nivel de stock</span>
              <span className={cn(
                'font-medium',
                isLowStock ? 'text-destructive' : 'text-foreground'
              )}>
                {fuel.stockLevel}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isLowStock ? 'bg-destructive' : 'bg-primary'
                )}
                style={{ width: `${fuel.stockLevel}%` }}
              />
            </div>
            {isLowStock && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertTriangle className="w-3 h-3" />
                <span>Stock bajo - Reabastecimiento requerido</span>
              </div>
            )}
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Última actualización: {fuel.lastUpdated ? new Date(fuel.lastUpdated).toLocaleDateString() : 'N/A'}
        </p>
      </div>

      {onSelect && (
        <div className="px-4 pb-4">
          <Button
            variant={selected ? 'default' : 'outline'}
            className="w-full"
          >
            {selected ? 'Seleccionado' : 'Seleccionar'}
          </Button>
        </div>
      )}
    </div>
  );
}

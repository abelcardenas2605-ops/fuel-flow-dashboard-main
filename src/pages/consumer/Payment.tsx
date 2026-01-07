import React, { useState, useEffect } from 'react';
import { ConsumerLayout } from '@/components/layout/ConsumerLayout';
import { FuelCard } from '@/components/shared/FuelCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fuel, FuelType } from '@/types';
import {
  Car,
  CreditCard,
  Smartphone,
  Wallet,
  Check,
  ArrowRight,
  ArrowLeft,
  Download,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type PaymentMethod = 'card' | 'qr' | 'wallet' | 'cash';
type Step = 'vehicle' | 'fuel' | 'amount' | 'payment' | 'confirmation';

const paymentMethods = [
  { id: 'CREDIT_CARD', name: 'Tarjeta', icon: CreditCard, description: 'Débito o Crédito' },
  { id: 'QR', name: 'Código QR', icon: Smartphone, description: 'Escanea y paga' },
  { id: 'CASH', name: 'Efectivo', icon: Wallet, description: 'Pago en caja' },
];

export default function Payment() {
  const [currentStep, setCurrentStep] = useState<Step>('vehicle');

  // Data State
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [fuels, setFuels] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Selection State
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [selectedFuel, setSelectedFuel] = useState<any | null>(null);
  const [liters, setLiters] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const navigate = useNavigate();

  const total = selectedFuel && liters ? (parseFloat(liters) * parseFloat(selectedFuel.currentPrice)) : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [vRes, fRes] = await Promise.all([
          fetch('http://localhost:3000/vehicles', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:3000/fuels', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (vRes.ok) setVehicles(await vRes.json());
        if (fRes.ok) setFuels(await fRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const steps: { id: Step; label: string }[] = [
    { id: 'vehicle', label: 'Vehículo' },
    { id: 'fuel', label: 'Combustible' },
    { id: 'amount', label: 'Cantidad' },
    { id: 'payment', label: 'Pago' },
    { id: 'confirmation', label: 'Confirmación' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle.id,
          fuelTypeId: selectedFuel.id,
          volume: parseFloat(liters),
          paymentMethod: selectedPayment
        })
      });

      if (response.ok) {
        setIsComplete(true);
        setCurrentStep('confirmation');
        // Notify ? (Next step)
      } else {
        alert('Error procesando el pago');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    setCurrentStep('vehicle');
    setSelectedVehicle(null);
    setSelectedFuel(null);
    setLiters('');
    setSelectedPayment(null);
    setIsComplete(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  if (loadingData) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <ConsumerLayout>
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="page-header text-center">
          <h1 className="page-title">Pago de Combustible</h1>
          <p className="page-subtitle">Completa los siguientes pasos para realizar tu pago</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                    index < currentStepIndex
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStepIndex
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {index < currentStepIndex ? <Check className="w-5 h-5" /> : index + 1}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-1 rounded-full mx-2 transition-colors duration-300',
                  index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="card-elevated p-6">
          {/* Step 1: Vehicle Selection */}
          {currentStep === 'vehicle' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-xl font-semibold">Selecciona tu vehículo</h2>
                {vehicles.length === 0 && <p className="text-destructive mt-2">No tienes vehículos. Ve a tu Perfil para agregar uno.</p>}
              </div>
              <div className="grid gap-4">
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={cn(
                      'p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all duration-200',
                      selectedVehicle?.id === vehicle.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Car className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{vehicle.plate}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                onClick={goNext}
                disabled={!selectedVehicle}
              >
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Fuel Selection */}
          {currentStep === 'fuel' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-xl font-semibold">Selecciona el combustible</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fuels.map((fuel) => (
                  <button
                    key={fuel.id}
                    onClick={() => setSelectedFuel(fuel)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left',
                      selectedFuel?.id === fuel.id ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    <div className="font-bold text-lg">{fuel.name}</div>
                    <div className="text-muted-foreground">{formatCurrency(parseFloat(fuel.currentPrice))} / L</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="flex-1" onClick={goBack}>Atrás</Button>
                <Button
                  variant="gradient"
                  size="lg"
                  className="flex-1"
                  onClick={goNext}
                  disabled={!selectedFuel}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Amount */}
          {currentStep === 'amount' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-xl font-semibold">¿Cuántos litros?</h2>
              </div>
              <div className="max-w-sm mx-auto space-y-4">
                <div className="space-y-2">
                  <Label>Litros</Label>
                  <Input
                    type="number"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    placeholder="20"
                    className="text-center text-2xl h-14"
                  />
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex justify-between items-center mt-2 pt-2">
                    <span className="font-semibold">Total estimado</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="flex-1" onClick={goBack}>Atrás</Button>
                <Button
                  variant="gradient"
                  size="lg"
                  className="flex-1"
                  onClick={goNext}
                  disabled={!liters || parseFloat(liters) <= 0}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 'payment' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-xl font-semibold">Método de Pago</h2>
              </div>
              <div className="grid gap-4">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedPayment(m.id)}
                    className={cn('p-4 rounded-xl border-2 flex items-center gap-4', selectedPayment === m.id ? 'border-primary bg-primary/5' : 'border-border')}
                  >
                    <m.icon className="w-6 h-6 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-sm text-muted-foreground">{m.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="flex-1" onClick={goBack}>Atrás</Button>
                <Button variant="gradient" size="lg" className="flex-1" onClick={handlePayment} disabled={!selectedPayment || isProcessing}>
                  {isProcessing ? 'Procesando...' : `Pagar ${formatCurrency(total)}`}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === 'confirmation' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold">¡Pago Exitoso!</h2>
              <div className="flex gap-3 justify-center">
                <Button variant="gradient" onClick={resetPayment}>Nueva Carga</Button>
                <Button variant="outline" onClick={() => navigate('/history')}>Ver Historial</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConsumerLayout>
  );
}

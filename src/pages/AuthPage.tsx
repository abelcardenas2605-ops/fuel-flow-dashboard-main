import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, Eye, EyeOff, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('consumer');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const loggedUser = await login(email, password, selectedRole);
        navigate(loggedUser.role === 'consumer' ? '/dashboard' : '/admin');
      } else {
        await register(name, email, password, selectedRole, employeeId);
        // Register likely auto-logins or we can assume selectedRole is correct for intent
        navigate(selectedRole === 'consumer' ? '/dashboard' : '/admin');
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions: { role: UserRole; label: string; description: string }[] = [
    { role: 'consumer', label: 'Usuario', description: 'Consulta y paga combustible' },
    { role: 'admin', label: 'Administrador', description: 'Gestión completa del sistema' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Fuel className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">GasStation</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Sistema de Gestión<br />de Gasolinera
            </h1>
            <p className="text-lg opacity-90 max-w-md">
              Plataforma integral para la gestión de ventas, inventario y clientes de tu estación de servicio.
            </p>
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold">+500</p>
                <p className="text-sm opacity-80">Clientes activos</p>
              </div>
              <div>
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm opacity-80">Servicio continuo</p>
              </div>
              <div>
                <p className="text-3xl font-bold">99.9%</p>
                <p className="text-sm opacity-80">Disponibilidad</p>
              </div>
            </div>
          </div>

          <p className="text-sm opacity-70">
            © 2024 GasStation. Todos los derechos reservados.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-10 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">GasStation</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold">
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {mode === 'login'
                ? 'Ingresa tus credenciales para continuar'
                : 'Completa tus datos para registrarte'}
            </p>
          </div>

          {/* Role Selection (Always visible now for Registration too) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de acceso</Label>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option.role}
                  type="button"
                  onClick={() => setSelectedRole(option.role)}
                  className={cn(
                    'p-3 rounded-lg border-2 text-left transition-all duration-200',
                    selectedRole === option.role
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  )}
                >
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Juan Pérez"
                      className="pl-10 input-field"
                      required
                    />
                  </div>
                </div>

                {/* Conditional Employee ID Input */}
                {selectedRole !== 'consumer' && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="employeeId" className="text-primary font-medium">
                      ID de Empleado / Carnet <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="employeeId"
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="ABC-12345"
                      className="input-field border-primary/50"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Requerido para validación administrativa.</p>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="pl-10 input-field"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 input-field"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-end">
                <button type="button" className="text-sm text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-pulse">Procesando...</span>
              ) : (
                <>
                  {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="ml-1 text-primary font-medium hover:underline"
              >
                {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>

          {/* Demo Info - Removed to implement Real Auth Request */}
        </div>
      </div>
    </div>
  );
}

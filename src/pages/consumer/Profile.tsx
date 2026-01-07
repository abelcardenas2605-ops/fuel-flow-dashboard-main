import React, { useState, useEffect } from 'react';
import { ConsumerLayout } from '@/components/layout/ConsumerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Mail,
  Phone,
  Car,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Shield,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });

  // Vehicles State
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);

  // New Vehicle Form
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    type: 'CAR',
    tankCapacity: '',
  });

  // Fetch Vehicles
  useEffect(() => {
    fetchVehicles();
  }, [user]);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleCreateVehicle = async () => {
    if (!newVehicle.plate || !newVehicle.tankCapacity) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plate: newVehicle.plate,
          type: newVehicle.type,
          tankCapacity: parseFloat(newVehicle.tankCapacity)
        })
      });

      if (response.ok) {
        setIsAddingVehicle(false);
        setNewVehicle({ plate: '', type: 'CAR', tankCapacity: '' });
        fetchVehicles(); // Refresh list
      }
    } catch (error) {
      console.error('Error creating vehicle:', error);
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este vehículo?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/vehicles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        // Update local session? ideally reload or update context
        setIsEditing(false);
        // For MVP simple reload to refresh context
        window.location.reload();
      }
    } catch (e) {
      console.error("Failed to update profile", e);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/users/${user?.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Logout
      window.location.href = '/';
    } catch (e) {
      console.error("Failed to delete account", e);
    }
  };

  return (
    <ConsumerLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-subtitle">Administra tu información personal y vehículos</p>
        </div>

        {/* Profile Info Card */}
        <div className="card-elevated p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isEditing ? 'outline' : 'secondary'}
                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </>
                )}
              </Button>
              {isEditing && (
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Cuenta
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 pt-6 border-t border-border">
              <Button variant="gradient" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          )}
        </div>

        {/* Vehicles Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mis Vehículos</h2>

            <Dialog open={isAddingVehicle} onOpenChange={setIsAddingVehicle}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Vehículo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Vehículo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Placa / Matrícula</Label>
                    <Input
                      placeholder="A000000"
                      value={newVehicle.plate}
                      onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={newVehicle.type}
                      onValueChange={(val) => setNewVehicle({ ...newVehicle, type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAR">Carro</SelectItem>
                        <SelectItem value="MOTORCYCLE">Moto</SelectItem>
                        <SelectItem value="TRUCK">Camión</SelectItem>
                        <SelectItem value="BUS">Autobús</SelectItem>
                        <SelectItem value="OTHER">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Capacidad Tanque (Galones/Litros)</Label>
                    <Input
                      type="number"
                      placeholder="15"
                      value={newVehicle.tankCapacity}
                      onChange={(e) => setNewVehicle({ ...newVehicle, tankCapacity: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingVehicle(false)}>Cancelar</Button>
                  <Button variant="gradient" onClick={handleCreateVehicle}>Guardar Vehículo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>

          {loadingVehicles ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
          ) : vehicles.length === 0 ? (
            <div className="card-elevated p-8 text-center text-muted-foreground">
              No tienes vehículos registrados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="card-elevated p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Car className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{vehicle.plate}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge-status badge-info capitalize">
                            {vehicle.type.toLowerCase()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {vehicle.tankCapacity} L/Gal
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ConsumerLayout>
  );
}

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  User,
  Mail,
  MoreVertical,
  UserCheck,
  UserX,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

// Removed CASHIER as requested
const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  CONSUMER: 'Usuario Final',
};

const roleColors: Record<string, string> = {
  ADMIN: 'bg-primary/10 text-primary',
  SUPERVISOR: 'bg-accent/10 text-accent',
  CONSUMER: 'bg-muted text-muted-foreground',
};

export default function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CONSUMER',
    employeeId: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: "Usuario eliminado" });
        fetchUsers();
      } else {
        toast({ title: "Error al eliminar", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't fill password
      role: user.role,
      employeeId: user.employeeId || ''
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'CONSUMER', employeeId: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingUser
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/users/${editingUser.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/register`; // Or a dedicated create user endpoint if dealing with non-auth specific logic

      // For editing we use PATCH, for creating we use POST to register (or create user)
      // Note: The User.create endpoint we saw earlier was likely auth/register. Ideally Admin creates users via users endpoint if pure CRUD.
      // But let's assume register logic is fine or use the create logic if exposed.
      // Actually earlier 'UsersService.create' was used by Auth. Let's try to use auth/register for new to ensure password hashing if backend hasn't exposed a direct Create User.
      // WAIT: UsersController doesn't have create. So we use auth/register for new users.

      const method = editingUser ? 'PATCH' : 'POST';
      const finalUrl = editingUser ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/users/${editingUser.id}` : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/register`;

      const body: any = { ...formData };
      if (!body.password && editingUser) delete body.password; // Don't send empty password on edit

      const res = await fetch(finalUrl, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast({ title: editingUser ? "Usuario actualizado" : "Usuario creado" });
        setShowModal(false);
        fetchUsers();
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="space-y-8 animate-fade-in relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Gestión de Usuarios</h1>
            <p className="page-subtitle">Administra usuarios y asigna roles</p>
          </div>
          <Button variant="gradient" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Modal Overlay */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Correo Electrónico</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{editingUser ? 'Contraseña (Opcional)' : 'Contraseña'}</Label>
                  <Input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? "Dejar en blanco para mantener actual" : ""}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="CONSUMER">Usuario Final</option>
                      <option value="ADMIN">Administrador</option>
                      <option value="SUPERVISOR">Supervisor</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>ID Empleado (Opcional)</Label>
                    <Input
                      value={formData.employeeId}
                      onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="gradient">
                    Guardar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <User className="w-4 h-4" />
              <span className="text-sm">Total</span>
            </div>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <UserCheck className="w-4 h-4" />
              <span className="text-sm">Activos</span>
            </div>
            <p className="text-2xl font-bold text-success">
              {users.length}
            </p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Admins</span>
            </div>
            <p className="text-2xl font-bold">
              {users.filter(u => u.role === 'ADMIN').length}
            </p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <UserX className="w-4 h-4" />
              <span className="text-sm">Inactivos</span>
            </div>
            <p className="text-2xl font-bold text-muted-foreground">
              0
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="card-elevated p-5 card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rol</span>
                  <span className={cn('badge-status', roleColors[user.role] || roleColors['CONSUMER'])}>
                    {roleLabels[user.role] || user.role}
                  </span>
                </div>
                {user.employeeId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ID Empleado</span>
                    <span className="text-sm font-medium">{user.employeeId}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Registrado</span>
                  <span className="text-sm">{formatDate(user.createdAt)}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => handleEdit(user)}>
                  <Edit2 className="w-3 h-3" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1 text-destructive hover:text-destructive" onClick={() => handleDelete(user.id)}>
                  <Trash2 className="w-3 h-3" />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

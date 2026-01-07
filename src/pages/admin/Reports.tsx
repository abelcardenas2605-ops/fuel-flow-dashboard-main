import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Download,
  Calendar,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Fuel,
  Users,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reports() {
  const [dateRange, setDateRange] = useState('week');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [dateRange]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      // ideally filter by dateRange in query params
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalSales = transactions.reduce((acc, t) => acc + Number(t.totalAmount), 0);
    const totalCount = transactions.length;
    const avgTicket = totalCount > 0 ? totalSales / totalCount : 0;

    // Simple aggregation for charts (mock logic replacement)
    const salesByFuel = transactions.reduce((acc: any, t) => {
      const type = t.fuelType?.name || 'Unknown';
      acc[type] = (acc[type] || 0) + Number(t.totalAmount);
      return acc;
    }, {});

    const pieData = Object.keys(salesByFuel).map((key, index) => ({
      name: key,
      value: salesByFuel[key],
      color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]
    }));

    return { totalSales, totalCount, avgTicket, pieData };
  };

  const { totalSales, totalCount, avgTicket, pieData } = calculateStats();

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Ventas - GasAdmin", 20, 10);

    const tableData = transactions.map(t => [
      new Date(t.timestamp).toLocaleDateString(),
      t.fuelType?.name,
      `${Number(t.volume).toFixed(2)} L`,
      `$${Number(t.totalAmount).toFixed(2)}`,
      t.paymentMethod
    ]);

    autoTable(doc, {
      head: [['Fecha', 'Combustible', 'Volumen', 'Monto', 'Pago']],
      body: tableData,
    });

    doc.save("reporte_ventas.pdf");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
      ID: t.id,
      Fecha: new Date(t.timestamp).toLocaleString(),
      Combustible: t.fuelType?.name,
      Volumen: t.volume,
      PrecioUnitario: t.pricePerUnit,
      Total: t.totalAmount,
      MetodoPago: t.paymentMethod,
      Estado: t.status
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");
    XLSX.writeFile(workbook, "reporte_ventas.xlsx");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
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
            <h1 className="page-title">Reportes</h1>
            <p className="page-subtitle">Análisis detallado de ventas y operaciones</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExportExcel}>
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
              <FileText className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'day', label: 'Hoy' },
            { id: 'week', label: 'Esta Semana' },
            { id: 'month', label: 'Este Mes' },
            { id: 'custom', label: 'Personalizado' },
          ].map((option) => (
            <Button
              key={option.id}
              variant={dateRange === option.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(option.id)}
            >
              {option.id === 'custom' && <Calendar className="w-4 h-4 mr-2" />}
              {option.label}
            </Button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Ventas Totales</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
            <p className="text-sm text-foreground mt-1">En el periodo seleccionado</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Transacciones</span>
            </div>
            <p className="text-2xl font-bold">{totalCount.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Fuel className="w-4 h-4" />
              <span className="text-sm">Ticket Promedio</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(avgTicket)}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Clientes</span>
            </div>
            <p className="text-2xl font-bold">--</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Placeholder for Bar Chart - Implementation complex without real daily aggregation logic on backend */}
          <div className="card-elevated p-6 flex flex-col items-center justify-center text-center">
            <h2 className="text-lg font-semibold mb-2">Detalle Temporal</h2>
            <p className="text-muted-foreground">Gráficos detallados disponibles en próxima versión</p>
          </div>


          {/* Sales by Fuel Type */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold mb-6">Ventas por Tipo de Combustible</h2>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

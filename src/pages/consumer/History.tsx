import React, { useState, useEffect } from 'react';
import { ConsumerLayout } from '@/components/layout/ConsumerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Download,
  Search,
  Calendar,
  Filter,
  FileText,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { Fuel, Transaction } from '@/types';

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/transactions/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTransactions(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.fuelType?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.totalAmount.toString().includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ["Fecha", "Combustible", "Litros", "Total", "Estación"];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.timestamp).toLocaleString(),
      tx.fuelType?.name || 'N/A',
      tx.volume,
      tx.totalAmount,
      "Estación Principal"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historial_transacciones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Simple print for MVP, can be enhanced with jsPDF
    window.print();
  };

  return (
    <ConsumerLayout>
      <div className="space-y-8 animate-fade-in print:p-0">
        <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="page-title">Historial de Transacciones</h1>
            <p className="page-subtitle">Revisa tus consumos y facturas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4 flex flex-col sm:flex-row gap-4 print:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por combustible o monto..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Filtrar por fecha
          </Button>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          {loading ? (
            <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Combustible</TableHead>
                    <TableHead>Litros</TableHead>
                    <TableHead>Precio/L</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="print:hidden">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center p-8 text-muted-foreground">
                        No se encontraron transacciones.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{formatDate(tx.timestamp)}</span>
                            <span className="text-xs text-muted-foreground md:hidden">
                              {tx.fuelType?.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="badge-fuel badge-fuel-regular">
                            {tx.fuelType?.name || 'Desconocido'}
                          </span>
                        </TableCell>
                        <TableCell>{parseFloat(tx.volume).toFixed(2)} L</TableCell>
                        <TableCell>{formatCurrency(parseFloat(tx.pricePerUnit))}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(parseFloat(tx.totalAmount))}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completado
                          </span>
                        </TableCell>
                        <TableCell className="print:hidden">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </ConsumerLayout>
  );
}

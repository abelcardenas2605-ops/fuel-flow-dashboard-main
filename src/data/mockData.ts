import { Fuel, Transaction, Vehicle, ConsumerStats, DashboardStats, CashRegister } from '@/types';

export const fuels: Fuel[] = [
  {
    id: '1',
    type: 'regular',
    name: 'Gasolina Regular',
    pricePerLiter: 22.85,
    available: true,
    stockLevel: 78,
    lastUpdated: new Date('2024-01-06'),
  },
  {
    id: '2',
    type: 'premium',
    name: 'Gasolina Premium',
    pricePerLiter: 24.52,
    available: true,
    stockLevel: 65,
    lastUpdated: new Date('2024-01-06'),
  },
  {
    id: '3',
    type: 'diesel',
    name: 'Diesel',
    pricePerLiter: 23.98,
    available: true,
    stockLevel: 15,
    lastUpdated: new Date('2024-01-06'),
  },
];

export const vehicles: Vehicle[] = [
  {
    id: '1',
    userId: '1',
    plate: 'ABC-123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    fuelType: 'regular',
  },
  {
    id: '2',
    userId: '1',
    plate: 'XYZ-789',
    brand: 'Honda',
    model: 'Civic',
    year: 2023,
    fuelType: 'premium',
  },
];

export const transactions: Transaction[] = [
  {
    id: '1',
    userId: '1',
    vehicleId: '1',
    fuelType: 'regular',
    liters: 45.5,
    totalAmount: 1039.67,
    paymentMethod: 'card',
    status: 'completed',
    date: new Date('2024-01-06T14:30:00'),
    receiptNumber: 'REC-2024-0001',
  },
  {
    id: '2',
    userId: '1',
    vehicleId: '2',
    fuelType: 'premium',
    liters: 38.2,
    totalAmount: 936.66,
    paymentMethod: 'qr',
    status: 'completed',
    date: new Date('2024-01-05T09:15:00'),
    receiptNumber: 'REC-2024-0002',
  },
  {
    id: '3',
    userId: '1',
    vehicleId: '1',
    fuelType: 'regular',
    liters: 50.0,
    totalAmount: 1142.50,
    paymentMethod: 'wallet',
    status: 'completed',
    date: new Date('2024-01-03T18:45:00'),
    receiptNumber: 'REC-2024-0003',
  },
  {
    id: '4',
    userId: '1',
    vehicleId: '1',
    fuelType: 'regular',
    liters: 42.3,
    totalAmount: 966.56,
    paymentMethod: 'cash',
    status: 'completed',
    date: new Date('2024-01-01T11:20:00'),
    receiptNumber: 'REC-2024-0004',
  },
  {
    id: '5',
    userId: '2',
    fuelType: 'diesel',
    liters: 80.0,
    totalAmount: 1918.40,
    paymentMethod: 'card',
    status: 'pending',
    date: new Date('2024-01-06T16:00:00'),
    receiptNumber: 'REC-2024-0005',
  },
];

export const consumerStats: ConsumerStats = {
  lastConsumption: {
    date: new Date('2024-01-06T14:30:00'),
    liters: 45.5,
    fuelType: 'regular',
    amount: 1039.67,
  },
  monthlySpend: 4085.39,
  favoritesFuel: 'regular',
  totalTransactions: 24,
};

export const adminStats: DashboardStats = {
  todaySales: 45678.50,
  totalTransactions: 156,
  avgTicket: 292.80,
  topFuel: 'regular',
  pendingPayments: 3,
  lowStockAlerts: 1,
};

export const cashRegister: CashRegister = {
  id: '1',
  cashierId: '3',
  openingAmount: 5000,
  currentAmount: 18450.75,
  status: 'open',
  openedAt: new Date('2024-01-06T06:00:00'),
  shift: 'morning',
};

export const recentSales = [
  { time: '16:45', fuel: 'Regular', liters: 35.5, amount: 811.17, method: 'Tarjeta' },
  { time: '16:32', fuel: 'Premium', liters: 42.0, amount: 1029.84, method: 'Efectivo' },
  { time: '16:18', fuel: 'Diesel', liters: 60.0, amount: 1438.80, method: 'QR' },
  { time: '16:05', fuel: 'Regular', liters: 28.3, amount: 646.66, method: 'Tarjeta' },
  { time: '15:52', fuel: 'Premium', liters: 45.0, amount: 1103.40, method: 'Billetera' },
];

export const weeklyData = [
  { day: 'Lun', ventas: 42500, transacciones: 145 },
  { day: 'Mar', ventas: 38200, transacciones: 132 },
  { day: 'Mié', ventas: 45800, transacciones: 158 },
  { day: 'Jue', ventas: 41300, transacciones: 142 },
  { day: 'Vie', ventas: 52100, transacciones: 178 },
  { day: 'Sáb', ventas: 48900, transacciones: 168 },
  { day: 'Dom', ventas: 35600, transacciones: 122 },
];

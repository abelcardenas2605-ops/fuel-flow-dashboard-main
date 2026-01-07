export type UserRole = 'consumer' | 'admin' | 'cashier' | 'supervisor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
}

export interface Vehicle {
  id: string;
  userId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  fuelType: FuelType;
}

export type FuelType = 'regular' | 'premium' | 'diesel';

export interface Fuel {
  id: string;
  type: FuelType;
  name: string;
  pricePerLiter: number;
  available: boolean;
  stockLevel: number;
  lastUpdated: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  vehicleId?: string;
  fuelType: FuelType;
  liters: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  date: Date;
  receiptNumber: string;
}

export type PaymentMethod = 'cash' | 'card' | 'qr' | 'wallet';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface CashRegister {
  id: string;
  cashierId: string;
  openingAmount: number;
  currentAmount: number;
  closingAmount?: number;
  status: 'open' | 'closed';
  openedAt: Date;
  closedAt?: Date;
  shift: 'morning' | 'afternoon' | 'night';
}

export interface DashboardStats {
  todaySales: number;
  totalTransactions: number;
  avgTicket: number;
  topFuel: FuelType;
  pendingPayments: number;
  lowStockAlerts: number;
}

export interface ConsumerStats {
  lastConsumption: {
    date: Date;
    liters: number;
    fuelType: FuelType;
    amount: number;
  };
  monthlySpend: number;
  favoritesFuel: FuelType;
  totalTransactions: number;
}

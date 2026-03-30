export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: MedicineCategory;
  manufacturer: string;
  unitPrice: number;
  reorderLevel: number;
  totalStock: number;
  batches: Batch[];
}

export type MedicineCategory = 'tablet' | 'syrup' | 'injection' | 'capsule' | 'cream' | 'drops' | 'inhaler' | 'powder';

export interface Batch {
  id: string;
  medicineId: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  purchaseDate: string;
  costPrice: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  gstNumber: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  netAmount: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  createdAt: string;
}

export interface SaleItem {
  id: string;
  medicineId: string;
  medicineName: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  items: PurchaseItem[];
  totalAmount: number;
  purchaseDate: string;
}

export interface PurchaseItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  costPrice: number;
  batchNumber: string;
  expiryDate: string;
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'expiring_soon' | 'expired';
  message: string;
  medicineName: string;
  severity: 'warning' | 'critical';
  createdAt: string;
  read: boolean;
}

export interface DashboardStats {
  totalMedicines: number;
  lowStockCount: number;
  expiringCount: number;
  expiredCount: number;
  todaySales: number;
  monthlyRevenue: number;
}

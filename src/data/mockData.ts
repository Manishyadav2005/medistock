import { Medicine, Supplier, Sale, Alert, DashboardStats } from '@/types/pharmacy';

const today = new Date();
const daysFromNow = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};
const daysAgo = (days: number) => daysFromNow(-days);

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'MedPharma Distributors', contact: '+91 98765 43210', email: 'orders@medpharma.com', address: '123 Pharma Lane, Mumbai', gstNumber: '27AABCU9603R1ZM' },
  { id: 's2', name: 'HealthLine Supplies', contact: '+91 87654 32109', email: 'sales@healthline.com', address: '45 Health St, Delhi', gstNumber: '07AABCU9603R1ZP' },
  { id: 's3', name: 'CureAll Wholesale', contact: '+91 76543 21098', email: 'info@cureall.com', address: '78 Cure Rd, Bangalore', gstNumber: '29AABCU9603R1ZK' },
];

export const mockMedicines: Medicine[] = [
  {
    id: 'm1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'tablet',
    manufacturer: 'Cipla', unitPrice: 2.5, reorderLevel: 100, totalStock: 450,
    batches: [
      { id: 'b1', medicineId: 'm1', batchNumber: 'PCM-2024-001', quantity: 200, expiryDate: daysFromNow(180), purchaseDate: daysAgo(30), costPrice: 1.8, supplierId: 's1' },
      { id: 'b2', medicineId: 'm1', batchNumber: 'PCM-2024-002', quantity: 250, expiryDate: daysFromNow(365), purchaseDate: daysAgo(10), costPrice: 1.9, supplierId: 's1' },
    ],
  },
  {
    id: 'm2', name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'capsule',
    manufacturer: 'Sun Pharma', unitPrice: 8.0, reorderLevel: 50, totalStock: 35,
    batches: [
      { id: 'b3', medicineId: 'm2', batchNumber: 'AMX-2024-001', quantity: 35, expiryDate: daysFromNow(90), purchaseDate: daysAgo(60), costPrice: 5.5, supplierId: 's2' },
    ],
  },
  {
    id: 'm3', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCL', category: 'tablet',
    manufacturer: 'Dr Reddys', unitPrice: 3.0, reorderLevel: 80, totalStock: 320,
    batches: [
      { id: 'b4', medicineId: 'm3', batchNumber: 'CTZ-2024-001', quantity: 320, expiryDate: daysFromNow(270), purchaseDate: daysAgo(45), costPrice: 2.0, supplierId: 's1' },
    ],
  },
  {
    id: 'm4', name: 'Cough Syrup DX', genericName: 'Dextromethorphan', category: 'syrup',
    manufacturer: 'Mankind', unitPrice: 65.0, reorderLevel: 30, totalStock: 12,
    batches: [
      { id: 'b5', medicineId: 'm4', batchNumber: 'CSX-2024-001', quantity: 12, expiryDate: daysFromNow(5), purchaseDate: daysAgo(90), costPrice: 42.0, supplierId: 's3' },
    ],
  },
  {
    id: 'm5', name: 'Insulin Glargine', genericName: 'Insulin Glargine', category: 'injection',
    manufacturer: 'Novo Nordisk', unitPrice: 850.0, reorderLevel: 10, totalStock: 25,
    batches: [
      { id: 'b6', medicineId: 'm5', batchNumber: 'INS-2024-001', quantity: 25, expiryDate: daysFromNow(120), purchaseDate: daysAgo(20), costPrice: 650.0, supplierId: 's2' },
    ],
  },
  {
    id: 'm6', name: 'Betadine Cream', genericName: 'Povidone Iodine', category: 'cream',
    manufacturer: 'Win Medicare', unitPrice: 45.0, reorderLevel: 20, totalStock: 8,
    batches: [
      { id: 'b7', medicineId: 'm6', batchNumber: 'BTC-2023-001', quantity: 8, expiryDate: daysAgo(5), purchaseDate: daysAgo(200), costPrice: 30.0, supplierId: 's3' },
    ],
  },
  {
    id: 'm7', name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'tablet',
    manufacturer: 'Cipla', unitPrice: 15.0, reorderLevel: 40, totalStock: 180,
    batches: [
      { id: 'b8', medicineId: 'm7', batchNumber: 'AZT-2024-001', quantity: 180, expiryDate: daysFromNow(300), purchaseDate: daysAgo(15), costPrice: 10.0, supplierId: 's1' },
    ],
  },
  {
    id: 'm8', name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'capsule',
    manufacturer: 'Lupin', unitPrice: 5.0, reorderLevel: 60, totalStock: 55,
    batches: [
      { id: 'b9', medicineId: 'm8', batchNumber: 'OMP-2024-001', quantity: 55, expiryDate: daysFromNow(25), purchaseDate: daysAgo(50), costPrice: 3.2, supplierId: 's2' },
    ],
  },
];

export const mockSales: Sale[] = [
  {
    id: 'sl1', invoiceNumber: 'INV-2024-0001', customerName: 'Rajesh Kumar', customerPhone: '9876543210',
    items: [
      { id: 'si1', medicineId: 'm1', medicineName: 'Paracetamol 500mg', batchId: 'b1', quantity: 10, unitPrice: 2.5, total: 25 },
      { id: 'si2', medicineId: 'm3', medicineName: 'Cetirizine 10mg', batchId: 'b4', quantity: 5, unitPrice: 3.0, total: 15 },
    ],
    totalAmount: 40, discount: 2, netAmount: 38, paymentMethod: 'cash', createdAt: daysAgo(0),
  },
  {
    id: 'sl2', invoiceNumber: 'INV-2024-0002', customerName: 'Priya Sharma', customerPhone: '8765432109',
    items: [
      { id: 'si3', medicineId: 'm5', medicineName: 'Insulin Glargine', batchId: 'b6', quantity: 1, unitPrice: 850, total: 850 },
    ],
    totalAmount: 850, discount: 0, netAmount: 850, paymentMethod: 'card', createdAt: daysAgo(1),
  },
  {
    id: 'sl3', invoiceNumber: 'INV-2024-0003', customerName: 'Amit Patel', customerPhone: '7654321098',
    items: [
      { id: 'si4', medicineId: 'm7', medicineName: 'Azithromycin 500mg', batchId: 'b8', quantity: 6, unitPrice: 15, total: 90 },
      { id: 'si5', medicineId: 'm8', medicineName: 'Omeprazole 20mg', batchId: 'b9', quantity: 10, unitPrice: 5, total: 50 },
    ],
    totalAmount: 140, discount: 5, netAmount: 135, paymentMethod: 'upi', createdAt: daysAgo(2),
  },
];

export const mockAlerts: Alert[] = [
  { id: 'a1', type: 'expired', message: 'Betadine Cream (BTC-2023-001) has expired', medicineName: 'Betadine Cream', severity: 'critical', createdAt: daysAgo(0), read: false },
  { id: 'a2', type: 'expiring_soon', message: 'Cough Syrup DX (CSX-2024-001) expires in 5 days', medicineName: 'Cough Syrup DX', severity: 'critical', createdAt: daysAgo(0), read: false },
  { id: 'a3', type: 'low_stock', message: 'Amoxicillin 250mg stock is below reorder level (35/50)', medicineName: 'Amoxicillin 250mg', severity: 'warning', createdAt: daysAgo(1), read: false },
  { id: 'a4', type: 'low_stock', message: 'Cough Syrup DX stock is below reorder level (12/30)', medicineName: 'Cough Syrup DX', severity: 'warning', createdAt: daysAgo(1), read: true },
  { id: 'a5', type: 'expiring_soon', message: 'Omeprazole 20mg (OMP-2024-001) expires in 25 days', medicineName: 'Omeprazole 20mg', severity: 'warning', createdAt: daysAgo(2), read: true },
  { id: 'a6', type: 'low_stock', message: 'Betadine Cream stock is below reorder level (8/20)', medicineName: 'Betadine Cream', severity: 'warning', createdAt: daysAgo(3), read: true },
];

export const mockDashboardStats: DashboardStats = {
  totalMedicines: 8,
  lowStockCount: 3,
  expiringCount: 2,
  expiredCount: 1,
  todaySales: 38,
  monthlyRevenue: 4250,
};

export const salesChartData = [
  { name: 'Mon', sales: 1200 },
  { name: 'Tue', sales: 980 },
  { name: 'Wed', sales: 1450 },
  { name: 'Thu', sales: 870 },
  { name: 'Fri', sales: 1680 },
  { name: 'Sat', sales: 2100 },
  { name: 'Sun', sales: 750 },
];

export const categoryDistribution = [
  { name: 'Tablets', value: 3, fill: 'hsl(168, 70%, 34%)' },
  { name: 'Capsules', value: 2, fill: 'hsl(38, 92%, 55%)' },
  { name: 'Syrup', value: 1, fill: 'hsl(210, 80%, 55%)' },
  { name: 'Injection', value: 1, fill: 'hsl(142, 71%, 45%)' },
  { name: 'Cream', value: 1, fill: 'hsl(0, 72%, 51%)' },
];

export const monthlyRevenueData = [
  { month: 'Jan', revenue: 32000 },
  { month: 'Feb', revenue: 28000 },
  { month: 'Mar', revenue: 35000 },
  { month: 'Apr', revenue: 42000 },
  { month: 'May', revenue: 38000 },
  { month: 'Jun', revenue: 45000 },
];

export const topSellingMedicines = [
  { name: 'Paracetamol 500mg', units: 1250 },
  { name: 'Cetirizine 10mg', units: 890 },
  { name: 'Azithromycin 500mg', units: 650 },
  { name: 'Omeprazole 20mg', units: 520 },
  { name: 'Amoxicillin 250mg', units: 380 },
];

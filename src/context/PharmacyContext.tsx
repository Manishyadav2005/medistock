import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Medicine, Supplier, Sale, Alert, DashboardStats } from '@/types/pharmacy';
import { supabase } from '@/integrations/supabase/client';
import { Batch } from '@/types/pharmacy';

interface PharmacyContextType {
  medicines: Medicine[];
  setMedicines: React.Dispatch<React.SetStateAction<Medicine[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  addMedicine: (medicine: Medicine) => Promise<void>;
  updateMedicine: (medicine: Medicine) => void;
  deleteMedicine: (id: string) => Promise<void>;
 addBatch: (batch: Batch) => Promise<void>;
 addSupplier: (supplier: Supplier) => Promise<void>;
 deleteSupplier: (id: string) => Promise<void>;
 updateSupplier: (supplier: Supplier) => Promise<void>;
 addSale: (sale: Sale) => Promise<void>;
 getDashboardStats: () => DashboardStats;
}

const PharmacyContext = createContext<PharmacyContextType | null>(null);

export const PharmacyProvider = ({ children }: { children: ReactNode }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  // 🟢 FETCH SUPPLIERS
const fetchSuppliers = async () => {
  const { data, error } = await supabase.from('suppliers').select('*');

  if (error) {
    console.error('Supplier fetch error:', error);
    return;
  }

  if (data) {
    setSuppliers(
      data.map((item: any) => ({
        id: item.id,
        name: item.name,
        contact: item.contact,
        email: item.email,
        address: item.address,
        gstNumber: item.gst_number,
      }))
    );
  }
};

  // 🔥 COMMON FETCH FUNCTION
  const fetchMedicines = async () => {
const { data, error } = await supabase
  .from('medicines')
  .select(`
    *,
    batches (*)
  `)
  .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      return;
    }

    if (data) {
      setMedicines(
        data.map((item: any) => ({
          id: item.id,
          name: item.name,
          genericName: item.generic_name,
          category: item.category,
          manufacturer: item.manufacturer,
          unitPrice: item.unit_price,
          reorderLevel: item.reorder_level,
          totalStock: item.total_stock,
        batches: (item.batches || []).map((b: any) => ({
  id: b.id,
  medicineId: b.medicine_id,
  batchNumber: b.batch_number,
  quantity: b.quantity,
  expiryDate: b.expiry_date,
  purchaseDate: b.purchase_date,
  costPrice: b.cost_price,
  supplierId: b.supplier_id,
})), 
        }))
      );
    }
  };

  // 🟢 INITIAL LOAD + REALTIME
  useEffect(() => {
    fetchMedicines();
    fetchSuppliers();
    generateAlerts();

    const channel = supabase
      .channel('medicines-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medicines',
        },
        () => {
          fetchMedicines(); // 🔥 auto update
        }
      )
      .on(
  'postgres_changes',
  {
    event: '*',
    schema: 'public',
    table: 'batches',
  },
  () => {
    fetchMedicines(); // 🔥 batches bhi update
  }
)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🟢 ADD MEDICINE
  const addMedicine = async (medicine: Medicine) => {
    try {
      const { error } = await supabase.from('medicines').insert([
        {
          id: medicine.id,
          name: medicine.name,
          generic_name: medicine.genericName,
          category: medicine.category,
          manufacturer: medicine.manufacturer,
          unit_price: medicine.unitPrice,
          reorder_level: medicine.reorderLevel,
          total_stock: medicine.totalStock,
        },
      ]);

      if (error) throw error;
      // 🔥 INSTANT UI UPDATE
setMedicines((prev) => [
  
  {
    ...medicine,
    batches: [],
  },
  ...prev,
]);
      // ❌ no refetch (realtime karega)
    } catch (err) {
      console.error('Add failed:', err);
    }
  };

const deleteSupplier = async (id: string) => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setSuppliers(prev => prev.filter(s => s.id !== id));

  } catch (err) {
    console.error('Delete supplier failed:', err);
  }
};

const updateSupplier = async (supplier: Supplier) => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .update({
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email,
        address: supplier.address,
        gst_number: supplier.gstNumber,
      })
      .eq('id', supplier.id);

    if (error) throw error;

    // 🔥 UI update
    setSuppliers(prev =>
      prev.map(s => (s.id === supplier.id ? supplier : s))
    );

  } catch (err) {
    console.error('Update supplier failed:', err);
  }
};

  // 🟢 UPDATE (UI only)
  const updateMedicine = (updatedMedicine: Medicine) => {
    setMedicines((prev) =>
      prev.map((med) =>
        med.id === updatedMedicine.id ? updatedMedicine : med
      )
    );
  };

  // 🟢 DELETE MEDICINE
  const deleteMedicine = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMedicines(prev => prev.filter(m => m.id !== id));

      setAlerts((prev) =>
        prev.filter((alert) => !alert.message.includes(id))
      );

      // ❌ no refetch (realtime karega)
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const addSupplier = async (supplier: Supplier) => {
  try {
    const { error } = await supabase.from('suppliers').insert([
      {
        id: supplier.id,
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email,
        address: supplier.address,
        gst_number: supplier.gstNumber,
      },
    ]);

    if (error) throw error;

    // 🔥 INSTANT UI UPDATE
    setSuppliers((prev) => [supplier, ...prev]);

  } catch (err) {
    console.error('Supplier add failed:', err);
  }
};

  // 🟢 ADD BATCH (🔥 REAL LOGIC)
const addBatch = async (batch: Batch) => {
  try {
    // 1. Insert batch
    const { error } = await supabase.from('batches').insert([
      {
        id: batch.id,
        medicine_id: batch.medicineId,
        batch_number: batch.batchNumber,
        quantity: batch.quantity,
        expiry_date: batch.expiryDate,
        purchase_date: batch.purchaseDate,
        cost_price: batch.costPrice,
        supplier_id: batch.supplierId,
      },
    ]);

    if (error) throw error;

    // 2. Get all batches of that medicine
    const { data: allBatches } = await supabase
      .from('batches')
      .select('*')
      .eq('medicine_id', batch.medicineId);

    const totalStock =
      allBatches?.reduce((sum, b) => sum + b.quantity, 0) || 0;

    // 3. Update stock in DB
    await supabase
      .from('medicines')
      .update({ total_stock: totalStock })
      .eq('id', batch.medicineId);

    // 4. 🔥 UPDATE UI (NO REFRESH NEEDED)
    setMedicines((prev) =>
      prev.map((med) =>
        med.id === batch.medicineId
          ? {
              ...med,
              totalStock,
              batches: [
                ...med.batches,
                {
                  ...batch,
                },
              ],
            }
          : med
      )
    );

  } catch (err) {
    console.error('Batch add failed:', err);
  }
};

const addSale = async (sale: Sale) => {
  try {
    // 1. Insert sale
    const { error } = await supabase.from('sales').insert([sale]);

    if (error) throw error;

    // 2. 🔥 UI update
    setSales(prev => [sale, ...prev]);

    // 3. 🔥 STOCK DEDUCTION (FIFO)
    for (const item of sale.items) {
      let remaining = item.quantity;

      // get batches sorted by expiry (FIFO)
      const { data: batches } = await supabase
        .from('batches')
        .select('*')
        .eq('medicine_id', item.medicineId)
        .order('expiry_date', { ascending: true });

      if (!batches) continue;

      for (const b of batches) {
        if (remaining <= 0) break;

        const deduct = Math.min(b.quantity, remaining);
        remaining -= deduct;

        await supabase
          .from('batches')
          .update({ quantity: b.quantity - deduct })
          .eq('id', b.id);
      }

      // 🔥 recalculate stock
      const { data: updatedBatches } = await supabase
        .from('batches')
        .select('*')
        .eq('medicine_id', item.medicineId);

      const totalStock =
        updatedBatches?.reduce((sum, b) => sum + b.quantity, 0) || 0;

      await supabase
        .from('medicines')
        .update({ total_stock: totalStock })
        .eq('id', item.medicineId);
    }

  } catch (err) {
    console.error('Sale failed:', err);
  }
};

const generateAlerts = () => {
  const newAlerts: Alert[] = [];

  medicines.forEach((med) => {
    // 🔴 LOW STOCK
    if (med.totalStock <= med.reorderLevel) {
      newAlerts.push({
        id: `low-${med.id}`,
        type: 'low_stock',
        message: `${med.name} is low on stock`,
        medicineName: med.name,
        severity: 'warning',
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    // 🔴 EXPIRY CHECK
    med.batches.forEach((batch) => {
      const today = new Date();
      const expiry = new Date(batch.expiryDate);

      const diffDays =
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays < 0) {
        // expired
        newAlerts.push({
          id: `exp-${batch.id}`,
          type: 'expired',
          message: `${med.name} batch expired`,
          medicineName: med.name,
          severity: 'critical',
          createdAt: new Date().toISOString(),
          read: false,
        });
      } else if (diffDays <= 7) {
        // expiring soon
        newAlerts.push({
          id: `soon-${batch.id}`,
          type: 'expiring_soon',
          message: `${med.name} expiring soon`,
          medicineName: med.name,
          severity: 'warning',
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
    });
  });

  setAlerts(newAlerts);
};

const getDashboardStats = () => {
  const today = new Date().toISOString().split('T')[0];

  // 🟢 TOTAL MEDICINES
  const totalMedicines = medicines.length;

  // 🔴 LOW STOCK
  const lowStockCount = medicines.filter(
    (m) => m.totalStock <= m.reorderLevel
  ).length;

  // 🔴 EXPIRY
  let expiringCount = 0;
  let expiredCount = 0;

  medicines.forEach((med) => {
    med.batches.forEach((batch) => {
      const todayDate = new Date();
      const expiry = new Date(batch.expiryDate);

      const diffDays =
        (expiry.getTime() - todayDate.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diffDays < 0) expiredCount++;
      else if (diffDays <= 7) expiringCount++;
    });
  });

  // 💰 SALES
  const todaySales = sales
    .filter((s) => s.createdAt === today)
    .reduce((sum, s) => sum + s.netAmount, 0);

  const currentMonth = new Date().getMonth();

  const monthlyRevenue = sales
    .filter((s) => new Date(s.createdAt).getMonth() === currentMonth)
    .reduce((sum, s) => sum + s.netAmount, 0);

  return {
    totalMedicines,
    lowStockCount,
    expiringCount,
    expiredCount,
    todaySales,
    monthlyRevenue,
  };
};

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        setMedicines,
        suppliers,
        setSuppliers,
        sales,
        setSales,
        alerts,
        setAlerts,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        addBatch,
        addSupplier,
        deleteSupplier,
        updateSupplier,
        addSale,
        getDashboardStats,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const ctx = useContext(PharmacyContext);
  if (!ctx)
    throw new Error('usePharmacy must be used within PharmacyProvider');
  return ctx;
};
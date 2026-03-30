import { useState } from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package } from 'lucide-react';
import { Batch, Medicine } from '@/types/pharmacy';

interface PurchaseRecord {
  id: string;
  supplierName: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  costPrice: number;
  expiryDate: string;
  purchaseDate: string;
}

export default function Purchases() {
  const { medicines, setMedicines, suppliers } = usePharmacy();
  const [showAdd, setShowAdd] = useState(false);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [form, setForm] = useState({ supplierId: '', medicineId: '', batchNumber: '', quantity: '', costPrice: '', expiryDate: '' });

  const handleAdd = () => {
    const supplier = suppliers.find(s => s.id === form.supplierId);
    const medicine = medicines.find(m => m.id === form.medicineId);
    if (!supplier || !medicine) return;

    const newBatch: Batch = {
      id: `b${Date.now()}`, medicineId: form.medicineId, batchNumber: form.batchNumber,
      quantity: Number(form.quantity), expiryDate: form.expiryDate,
      purchaseDate: new Date().toISOString().split('T')[0], costPrice: Number(form.costPrice), supplierId: form.supplierId,
    };

    setMedicines(prev => prev.map(m => m.id === form.medicineId ? {
      ...m, batches: [...m.batches, newBatch], totalStock: m.totalStock + Number(form.quantity),
    } : m));

    setPurchases(prev => [{
      id: `p${Date.now()}`, supplierName: supplier.name, medicineName: medicine.name,
      batchNumber: form.batchNumber, quantity: Number(form.quantity), costPrice: Number(form.costPrice),
      expiryDate: form.expiryDate, purchaseDate: new Date().toISOString().split('T')[0],
    }, ...prev]);

    setShowAdd(false);
    setForm({ supplierId: '', medicineId: '', batchNumber: '', quantity: '', costPrice: '', expiryDate: '' });
  };

  // Derive historical purchases from batches
  const allPurchases: PurchaseRecord[] = [
    ...purchases,
    ...medicines.flatMap(m => m.batches.map(b => {
      const supplier = suppliers.find(s => s.id === b.supplierId);
      return {
        id: b.id, supplierName: supplier?.name || 'Unknown', medicineName: m.name,
        batchNumber: b.batchNumber, quantity: b.quantity, costPrice: b.costPrice,
        expiryDate: b.expiryDate, purchaseDate: b.purchaseDate,
      };
    })),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header font-display">Purchases</h1>
          <p className="page-description">Record purchases and manage batches</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Record Purchase</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Record New Purchase</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Supplier</Label>
                <Select value={form.supplierId} onValueChange={v => setForm(p => ({ ...p, supplierId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Medicine</Label>
                <Select value={form.medicineId} onValueChange={v => setForm(p => ({ ...p, medicineId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select medicine" /></SelectTrigger>
                  <SelectContent>{medicines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Batch Number</Label><Input value={form.batchNumber} onChange={e => setForm(p => ({ ...p, batchNumber: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Cost Price (₹)</Label><Input type="number" value={form.costPrice} onChange={e => setForm(p => ({ ...p, costPrice: e.target.value }))} /></div>
              </div>
              <div className="grid gap-2"><Label>Expiry Date</Label><Input type="date" value={form.expiryDate} onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} /></div>
              <Button onClick={handleAdd} disabled={!form.supplierId || !form.medicineId || !form.batchNumber}>Record Purchase</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Purchase Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPurchases.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.medicineName}</TableCell>
                  <TableCell className="font-mono text-xs">{p.batchNumber}</TableCell>
                  <TableCell className="text-sm">{p.supplierName}</TableCell>
                  <TableCell className="text-right">{p.quantity}</TableCell>
                  <TableCell className="text-right">₹{p.costPrice}</TableCell>
                  <TableCell className="text-sm">{p.expiryDate}</TableCell>
                  <TableCell className="text-sm">{p.purchaseDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Medicine, MedicineCategory } from '@/types/pharmacy';
import { toast } from "sonner";

const categories: MedicineCategory[] = ['tablet', 'syrup', 'injection', 'capsule', 'cream', 'drops', 'inhaler', 'powder'];

export default function Inventory() {
const { medicines, addMedicine, deleteMedicine } = usePharmacy();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [viewMedicine, setViewMedicine] = useState<Medicine | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState({ name: '', genericName: '', category: 'tablet' as MedicineCategory, manufacturer: '', unitPrice: '', reorderLevel: '',totalStock: '' });

  const filtered = medicines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.genericName.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || m.category === catFilter;
    return matchSearch && matchCat;
  });

  const getStockStatus = (m: Medicine) => {
    const hasExpired = m.batches.some(b => new Date(b.expiryDate) < new Date());
    if (hasExpired) return { label: 'Expired', cls: 'badge-destructive' };
    if (m.totalStock <= m.reorderLevel) return { label: 'Low Stock', cls: 'badge-warning' };
    return { label: 'In Stock', cls: 'badge-success' };
  };

const handleAdd = async () => {
if (
  !form.name ||
  !form.genericName ||
  !form.unitPrice ||
  !form.reorderLevel ||
  !form.totalStock
) {
    alert("Please fill all required fields");
    return;
  }

  const newMed: Medicine = {
    id: `m-${Date.now()}`,
    name: form.name.trim(),
    genericName: form.genericName.trim(),
    category: form.category,
    manufacturer: form.manufacturer.trim(),
    unitPrice: Number(form.unitPrice),
    reorderLevel: Number(form.reorderLevel),
   totalStock: Number(form.totalStock),
    batches: [],
  };

  await addMedicine(newMed); // 🔥 DB insert
  toast.success("Medicine added successfully ✅");

  setShowAdd(false);

  setForm({
    name: '',
    genericName: '',
    category: 'tablet',
    manufacturer: '',
    unitPrice: '',
    reorderLevel: '',
    totalStock: '',
  });
};
 const handleDelete = (id: string) => {
  setDeleteId(id);
};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header font-display">Inventory</h1>
          <p className="page-description">Manage medicines and stock levels</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Add Medicine</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Add New Medicine</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Generic Name</Label><Input value={form.genericName} onChange={e => setForm(p => ({ ...p, genericName: e.target.value }))} /></div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm(p => ({ ...p, category: v as MedicineCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Manufacturer</Label><Input value={form.manufacturer} onChange={e => setForm(p => ({ ...p, manufacturer: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
  <Label>Initial Stock</Label>
  <Input
    type="number"
    value={form.totalStock}
    onChange={(e) =>
      setForm((p) => ({ ...p, totalStock: e.target.value }))
    }
  />
</div>
                <div className="grid gap-2"><Label>Unit Price (₹)</Label><Input type="number" value={form.unitPrice} onChange={e => setForm(p => ({ ...p, unitPrice: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Reorder Level</Label><Input type="number" value={form.reorderLevel} onChange={e => setForm(p => ({ ...p, reorderLevel: e.target.value }))} /></div>
              </div>
              <Button onClick={handleAdd} disabled={!form.name}>Add Medicine</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search medicines..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
             {filtered.map((m, index) => {
                const status = getStockStatus(m);
                return (
                  <TableRow key={m.id}>
                   <TableCell className="text-xs text-muted-foreground">
  {index + 1}
</TableCell>
                    <TableCell>
                      <div><span className="font-medium">{m.name}</span><br /><span className="text-xs text-muted-foreground">{m.genericName}</span></div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize text-xs">{m.category}</Badge></TableCell>
                    <TableCell className="text-sm">{m.manufacturer}</TableCell>
                    <TableCell className="text-right text-sm">₹{m.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{m.totalStock}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${status.cls}`}>{status.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewMedicine(m)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(m.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewMedicine} onOpenChange={() => setViewMedicine(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">{viewMedicine?.name}</DialogTitle></DialogHeader>
          {viewMedicine && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Generic:</span> {viewMedicine.genericName}</div>
                <div><span className="text-muted-foreground">Category:</span> <span className="capitalize">{viewMedicine.category}</span></div>
                <div><span className="text-muted-foreground">Manufacturer:</span> {viewMedicine.manufacturer}</div>
                <div><span className="text-muted-foreground">Price:</span> ₹{viewMedicine.unitPrice}</div>
                <div><span className="text-muted-foreground">Stock:</span> {viewMedicine.totalStock}</div>
                <div><span className="text-muted-foreground">Reorder Level:</span> {viewMedicine.reorderLevel}</div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Batches</h4>
                <div className="space-y-2">
                  {viewMedicine.batches.length === 0 ? <p className="text-sm text-muted-foreground">No batches</p> :
                    viewMedicine.batches.map(b => {
                      const isExpired = new Date(b.expiryDate) < new Date();
                      const isExpiringSoon = !isExpired && (new Date(b.expiryDate).getTime() - Date.now()) / 86400000 < 30;
                      return (
                        <div key={b.id} className={`p-3 rounded-lg border text-sm ${isExpired ? 'bg-destructive/5 border-destructive/20' : isExpiringSoon ? 'bg-warning/5 border-warning/20' : ''}`}>
                          <div className="flex justify-between">
                            <span className="font-medium">{b.batchNumber}</span>
                            <Badge variant="outline" className={`text-[10px] ${isExpired ? 'badge-destructive' : isExpiringSoon ? 'badge-warning' : 'badge-success'}`}>
                              {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Valid'}
                            </Badge>
                          </div>
                          <div className="flex gap-4 mt-1 text-muted-foreground text-xs">
                            <span>Qty: {b.quantity}</span>
                            <span>Expiry: {b.expiryDate}</span>
                            <span>Cost: ₹{b.costPrice}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        
      </Dialog>
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
  <DialogContent className="max-w-sm">
    <DialogHeader>
      <DialogTitle>Delete Medicine</DialogTitle>
    </DialogHeader>

    <p className="text-sm text-muted-foreground">
      Are you sure you want to delete this medicine?
    </p>

    <div className="flex justify-end gap-3 mt-4">
      <Button variant="outline" onClick={() => setDeleteId(null)}>
        Cancel
      </Button>

     <Button
  variant="destructive"
  disabled={isDeleting}
  onClick={async () => {
    if (deleteId) {
      setIsDeleting(true);
      await deleteMedicine(deleteId);
      setIsDeleting(false);
      setDeleteId(null);
    }
  }}
>
  {isDeleting ? "Deleting..." : "Delete"}
</Button>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}

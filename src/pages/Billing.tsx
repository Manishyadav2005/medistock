import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { usePharmacy } from '@/context/PharmacyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Receipt, Download } from 'lucide-react';
import { Sale, SaleItem } from '@/types/pharmacy';

export default function Billing() {
  const { medicines, setMedicines, sales, setSales } = usePharmacy();
  console.log("MEDICINES:", medicines);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState<{ medicineId: string; quantity: number }[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const fetchSales = async () => {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error && data) {
    setSalesData(data);
  }
};

useEffect(() => {
  fetchSales();
}, []);

  const addItem = () => setItems(prev => [...prev, { medicineId: '', quantity: 1 }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: string | number) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const lineItems = items.map(item => {
    const med = medicines.find(m => m.id === item.medicineId);
    if (!med) return null;
    return { ...item, name: med.name, unitPrice: med.unitPrice, total: med.unitPrice * item.quantity };
  }).filter(Boolean) as (typeof items[0] & { name: string; unitPrice: number; total: number })[];

  const subtotal = lineItems.reduce((s, i) => s + i.total, 0);
  const net = subtotal - discount;

 const handleCreateBill = async () => {
  if (!customerName || lineItems.length === 0) return;

  // 👉 1. Insert into sales
  const { data: saleData, error: saleError } = await supabase
    .from("sales")
    .insert([
      {
        customer_name: customerName,
        total_amount: net,
        discount: discount,
        payment_method: paymentMethod,
      },
    ])
    .select()
    .single();

  if (saleError) {
    console.error("Sale error:", saleError);
    return;
  }

  // 👉 2. Insert sale_items
  const saleItemsPayload = lineItems.map((item) => ({
    sale_id: saleData.id,
    medicine_id: item.medicineId,
    quantity: item.quantity,
    price: item.unitPrice,
  }));

  const { error: itemError } = await supabase
    .from("sale_items")
    .insert(saleItemsPayload);

  if (itemError) {
    console.error("Items error:", itemError);
    return;
  }

  // 👉 3. Stock reduce (same as your existing logic)
  setMedicines(prev => prev.map(m => {
    const saleItem = saleItemsPayload.find(si => si.medicine_id === m.id);
    if (!saleItem) return m;
    let remaining = saleItem.quantity;
    const updatedBatches = m.batches.map(b => {
      if (remaining <= 0) return b;
      const deduct = Math.min(b.quantity, remaining);
      remaining -= deduct;
      return { ...b, quantity: b.quantity - deduct };
    }).filter(b => b.quantity > 0);
    return { ...m, batches: updatedBatches, totalStock: m.totalStock - saleItem.quantity };
  }));

  // 👉 4. Reset form
  setCustomerName('');
  setCustomerPhone('');
  setItems([]);
  setDiscount(0);
};

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header font-display">Billing / POS</h1>
        <p className="page-description">Create invoices and manage sales</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-display">New Invoice</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Customer Name</Label><Input value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
                <div className="grid gap-2"><Label>Phone</Label><Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} /></div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Items</Label>
                  <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" /> Add Item</Button>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select value={item.medicineId} onValueChange={v => updateItem(i, 'medicineId', v)}>
                        <SelectTrigger><SelectValue placeholder="Select medicine" /></SelectTrigger>
                        <SelectContent>{medicines.map(m => <SelectItem key={m.id} value={m.id}>{m.name} (Stock: {m.totalStock})</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <Input type="number" className="w-20" min={1} value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} />
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Payment</Label>
                  <Select value={paymentMethod} onValueChange={v => setPaymentMethod(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2"><Label>Discount (₹)</Label><Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-muted-foreground"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t"><span>Net Total</span><span>₹{net.toFixed(2)}</span></div>
              <Button className="w-full mt-4" onClick={handleCreateBill} disabled={!customerName || lineItems.length === 0}>
                <Receipt className="h-4 w-4 mr-1" /> Generate Invoice
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base font-display">Recent Sales</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-auto">
            {salesData.slice(0, 10).map(s => (
              <div key={s.id} className="p-3 border rounded-lg text-sm">
                <div className="flex justify-between">
          <span className="font-medium">Sale #{s.id.slice(0, 6)}</span>
                  <Badge variant="secondary" className="text-xs capitalize">{s.paymentMethod}</Badge>
                </div>
                <div className="text-muted-foreground text-xs mt-1">{s.customer_name} •{new Date(s.created_at).toLocaleDateString()}</div>
                <div className="font-semibold mt-1">₹{s.total_amount?.toFixed(2)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

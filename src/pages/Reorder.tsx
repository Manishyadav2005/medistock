import { usePharmacy } from '@/context/PharmacyContext';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, ShoppingCart, TrendingDown } from 'lucide-react';

export default function Reorder() {
  const [medicinesData, setMedicinesData] = useState<any[]>([]);
  const fetchMedicines = async () => {
  const { data, error } = await supabase
    .from("medicines")
    .select("*");

  if (!error && data) {
    setMedicinesData(data);
  }
};
useEffect(() => {
  fetchMedicines();
}, []);
  const { medicines } = usePharmacy();
  const medicinesList = medicinesData.length > 0 ? medicinesData : medicines;

const lowStock = medicinesList.filter(m => (m.total_stock || 0) <= (m.reorder_level || 0));
const expiringSoon = [];
  const reorderList = [...new Map([...lowStock, ...expiringSoon].map(m => [m.id, m])).values()];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header font-display">Smart Reorder</h1>
        <p className="page-description">Medicines recommended for reorder based on stock and expiry</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="stat-card"><CardContent className="p-0 flex items-center gap-3">
          <div className="bg-warning/10 p-2 rounded-lg"><TrendingDown className="h-4 w-4 text-warning" /></div>
          <div><p className="text-xs text-muted-foreground">Low Stock Items</p><p className="text-lg font-bold font-display">{lowStock.length}</p></div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0 flex items-center gap-3">
          <div className="bg-destructive/10 p-2 rounded-lg"><AlertTriangle className="h-4 w-4 text-destructive" /></div>
          <div><p className="text-xs text-muted-foreground">Expiring Soon</p><p className="text-lg font-bold font-display">{expiringSoon.length}</p></div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg"><ShoppingCart className="h-4 w-4 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Reorder Needed</p><p className="text-lg font-bold font-display">{reorderList.length}</p></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-display">Reorder Recommendations</CardTitle></CardHeader>
        <CardContent className="p-0">
          {reorderList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">All stock levels are healthy! 🎉</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Reorder Level</TableHead>
                  <TableHead className="text-right">Suggested Qty</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reorderList.map(m => {
               const isLow = (m.total_stock || 0) <= (m.reorder_level || 0);
                  const isExpiring =(m.batches || []).some(b => { const d = (new Date(b.expiryDate).getTime() - Date.now()) / 86400000; return d > 0 && d < 30; });
              const suggestedQty = Math.max((m.reorder_level || 0) * 2 - (m.total_stock || 0), (m.reorder_level || 0));
                  return (
                    <TableRow key={m.id}>
                      <TableCell><span className="font-medium">{m.name}</span></TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize text-xs">{m.category || "General"}</Badge></TableCell>
            <TableCell className={`text-right font-medium ${isLow ? 'text-destructive' : ''}`}>
  {m.total_stock ?? 0}
</TableCell>
                      <TableCell className="text-right">{m.reorder_level}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">{suggestedQty}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {isLow && <Badge variant="outline" className="text-[10px] badge-warning">Low Stock</Badge>}
                          {isExpiring && <Badge variant="outline" className="text-[10px] badge-destructive">Expiring</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

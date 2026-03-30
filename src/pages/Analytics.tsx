import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';

export default function Analytics() {

  // ✅ STATES
  const [medicines, setMedicines] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  // ✅ FETCH SALES
  const fetchSales = async () => {
    const { data, error } = await supabase
      .from("sales")
      .select("*");

    if (!error && data) {
      setSalesData(data);
    }
  };

  // ✅ FETCH MEDICINES
  const fetchMedicines = async () => {
    const { data, error } = await supabase
      .from("medicines")
      .select("*");

    if (!error && data) {
      setMedicines(data);
    }
  };

  // ✅ USE EFFECT
  useEffect(() => {
    fetchSales();
    fetchMedicines();
  }, []);

  // ✅ CALCULATIONS
  const totalRevenue = salesData.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const totalOrders = salesData.length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const dailyData = salesData.reduce((acc: any, s) => {
    const day = new Date(s.created_at).toLocaleDateString();

    const found = acc.find((d: any) => d.name === day);

    if (found) {
      found.sales += Number(s.total_amount || 0);
    } else {
      acc.push({
        name: day,
        sales: Number(s.total_amount || 0),
      });
    }

    return acc;
  }, []);

  const monthlyData = salesData.reduce((acc: any, s) => {
    const month = new Date(s.created_at).toLocaleString('default', { month: 'short' });

    const found = acc.find((m: any) => m.month === month);

    if (found) {
      found.revenue += Number(s.total_amount || 0);
    } else {
      acc.push({
        month,
        revenue: Number(s.total_amount || 0),
      });
    }

    return acc;
  }, []);

  const totalItems = salesData.length;

  // ✅ TOP MEDICINES
  const topMedicines = salesData
    .reduce((acc: any, sale) => {
      const name = sale.medicine_name || "Unknown";

      const found = acc.find((m: any) => m.name === name);

      if (found) {
        found.units += sale.quantity || 1;
      } else {
        acc.push({
          name,
          units: sale.quantity || 1,
        });
      }

      return acc;
    }, [])
    .sort((a: any, b: any) => b.units - a.units)
    .slice(0, 5);

  // ✅ CATEGORY DATA
  const categoryData = (medicines || []).reduce((acc: any, m) => {
    const category = m.category || "Other";

    const found = acc.find((c: any) => c.name === category);

    if (found) {
      found.value += 1;
    } else {
      acc.push({
        name: category,
        value: 1,
        fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
      });
    }

    return acc;
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="page-header font-display">Analytics</h1>
        <p className="page-description">Sales performance and inventory insights</p>
      </div>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Card className="stat-card">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-bold font-display">₹{totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="bg-success/10 p-2 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-lg font-bold font-display">{totalOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="bg-info/10 p-2 rounded-lg">
              <Package className="h-4 w-4 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Items Sold</p>
              <p className="text-lg font-bold font-display">{totalItems}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-0 flex items-center gap-3">
            <div className="bg-warning/10 p-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Order</p>
              <p className="text-lg font-bold font-display">₹{avgOrder.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* 🔥 CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Daily Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* 🔥 PIE + TOP */}
      <div className="grid lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" label>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            {topMedicines.map((m, i) => {
              const max = topMedicines[0]?.units || 1;

              return (
                <div key={m.name} className="mb-3">
                  <div className="flex justify-between text-sm">
                    <span>{i + 1}. {m.name}</span>
                    <span>{m.units}</span>
                  </div>
                  <div className="h-2 bg-muted rounded">
                    <div
                      className="h-2 bg-primary rounded"
                      style={{ width: `${(m.units / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
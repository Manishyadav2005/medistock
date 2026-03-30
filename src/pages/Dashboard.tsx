import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePharmacy } from '@/context/PharmacyContext';
import { Pill, AlertTriangle, TrendingUp, ShoppingCart, Package, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
const { getDashboardStats, alerts } = usePharmacy();

const stats = getDashboardStats();
const [weeklySales, setWeeklySales] = useState<any[]>([]);
const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
const [topMedicines, setTopMedicines] = useState<any[]>([]);
const [categoryData, setCategoryData] = useState<any[]>([]);
const todaySales = weeklySales.find(
  d => d.name === ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()]
)?.sales || 0;

const currentMonth = new Date().getMonth();

const totalMonthlyRevenue = monthlyRevenue[currentMonth]?.revenue || 0;

const statCards = [
  { label: 'Total Medicines', value: stats.totalMedicines, icon: Pill, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Low Stock', value: stats.lowStockCount, icon: Package, color: 'text-warning', bg: 'bg-warning/10' },
  { label: 'Expiring Soon', value: stats.expiringCount, icon: Clock, color: 'text-info', bg: 'bg-info/10' },
  { label: 'Expired', value: stats.expiredCount, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  { label: "Today's Sales", value: `₹${todaySales}`, icon: ShoppingCart, color: 'text-success', bg: 'bg-success/10' },
  { label: 'Monthly Revenue', value: `₹${totalMonthlyRevenue}`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
];

const fetchDashboardData = async () => {
  try {
  const { data: sales, error } = await supabase
  .from('sales')
  .select(`
    *,
    sale_items (
      quantity,
      medicines (
        name
      )
    )
  `);

if (error) {
  console.error(error);
  return;
}

    if (!sales) return;

    // 🔥 WEEKLY SALES
    const week = [
      { name: 'Sun', sales: 0 },
      { name: 'Mon', sales: 0 },
      { name: 'Tue', sales: 0 },
      { name: 'Wed', sales: 0 },
      { name: 'Thu', sales: 0 },
      { name: 'Fri', sales: 0 },
      { name: 'Sat', sales: 0 },
    ];

    sales.forEach(s => {
      const day = s.created_at ? new Date(s.created_at).getDay() : 0;
      week[day].sales += s.total_amount || 0;
    });

    setWeeklySales(week);

    // 🔥 MONTHLY REVENUE
    const months = ['Jan','Feb','Mar','Apr','May','Jun','jul','Aug','Sep','Oct','Nov','Dec'];
    const monthData = months.map(m => ({ month: m, revenue: 0 }));

    sales.forEach(s => {
     const m = s.created_at ? new Date(s.created_at).getMonth() : 0;
      if (m < 12) monthData[m].revenue += s.total_amount || 0;
    });

    setMonthlyRevenue(monthData);

    // 🔥 TOP MEDICINES
    const map: any = {};
sales.forEach((s: any) => {
  if (!s.sale_items) return;

  s.sale_items.forEach((item: any) => {
    const name = item.medicines?.name || "Unknown";

    if (!map[name]) map[name] = 0;
    map[name] += item.quantity || 0;
  });
});

const top = Object.entries(map)
  .map(([name, units]) => ({
    name,
    units: Number(units),
  }))
  .sort((a: any, b: any) => b.units - a.units)
  .slice(0, 5);

    setTopMedicines(top);

    // 🔥 CATEGORY
    const { data: meds } = await supabase.from('medicines').select('*');

    const catMap: any = {};
    meds?.forEach(m => {
      if (!catMap[m.category]) catMap[m.category] = 0;
      catMap[m.category]++;
    });

    const colors = ['#10b981','#f59e0b','#3b82f6','#22c55e','#ef4444'];

    const catData = Object.entries(catMap).map(([name, value], i) => ({
      name,
      value,
      fill: colors[i % colors.length],
    }));

    setCategoryData(catData);

  } catch (err) {
    console.error(err);
  }
};

  const recentAlerts = alerts.filter(a => !a.read).slice(0, 4);


 useEffect(() => {
  fetchDashboardData();
}, []);

// ✅ EXACT YAHI ADD KARNA HAI (useEffect ke niche)
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header font-display">Dashboard</h1>
        <p className="page-description">Overview of your pharmacy operations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="stat-card">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className={`${s.bg} p-2 rounded-lg`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold font-display">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-display">Weekly Sales</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
             <BarChart data={weeklySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-display">By Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
               <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
                  <span className="text-muted-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-display">Top Selling Medicines</CardTitle></CardHeader>
        <CardContent className="space-y-4">
  {topMedicines.length === 0 ? (
    <p className="text-sm text-muted-foreground">No sales data</p>
  ) : (
    topMedicines.map((item, index) => (
      <div key={index} className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>{index + 1}. {item.name}</span>
          <span className="font-medium">{item.units} units</span>
        </div>

        <div className="w-full bg-muted h-2 rounded-full">
          <div
            className="bg-primary h-2 rounded-full"
            style={{
              width: `${  100}%`
            }}
          />
        </div>
      </div>
    ))
  )}
</CardContent>
        </Card>
      </div>

      {recentAlerts.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Recent Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentAlerts.map((a) => (
                <div key={a.id} className={`flex items-center gap-3 p-3 rounded-lg ${a.severity === 'critical' ? 'bg-destructive/5' : 'bg-warning/5'}`}>
                  <AlertTriangle className={`h-4 w-4 ${a.severity === 'critical' ? 'text-destructive' : 'text-warning'}`} />
                  <span className="text-sm">{a.message}</span>
                  <Badge variant="outline" className={`ml-auto text-[10px] ${a.severity === 'critical' ? 'badge-destructive' : 'badge-warning'}`}>
                    {a.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Bell, BellOff } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const fetchAlerts = async () => {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error && data) {
    setAlerts(data);
  }
};
useEffect(() => {
  fetchAlerts();

  const channel = supabase
    .channel("alerts-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "alerts" },
      () => {
        fetchAlerts();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
  const markRead = async (id: string) => {
  await supabase
    .from("alerts")
    .update({ is_read: true })
    .eq("id", id);

  fetchAlerts();
};
const markAllRead = async () => {
  await supabase
    .from("alerts")
    .update({ is_read: true })
    .eq("is_read", false);

  fetchAlerts();
};

 const unread = alerts.filter(a => !a.is_read);
const read = alerts.filter(a => a.is_read);
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header font-display">Alerts</h1>
          <p className="page-description">Stock and expiry notifications</p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}><CheckCircle className="h-4 w-4 mr-1" /> Mark All Read</Button>
        )}
      </div>

      {unread.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Bell className="h-4 w-4" /> Unread ({unread.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {unread.map(a => (
              <div key={a.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${a.type === 'expired' ? 'bg-destructive/5 border border-destructive/10' : 'bg-warning/5 border border-warning/10'}`} onClick={() => markRead(a.id)}>
                <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${a.type === 'expired' ? 'text-destructive' : 'text-warning'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(a.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className={`text-[10px] ${a.type === 'expired' ? 'badge-destructive' : a.type === 'expiry' ? 'badge-warning' : 'badge-info'}`}>
                    {a.type === 'low_stock' ? 'Low Stock' : a.type === 'expiry' ? 'Expiring' : 'Expired'}
                  </Badge>
                 <Badge variant="outline" className={`text-[10px] ${a.type === 'expired' ? 'badge-destructive' : 'badge-warning'}`}>
  {a.type}
</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><BellOff className="h-4 w-4 text-muted-foreground" /> History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {read.length === 0 ? <p className="text-sm text-muted-foreground">No read alerts</p> :
            read.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg opacity-60">
                <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(a.created_at).toLocaleString()}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {a.type === 'low_stock' ? 'Low Stock' : a.type === 'expiry' ? 'Expiring' : 'Expired'}
                </Badge>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

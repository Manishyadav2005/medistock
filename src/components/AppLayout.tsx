import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState<any[]>([]);
  const unreadCount = alerts.filter(a => !a.is_read).length;

  const [openProfile, setOpenProfile] = useState(false);
  const [user, setUser] = useState<any>(null);

  const dropdownRef = useRef<any>(null);

  // 🔐 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // 🔔 Fetch alerts
  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAlerts(data);
    }
  };

  // 👤 Fetch logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  // 🔔 Alerts realtime
  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel("alerts-changes")
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

  // ❌ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          
          {/* HEADER */}
          <header className="h-14 flex items-center justify-between border-b px-4 bg-card">
            
            {/* LEFT */}
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">

              {/* 🔔 Alerts */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/alerts')}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground border-0">
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {/* 👤 PROFILE */}
              <div ref={dropdownRef} className="relative">

                {/* Avatar */}
                <div
                  onClick={() => setOpenProfile(!openProfile)}
                  className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold cursor-pointer hover:scale-105 transition"
                >
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>

                {/* Dropdown */}
                {openProfile && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95">

                    {/* User Info */}
                    <div className="p-3 border-b">
                      <p className="font-semibold">
                        {user?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user?.email || "No email"}
                      </p>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setOpenProfile(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                    >
                      Settings
                    </button>

                    <button
                      onClick={() => {
                        navigate("/profile");
                        setOpenProfile(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                    >
                      Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition"
                    >
                      Logout
                    </button>

                  </div>
                )}
              </div>

            </div>
          </header>

          {/* MAIN */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
}
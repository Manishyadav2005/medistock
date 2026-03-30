import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PharmacyProvider } from "@/context/PharmacyContext";

import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Reorder from "./pages/Reorder";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Staff from "./pages/Staff";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PharmacyProvider>
        <BrowserRouter>
          <Routes>

            {/* 🔓 Public Route */}
            <Route path="/login" element={<Login />} />

            {/* 🔐 Protected Routes with Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Index />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="billing" element={<Billing />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="purchases" element={<Purchases />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="reorder" element={<Reorder />} />
              <Route path="staff" element={<Staff />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* ❌ Not Found */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </PharmacyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
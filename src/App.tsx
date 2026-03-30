import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PharmacyProvider } from "@/context/PharmacyContext";
import { AppLayout } from "@/components/AppLayout";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PharmacyProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              

  {/* 🔓 Public */}
  <Route path="/login" element={<Login />} />

  {/* 🔐 Dashboard */}
  <Route path="/" element={
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <Index />
    </ProtectedRoute>
  } />

  {/* 🔐 Admin only */}
  <Route path="/inventory" element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <Inventory />
    </ProtectedRoute>
  } />

  {/* 🔐 Admin + Staff */}
  <Route path="/billing" element={
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <Billing />
    </ProtectedRoute>
  } />

  {/* 🔐 Admin only */}
  <Route path="/suppliers" element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <Suppliers />
    </ProtectedRoute>
  } />

  <Route path="/purchases" element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <Purchases />
    </ProtectedRoute>
  } />

  <Route path="/analytics" element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <Analytics />
    </ProtectedRoute>
  } />

  <Route path="/alerts" element={
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <Alerts />
    </ProtectedRoute>
  } />

  <Route path="/reorder" element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <Reorder />
    </ProtectedRoute>
  } />
  <Route
  path="/staff"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <Staff />
    </ProtectedRoute>
  }
/>

<Route
  path="/settings"
  element={
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <Settings />
    </ProtectedRoute>
  }
/>
<Route
  path="/profile"
  element={
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <Profile />
    </ProtectedRoute>
  }
/>

  {/* ❌ Not Found */}
  <Route path="*" element={<NotFound />} />

</Routes>
          </AppLayout>
        </BrowserRouter>
      </PharmacyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
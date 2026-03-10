import { Route, Routes } from "react-router-dom";
import Login from "@/pages/Login";
import Menu from "@/pages/Menu";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminStudents from "@/pages/admin/Students";
import AdminTeachers from "@/pages/admin/Teachers";
import AdminStores from "@/pages/admin/Stores";
import DashProducts from "@/pages/DashProducts";
import DashOrders from "@/pages/DashOrders";
import DashSettings from "@/pages/DashSettings";
import UserOrders from "@/pages/UserOrders";
import Signup from "@/pages/Signup";
import Cart from "@/pages/Cart";
import { AuthContextProvider } from "@/context/AuthContext";
import { DashboardLayout } from "@/layout/Dashboard";
import { AdminDashboardLayout } from "@/layout/AdminDashboard";
import { Toaster } from "@/components/ui/sonner";
import StoreProfile from "@/pages/StoreProfile"

function App() {
  return (
    <AuthContextProvider>
      <Routes>
        <Route index element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<UserOrders />} />
        <Route path="/store/:id" element={<StoreProfile />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<DashProducts />} />
          <Route path="orders" element={<DashOrders />} />
          <Route path="settings" element={<DashSettings />} />
        </Route>

        <Route path="/admin" element={<AdminDashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="teachers" element={<AdminTeachers />} />
          <Route path="stores" element={<AdminStores />} />
        </Route>
      </Routes>
      <Toaster position="top-center" />
    </AuthContextProvider>
  );
}

export default App;

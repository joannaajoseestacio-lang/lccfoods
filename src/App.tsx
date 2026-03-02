import { Route, Routes } from "react-router-dom";
import Login from "@/pages/Login";
import Menu from "@/pages/Menu";
import Dashboard from "@/pages/Dashboard";
import DashProducts from "@/pages/DashProducts";
import DashOrders from "@/pages/DashOrders";
import UserOrders from "@/pages/UserOrders";
import Signup from "@/pages/Signup";
import Cart from "@/pages/Cart";
import { AuthContextProvider } from "@/context/AuthContext";
import { DashboardLayout } from "@/layout/Dashboard";

function App() {
  return (
    <AuthContextProvider>
      <Routes>
        <Route index element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<UserOrders />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<DashProducts />} />
          <Route path="orders" element={<DashOrders />} />
        </Route>

      </Routes>
    </AuthContextProvider>
  );
}

export default App;

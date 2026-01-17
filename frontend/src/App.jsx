import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { CartProvider } from "./pages/CartProvider";
import Payment from "./pages/Payment";
import Address from "./pages/Address";
import OrderDetails from "./pages/OrderDetails";
import Wishlist from "./pages/Wishlist";
<<<<<<< HEAD
import NotFound from "./pages/NotFound";
=======
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminDashboard from "./Admin/AdminDashboard";
import AdminProducts from "./Admin/AdminProducts";
import AdminOrders from "./Admin/AdminOrders";
import AdminUsers from "./Admin/AdminUsers";
import AdminOverview from "./Admin/AdminOverview";
import ProtectedRoute from "./components/ProtectedRoute";

// 👇 Sub-component to use useLocation
function AppContent() {
  const location = useLocation();

  // Hide navbar on login, register, and all admin routes
  const hideNavbar =
    ["/login", "/register"].includes(location.pathname) || location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes with "Redirect if Logged In" logic via ProtectedRoute */}
        <Route path="/login" element={<ProtectedRoute><Login /></ProtectedRoute>} />
        <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />

        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/address" element={<ProtectedRoute><Address /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

        {/* Admin Routes */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
<<<<<<< HEAD

        {/* Catch-all for 404 */}
        <Route path="*" element={<NotFound />} />
=======
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
      </Routes>
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />

      <AppContent />

    </CartProvider>
  );
}

export default App;

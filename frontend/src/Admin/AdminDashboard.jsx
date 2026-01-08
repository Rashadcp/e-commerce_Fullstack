import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../pages/CartProvider";

function AdminDashboard() {
  const { logoutUser } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      <div className="sticky top-0 h-screen w-64 bg-[#8dc53e] text-white overflow-y-auto">
        <div className="p-5 space-y-6 flex flex-col h-full">
          <h2 className="text-2xl font-bold text-center mb-6 sticky top-0 bg-[#8dc53e] py-2 border-b border-green-700">Admin Panel</h2>
          <nav className="flex flex-col gap-4 flex-1">
            <Link to="/admin" className="hover:bg-green-700 p-2 rounded transition-colors">Overview</Link>
            <Link to="/admin/products" className="hover:bg-green-700 p-2 rounded transition-colors">Products</Link>
            <Link to="/admin/orders" className="hover:bg-green-700 p-2 rounded transition-colors">Orders</Link>
            <Link to="/admin/users" className="hover:bg-green-700 p-2 rounded transition-colors">Users</Link>
            <Link to="/" className="hover:bg-green-700 p-2 rounded transition-colors">Back to Shop</Link>
          </nav>

          <button
            onClick={handleLogout}
            className="mt-auto bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors font-bold"
          >
            Logout
          </button>
        </div>
      </div>


      <div className="flex-1 overflow-x-hidden">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

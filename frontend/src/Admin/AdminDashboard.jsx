import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { CartContext } from "../pages/CartProvider";
import { FaBars, FaTimes } from "react-icons/fa";

function AdminDashboard() {
  const { logoutUser } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  // Close sidebar on route change (mobile)
  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  const navLinks = [
    { name: "Overview", path: "/admin", exact: true },
    { name: "Products", path: "/admin/products" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Users", path: "/admin/users" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#8dc53e] text-gray-900 shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-5 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Admin</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-gray-800 hover:bg-black/10 p-1 rounded"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-3 flex-1 overflow-y-auto">
            {navLinks.map((link) => {
              const isActive = link.exact
                ? location.pathname === link.path
                : location.pathname.startsWith(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleLinkClick}
                  className={`p-3 rounded-xl transition-all duration-200 font-bold flex items-center gap-3 ${isActive
                    ? "bg-gray-900 text-[#8dc53e] shadow-lg transform scale-105 ml-2"
                    : "hover:bg-black/10 text-gray-900"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="border-t border-black/10 my-4 pt-4">
              <Link
                to="/"
                onClick={handleLinkClick}
                className="block p-3 rounded-xl font-bold hover:bg-black/10 transition-colors flex items-center gap-3"
              >
                ← Back to Shop
              </Link>
            </div>
          </nav>

          <button
            onClick={handleLogout}
            className="mt-4 bg-black/10 hover:bg-black/20 text-gray-900 p-4 rounded-xl transition-all font-black uppercase text-sm w-full flex items-center justify-center gap-2 border border-black/5"
          >
            Logout session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden text-gray-900">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm p-4 flex items-center md:hidden z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-600 hover:bg-gray-100 p-2 rounded mr-4"
          >
            <FaBars size={24} />
          </button>
          <span className="font-bold text-gray-800 text-lg">Admin Dashboard</span>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;

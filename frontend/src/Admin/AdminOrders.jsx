import { useState, useEffect } from "react";
import { orderAPI } from "../services/api";
import { formatDate } from "../utils/dateUtils";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounced fetch on search
  useEffect(() => {
    const timeout = searchTerm ? 500 : 0;
    const delayDebounceFn = setTimeout(() => {
      fetchOrders(currentPage, searchTerm);
    }, timeout);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage]);

  const fetchOrders = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await orderAPI.getAll({
        page,
        limit: 10,
        search
      });
      if (response.data.orders) {
        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages);
      } else {
        setOrders(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchOrders(newPage, searchTerm);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const order = orders.find((o) => (o._id || o.id) === orderId);
      await orderAPI.update(orderId, {
        ...order,
        status: newStatus,
      });
      fetchOrders(currentPage, searchTerm);
      toast.success("Order status updated");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleSearch = (e) => e.preventDefault();

  if (loading && orders.length === 0) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="p-6">
      {/* 🔍 Search + Heading */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Manage Orders</h2>
        <form onSubmit={handleSearch} className="relative flex items-center gap-2">
          <motion.label
            initial={{ y: 0, opacity: 0.1 }}
            animate={{
              y: isFocused || searchTerm ? 5 : -10,
              opacity: isFocused || searchTerm ? 1 : 0.6,
              scale: isFocused || searchTerm ? 0 : 1,
            }}
            transition={{ duration: 0.1 }}
            className="absolute left-4 top-3 text-gray-400 pointer-events-none text-sm"
          >
            Search by order ID
          </motion.label>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="border border-gray-300 rounded-lg px-4 pt-5 pb-2 w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* 📋 Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Order ID", "Customer", "Date", "Amount", "Status", "Actions"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((order) => {
                const orderId = order.id || order._id;
                return (
                  <tr key={orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{orderId}</td>
                    <td className="px-6 py-4">{order.customerName}</td>
                    <td className="px-6 py-4">{formatDate(order.date)}</td>
                    <td className="px-6 py-4">₹{order.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Paid"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(orderId, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() =>
                          setSelectedOrder(selectedOrder?.id === orderId ? null : order)
                        }
                        className="ml-3 text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  {loading ? "Searching..." : "No matching orders found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2 pb-6">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* 🪟 Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b bg-white/40 backdrop-blur-lg rounded-t-2xl">
                <h3 className="text-lg font-semibold text-gray-800">
                  Order Details #{selectedOrder.id || selectedOrder._id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-600 hover:text-red-600 text-xl transition"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Customer Name</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Customer Email</p>
                    <p className="font-medium">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Customer Phone</p>
                    <p className="font-medium">{selectedOrder.customerPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Order Date</p>
                    <p className="font-medium">{formatDate(selectedOrder.date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Payment Method</p>
                    <p className="font-medium">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Amount</p>
                    <p className="font-medium">₹{selectedOrder.totalAmount}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🛍️ Items Ordered</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center border p-2 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-white/80 transition"
                      >
                        <div className="flex items-center">
                          <img
                            src={item.image?.startsWith("http") ? item.image : `/${item.image || ""}`}
                            alt={item.name}
                            className="w-12 h-12 rounded object-cover mr-3"
                          />

                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right pt-4">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminOrders;

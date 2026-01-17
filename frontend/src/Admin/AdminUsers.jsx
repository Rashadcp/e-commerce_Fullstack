import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search to prevent too many API calls
  useEffect(() => {
    const timeout = searchTerm ? 500 : 0;
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(currentPage, searchTerm);
    }, timeout);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage]);

  const fetchUsers = async (page, search) => {
    setLoading(true);
    try {
      // Pass params to backend
      const response = await userAPI.getAllUsers({
        page,
        limit: 10,
        search
      });

      if (response.data.users) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      } else {
        // Fallback if backend structure differs temporarily
        setUsers(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchUsers(newPage, searchTerm);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await userAPI.deleteUser(userId);
      fetchUsers(currentPage, searchTerm);
      toast.success('User deleted successfully');
      if (selectedUser && (selectedUser._id === userId || selectedUser.id === userId)) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleBlock = async (userId, currentlyBlocked) => {
    const action = currentlyBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await userAPI.updateUser(userId, { blocked: !currentlyBlocked });
      fetchUsers(currentPage, searchTerm);

      // Update modal state if open
      if (selectedUser && (selectedUser._id === userId || selectedUser.id === userId)) {
        setSelectedUser(prev => ({ ...prev, blocked: !currentlyBlocked }));
      }

      toast.success(!currentlyBlocked ? 'User blocked successfully' : 'User unblocked successfully');
    } catch (error) {
      console.error('Error updating user block status:', error);
      toast.error('Failed to update user status');
    }
  };

  if (loading && users.length === 0) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Users</h2>

      {/* 🔍 Search Bar */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id || user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.number}</td>
                  <td className="px-6 py-4">
                    {user.blocked ? (
                      <span className="text-red-600">Blocked</span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        setSelectedUser(selectedUser?.id === user.id ? null : user)
                      }
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleToggleBlock(user._id || user.id, !!user.blocked)}
                      className={`mr-3 ${user.blocked
                        ? 'text-green-600 hover:text-green-900'
                        : 'text-yellow-600 hover:text-yellow-900'
                        }`}
                    >
                      {user.blocked ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id || user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  {loading ? "Searching..." : "No users found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-600">Name</label>
                <p className="font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-gray-600">Email</label>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-gray-600">Phone</label>
                <p className="font-medium">{selectedUser.number}</p>
              </div>
              <div>
                <label className="text-gray-600">Cart Items</label>
                <p className="font-medium">{selectedUser.cart?.length || 0} items</p>
              </div>
              <div>
                <label className="text-gray-600">Status</label>
                <p className="font-medium">
                  {selectedUser.blocked ? 'Blocked' : 'Active'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleToggleBlock(selectedUser._id || selectedUser.id, !!selectedUser.blocked)
                  }
                  className={`px-3 py-1 rounded ${selectedUser.blocked
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                  {selectedUser.blocked ? 'Unblock User' : 'Block User'}
                </button>
                <button
                  onClick={() => handleDeleteUser(selectedUser._id || selectedUser.id)}
                  className="px-3 py-1 rounded bg-red-100 text-red-800"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;

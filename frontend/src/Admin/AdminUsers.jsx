import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { userAPI } from '../services/api';
=======
import axios from 'axios';
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
import { toast } from 'react-toastify';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
<<<<<<< HEAD
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search to prevent too many API calls
  useEffect(() => {
    const timeout = searchTerm ? 500 : 0;
    const delayDebounceFn = setTimeout(() => {
      // Only reset page if it IS a search action? 
      // This effect runs on mount too (searchTerm=''). 
      // If we blindly setCurrentPage(1), it fits mount logic (1->1).
      // Ideally we only reset page if search CHANGED. 
      // But keeping it simple: simplified logic for speed.
      fetchUsers(currentPage, searchTerm);
    }, timeout);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage]);

  // Handle page changes
  useEffect(() => {
    // Only fetch if not triggered by search change (managed above)
    // Actually, we can just allow this to run or manage differently.
    // To keep simple: let dependencies handle it, but avoid double fetch.
    // Better pattern: Just fetch when page changes. Search resets page to 1.
    // But search effect already fetches.
  }, []);

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
=======
  const [searchTerm, setSearchTerm] = useState(''); // 🔍 added state for search

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:5000/users', config);
      setUsers(response.data);
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchUsers(newPage, searchTerm);
    }
  };

=======
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
<<<<<<< HEAD
      await userAPI.deleteUser(userId);
      fetchUsers(currentPage, searchTerm);
=======
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/users/${userId}`, config);
      fetchUsers();
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleBlock = async (userId, currentlyBlocked) => {
    const action = currentlyBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
<<<<<<< HEAD
      await userAPI.updateUser(userId, { blocked: !currentlyBlocked });
      fetchUsers(currentPage, searchTerm);
=======
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(`http://localhost:5000/users/${userId}`, { blocked: !currentlyBlocked }, config);
      fetchUsers();
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e

      // Update modal state if open
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => ({ ...prev, blocked: !currentlyBlocked }));
      }

      toast.success(!currentlyBlocked ? 'User blocked successfully' : 'User unblocked successfully');
    } catch (error) {
      console.error('Error updating user block status:', error);
      toast.error('Failed to update user status');
    }
  };

<<<<<<< HEAD
  if (loading && users.length === 0) return <div className="text-center p-4">Loading...</div>;
=======


  // 🔍 Filter users based on search term
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.number.toString().includes(searchTerm)
  );

  if (loading) return <div className="text-center p-4">Loading...</div>;
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Users</h2>

      {/* 🔍 Search Bar */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
<<<<<<< HEAD
          placeholder="Search by name or email..."
=======
          placeholder="Search by name, email, or phone..."
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
<<<<<<< HEAD
        {/* Clear button implicitly handled by setting text to '' which triggers effect */}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
=======
        <button
          onClick={() => setSearchTerm('')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg"
        >
          Clear
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
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
<<<<<<< HEAD
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id || user.id} className="hover:bg-gray-50">
=======
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
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
<<<<<<< HEAD
                      onClick={() => handleToggleBlock(user._id || user.id, !!user.blocked)}
=======
                      onClick={() => handleToggleBlock(user.id, !!user.blocked)}
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
                      className={`mr-3 ${user.blocked
                        ? 'text-green-600 hover:text-green-900'
                        : 'text-yellow-600 hover:text-yellow-900'
                        }`}
                    >
                      {user.blocked ? 'Unblock' : 'Block'}
                    </button>
                    <button
<<<<<<< HEAD
                      onClick={() => handleDeleteUser(user._id || user.id)}
=======
                      onClick={() => handleDeleteUser(user.id)}
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
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
<<<<<<< HEAD
                  {loading ? "Searching..." : "No users found."}
=======
                  No users found.
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

<<<<<<< HEAD
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

      {/* User Details Modal (kept mostly same, ensured ID usage) */}
=======
      {/* User Details Modal */}
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
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
<<<<<<< HEAD
                    handleToggleBlock(selectedUser._id || selectedUser.id, !!selectedUser.blocked)
=======
                    handleToggleBlock(selectedUser.id, !!selectedUser.blocked)
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
                  }
                  className={`px-3 py-1 rounded ${selectedUser.blocked
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                  {selectedUser.blocked ? 'Unblock User' : 'Block User'}
                </button>
                <button
<<<<<<< HEAD
                  onClick={() => handleDeleteUser(selectedUser._id || selectedUser.id)}
=======
                  onClick={() => handleDeleteUser(selectedUser.id)}
>>>>>>> 21455ae0686bc2502dc71dc878e983fce041641e
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
